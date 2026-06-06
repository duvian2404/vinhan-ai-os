function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search summaries... contents or title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-xl"
      />
    </div>
  );
}

export default SearchBar;
