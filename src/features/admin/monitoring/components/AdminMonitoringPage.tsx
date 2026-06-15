"use client"

import React from 'react'
import { AlertTriangle, Bot, Zap, ShieldAlert, Award, Search, RefreshCw, BarChart2, Shield } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { Loader } from '@/shared/components'
import { AdminPageShell } from '../../shared'
import { useAdminMonitoringData } from '../hooks/useAdminMonitoringData'
import MonitoringList from './MonitoringList'

export default function AdminMonitoringPage() {
  const {
    user,
    authLoading,
    isLoading,
    isAdminUser,
    solves,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    stats,
    isRefreshing,
    isRealtimeConnected,
    lastUpdatedAt,
    refresh,
  } = useAdminMonitoringData()

  if (authLoading || isLoading) return <Loader fullscreen color="text-amber-600 dark:text-amber-500" />
  if (!user || !isAdminUser) return null

  return (
    <AdminPageShell>
      <div className="space-y-6 pb-12">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-amber-900 dark:text-amber-50 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Solves Monitoring Telemetry
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>Real-time heuristic analysis for flag-sharing, automation scripts, and oneshot behaviors.</span>
              <span className={`inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full text-xs transition-all duration-300 border ${
                isRealtimeConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse'
              }`}>
                <span className={`h-2 w-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isRealtimeConnected ? 'LIVE SYNC' : 'SYNCING'}
              </span>
              {lastUpdatedAt && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Refreshed {lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 border-gray-300 dark:border-gray-700 bg-[#fdf6e3] dark:bg-[#1A100C] text-gray-700 dark:text-gray-200 hover:bg-[#f4e4bc] dark:hover:bg-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
          </Button>
        </div>

        {/* Stats Counter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#fdf6e3] dark:bg-[#1A100C] shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-amber-900/50 dark:border-gray-700/60 hover:border-blue-500/30 transition-all duration-300">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Solves</p>
                <h3 className="text-3xl font-black text-amber-900 dark:text-amber-50 mt-1">{stats.totalSolves}</h3>
              </div>
              <BarChart2 className="w-8 h-8 text-amber-600 dark:text-amber-500/80 dark:text-blue-400/80" />
            </CardContent>
          </Card>

          <Card className={`shadow-[0_4px_12px_rgba(0,0,0,0.6)] border transition-all duration-300 ${
            stats.flagSharingCount > 0 
              ? 'bg-gradient-to-br from-red-500/[0.02] to-red-600/[0.05] border-red-500/30 dark:border-red-950/60 dark:from-red-950/10 dark:to-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
              : 'bg-[#fdf6e3] dark:bg-[#1A100C] border-amber-900/50 dark:border-gray-700'
          }`}>
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Flag Sharing</p>
                <h3 className={`text-3xl font-black mt-1 ${stats.flagSharingCount > 0 ? 'text-red-600 dark:text-red-500' : 'text-amber-900 dark:text-amber-50'}`}>
                  {stats.flagSharingCount}
                </h3>
              </div>
              <AlertTriangle className={`w-8 h-8 ${stats.flagSharingCount > 0 ? 'text-red-500 animate-pulse' : 'text-gray-400 dark:text-gray-500'}`} />
            </CardContent>
          </Card>

          <Card className={`shadow-[0_4px_12px_rgba(0,0,0,0.6)] border transition-all duration-300 ${
            stats.aiAgentCount > 0 
              ? 'bg-gradient-to-br from-red-500/[0.02] to-red-600/[0.05] border-red-500/30 dark:border-red-950/60 dark:from-red-950/10 dark:to-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
              : 'bg-[#fdf6e3] dark:bg-[#1A100C] border-amber-900/50 dark:border-gray-700'
          }`}>
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">AI Suspicion</p>
                <h3 className={`text-3xl font-black mt-1 ${stats.aiAgentCount > 0 ? 'text-red-600 dark:text-red-500' : 'text-amber-900 dark:text-amber-50'}`}>
                  {stats.aiAgentCount}
                </h3>
              </div>
              <Bot className={`w-8 h-8 ${stats.aiAgentCount > 0 ? 'text-red-500 animate-pulse' : 'text-gray-400 dark:text-gray-500'}`} />
            </CardContent>
          </Card>

          <Card className="bg-[#fdf6e3] dark:bg-[#1A100C] shadow-[0_4px_12px_rgba(0,0,0,0.6)] border border-amber-900/50 dark:border-gray-700 hover:border-amber-500/30 transition-all duration-300">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Oneshots</p>
                <h3 className="text-3xl font-black text-amber-900 dark:text-amber-50 mt-1">{stats.oneshotCount}</h3>
              </div>
              <Award className="w-8 h-8 text-amber-500" />
            </CardContent>
          </Card>
        </div>

        {/* Filters and List Card */}
        <Card className="bg-[#fdf6e3] dark:bg-[#1A100C] border-amber-900/50 dark:border-gray-700 shadow-[0_6px_16px_rgba(0,0,0,0.8)]">
          <CardHeader className="flex flex-col gap-4 border-b border-amber-900/30 dark:border-gray-700/60 pb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Solve Activity Logs
              </CardTitle>

              {/* Search Utility */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user, team, challenge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 w-full text-sm rounded-sm border border-gray-300 dark:border-gray-700 bg-[#f4e4bc] dark:bg-[#1f140f] text-amber-900 dark:text-amber-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'all', label: 'All Solves', color: 'text-gray-600 dark:text-gray-300' },
                { type: 'suspicious', label: 'Suspicious Only', color: 'text-red-600 dark:text-red-400' },
                { type: 'flag_sharing', label: 'Flag Sharing', color: 'text-red-500' },
                { type: 'ai_agent', label: 'AI & Automation', color: 'text-red-500' },
                { type: 'oneshot', label: 'Oneshots', color: 'text-amber-600 dark:text-amber-400' },
              ].map((pill) => {
                const isActive = filterType === pill.type
                return (
                  <button
                    key={pill.type}
                    onClick={() => setFilterType(pill.type as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
                        : 'bg-[#f4e4bc] dark:bg-[#1f140f] border-amber-900/50 dark:border-gray-700 hover:bg-[#eaddb6] dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {pill.label}
                  </button>
                )
              })}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <MonitoringList solves={solves} isLoading={isLoading} onRefresh={refresh} />
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  )
}


