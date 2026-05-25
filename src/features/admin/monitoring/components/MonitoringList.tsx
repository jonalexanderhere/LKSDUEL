"use client"

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, Bot, Zap, ShieldAlert, Clock, RefreshCw, User, Award, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui'
import { formatRelativeDate } from '@/shared/lib'
import type { SolveMonitoringRow } from '../types'

interface MonitoringListProps {
  solves: SolveMonitoringRow[]
  isLoading: boolean
  onRefresh: () => void
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

export default function MonitoringList({ solves, isLoading, onRefresh }: MonitoringListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">Analyzing telemetry and compiling monitoring logs...</p>
      </div>
    )
  }

  if (solves.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">System Secure</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mt-1">
          No solved logs found matching your filters. All solves appear to be within acceptable thresholds.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {solves.map((s) => {
        // Heuristics flags
        const isFlagSharing = s.time_since_prev_solve_seconds !== null && s.time_since_prev_solve_seconds <= 300 // under 5 minutes
        const isUserSpamming = s.time_since_user_prev_solve_seconds !== null && s.time_since_user_prev_solve_seconds <= 60
        const isInstantSolve = s.time_to_solve_seconds !== null && s.time_to_solve_seconds <= 30
        const isSuspiciousOneshot = s.time_to_solve_seconds !== null && s.time_to_solve_seconds <= 180 && s.incorrect_attempts_count === 0 // under 3 minutes oneshot
        
        const isAiAgent = isUserSpamming || isInstantSolve
        const isOneshot = s.incorrect_attempts_count === 0
        const isSuspicious = isFlagSharing || isAiAgent || isSuspiciousOneshot

        return (
          <Card
            key={s.solve_id}
            className={`transition-all duration-300 relative overflow-hidden bg-white dark:bg-gray-800 border ${
              isSuspicious
                ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.08)] dark:border-red-900/80 dark:shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                : 'border-gray-200 dark:border-gray-700 shadow-sm'
            }`}
          >
            {/* Alert Indicator Bar */}
            {isSuspicious && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 dark:bg-red-500" />
            )}

            <CardContent className={`p-4 sm:p-5 ${isSuspicious ? 'pl-6 sm:pl-7' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Solves Info & Identity */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/user/${encodeURIComponent(s.username)}`}
                      className="font-bold text-base text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      {s.username}
                    </Link>
                    
                    {s.team_name && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono font-semibold">
                        [ {s.team_name} ]
                      </span>
                    )}

                    <span className="text-gray-400 dark:text-gray-500 text-xs">•</span>

                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {formatRelativeDate(s.solved_at)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Solved </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{s.challenge_title}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 ml-2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
                      +{s.points} pts
                    </span>
                  </div>

                  {/* Warning Messages */}
                  {isSuspicious && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      {isFlagSharing && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded border border-red-200/50 dark:border-red-900/40 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            Suspected Flag Sharing: Solved just {formatDuration(s.time_since_prev_solve_seconds!)} after the previous solver.
                          </span>
                        </div>
                      )}
                      
                      {isUserSpamming && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded border border-red-200/50 dark:border-red-900/40 w-fit">
                          <Bot className="w-3.5 h-3.5" />
                          <span>
                            AI Agent / Automation: Solved just {formatDuration(s.time_since_user_prev_solve_seconds!)} after their previous solve.
                          </span>
                        </div>
                      )}

                      {isInstantSolve && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded border border-red-200/50 dark:border-red-900/40 w-fit">
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            AI Agent / Speed: Solved in only {formatDuration(s.time_to_solve_seconds!)} after opening the challenge.
                          </span>
                        </div>
                      )}

                      {isSuspiciousOneshot && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded border border-red-200/50 dark:border-red-900/40 w-fit">
                          <Award className="w-3.5 h-3.5 text-yellow-500" />
                          <span>
                            Suspicious Oneshot: Solved in only {formatDuration(s.time_to_solve_seconds!)} on the first attempt with no failed attempts.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Telemetry Stats & Badges */}
                <div className="flex flex-wrap lg:flex-col lg:items-end gap-3 justify-start lg:justify-center border-t lg:border-t-0 border-gray-100 dark:border-gray-700/60 pt-3 lg:pt-0">
                  {/* Solve Badges */}
                  <div className="flex items-center gap-2">
                    {isOneshot ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black bg-yellow-500 text-black px-2.5 py-1 rounded shadow-sm">
                        <Award className="w-3 h-3" />
                        ONESHOT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        Attempts: {s.incorrect_attempts_count + 1}
                      </span>
                    )}
                    
                    {isSuspicious ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded shadow-md animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        SUSPICIOUS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded shadow-sm">
                        SECURE
                      </span>
                    )}
                  </div>

                  {/* Raw Telemetry */}
                  <div className="flex flex-wrap lg:justify-end gap-x-4 gap-y-1 text-xs font-mono text-gray-500 dark:text-gray-400">
                    {s.time_to_solve_seconds !== null && (
                      <span className="flex items-center gap-1" title="Time taken from viewing challenge to solving it">
                        <Clock className="w-3 h-3 text-gray-400" />
                        Duration: {formatDuration(s.time_to_solve_seconds)}
                      </span>
                    )}

                    {s.time_since_user_prev_solve_seconds !== null && (
                      <span className="flex items-center gap-1" title="Time elapsed since this user's previous solve of any challenge">
                        User Speed: {formatDuration(s.time_since_user_prev_solve_seconds)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
