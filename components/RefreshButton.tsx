"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
      setLastUpdated(new Date());
      setSecondsAgo(0);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-[#161b22] border border-[#30363d] px-4 py-2 text-sm text-gray-300 hover:text-white hover:border-[#F2A71B] transition-colors disabled:opacity-50"
      >
        <span className={isPending ? "animate-spin" : ""}>↻</span>
        Refresh
      </button>
      <span className="text-xs text-gray-500">
        Updated {secondsAgo}s ago
      </span>
    </div>
  );
}
