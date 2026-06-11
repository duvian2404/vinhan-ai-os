function RSSSettings({
  cachedResult,
  rssEnabled,
  setRssEnabled,
  rssFeedUrl,
  setRssFeedUrl,
  saveRssConfig,
}) {
  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Article Intelligence 🤖
          {cachedResult ? (
            <div className="mt-3 inline-block bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-semibold">
              ⚡ Cached Result
            </div>
          ) : (
            <div className="mt-3 inline-block bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-sm font-semibold">
              🤖 Fresh AI Summary
            </div>
          )}
        </h2>
        <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-bold mb-4">RSS Control Panel</h2>

          <input
            type="text"
            value={rssFeedUrl}
            onChange={(e) => setRssFeedUrl(e.target.value)}
            placeholder="RSS Feed URL"
            className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
          />
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={rssEnabled}
              onChange={(e) => setRssEnabled(e.target.checked)}
            />
            <span>Auto RSS Import</span>
            <dev>
              <i>( Import Interval [30] phút )</i>
            </dev>
          </div>

          <button
            onClick={saveRssConfig}
            className="bg-purple-600 px-5 py-3 rounded-xl"
          >
            Save & Run
          </button>
        </div>
      </div>
    </>
  );
}

export default RSSSettings;
