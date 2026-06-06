export const sortSummaries = (summaries, sortBy) => {
  const sorted = [...summaries];

  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );

    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return sorted;
  }
};

export const filterSummaries = (summaries, selectedTag, searchTerm) => {
  return summaries.filter((summary) => {
    const matchTag = !selectedTag || summary.tags?.includes(selectedTag);

    const matchSearch =
      !searchTerm ||
      summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.tags?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchTag && matchSearch;
  });
};
