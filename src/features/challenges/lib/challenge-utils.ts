import { Globe, Bomb, Binary, Cpu, Search, Puzzle, Shield, Terminal, Lightbulb, Eye, Wifi } from 'lucide-react'
import { ImageIcon } from 'lucide-react'
import type { ChallengeWithSolve } from '@/shared/types'

export interface CategoryDetails {
  color: string
  borderColor: string
  badgeColor: string
}

export function getCategoryDetails(category: string): CategoryDetails {
  const cat = (category || '').toLowerCase()
  if (cat.includes('intro'))        return { color: 'text-yellow-600',  borderColor: 'border-yellow-600/30',  badgeColor: 'bg-yellow-600/15 text-yellow-500'   }
  if (cat.includes('boot to root')) return { color: 'text-red-700', borderColor: 'border-red-700/30', badgeColor: 'bg-red-700/15 text-red-500'  }
  if (cat.includes('web'))          return { color: 'text-amber-500',    borderColor: 'border-amber-500/30',    badgeColor: 'bg-amber-500/15 text-amber-400'        }
  if (cat.includes('forensic'))     return { color: 'text-stone-500',    borderColor: 'border-stone-500/30',    badgeColor: 'bg-stone-500/15 text-stone-400'        }
  if (cat.includes('osint'))        return { color: 'text-orange-500',    borderColor: 'border-orange-500/30',    badgeColor: 'bg-orange-500/15 text-orange-400'        }
  if (cat.includes('crypto'))       return { color: 'text-zinc-400',  borderColor: 'border-zinc-500/30',  badgeColor: 'bg-zinc-500/15 text-zinc-300'    }
  if (cat.includes('rev'))          return { color: 'text-neutral-500',  borderColor: 'border-neutral-500/30',  badgeColor: 'bg-neutral-500/15 text-neutral-400'    }
  if (cat.includes('pwn') || cat.includes('exploit')) return { color: 'text-red-600', borderColor: 'border-red-600/30', badgeColor: 'bg-red-600/15 text-red-500' }
  if (cat.includes('steg'))         return { color: 'text-rose-500',    borderColor: 'border-rose-500/30',    badgeColor: 'bg-rose-500/15 text-rose-400'        }
  if (cat.includes('network'))      return { color: 'text-amber-600',  borderColor: 'border-amber-600/30',  badgeColor: 'bg-amber-600/15 text-amber-500'    }
  if (cat.includes('misc'))         return { color: 'text-stone-500',    borderColor: 'border-stone-500/30',    badgeColor: 'bg-stone-500/15 text-stone-400'        }
  return                                   { color: 'text-amber-500',    borderColor: 'border-amber-500/30',    badgeColor: 'bg-amber-500/15 text-amber-400'        }
}

export interface DifficultyStyle {
  dotClass: string
  textClass: string
}

export function getDifficultyStyle(colorName: string): DifficultyStyle {
  const map: Record<string, DifficultyStyle> = {
    cyan:   { dotClass: 'bg-cyan-500',   textClass: 'text-cyan-400'   },
    green:  { dotClass: 'bg-green-500',  textClass: 'text-green-400'  },
    yellow: { dotClass: 'bg-yellow-400', textClass: 'text-yellow-400' },
    red:    { dotClass: 'bg-red-500',    textClass: 'text-red-400'    },
    purple: { dotClass: 'bg-purple-500', textClass: 'text-purple-400' },
  }
  return map[colorName] ?? { dotClass: 'bg-gray-400', textClass: 'text-gray-400' }
}


export function normalizeChallengeHints(raw: unknown): string[] {
  let hints: string[] = []

  if (Array.isArray(raw)) {
    hints = raw.filter((hint): hint is string => typeof hint === 'string')
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) hints = parsed.filter((hint): hint is string => typeof hint === 'string')
      else if (typeof parsed === 'string') hints = [parsed]
    } catch {
      if (raw.trim() !== '') hints = [raw]
    }
  } else if (raw && typeof raw !== 'object') {
    hints = [String(raw)]
  }

  return hints
}

export function getDifficultyOrder(difficultyStyles?: Record<string, unknown>): string[] {
  return Object.keys(difficultyStyles || {}).map((key) => String(key).trim().toLowerCase())
}

export function getDifficultyRank(difficulty: unknown, difficultyOrder: string[]): number {
  if (!difficulty) return difficultyOrder.length

  const normalized = String(difficulty).trim().toLowerCase()
  if (normalized === 'imposible') {
    const fixedIndex = difficultyOrder.indexOf('impossible')
    return fixedIndex === -1 ? difficultyOrder.length : fixedIndex
  }

  const index = difficultyOrder.indexOf(normalized)
  return index === -1 ? difficultyOrder.length : index
}

export function sortChallengesByDisplayPriority<T extends Pick<ChallengeWithSolve, 'points' | 'total_solves' | 'difficulty' | 'title'>>(
  list: T[],
  difficultyOrder: string[]
): T[] {
  return [...list].sort((a, b) => {
    if ((a.points ?? 0) !== (b.points ?? 0)) return (a.points ?? 0) - (b.points ?? 0)

    const solvesA = a.total_solves ?? 0
    const solvesB = b.total_solves ?? 0
    if (solvesA !== solvesB) return solvesB - solvesA

    const rankA = getDifficultyRank(a.difficulty, difficultyOrder)
    const rankB = getDifficultyRank(b.difficulty, difficultyOrder)
    if (rankA !== rankB) return rankA - rankB

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

export function sortChallengesByNewest<T extends Pick<ChallengeWithSolve, 'created_at' | 'title'>>(
  list: T[]
): T[] {
  return [...list].sort((a, b) => {
    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0

    if (createdA !== createdB) return createdB - createdA

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

export function buildFuzzyOrderedList(preferredOrder: string[], values: string[]): string[] {
  const matchedValues = new Set<string>()

  return [
    ...preferredOrder.flatMap((preferred) => {
      const preferredLower = preferred.toLowerCase()
      const found = values.find((value) => {
        const valueLower = value.toLowerCase()
        return valueLower.includes(preferredLower) || preferredLower.includes(valueLower)
      })

      if (found && !matchedValues.has(found)) {
        matchedValues.add(found)
        return found
      }

      return [] as string[]
    }),
    ...values.filter((value) => !matchedValues.has(value)).sort(),
  ]
}

export function groupChallengesByCategory(challenges: ChallengeWithSolve[]): Record<string, ChallengeWithSolve[]> {
  return challenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) acc[challenge.category] = []
    acc[challenge.category].push(challenge)
    return acc
  }, {} as Record<string, ChallengeWithSolve[]>)
}
