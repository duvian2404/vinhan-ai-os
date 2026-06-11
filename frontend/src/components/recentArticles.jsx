function RecentArticles({ summaries }) {
  const recentArticles = [...summaries]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  return (
    <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
      <h2 className="text-xl font-bold mb-4">Recent Articles</h2>

      {recentArticles.map((article) => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
}

export default RecentArticles;
