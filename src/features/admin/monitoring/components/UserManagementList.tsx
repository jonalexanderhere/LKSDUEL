"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Search, Trash2, ShieldAlert, User, Shield, RefreshCw, AlertTriangle } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui'
import { getAllUsersWithStats, deleteUserAccount, type UserWithStats } from '@/shared/lib'

export default function UserManagementList() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Delete dialog state
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchUsers = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const data = await getAllUsersWithStats()
      setUsers(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch user lists')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(true)
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return users
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.team_name.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const handleDeleteClick = (user: UserWithStats) => {
    setSelectedUser(user)
    setConfirmUsername('')
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return
    if (confirmUsername !== selectedUser.username) {
      toast.error('Username does not match')
      return
    }

    setIsDeleting(true)
    try {
      await deleteUserAccount(selectedUser.id)
      toast.success(`Successfully deleted user "${selectedUser.username}"`)
      setSelectedUser(null)
      fetchUsers(false)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to delete user account')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md">
      <CardHeader className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            User Management & Statistics
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(false)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1 text-xs border-gray-300 dark:border-gray-700 h-9 bg-white dark:bg-gray-800"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync
            </Button>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search username or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 py-1 h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading users data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No users found matching your search.' : 'No users registered on the platform.'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-100 dark:border-gray-700/50 rounded-lg">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow className="border-b border-gray-100 dark:border-gray-700/60">
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">User</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Team Name</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">Solved Challenges</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Joined Date</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0 hover:bg-gray-50/55 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <TableCell className="font-semibold text-gray-900 dark:text-gray-100 py-3.5">
                      {u.username}
                    </TableCell>
                    <TableCell className="py-3.5">
                      {u.is_admin ? (
                        <Badge className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 flex items-center gap-1 w-max font-bold px-2 py-0.5 text-[10px] uppercase">
                          <Shield className="w-3 h-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 flex items-center gap-1 w-max font-bold px-2 py-0.5 text-[10px] uppercase">
                          <User className="w-3 h-3" />
                          Player
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300 font-medium py-3.5">
                      {u.team_name}
                    </TableCell>
                    <TableCell className="text-center font-bold text-gray-900 dark:text-gray-100 py-3.5">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-black ${
                        u.solve_count > 0 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400' 
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600'
                      }`}>
                        {u.solve_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400 text-xs py-3.5">
                      {new Date(u.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right py-3.5">
                      {!u.is_admin ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(u)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 dark:hover:bg-red-950/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete user</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic pr-2">Protected</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-500 flex items-center gap-2 font-black uppercase tracking-wider text-base">
              <ShieldAlert className="w-5 h-5" />
              Confirm Delete User Account
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-2">
              This action is <strong className="text-red-600 dark:text-red-500 uppercase">irreversible</strong>. Deleting this user will completely erase their auth account, profile, solving history, and team memberships.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-3 text-red-800 dark:text-red-400 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">Warning:</p>
                  <p className="mt-0.5">Player <strong>{selectedUser.username}</strong> has solved <strong>{selectedUser.solve_count}</strong> challenge(s) and belongs to team <strong>{selectedUser.team_name}</strong>.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type <strong className="text-gray-900 dark:text-gray-200">{selectedUser.username}</strong> to confirm:
                </label>
                <Input
                  type="text"
                  placeholder={selectedUser.username}
                  value={confirmUsername}
                  onChange={(e) => setConfirmUsername(e.target.value)}
                  className="h-10 text-sm focus:ring-red-500/50 focus:border-red-500"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setSelectedUser(null)}
              className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting || !selectedUser || confirmUsername !== selectedUser.username}
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
