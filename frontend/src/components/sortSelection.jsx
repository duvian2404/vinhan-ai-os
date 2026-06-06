function SortSelector({ sortBy, setSortBy }) {
  return (
    <div className="mb-5">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-zinc-800 p-3 rounded-xl"
      >
        <option value="newest">Newest</option>

        <option value="oldest">Oldest</option>

        <option value="title">A-Z</option>
      </select>
    </div>
  );
}

export default SortSelector;
