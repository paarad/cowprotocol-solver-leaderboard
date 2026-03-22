"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TimePeriod } from "@/lib/solvers";

const periods: { value: TimePeriod; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

export default function TimePeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("period") ?? "live") as TimePeriod;

  function select(period: TimePeriod) {
    if (period === current) return;
    const params = new URLSearchParams();
    if (period !== "live") params.set("period", period);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-lg border border-[#30363d] bg-[#0d1117] p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => select(p.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            current === p.value
              ? "bg-[#F2A71B] text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
