import { CompetitionSummary } from "./api";

export type TimePeriod = "live" | "7d" | "30d";

export interface WeeklyHistory {
  week: string;
  winRate: number;
  wins: number;
  participations: number;
}

export interface SolverStats {
  address: string;
  name: string;
  shortAddress: string;
  totalParticipations: number;
  totalWins: number;
  winRate: number;
  avgWinScore: number;
  avgScore: number;
  totalSurplus: number;
  recentForm: ("W" | "L")[];
  trend?: number | null;
  weeklyHistory?: WeeklyHistory[];
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatScore(score: number): string {
  if (score >= 1e15) return `${(score / 1e15).toFixed(2)}P`;
  if (score >= 1e12) return `${(score / 1e12).toFixed(2)}T`;
  if (score >= 1e9) return `${(score / 1e9).toFixed(2)}B`;
  if (score >= 1e6) return `${(score / 1e6).toFixed(2)}M`;
  if (score >= 1e3) return `${(score / 1e3).toFixed(2)}K`;
  return score.toFixed(0);
}

export function aggregateSolverStats(
  competitions: CompetitionSummary[]
): SolverStats[] {
  const solverMap = new Map<
    string,
    {
      name: string;
      participations: number;
      wins: number;
      totalScore: number;
      winScoreSum: number;
      recentAuctions: { auctionId: number; won: boolean }[];
    }
  >();

  // Process competitions from oldest to newest for recentForm ordering
  const sorted = [...competitions].sort(
    (a, b) => a.auctionId - b.auctionId
  );

  for (const comp of sorted) {
    for (const solution of comp.solutions) {
      const addr = solution.solverAddress.toLowerCase();
      if (!solverMap.has(addr)) {
        solverMap.set(addr, {
          name: solution.solver,
          participations: 0,
          wins: 0,
          totalScore: 0,
          winScoreSum: 0,
          recentAuctions: [],
        });
      }
      const stats = solverMap.get(addr)!;
      stats.participations++;
      const score = Number(solution.score);
      stats.totalScore += score;

      const won = solution.ranking === 1;
      if (won) {
        stats.wins++;
        stats.winScoreSum += score;
      }

      stats.recentAuctions.push({ auctionId: comp.auctionId, won });
    }
  }

  const result: SolverStats[] = [];

  solverMap.forEach((data, address) => {
    const recent = data.recentAuctions.slice(-20);
    result.push({
      address,
      name: data.name,
      shortAddress: shortAddress(address),
      totalParticipations: data.participations,
      totalWins: data.wins,
      winRate:
        data.participations > 0
          ? Math.round((data.wins / data.participations) * 10000) / 100
          : 0,
      avgWinScore:
        data.wins > 0 ? data.winScoreSum / data.wins : 0,
      avgScore:
        data.participations > 0
          ? data.totalScore / data.participations
          : 0,
      totalSurplus: data.totalScore,
      recentForm: recent.map((a) => (a.won ? "W" : "L")),
    });
  });

  return result.sort((a, b) => b.winRate - a.winRate);
}
