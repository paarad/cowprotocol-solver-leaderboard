export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1b1e2e]">
      <div className="border-b border-[#2e3148] bg-[#242637] px-6 py-6">
        <div className="mx-auto max-w-7xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#2e3148] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-[#2e3148] animate-pulse" />
            <div className="h-4 w-72 rounded bg-[#2e3148] animate-pulse" />
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-lg border border-[#2e3148] bg-[#242637] animate-pulse"
            />
          ))}
        </div>
        <div className="rounded-lg border border-[#2e3148] bg-[#242637] overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-14 border-b border-[#2e3148] animate-pulse"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
