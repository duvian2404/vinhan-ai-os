function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div>
      <button
        onClick={() => {
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        }}
        className=" hover:bg-purple-300 transition-all duration-300  px-2 py-1 rounded-xl"
      >
        Previous
      </button>
      <span className="text-zinc-400">
        Page {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => {
          if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
          }
        }}
        className=" hover:bg-purple-300 transition-all duration-300  px-2 py-1 rounded-xl"
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
