const BASE_URL = "https://api.cow.fi/mainnet/api/v1";

export interface SolverCompetition {
  auctionId: number;
  transactionHashes: string[];
  solutions: Solution[];
}

export interface Solution {
  solver: string;
  solverAddress: string;
  score: string;
  ranking: number;
  isWinner: boolean;
  orders: { id: string; sellAmount: string; buyAmount: string }[];
}

// Lightweight version for caching and client transfer
export interface CompetitionSummary {
  auctionId: number;
  solutions: {
    solver: string;
    solverAddress: string;
    score: string;
    ranking: number;
  }[];
}

async function fetchLatest(): Promise<SolverCompetition> {
  const res = await fetch(`${BASE_URL}/solver_competition/latest`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchCompetition(
  auctionId: number
): Promise<SolverCompetition> {
  const res = await fetch(`${BASE_URL}/solver_competition/${auctionId}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok)
    throw new Error(`API error: ${res.status} for auction ${auctionId}`);
  return res.json();
}

function toSummary(c: SolverCompetition): CompetitionSummary {
  return {
    auctionId: c.auctionId,
    solutions: c.solutions.map((s) => ({
      solver: s.solver,
      solverAddress: s.solverAddress,
      score: s.score,
      ranking: s.ranking,
    })),
  };
}

// In-memory cache since Next.js data cache has a 2MB limit
let cachedResult: { data: CompetitionSummary[]; timestamp: number } | null =
  null;
const CACHE_TTL = 60_000; // 60 seconds

export async function getRecentCompetitions(
  n: number
): Promise<CompetitionSummary[]> {
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    return cachedResult.data;
  }

  const latest = await fetchLatest();
  const results: CompetitionSummary[] = [toSummary(latest)];

  const batchSize = 50;
  let cursor = latest.auctionId - 1;
  const maxAttempts = n * 5;
  let attempts = 0;

  while (results.length < n && attempts < maxAttempts) {
    const ids: number[] = [];
    for (let i = 0; i < batchSize && attempts < maxAttempts; i++) {
      ids.push(cursor - i);
      attempts++;
    }
    cursor -= batchSize;

    const batchResults = await Promise.allSettled(
      ids.map((id) => fetchCompetition(id))
    );
    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(toSummary(result.value));
      }
    }
  }

  const sorted = results.sort((a, b) => b.auctionId - a.auctionId).slice(0, n);

  cachedResult = { data: sorted, timestamp: Date.now() };
  return sorted;
}
