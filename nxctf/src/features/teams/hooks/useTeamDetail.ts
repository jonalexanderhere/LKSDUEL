import { useState, useEffect, useRef } from 'react'
import { getTeamByName, getTeamChallengesByName } from '@/shared/lib'
import { TeamInfo, TeamMember, TeamSummary, TeamChallenge } from '../types'

export function useTeamDetail(user: any, teamName: string, effectiveSelectedEvent: string | number) {
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [summary, setSummary] = useState<TeamSummary | null>(null)
  const [challenges, setChallenges] = useState<TeamChallenge[]>([])
  const [solvedEventIds, setSolvedEventIds] = useState<string[]>([])
  const [hasMainSolved, setHasMainSolved] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const initialLoadDone = useRef(false)
  useEffect(() => {
    if (!user || !teamName) return
    const fetchData = async () => {
      if (!initialLoadDone.current) setLoading(true)
      setError(null)

      const p_event_id = (effectiveSelectedEvent === 'all' || effectiveSelectedEvent === 'main') ? null : String(effectiveSelectedEvent)
      const p_event_mode = effectiveSelectedEvent === 'all' ? 'any' : effectiveSelectedEvent === 'main' ? 'main' : 'event'

      const [teamRes, challengesRes] = await Promise.all([
        getTeamByName(teamName, p_event_id, p_event_mode),
        getTeamChallengesByName(teamName, p_event_id, p_event_mode),
      ])

      if (teamRes.error) {
        setError(teamRes.error)
        setTeam(null)
        setMembers([])
        setSummary(null)
        setSolvedEventIds([])
        setHasMainSolved(false)
      } else {
        setTeam(teamRes.team ?? null)
        setMembers(teamRes.members ?? [])
        setSummary(teamRes.stats ?? null)
        setSolvedEventIds(teamRes.solved_event_ids ?? [])
        setHasMainSolved(!!teamRes.has_main_solved)
      }

      setChallenges(challengesRes.challenges ?? [])
      if (!initialLoadDone.current) {
        setLoading(false)
        initialLoadDone.current = true
      }
    }
    fetchData()
  }, [user, teamName, effectiveSelectedEvent])

  return {
    loading,
    team,
    members,
    summary,
    challenges,
    solvedEventIds,
    hasMainSolved,
    error
  }
}
