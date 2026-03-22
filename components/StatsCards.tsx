import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatScore } from "@/lib/solvers";

interface StatsCardsProps {
  totalAuctions: number;
  topSolver: { name: string; shortAddress: string; winRate: number };
  mostActive: { name: string; shortAddress: string; participations: number };
  totalSurplus: number;
  periodLabel?: string;
}

export default function StatsCards({
  totalAuctions,
  topSolver,
  mostActive,
  totalSurplus,
  periodLabel,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card className="border-[#30363d] bg-[#161b22]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            {periodLabel ?? "Auctions Analyzed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white">
            {periodLabel ? totalAuctions.toLocaleString() + " entries" : totalAuctions}
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#30363d] bg-[#161b22]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Top Solver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold text-[#F2A71B]">{topSolver.name}</p>
          <p className="text-xs text-gray-500 font-mono">
            {topSolver.shortAddress}
          </p>
          <p className="text-sm text-[#3fb950]">{topSolver.winRate}% win rate</p>
        </CardContent>
      </Card>

      <Card className="border-[#30363d] bg-[#161b22]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Most Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold text-white">{mostActive.name}</p>
          <p className="text-xs text-gray-500 font-mono">
            {mostActive.shortAddress}
          </p>
          <p className="text-sm text-gray-300">
            {mostActive.participations} participations
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#30363d] bg-[#161b22]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Total Surplus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white">
            {formatScore(totalSurplus)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
