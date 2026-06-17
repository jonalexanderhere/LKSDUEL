'use client'

import Link from 'next/link'
import { InfoIcon, Users, Crown, ChartColumnDecreasing, Copy, Wrench, LogOut, CheckCircle2, Sparkles, Coins, UserX, Shield, Key, Lock } from 'lucide-react'
import TeamSolves from './TeamSolves'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { TeamMember, TeamInfo, TeamSummary, TeamChallenge } from '../types'
import { EmptyState } from '@/shared/components'

interface TeamPageContentProps {
  team: TeamInfo
  members: TeamMember[]
  summary: TeamSummary | null
  challenges: TeamChallenge[]
  currentUserId?: string
  canManage?: boolean
  busy?: boolean
  showManageActions?: boolean
  onLeaveTeam?: () => void
  onKickMember?: (member: TeamMember) => void
  onTransferCaptain?: (member: TeamMember) => void
}

export default function TeamPageContent({
  team,
  members,
  summary,
  challenges,
  currentUserId,
  canManage = false,
  busy = false,
  showManageActions = false,
  onLeaveTeam,
  onKickMember,
  onTransferCaptain,
}: TeamPageContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-amber-900/10 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-50 dark:text-amber-50 flex items-center gap-2">
              <InfoIcon size={18} className="text-amber-500" /> Team Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-amber-500/70 dark:text-amber-500/70 uppercase tracking-wide mb-1">Team Name</div>
              <div className="flex items-center gap-2 justify-between">
                <div className="text-2xl font-bold text-amber-50 dark:text-amber-50">{team.name}</div>
              </div>
            </div>
            <div className="pt-2 space-y-3 border-t border-gray-100 dark:border-gray-700 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-amber-500/70 dark:text-amber-500/70 flex items-center gap-2">
                  <Shield size={14} /> Team ID
                </span>
                <span className="font-mono text-xs text-amber-100 dark:text-amber-500/70">{team.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-900/10 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-50 dark:text-amber-50 flex items-center gap-2">
              <ChartColumnDecreasing size={18} className="text-amber-500" /> Team Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-200 to-indigo-400 dark:from-indigo-900 dark:to-indigo-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-indigo-300/60 dark:ring-indigo-800/60">
                <CheckCircle2 className="h-5 w-5 text-indigo-800 dark:text-indigo-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-50 dark:text-amber-50">{summary?.unique_challenges ?? 0}</p>
                <p className="text-xs text-amber-500/70 dark:text-amber-500/70">Solves</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-green-200 to-green-400 dark:from-green-900 dark:to-green-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-green-300/60 dark:ring-green-800/60">
                <Sparkles className="h-5 w-5 text-green-800 dark:text-green-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-50 dark:text-amber-50">{summary?.unique_score ?? 0}</p>
                <p className="text-xs text-amber-500/70 dark:text-amber-500/70">Unique Score</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-900 dark:to-blue-700 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-blue-300/60 dark:ring-blue-800/60">
                <Coins className="h-5 w-5 text-amber-800 dark:text-amber-200" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-50 dark:text-amber-50">{summary?.total_score ?? summary?.unique_score ?? 0}</p>
                <p className="text-xs text-amber-500/70 dark:text-amber-500/70">Total Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showManageActions && (
        <Card className="bg-amber-900/10 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-50 dark:text-amber-50 flex items-center gap-2">
              <Wrench size={18} className="text-red-500" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {onLeaveTeam && (
              <Button variant="secondary" size="sm" onClick={onLeaveTeam} disabled={busy} className="w-full">
                <LogOut size={14} /> Leave Team
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-amber-900/10 dark:bg-amber-900/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-amber-50 dark:text-amber-50 flex items-center gap-2">
            <Users size={18} className="text-amber-500" /> Members ({members.length} / 3)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {members.length === 0 ? (
            <EmptyState
              icon={<UserX className="w-full h-full" />}
              title="No members found"
              description="Invite your friends to join your team!"
              containerHeight="py-8"
            />
          ) : (
            members.map((m) => (
              <div key={m.user_id} className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-700 py-3 last:border-0 hover:bg-amber-900/30 dark:hover:bg-amber-900/20/30 transition-colors rounded px-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.role === 'captain' ? <Crown size={16} className="text-yellow-500 dark:text-yellow-400" /> : <Users size={16} className="text-gray-400" />}
                      <Link
                        href={`/user/${encodeURIComponent(m.username)}`}
                        className="text-sm font-medium text-amber-50 dark:text-amber-50 hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors truncate max-w-[220px]"
                      >
                        {m.username}
                      </Link>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${m.role === 'captain'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-amber-900/20 dark:bg-amber-900/20 text-gray-600 dark:text-amber-500/70'
                        }`}>
                        {m.role}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-amber-900/20 dark:bg-amber-900/20 text-amber-100 dark:text-gray-200">
                        Solves <span className="font-semibold text-amber-50 dark:text-amber-50">{m.first_solve_count ?? 0}</span>
                      </span>
                      <span className="px-2 py-1 rounded bg-amber-900/20 dark:bg-amber-900/20 text-amber-100 dark:text-gray-200">
                        Points <span className="font-semibold text-amber-50 dark:text-amber-50">{m.first_solve_score ?? 0}</span>
                      </span>
                      <span className="px-2 py-1 rounded bg-amber-900/20 dark:bg-amber-900/20 text-amber-100 dark:text-gray-200">
                        Total Points <span className="font-semibold text-amber-50 dark:text-amber-50">{m.solo_score ?? 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {canManage && m.user_id !== currentUserId && onKickMember && onTransferCaptain && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTransferCaptain(m)}
                      disabled={busy}
                      aria-label={`Make ${m.username} captain`}
                    >
                      <Crown size={14} /> Make Captain
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onKickMember(m)}
                      disabled={busy}
                      aria-label={`Kick ${m.username} from team`}
                    >
                      Kick
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <TeamSolves challenges={challenges} />
    </div>
  )
}

