"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SolverStats, TimePeriod, formatScore } from "@/lib/solvers";

type SortKey =
  | "winRate"
  | "totalParticipations"
  | "totalWins"
  | "avgScore"
  | "name"
  | "trend";
type SortDir = "asc" | "desc";

interface LeaderboardTableProps {
  solvers: SolverStats[];
  onSolverClick: (solver: SolverStats) => void;
  period: TimePeriod;
}

export default function LeaderboardTable({
  solvers,
  onSolverClick,
  period,
}: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("winRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const showTrend = period !== "live";
  const showRecentForm = period === "live";

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...solvers].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") {
      return mul * a.name.localeCompare(b.name);
    }
    if (sortKey === "trend") {
      return mul * ((a.trend ?? 0) - (b.trend ?? 0));
    }
    return mul * (a[sortKey] - b[sortKey]);
  });

  const medal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const winRateColor = (rate: number) => {
    if (rate >= 50) return "text-[#3fb950]";
    if (rate >= 25) return "text-yellow-400";
    return "text-[#f85149]";
  };

  const borderColor = (rank: number) => {
    if (rank === 1) return "border-l-4 border-l-yellow-400";
    if (rank === 2) return "border-l-4 border-l-gray-300";
    if (rank === 3) return "border-l-4 border-l-amber-700";
    return "";
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="rounded-lg border border-[#2e3148] bg-[#242637] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2e3148] hover:bg-transparent">
            <TableHead className="text-gray-400 w-16">Rank</TableHead>
            <TableHead
              className="text-gray-400 cursor-pointer hover:text-white"
              onClick={() => toggleSort("name")}
            >
              Solver{sortIndicator("name")}
            </TableHead>
            <TableHead
              className="text-gray-400 cursor-pointer hover:text-white text-right"
              onClick={() => toggleSort("totalParticipations")}
            >
              Participations{sortIndicator("totalParticipations")}
            </TableHead>
            <TableHead
              className="text-gray-400 cursor-pointer hover:text-white text-right"
              onClick={() => toggleSort("totalWins")}
            >
              Wins{sortIndicator("totalWins")}
            </TableHead>
            <TableHead
              className="text-gray-400 cursor-pointer hover:text-white text-right"
              onClick={() => toggleSort("winRate")}
            >
              Win Rate{sortIndicator("winRate")}
            </TableHead>
            {showTrend && (
              <TableHead
                className="text-gray-400 cursor-pointer hover:text-white text-right"
                onClick={() => toggleSort("trend")}
              >
                Trend{sortIndicator("trend")}
              </TableHead>
            )}
            <TableHead
              className="text-gray-400 cursor-pointer hover:text-white text-right hidden md:table-cell"
              onClick={() => toggleSort("avgScore")}
            >
              Avg Score{sortIndicator("avgScore")}
            </TableHead>
            {showRecentForm && (
              <TableHead className="text-gray-400 hidden md:table-cell">
                Recent Form
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((solver, i) => {
            const rank = i + 1;
            return (
              <TableRow
                key={solver.address}
                className={`border-[#2e3148] cursor-pointer hover:bg-[#2a2d3e] ${borderColor(rank)} ${
                  rank % 2 === 0 ? "bg-[#1b1e2e]" : ""
                }`}
                onClick={() => onSolverClick(solver)}
              >
                <TableCell className="font-medium text-white">
                  {medal(rank)}
                </TableCell>
                <TableCell>
                  <div>
                    <span className="text-white font-medium">
                      {solver.name}
                    </span>
                    <br />
                    <a
                      href={`https://explorer.cow.fi/address/${solver.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-gray-500 hover:text-[#6B8AFF]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {solver.shortAddress}
                    </a>
                  </div>
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {solver.totalParticipations}
                </TableCell>
                <TableCell className="text-right text-gray-300">
                  {solver.totalWins}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${winRateColor(solver.winRate)}`}
                >
                  {solver.winRate}%
                </TableCell>
                {showTrend && (
                  <TableCell className="text-right">
                    {solver.trend != null ? (
                      solver.trend > 0 ? (
                        <span className="text-[#3fb950]">
                          +{solver.trend}% ▲
                        </span>
                      ) : solver.trend < 0 ? (
                        <span className="text-[#f85149]">
                          {solver.trend}% ▼
                        </span>
                      ) : (
                        <span className="text-gray-500">0% ●</span>
                      )
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right text-gray-300 hidden md:table-cell">
                  {formatScore(solver.avgScore)}
                </TableCell>
                {showRecentForm && (
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-1">
                      {solver.recentForm.slice(-10).map((r, j) => (
                        <span
                          key={j}
                          className={`inline-block h-2.5 w-2.5 rounded-full ${
                            r === "W" ? "bg-[#3fb950]" : "bg-[#f85149]"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
