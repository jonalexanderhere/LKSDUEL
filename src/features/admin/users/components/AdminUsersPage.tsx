"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { isAdmin } from '@/shared/lib'
import { AdminPageShell } from '../../shared'
import UserManagementList from '../../monitoring/components/UserManagementList'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      setIsLoading(false)
    }

    init()
    return () => {
      mounted = false
    }
  }, [authLoading, user, router])

  if (authLoading || isLoading) return <Loader fullscreen color="text-blue-500" />
  if (!user || !isAdminUser) return null

  return (
    <AdminPageShell>
      <div className="space-y-6 pb-12">
        <UserManagementList />
      </div>
    </AdminPageShell>
  )
}
