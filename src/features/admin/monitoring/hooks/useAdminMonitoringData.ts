"use client"

import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/hooks'
import { getSolvesMonitoring, isAdmin, subscribeToSolvesMonitoringSignals } from '@/shared/lib'
import type { SolveMonitoringRow } from '../types'

export function useAdminMonitoringData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [isAdminUser, setIsAdminUser] = useState(false)
  const [solves, setSolves] = useState<SolveMonitoringRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'flag_sharing' | 'ai_agent' | 'oneshot' | 'suspicious'>('all')

  const fetchSolves = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await getSolvesMonitoring()
      
      // Enriched solves data with advanced telemetry heuristics
      const enrichedData = (data || []).map((s: any): SolveMonitoringRow => {
        const reasons: string[] = []
        let score = 0

        // Heuristic 1: Oneshot logic (duration under 2 minutes / 120 seconds)
        const is_oneshot = s.time_to_solve_seconds !== null && s.time_to_solve_seconds <= 120
        const is_flawless_oneshot = is_oneshot && s.incorrect_attempts_count === 0

        // Heuristic 2: Sharing flag (time since prev solve of same chall by a DIFFERENT team <= 900 seconds)
        const prevDifferentTeamSolve = arr.slice(index + 1).find(x => 
          x.challenge_id === s.challenge_id && 
          (s.team_name ? x.team_name !== s.team_name : x.user_id !== s.user_id)
        );
        let time_since_diff_team_solve = null;
        if (prevDifferentTeamSolve) {
           time_since_diff_team_solve = (new Date(s.solved_at).getTime() - new Date(prevDifferentTeamSolve.solved_at).getTime()) / 1000;
        }
        const is_flag_sharing = time_since_diff_team_solve !== null && time_since_diff_team_solve <= 900;
        
        // Update the value so UI shows the correct duration
        s.time_since_prev_solve_seconds = time_since_diff_team_solve ?? s.time_since_prev_solve_seconds;

        // Heuristic 3: AI & Automation Detection
        // A. Direct API submission (no view event recorded)
        if (s.time_to_solve_seconds === null) {
          score += 75
          reasons.push("Direct API Submission: challenge solved without being viewed in the UI first.")
        } else {
          // B. Speed heuristics
          if (s.time_to_solve_seconds < 15) {
            score += 90
            reasons.push(`Supernatural Speed: challenge solved in ${Math.round(s.time_to_solve_seconds)}s after opening (< 15s).`)
          } else if (s.time_to_solve_seconds < 60) {
            score += 60
            reasons.push(`Rapid Solve: challenge solved in ${Math.round(s.time_to_solve_seconds)}s after opening (< 60s).`)
          } else if (s.time_to_solve_seconds < 120) {
            score += 30
            reasons.push(`Quick Solve: challenge solved in ${Math.round(s.time_to_solve_seconds)}s after opening (< 120s).`)
          }
        }

        // C. Consecutive solves by same user (Spamming)
        if (s.time_since_user_prev_solve_seconds !== null) {
          if (s.time_since_user_prev_solve_seconds < 15) {
            score += 80
            reasons.push(`Ultra-rapid Sequence: solved another challenge ${Math.round(s.time_since_user_prev_solve_seconds)}s after their previous solve (< 15s).`)
          } else if (s.time_since_user_prev_solve_seconds < 60) {
            score += 50
            reasons.push(`Fast Sequence: solved another challenge ${Math.round(s.time_since_user_prev_solve_seconds)}s after their previous solve (< 60s).`)
          }
        }

        // D. Flawless High-Speed Accuracy
        if (is_flawless_oneshot) {
          score += 15
          reasons.push("Flawless rapid accuracy: solved on first attempt in under 2 minutes.")
        }

        const ai_confidence_score = Math.min(score, 100)

        return {
          ...s,
          is_oneshot,
          is_flawless_oneshot,
          is_flag_sharing,
          ai_confidence_score,
          ai_confidence_reasons: reasons,
        }
      })

      setSolves(enrichedData)
      setLastUpdatedAt(new Date())
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch monitoring logs')
    } finally {
      if (showLoader) {
        setIsLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/challenges')
        return
      }

      const adminCheck = await isAdmin()
      if (!mounted) return
      setIsAdminUser(adminCheck)
      if (!adminCheck) {
        router.push('/challenges')
        return
      }

      await fetchSolves()
      if (!mounted) return
      setIsLoading(false)
    }

    init()
    return () => {
      mounted = false
    }
  }, [authLoading, user, router, fetchSolves])

  useEffect(() => {
    if (!isAdminUser) return

    let refreshTimeout: ReturnType<typeof setTimeout> | null = null
    const scheduleRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => {
        fetchSolves(false)
      }, 400)
    }

    const unsubscribe = subscribeToSolvesMonitoringSignals(scheduleRefresh, setIsRealtimeConnected)
    const fallbackInterval = window.setInterval(() => {
      fetchSolves(false)
    }, 30000)

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      window.clearInterval(fallbackInterval)
      unsubscribe()
      setIsRealtimeConnected(false)
    }
  }, [isAdminUser, fetchSolves])

  const refresh = useCallback(() => {
    fetchSolves(true)
  }, [fetchSolves])

  const filteredSolves = useMemo(() => {
    return solves.filter((s) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        s.username.toLowerCase().includes(query) ||
        s.challenge_title.toLowerCase().includes(query) ||
        (s.team_name && s.team_name.toLowerCase().includes(query))

      if (!matchesSearch) return false

      // 2. Alert Types Heuristics
      const isFlagSharing = !!s.is_flag_sharing
      const isSuspiciousOneshot = !!s.is_oneshot
      const isAiAgent = (s.ai_confidence_score ?? 0) >= 50

      if (filterType === 'flag_sharing') return isFlagSharing
      if (filterType === 'ai_agent') return isAiAgent
      if (filterType === 'oneshot') return isSuspiciousOneshot
      if (filterType === 'suspicious') return isFlagSharing || isAiAgent || isSuspiciousOneshot

      return true
    })
  }, [solves, searchQuery, filterType])

  // Statistics summaries
  const stats = useMemo(() => {
    let flagSharingCount = 0
    let aiAgentCount = 0
    let oneshotCount = 0

    solves.forEach((s) => {
      if (s.is_flag_sharing) {
        flagSharingCount++
      }
      if ((s.ai_confidence_score ?? 0) >= 50) {
        aiAgentCount++
      }
      if (s.is_oneshot) {
        oneshotCount++
      }
    })

    return {
      totalSolves: solves.length,
      flagSharingCount,
      aiAgentCount,
      oneshotCount,
      suspiciousCount: flagSharingCount + aiAgentCount + oneshotCount,
    }
  }, [solves])

  return {
    user,
    authLoading,
    isLoading,
    isAdminUser,
    solves: filteredSolves,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    stats,
    isRefreshing,
    isRealtimeConnected,
    lastUpdatedAt,
    refresh,
  }
}

