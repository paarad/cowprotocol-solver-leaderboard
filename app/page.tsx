import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import RefreshButton from "@/components/RefreshButton";
import LeaderboardClient from "@/components/LeaderboardClient";
import { getRecentCompetitions, CompetitionSummary } from "@/lib/api";
import { aggregateSolverStats, TimePeriod, SolverStats } from "@/lib/solvers";
import { fetchDuneResults, aggregateDuneSolverStats } from "@/lib/dune";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = (searchParams.period ?? "live") as TimePeriod;

  let solvers: SolverStats[];
  let clientCompetitions: CompetitionSummary[] = [];
  let periodLabel: string | undefined;

  if (period === "live") {
    const competitions = await getRecentCompetitions(50);
    solvers = aggregateSolverStats(competitions);
    clientCompetitions = competitions;
  } else {
    const rows = await fetchDuneResults();
    solvers = aggregateDuneSolverStats(rows, period);
    periodLabel = period === "7d" ? "Last 7 days" : "Last 30 days";
  }

  const topSolver = solvers[0];
  const mostActive = [...solvers].sort(
    (a, b) => b.totalParticipations - a.totalParticipations
  )[0];
  const totalSurplus = solvers.reduce((sum, s) => sum + s.totalSurplus, 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-300">Dashboard</h2>
          <RefreshButton />
        </div>

        <StatsCards
          totalAuctions={
            period === "live"
              ? clientCompetitions.length
              : solvers.reduce((s, v) => s + v.totalParticipations, 0)
          }
          topSolver={{
            name: topSolver?.name ?? "N/A",
            shortAddress: topSolver?.shortAddress ?? "",
            winRate: topSolver?.winRate ?? 0,
          }}
          mostActive={{
            name: mostActive?.name ?? "N/A",
            shortAddress: mostActive?.shortAddress ?? "",
            participations: mostActive?.totalParticipations ?? 0,
          }}
          totalSurplus={totalSurplus}
          periodLabel={periodLabel}
        />

        <LeaderboardClient
          solvers={solvers}
          competitions={clientCompetitions}
          period={period}
        />
      </main>
    </div>
  );
}
