export interface SolveMonitoringRow {
  solve_id: string
  user_id: string
  username: string
  team_name: string
  challenge_id: string
  challenge_title: string
  points: number
  solved_at: string
  time_since_prev_solve_seconds: number | null
  time_since_user_prev_solve_seconds: number | null
  incorrect_attempts_count: number
  time_to_solve_seconds: number | null
}
