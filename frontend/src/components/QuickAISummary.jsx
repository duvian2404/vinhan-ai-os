function QuickAISummary({
  articleUrl,
  setArticleUrl,
  handleArticleSummary,
  aiLoading,
  cachedResult,
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-8">
      <div className="text-2xl font-bold mb-4">
        Article Intelligence 🤖
        <h3 className="text-sm font-normal text-zinc-400 mt-1">
          Generate AI summary from any article URL
        </h3>
        {cachedResult ? (
          <div className="mt-3 inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-semibold">
            ⚡ Cached Result
          </div>
        ) : (
          <div className="mt-3 inline-block bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold">
            🤖 Fresh AI Summary
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <input
          type="text"
          placeholder="Paste article URL here..."
          value={articleUrl}
          onChange={(e) => setArticleUrl(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 p-4 rounded-xl outline-none focus:border-purple-500"
        />
        <button
          onClick={handleArticleSummary}
          className="bg-purple-600 hover:bg-purple-500 transition px-3 py-2 rounded-xl font-semibold"
        >
          {aiLoading ? "Reading..." : "Summarize"}
        </button>
      </div>
    </div>
  );
}
export default QuickAISummary;
