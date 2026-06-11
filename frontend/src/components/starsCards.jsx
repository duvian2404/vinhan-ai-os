function StatsCards({
  totalArticles,
  totalTags,
  showingResults,
  summaries,
  filteredSummaries,
}) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-400 text-sm mb-2">Total Summaries</p>

          <h2 className="text-3xl font-bold">{summaries.length}</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-400 text-sm mb-2">AI Sources</p>

          <h2 className="text-3xl font-bold">
            {new Set(filteredSummaries.map((s) => s.source)).size}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-400 text-sm mb-2">Dashboard Status</p>

          <h2 className="text-2xl font-bold text-green-400">Online</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-400 text-sm mb-2">🤖 AI Generated</p>
          <h2 className="text-3xl font-bold">{totalArticles}</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-400 text-sm mb-2">🏷️ Total Tags</p>
          <h2 className="text-3xl font-bold">{totalTags}</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-400 text-sm mb-2">🔍 Showing Results</p>
          <h2 className="text-3xl font-bold">{showingResults}</h2>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
