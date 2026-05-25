"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/shared/contexts';
import { Loader } from '@/shared/components';
import LogsList from "../logs/LogsList";
import { Flame } from "lucide-react";

export default function AttackFeedPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading) return <Loader fullscreen color="text-red-500" />;
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-red-600 dark:text-red-500 uppercase tracking-widest flex items-center gap-2">
          <Flame size={28} className="fill-red-600/10 animate-pulse" />
          Attack-Feed (First Bloods)
        </h1>
      </div>
      <div className="min-h-[400px]">
        <LogsList tabType="firstblood" eventId="all" />
      </div>
    </main>
  );
}
