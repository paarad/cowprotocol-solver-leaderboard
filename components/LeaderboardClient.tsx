"use client";

import { useState, Suspense } from "react";
import LeaderboardTable from "./LeaderboardTable";
import SolverDrawer from "./SolverDrawer";
import TimePeriodSelector from "./TimePeriodSelector";
import { SolverStats, TimePeriod } from "@/lib/solvers";
import { CompetitionSummary } from "@/lib/api";

interface LeaderboardClientProps {
  solvers: SolverStats[];
  competitions: CompetitionSummary[];
  period: TimePeriod;
}

export default function LeaderboardClient({
  solvers,
  competitions,
  period,
}: LeaderboardClientProps) {
  const [selectedSolver, setSelectedSolver] = useState<SolverStats | null>(
    null
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <Suspense>
          <TimePeriodSelector />
        </Suspense>
      </div>
      <LeaderboardTable
        solvers={solvers}
        onSolverClick={setSelectedSolver}
        period={period}
      />
      <SolverDrawer
        solver={selectedSolver}
        competitions={competitions}
        period={period}
        onClose={() => setSelectedSolver(null)}
      />
    </>
  );
}
