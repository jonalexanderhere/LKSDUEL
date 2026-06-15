'use client'

import { useState } from 'react'
import { AlertCircle, Chrome, Loader2 } from 'lucide-react'
import { AuthService } from '@/features/auth'

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      const { error } = await AuthService.loginWithGoogle()
      if (error) {
        setError(error)
      }
      // Supabase akan redirect ke callback URL
    } catch {
      setError('Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="relative flex w-full items-center justify-center gap-2 rounded-sm border-double border-4 border-amber-900/70 border border-amber-900/50 bg-[#fdf6e3]/60 px-4 py-3 text-sm font-semibold text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-[#fdf6e3] hover:shadow-[0_8px_30px_rgba(249,115,22,0.06)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-[#fdf6e3]/5 dark:text-gray-100 dark:hover:bg-[#fdf6e3]/10"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
        <span>{loading ? 'Processing...' : 'Sign in with Google'}</span>
      </button>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border-double border-4 border-amber-900/70 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 flex-none" />
          {error}
        </div>
      )}
    </div>
  )
}

