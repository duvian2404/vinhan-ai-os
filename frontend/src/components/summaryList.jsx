function SummaryList({
  summaries,
  loading,
  filteredSummaries,
  visibleCount,
  setSelectedTag,
  setVisibleCount,
  setEditingId,
  setTitle,
  setContent,
  setSource,
  handleDelete,
}) {
  return (
    <div>
      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : summaries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
          <p className="text-zinc-400">No summaries yet 😄</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredSummaries.slice(0, visibleCount).map((summary) => (
            // Hiển thị tags nếu có
            <div
              key={summary.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
              <div className="flex gap-2 mt-3 flex-wrap">
                {summary.tags?.split(",").map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedTag(tag.trim());
                      setVisibleCount(3);
                    }}
                    className="bg-purple-500/20 hover:bg-purple-500/40 transition text-purple-300 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag.trim()}
                  </button>
                ))}
              </div>
              {/* load title */}
              <h2 className="text-2xl font-bold mb-3">{summary.title}</h2>
              {/* load content */}
              <p className="text-zinc-300 mb-5 leading-relaxed">
                {summary.content}
              </p>
              {/* load source */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm">
                  {summary.source}
                  <a
                    href={summary.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    🔗 Read Original Article
                  </a>
                </span>
                {/* load actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingId(summary.id);

                      setTitle(summary.title);
                      setContent(summary.content);
                      setSource(summary.source);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-400 transition text-black px-4 py-2 rounded-xl font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(summary.id)}
                    className="bg-red-600 hover:bg-red-500 transition px-4 py-2 rounded-xl font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {visibleCount < filteredSummaries.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount(visibleCount + 3)}
            className="bg-purple-600 hover:bg-purple-500 transition px-6 py-3 rounded-2xl"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default SummaryList;
