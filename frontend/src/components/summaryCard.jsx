function SummaryCard({
  setSelectedTag,
  setVisibleCount,
  setEditingId,
  setTitle,
  setContent,
  setSource,
  handleDelete,
  summary,
  //LOAD_MORE_STEP,
}) {
  return (
    <div className="space-y-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
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

        <h2 className="text-2xl font-bold mb-3">{summary.title}</h2>

        <p className="text-zinc-300 mb-5 leading-relaxed">{summary.content}</p>

        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-sm">
            {/* {summary.source} */}
            <a
              href={summary.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              🌐 {new URL(summary.source).hostname}
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
              className=" hover:bg-purple-300 transition-all duration-300  px-2 py-1 rounded-xl"
            >
              ✏
            </button>

            <button
              onClick={() => handleDelete(summary.id)}
              className="p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300"
            >
              🗑
            </button>
            <button
              //   onClick={() => handleDelete(summary.id)}
              className="p-2 rounded-lg hover:bg-zinc-600 transition-all duration-300 "
            >
              ⭐
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;
