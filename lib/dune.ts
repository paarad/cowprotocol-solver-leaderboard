import { SolverStats, WeeklyHistory, shortAddress } from "./solvers";

// Set these in .env.local after creating the Dune query
const QUERY_ID = process.env.DUNE_QUERY_ID || "0";
const DUNE_API_KEY = process.env.DUNE_API_KEY || "";

// Matches output of the Dune SQL query against cow_protocol_ethereum.batches
// Note: each row in batches = a batch the solver WON (only winners settle on-chain)
export interface DuneWeeklySolverRow {
  week: string;
  solver_name: string;
  solver_address: string;
  batches_solved: number; // = wins (only winning solvers appear in batches table)
  total_trades: number;
  total_dex_swaps: number;
  total_batch_value: number;
  total_gas_used: number;
}

interface DuneResponse {
  execution_id: string;
  query_id: number;
  state: string;
  result: {
    rows: DuneWeeklySolverRow[];
    metadata: { column_names: string[]; result_set_bytes: number };
  };
}

export async function fetchDuneResults(): Promise<DuneWeeklySolverRow[]> {
  if (!DUNE_API_KEY) {
    console.warn("DUNE_API_KEY not set, returning empty results");
    return [];
  }

  const res = await fetch(
    `https://api.dune.com/api/v1/query/${QUERY_ID}/results?limit=5000`,
    {
      headers: { "X-DUNE-API-KEY": DUNE_API_KEY },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    console.error(`Dune API error: ${res.status}`);
    return [];
  }

  const data: DuneResponse = await res.json();
  return data.result.rows;
}

export function aggregateDuneSolverStats(
  rows: DuneWeeklySolverRow[],
  period: "7d" | "30d"
): SolverStats[] {
  const now = new Date();
  const periodDays = period === "7d" ? 7 : 30;
  const cutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const prevCutoff = new Date(
    cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000
  );

  const currentRows = rows.filter((r) => new Date(r.week) >= cutoff);
  const prevRows = rows.filter(
    (r) => new Date(r.week) >= prevCutoff && new Date(r.week) < cutoff
  );

  // Aggregate current period by solver
  // batches_solved = wins (only winners settle on-chain)
  const solverMap = new Map<
    string,
    {
      name: string;
      totalWins: number;
      totalBatchValue: number;
      totalTrades: number;
      weeklyHistory: WeeklyHistory[];
    }
  >();

  for (const row of currentRows) {
    const addr = row.solver_address.toLowerCase();
    if (!solverMap.has(addr)) {
      solverMap.set(addr, {
        name: row.solver_name || addr.slice(0, 10),
        totalWins: 0,
        totalBatchValue: 0,
        totalTrades: 0,
        weeklyHistory: [],
      });
    }
    const s = solverMap.get(addr)!;
    s.totalWins += row.batches_solved;
    s.totalBatchValue += row.total_batch_value || 0;
    s.totalTrades += row.total_trades;
    s.weeklyHistory.push({
      week: row.week,
      winRate: 0, // computed below after totals are known
      wins: row.batches_solved,
      participations: row.batches_solved,
    });
  }

  // Compute total wins across ALL solvers for the period to get win share
  let totalWinsAllSolvers = 0;
  solverMap.forEach((data) => {
    totalWinsAllSolvers += data.totalWins;
  });

  // Previous period totals for trend
  const prevWinShares = new Map<string, number>();
  const prevSolverWins = new Map<string, number>();
  let prevTotalWins = 0;
  for (const row of prevRows) {
    const addr = row.solver_address.toLowerCase();
    prevSolverWins.set(
      addr,
      (prevSolverWins.get(addr) || 0) + row.batches_solved
    );
    prevTotalWins += row.batches_solved;
  }
  if (prevTotalWins > 0) {
    prevSolverWins.forEach((wins, addr) => {
      prevWinShares.set(
        addr,
        Math.round((wins / prevTotalWins) * 10000) / 100
      );
    });
  }

  // Add previous weeks to history for richer charts
  for (const row of prevRows) {
    const addr = row.solver_address.toLowerCase();
    if (solverMap.has(addr)) {
      solverMap.get(addr)!.weeklyHistory.unshift({
        week: row.week,
        winRate: 0, // filled below
        wins: row.batches_solved,
        participations: row.batches_solved,
      });
    }
  }

  const result: SolverStats[] = [];

  solverMap.forEach((data, address) => {
    // Win share = what % of all batches this solver won
    const winRate =
      totalWinsAllSolvers > 0
        ? Math.round((data.totalWins / totalWinsAllSolvers) * 10000) / 100
        : 0;

    // Compute weekly win rates for chart
    // Group all rows by week to get per-week totals
    const weekTotals = new Map<string, number>();
    for (const row of [...currentRows, ...prevRows]) {
      weekTotals.set(
        row.week,
        (weekTotals.get(row.week) || 0) + row.batches_solved
      );
    }
    for (const wh of data.weeklyHistory) {
      const weekTotal = weekTotals.get(wh.week) || 1;
      wh.winRate = Math.round((wh.wins / weekTotal) * 10000) / 100;
    }

    const prevShare = prevWinShares.get(address);
    const trend =
      prevShare !== undefined
        ? Math.round((winRate - prevShare) * 100) / 100
        : null;

    data.weeklyHistory.sort(
      (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
    );

    result.push({
      address,
      name: data.name,
      shortAddress: shortAddress(address),
      totalParticipations: data.totalWins, // on-chain = won batches
      totalWins: data.totalWins,
      winRate, // win share among all solvers
      avgWinScore: 0,
      avgScore:
        data.totalWins > 0 ? data.totalBatchValue / data.totalWins : 0,
      totalSurplus: data.totalBatchValue,
      recentForm: [],
      trend,
      weeklyHistory: data.weeklyHistory,
    });
  });

  return result.sort((a, b) => b.totalWins - a.totalWins);
}
