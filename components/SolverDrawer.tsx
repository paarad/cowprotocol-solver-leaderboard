"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SolverStats, TimePeriod, formatScore } from "@/lib/solvers";
import { CompetitionSummary } from "@/lib/api";

interface SolverDrawerProps {
  solver: SolverStats | null;
  competitions: CompetitionSummary[];
  period: TimePeriod;
  onClose: () => void;
}

export default function SolverDrawer({
  solver,
  competitions,
  period,
  onClose,
}: SolverDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!solver) return null;

  // Live: per-auction bar chart data
  const solverAuctions = competitions
    .filter((c) =>
      c.solutions.some(
        (s) => s.solverAddress.toLowerCase() === solver.address
      )
    )
    .sort((a, b) => a.auctionId - b.auctionId)
    .slice(-20)
    .map((c) => {
      const solution = c.solutions.find(
        (s) => s.solverAddress.toLowerCase() === solver.address
      )!;
      return {
        auctionId: c.auctionId,
        shortId: `${c.auctionId}`.slice(-5),
        score: Number(solution.score),
        won: solution.ranking === 1,
      };
    });

  const bestScore =
    solverAuctions.length > 0
      ? Math.max(...solverAuctions.map((a) => a.score))
      : 0;

  // Dune: weekly history line chart data
  const weeklyData = (solver.weeklyHistory ?? []).map((w) => ({
    ...w,
    shortWeek: new Date(w.week).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  function copyAddress() {
    navigator.clipboard.writeText(solver!.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tooltipStyle = {
    backgroundColor: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "8px",
    color: "#fff",
  };

  return (
    <Sheet open={!!solver} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="bg-[#161b22] border-[#30363d] text-white overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-[#F2A71B] text-xl">
            {solver.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Address */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-gray-300 break-all">
                {solver.address}
              </code>
              <button
                onClick={copyAddress}
                className="shrink-0 text-xs px-2 py-1 rounded bg-[#30363d] hover:bg-[#3d444d] text-gray-300"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-[#0d1117] p-3 text-center">
              <p className="text-2xl font-bold text-white">
                {solver.totalParticipations}
              </p>
              <p className="text-xs text-gray-400">Participations</p>
            </div>
            <div className="rounded-lg bg-[#0d1117] p-3 text-center">
              <p className="text-2xl font-bold text-[#3fb950]">
                {solver.totalWins}
              </p>
              <p className="text-xs text-gray-400">Wins</p>
            </div>
            <div className="rounded-lg bg-[#0d1117] p-3 text-center">
              <p className="text-2xl font-bold text-[#F2A71B]">
                {solver.winRate}%
              </p>
              <p className="text-xs text-gray-400">Win Rate</p>
            </div>
          </div>

          {/* Trend (Dune periods only) */}
          {solver.trend != null && (
            <p className="text-sm">
              Trend vs previous period:{" "}
              {solver.trend > 0 ? (
                <span className="text-[#3fb950] font-medium">
                  +{solver.trend}% ▲
                </span>
              ) : solver.trend < 0 ? (
                <span className="text-[#f85149] font-medium">
                  {solver.trend}% ▼
                </span>
              ) : (
                <span className="text-gray-500">No change</span>
              )}
            </p>
          )}

          {/* Explorer link */}
          <a
            href={`https://explorer.cow.fi/address/${solver.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-[#F2A71B] hover:underline"
          >
            View on CoW Explorer →
          </a>

          {/* Chart: Bar chart for live, Line chart for Dune periods */}
          {period === "live" && solverAuctions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Recent Auction Performance
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={solverAuctions}>
                    <XAxis
                      dataKey="shortId"
                      tick={{ fill: "#8b949e", fontSize: 10 }}
                      axisLine={{ stroke: "#30363d" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8b949e", fontSize: 10 }}
                      axisLine={{ stroke: "#30363d" }}
                      tickLine={false}
                      tickFormatter={(v) => formatScore(v)}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [
                        formatScore(Number(value)),
                        "Score",
                      ]}
                      labelFormatter={(label) => `Auction ...${label}`}
                    />
                    <Bar dataKey="score" radius={[2, 2, 0, 0]}>
                      {solverAuctions.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.won ? "#3fb950" : "#484f58"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Best score:{" "}
                <span className="text-white font-medium">
                  {formatScore(bestScore)}
                </span>
              </p>
            </div>
          )}

          {period !== "live" && weeklyData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Weekly Win Rate
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#30363d"
                    />
                    <XAxis
                      dataKey="shortWeek"
                      tick={{ fill: "#8b949e", fontSize: 10 }}
                      axisLine={{ stroke: "#30363d" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#8b949e", fontSize: 10 }}
                      axisLine={{ stroke: "#30363d" }}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${Number(value)}%`, "Win Rate"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="winRate"
                      stroke="#F2A71B"
                      strokeWidth={2}
                      dot={{ fill: "#F2A71B", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
