function SummaryEditor({
  aiLoading,
  title,
  setTitle,
  content,
  setContent,
  source,
  setSource,
  handleAISummary,
  handleSubmit,
  editingId,
  filteredSummaries,
  selectedTag,
  setSelectedTag,
}) {
  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8 space-y-4"
      >
        {/* form chính */}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl outline-none focus:border-blue-500"
        />

        {selectedTag && (
          <div className="mb-6 flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl">
            <span className="text-zinc-400">Showing</span>

            <span className="font-bold text-purple-400">
              {filteredSummaries.length}
            </span>

            <span className="text-zinc-400">articles for</span>

            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
              #{selectedTag}
            </span>

            <button
              type="button"
              onClick={() => setSelectedTag("")}
              className="ml-auto text-sm bg-zinc-800 hover:bg-zinc-700 transition px-4 py-2 rounded-xl"
            >
              Clear
            </button>
          </div>
        )}
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl h-90 outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl outline-none focus:border-blue-500"
        />
        {/* <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-semibold"
          > */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAISummary}
            className="bg-purple-600 hover:bg-purple-500 transition px-6 py-3 rounded-xl font-semibold"
          >
            {aiLoading ? "Generating..." : "Generate AI Summary"}
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-semibold"
          >
            {editingId ? "Update Summary" : "Save Summary"}
          </button>
        </div>
        {/* </button> */}
      </form>
    </>
  );
}
export default SummaryEditor;
