//import { LOAD_MORE_STEP } from "../services/constants";
import SummaryCard from "./summaryCard";
import Pagination from "./Pagination";

function SummaryList({
  summaries,
  loading,
  filteredSummaries,
  //visibleCount,
  setSelectedTag,
  //setVisibleCount,
  setEditingId,
  setTitle,
  setContent,
  setSource,
  handleDelete,
  currentPage,
  setCurrentPage,
  totalPages,
  currentSummaries,
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
          {filteredSummaries.map((summary) => (
            // {filteredSummaries.slice(0, visibleCount).map((summary) => (
            <SummaryCard
              key={summary.id}
              summary={summary}
              setSelectedTag={setSelectedTag}
              //setVisibleCount={setVisibleCount}
              setEditingId={setEditingId}
              setTitle={setTitle}
              setContent={setContent}
              setSource={setSource}
              filteredSummaries={currentSummaries}
              handleDelete={handleDelete}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
      {/* {visibleCount < filteredSummaries.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount(visibleCount + LOAD_MORE_STEP)}
            className="bg-purple-600 hover:bg-purple-500 transition px-6 py-3 rounded-2xl"
          >
            Load More
          </button>
        </div>
      )} */}
    </div>
  );
}

export default SummaryList;
