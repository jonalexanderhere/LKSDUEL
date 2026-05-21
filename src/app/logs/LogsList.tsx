"use client";

// React Imports
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy } from "lucide-react";

// Shared Imports
import { Loader } from '@/shared/components';
import { useLogs } from '@/shared/contexts';
import { formatRelativeDate } from '@/shared/lib'

export type LogEntry = {
  log_type: "new_challenge" | "first_blood" | "solve";
  log_challenge_id: string;
  log_challenge_title: string;
  log_category: string;
  log_user_id?: string;
  log_username?: string;
  log_created_at: string;
};

export default function LogsList({ tabType = 'challenges', eventId }: { tabType?: 'challenges' | 'solves' | 'firstblood', eventId?: string | null | 'all' }) {
  const [notifications, setNotifications] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFeed } = useLogs()

  const eventKey = eventId === undefined ? 'any' : (eventId === null ? 'main' : String(eventId))
  const cacheKey = `${tabType}:${eventKey}`

  useEffect(() => {
    (async () => {
      setLoading(true);

      const merged = await getFeed(tabType, eventId)
      setNotifications(merged as LogEntry[])
      setLoading(false)
    })();
  }, [cacheKey, eventId, getFeed, tabType]);

  // Filter based on tab type
  const challengeLogs = notifications.filter(n => n.log_type === 'new_challenge');
  const solveLogs = notifications.filter(n => n.log_type === 'solve');
  const firstBloodLogs = notifications.filter(n => n.log_type === 'first_blood');
  const filteredNotifications = tabType === 'solves'
    ? solveLogs
    : tabType === 'firstblood'
      ? firstBloodLogs
      : challengeLogs;
  const featuredFirstBlood = tabType === 'firstblood' && firstBloodLogs.length > 0 ? firstBloodLogs[0] : null;

  if (loading && notifications.length === 0) return <Loader fullscreen color="text-blue-500" />;

  if (filteredNotifications.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border rounded-lg px-4 py-6 shadow bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center text-center text-sm text-gray-600 dark:text-gray-300"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mb-3">
          <svg
            width="22"
            height="22"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <p className="font-medium text-gray-700 dark:text-gray-200">No logs found</p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">You’re all caught up!</p>
      </motion.div>
    );

  return (
    <div className="space-y-3">
      {featuredFirstBlood && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative overflow-hidden rounded-xl border border-red-500/70 bg-gradient-to-b from-red-900 via-red-950 to-black px-5 py-5 shadow-[0_16px_45px_rgba(220,38,38,0.5)]"
        >
          <motion.div
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(252,165,165,0.35),transparent_50%)]"
          />
          <div className="relative">
            <div className="text-[11px] font-black tracking-[0.35em] text-red-200/95">FIRST BLOOD</div>
            <div className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-red-400">FIRST BLOOD</div>
            <p className="mt-4 text-center text-2xl font-extrabold text-zinc-100">
              {featuredFirstBlood.log_username || 'unknown'}
            </p>
            <p className="mt-2 text-center text-2xl font-black text-red-500">
              {featuredFirstBlood.log_challenge_title}
            </p>
            <p className="mt-3 text-center text-xs uppercase tracking-[0.22em] text-zinc-400">
              {featuredFirstBlood.log_category}
            </p>
          </div>
        </motion.div>
      )}
      <motion.ul
        key={cacheKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: loading ? 0.6 : 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-2"
      >
      {filteredNotifications.map((notif, idx) => (
        <motion.li
          key={idx}
          className={`border rounded-lg px-4 py-3 shadow flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm transition-colors duration-150 min-w-0 ${
            notif.log_type === "first_blood"
              ? "bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border-red-300 dark:from-red-950/50 dark:via-rose-950/40 dark:to-amber-950/30 dark:border-red-800/60 hover:bg-red-50/80"
              : "bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
          }`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Icon */}
          <span className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${
            notif.log_type === "first_blood" ? "bg-red-100 dark:bg-red-900/40" : "bg-blue-100 dark:bg-blue-900"
          }`}>
            {notif.log_type === "new_challenge" ? (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 19V6" />
                <path d="M5 12l7-7 7 7" />
              </svg>
            ) : notif.log_type === "first_blood" ? (
              <Trophy size={18} className="text-amber-500" />
            ) : (
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>

          {/* Content */}
          <div className="flex-1 flex flex-wrap items-center gap-x-2 min-w-0">
            {notif.log_type === "new_challenge" ? (
              <>
                <span className="font-semibold text-blue-600 dark:text-blue-300">New Challenge:</span>
                <span className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-block">{notif.log_challenge_title}</span>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            ) : notif.log_type === "first_blood" ? (
              <>
                <span className="inline-flex items-center rounded-md bg-red-600 text-white px-2 py-0.5 text-[10px] font-black tracking-wider shadow-sm">
                  FIRST BLOOD
                </span>
                <motion.span
                  animate={{ opacity: [0.35, 0.9, 0.35] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="inline-block h-2 w-2 rounded-full bg-yellow-400"
                />
                <span className="inline-flex items-center gap-1 min-w-0">
                  <Link
                    href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"}
                    className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                  >
                    <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate">
                      {notif.log_username && notif.log_username.length > 20
                        ? `${notif.log_username.slice(0, 20)}...`
                        : notif.log_username}
                    </span>
                  </Link>
                </span>
                <span className="text-red-700 dark:text-red-200 font-semibold">solved</span>
                <b className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-block">{notif.log_challenge_title}</b>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate min-w-0">
                  <Link
                    href={notif.log_username ? `/user/${encodeURIComponent(notif.log_username)}` : "#"}
                    className="text-blue-600 dark:text-blue-300 font-medium hover:underline"
                  >
                    <span className="inline-flex items-center gap-1 max-w-[160px] sm:max-w-[300px] truncate">
                      {notif.log_username && notif.log_username.length > 20
                        ? `${notif.log_username.slice(0, 20)}...`
                        : notif.log_username}
                    </span>
                  </Link>
                </span>
                <span className="text-gray-700 dark:text-gray-300">solved</span>
                <b className="dark:text-gray-100 font-medium max-w-[220px] sm:max-w-[300px] truncate inline-flex">{notif.log_challenge_title}</b>
                <span className="text-gray-500 dark:text-gray-400">[{notif.log_category}]</span>
              </>
            )}
          </div>

          {/* Date */}
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap sm:ml-2 w-full sm:w-auto text-left sm:text-right">
            {notif.log_created_at ? formatRelativeDate(notif.log_created_at) : ""}
          </span>
        </motion.li>
      ))}
      </motion.ul>
    </div>
  );
}
