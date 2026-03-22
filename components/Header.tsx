export default function Header() {
  return (
    <header className="border-b border-[#2e3148] bg-[#242637] px-6 py-6">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://docs.cow.fi/img/cow-logo.svg"
          alt="CoW Protocol"
          className="h-10 w-10"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-[#6B8AFF]">Solver</span> Leaderboard
          </h1>
          <p className="text-sm text-gray-400">
            Live competition rankings for CoW Protocol batch auction solvers
          </p>
        </div>
        <a
          href="https://cow.fi"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-gray-500 hover:text-[#6B8AFF] transition-colors"
        >
          Powered by CoW Protocol
        </a>
      </div>
    </header>
  );
}
