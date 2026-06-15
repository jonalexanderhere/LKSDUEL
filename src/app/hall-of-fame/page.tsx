"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/contexts";
import { Loader } from "@/shared/components";
import { supabase } from "@/shared/lib/supabase";
import { ImageWithFallback } from "@/shared/components";
import { Trophy, Crown, Medal, Search, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { subscribeToLogSignals } from "@/shared/lib/challenges";

interface UserSolveCount {
  username: string;
  profile_picture_url: string | null;
  count: number;
}

export default function HallOfFamePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [solvers, setSolvers] = useState<UserSolveCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Authenticate user
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch and process solves data
  const fetchSolversData = async () => {
    try {
      const { data, error } = await supabase
        .from("solves")
        .select(`
          user_id,
          users (
            username,
            profile_picture_url
          )
        `);

      if (error) {
        console.error("Error fetching solves for Hall of Fame:", error);
        return;
      }

      // Aggregate counts by username
      const countMap: Record<string, { username: string; profile_picture_url: string | null; count: number }> = {};
      
      for (const item of (data || []) as any[]) {
        const username = item.users?.username;
        const profile_picture_url = item.users?.profile_picture_url || null;
        if (!username) continue;

        if (!countMap[username]) {
          countMap[username] = {
            username,
            profile_picture_url,
            count: 0,
          };
        }
        countMap[username].count += 1;
      }

      // Convert to sorted array
      const sortedSolvers = Object.values(countMap).sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.username.localeCompare(b.username);
      });

      setSolvers(sortedSolvers);
    } catch (err) {
      console.error("Error in Hall of Fame fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchSolversData();

    // Subscribe to database solves signals for real-time updates
    const unsubscribe = subscribeToLogSignals(() => {
      fetchSolversData();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Filter solvers by search query
  const filteredSolvers = useMemo(() => {
    if (!searchQuery.trim()) return solvers;
    return solvers.filter((s) =>
      s.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [solvers, searchQuery]);

  // Top solver(s) details
  const topSolver = useMemo(() => {
    if (solvers.length === 0) return null;
    return solvers[0]; // First element is rank 1 because it's pre-sorted
  }, [solvers]);

  if (authLoading) return <Loader fullscreen color="text-yellow-500" />;
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 mt-10">
      {/* Decorative background mist */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest flex items-center gap-2">
            <Trophy size={32} className="fill-yellow-600/10 animate-bounce text-yellow-500" />
            Hall of Fame
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Elite agents with the highest number of challenge solves.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader color="text-yellow-500" />
          <p className="text-sm text-gray-500">Retrieving elite solvers...</p>
        </div>
      ) : solvers.length === 0 ? (
        <div className="text-center py-20 border rounded-sm border-double border-4 border-amber-900/70 bg-[#fdf6e3] dark:bg-[#1A100C] dark:border-gray-700">
          <Award size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-3" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No solves logged yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to submit a flag and enter the Hall of Fame!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Solver Featured Card */}
          {topSolver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-sm border-double border-4 border-amber-900/70 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-yellow-500/10 to-transparent p-6 sm:p-8 shadow-[0_0_30px_rgba(234,179,8,0.15)] flex flex-col sm:flex-row items-center gap-6"
            >
              {/* Crown Background Glow */}
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 text-yellow-500/10 pointer-events-none">
                <Crown size={220} className="stroke-[0.5]" />
              </div>

              {/* Avatar Showcase */}
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 text-yellow-500 animate-pulse">
                  <Crown size={36} className="fill-yellow-500" />
                </div>
                <div className="p-1 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                  <ImageWithFallback
                    src={topSolver.profile_picture_url}
                    alt={topSolver.username}
                    size={80}
                    className="rounded-full border-2 border-black dark:border-gray-900 bg-[#fdf6e3]"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500 text-black shadow">
                  Rank 1
                </div>
              </div>

              {/* Top Solver Bio/Stats */}
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs font-mono font-bold tracking-[0.2em] text-yellow-600 dark:text-yellow-400 uppercase mb-1">
                  CURRENT TOP SOLVER
                </div>
                <Link
                  href={`/user/${encodeURIComponent(topSolver.username)}`}
                  className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition hover:underline"
                >
                  {topSolver.username}
                </Link>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-sm px-4 py-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-mono">TOTAL SOLVES</span>
                    <span className="text-xl font-extrabold text-yellow-600 dark:text-yellow-400">
                      {topSolver.count} Challenges
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    ðŸ† Standing strong at the peak!
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard Table List */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search solver username..."
                className="w-full pl-10 pr-4 py-2 border rounded-sm bg-[#fdf6e3] dark:bg-[#1A100C] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* List */}
            <div className="border border-amber-900/50 dark:border-gray-700 rounded-sm border-double border-4 border-amber-900/70 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.6)] bg-[#fdf6e3] dark:bg-[#1A100C]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-900/50 dark:border-gray-700 bg-[#f4e4bc] dark:bg-[#1A100C]/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="py-4 px-6 text-center w-20">Rank</th>
                      <th className="py-4 px-6">Solver</th>
                      <th className="py-4 px-6 text-right w-36">Solves Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredSolvers.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                            No users matched "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredSolvers.map((solver, idx) => {
                          const originalRank = solvers.findIndex((s) => s.username === solver.username) + 1;
                          
                          // Medal / Rank formatting
                          let rankDisplay: React.ReactNode = originalRank;
                          if (originalRank === 1) {
                            rankDisplay = <span className="text-xl" title="Gold Medal">ðŸ¥‡</span>;
                          } else if (originalRank === 2) {
                            rankDisplay = <span className="text-xl" title="Silver Medal">ðŸ¥ˆ</span>;
                          } else if (originalRank === 3) {
                            rankDisplay = <span className="text-xl" title="Bronze Medal">ðŸ¥‰</span>;
                          }

                          return (
                            <motion.tr
                              key={solver.username}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                              className="border-b border-amber-900/30 dark:border-gray-700/60 hover:bg-yellow-500/5 dark:hover:bg-yellow-500/[0.03] transition-colors"
                            >
                              <td className="py-4 px-6 text-center font-bold font-mono text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center h-8 w-8 mx-auto rounded-full bg-[#eaddb6] dark:bg-gray-700/50">
                                  {rankDisplay}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <ImageWithFallback
                                    src={solver.profile_picture_url}
                                    alt={solver.username}
                                    size={36}
                                    className="rounded-full"
                                  />
                                  <Link
                                    href={`/user/${encodeURIComponent(solver.username)}`}
                                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-yellow-600 dark:hover:text-yellow-400 hover:underline transition truncate max-w-xs"
                                  >
                                    {solver.username}
                                  </Link>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-right font-bold text-gray-950 dark:text-white">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#eaddb6] dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-amber-900/50 dark:border-gray-600/50">
                                  {solver.count} Solves
                                </span>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

