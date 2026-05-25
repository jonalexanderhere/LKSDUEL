"use client"

import { useCallback, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/hooks'
import { getSolvesMonitoring, isAdmin } from '@/shared/lib'
import type { SolveMonitoringRow } from '../types'

export function useAdminMonitoringData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [isAdminUser, setIsAdminUser] = useState(false)
  const [solves, setSolves] = useState<SolveMonitoringRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'flag_sharing' | 'ai_agent' | 'oneshot' | 'suspicious'>('all')

  const fetchSolves = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getSolvesMonitoring()
      setSolves(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch monitoring logs')
    } finally {
      setIsLoading(false)
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

  const filteredSolves = useMemo(() => {
    return solves.filter((s) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        s.username.toLowerCase().includes(query) ||
        s.challenge_title.toLowerCase().includes(query) ||
        s.team_name.toLowerCase().includes(query)

      if (!matchesSearch) return false

      // 2. Alert Types Heuristics
      const isFlagSharing = s.time_since_prev_solve_seconds !== null && s.time_since_prev_solve_seconds <= 300 // under 5 minutes
      const isSuspiciousOneshot = s.time_to_solve_seconds !== null && s.time_to_solve_seconds <= 180 && s.incorrect_attempts_count === 0 // under 3 minutes & oneshot
      const isAiAgent =
        (s.time_since_user_prev_solve_seconds !== null && s.time_since_user_prev_solve_seconds <= 60) || // solved another chall within 60s
        (s.time_to_solve_seconds !== null && s.time_to_solve_seconds <= 30) // solved within 30s of view

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
      if (s.time_since_prev_solve_seconds !== null && s.time_since_prev_solve_seconds <= 300) {
        flagSharingCount++
      }
      if (
        (s.time_since_user_prev_solve_seconds !== null && s.time_since_user_prev_solve_seconds <= 60) ||
        (s.time_to_solve_seconds !== null && s.time_to_solve_seconds <= 30)
      ) {
        aiAgentCount++
      }
      if (s.time_to_solve_seconds !== null && s.time_to_solve_seconds <= 180 && s.incorrect_attempts_count === 0) {
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
    refresh: fetchSolves,
  }
}
