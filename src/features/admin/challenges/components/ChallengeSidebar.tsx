import React from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { Button, Card, CardContent } from '@/shared/ui'
import ChallengeOverviewCard from './ChallengeOverviewCard'
import RecentSolversList from './RecentSolversList'
import type { Challenge, SiteInfo, SolverRow } from '../types'

interface ChallengeSidebarProps {
  challenges: Challenge[]
  solvers: SolverRow[]
  siteInfo: SiteInfo | null
  isGlobalAdmin: boolean
  onViewAllSolvers: () => void
}

const ChallengeSidebar: React.FC<ChallengeSidebarProps> = ({
  challenges,
  solvers,
  siteInfo,
  isGlobalAdmin,
  onViewAllSolvers,
}) => {
  return (
    <aside className="lg:col-span-1 order-2 lg:order-none space-y-6 sticky top-0">
      <ChallengeOverviewCard
        challenges={challenges}
        info={isGlobalAdmin ? (siteInfo || undefined) : undefined}
        showViewAll={isGlobalAdmin}
      />
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="pt-6">
          <Link href="/admin/teams">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Users className="w-4 h-4" />
              Manage Teams
            </Button>
          </Link>
        </CardContent>
      </Card>
      <RecentSolversList solvers={solvers} onViewAll={onViewAllSolvers} />
    </aside>
  )
}

export default ChallengeSidebar
