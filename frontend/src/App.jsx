import { useEffect, useState } from "react";
import axios from "axios";
// Main App component
function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [articleUrl, setArticleUrl] = useState("");
  const [cachedResult, setCachedResult] = useState(false);

  const [selectedTag, setSelectedTag] = useState("");

  const [rssEnabled, setRssEnabled] = useState(false);

  const [rssFeedUrl, setRssFeedUrl] = useState("");

  const [visibleCount, setVisibleCount] = useState(5);

  const fetchSummaries = () => {
    fetch("http://localhost:3000/api/summaries")
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data.data);
        setLoading(false);
      });
  };
  // tao filter summaries
  const filteredSummaries = selectedTag
    ? summaries.filter((summary) => summary.tags?.includes(selectedTag))
    : summaries;

  // API endpoint cho lấy tất cả summaries
  useEffect(() => {
    fetchSummaries();
    const fetchRssConfig = async () => {
      const response = await axios.get("http://localhost:3000/api/rss-config");

      setRssEnabled(response.data.rssEnabled);

      setRssFeedUrl(response.data.rssFeedUrl);
    };

    fetchRssConfig();
  }, []);

  // API endpoint cho tạo summary mới
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:3000/api/summaries/${editingId}`
      : "http://localhost:3000/api/summaries";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        source,
      }),
    });

    setTitle("");
    setContent("");
    setSource("");
    setEditingId(null);

    fetchSummaries();
  };

  // API endpoint cho xóa summary
  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/api/summaries/${id}`, {
      method: "DELETE",
    });
    fetchSummaries();
  };
  // Lọc summaries dựa trên search query
  // const filteredSummaries = summaries.filter(
  //   (summary) =>
  //     summary.title.toLowerCase().includes(search.toLowerCase()) ||
  //     summary.content.toLowerCase().includes(search.toLowerCase()),
  // );

  // API endpoint cho AI summary từ content
  const handleAISummary = async () => {
    try {
      setAiLoading(true);
      const response = await fetch("http://localhost:3000/api/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });
      const data = await response.json();
      setContent(data.summary);
      setAiLoading(false);
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };

  // API endpoint cho lấy tất cả summaries
  const handleArticleSummary = async () => {
    try {
      setAiLoading(true);
      const response = await fetch(
        "http://localhost:3000/api/article-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: articleUrl,
          }),
        },
      );
      const data = await response.json();
      // Lưu trạng thái cache vào state
      setCachedResult(data.cached || false);
      setContent(data.summary);
      setTitle(data.title);
      setSource(articleUrl);
      fetchSummaries();
      setAiLoading(false);
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };
  //-----------

  const saveRssConfig = async () => {
    await axios.post("http://localhost:3000/api/rss-config", {
      enabled: rssEnabled,
      feedUrl: rssFeedUrl,
    });

    alert("RSS Config Saved 😄");
  };

  //===================Hien thi ra Browser=================
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3">VinhAn-ai-os 🚀</h1>

          <p className="text-zinc-400 text-lg">
            AI-powered summaries dashboard
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search summaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-blue-500"
              />

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <p className="text-zinc-400 text-sm mb-2">Total Summaries</p>

                  <h2 className="text-3xl font-bold">{summaries.length}</h2>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <p className="text-zinc-400 text-sm mb-2">AI Sources</p>

                  <h2 className="text-3xl font-bold">
                    {new Set(filteredSummaries.map((s) => s.source)).size}
                  </h2>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <p className="text-zinc-400 text-sm mb-2">Dashboard Status</p>

                  <h2 className="text-2xl font-bold text-green-400">Online</h2>
                </div>
              </div>
            </div>
          </p>
        </div>

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

            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={rssEnabled}
                onChange={(e) => setRssEnabled(e.target.checked)}
              />

              <span>Auto RSS Import</span>
            </div>

            <input
              type="text"
              value={rssFeedUrl}
              onChange={(e) => setRssFeedUrl(e.target.value)}
              placeholder="RSS Feed URL"
              className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
            />

            <button
              onClick={saveRssConfig}
              className="bg-purple-600 px-5 py-3 rounded-xl"
            >
              Save RSS Config
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Paste article URL..."
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 p-4 rounded-xl outline-none focus:border-purple-500"
            />

            <button
              onClick={handleArticleSummary}
              className="bg-purple-600 hover:bg-purple-500 transition px-6 py-3 rounded-xl font-semibold"
            >
              {aiLoading ? "Reading..." : "Summarize URL"}
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl mb-8 space-y-4"
        >
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
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-semibold"
          >
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
          </button>
        </form>

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
                      onClick={() => setSelectedTag(tag.trim())}
                      className="bg-purple-500/20 hover:bg-purple-500/40 transition text-purple-300 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag.trim()}
                    </button>
                  ))}
                </div>

                <h2 className="text-2xl font-bold mb-3">{summary.title}</h2>

                <p className="text-zinc-300 mb-5 leading-relaxed">
                  {summary.content}
                </p>

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
              onClick={() => setVisibleCount(visibleCount + 5)}
              className="bg-purple-600 hover:bg-purple-500 transition px-6 py-3 rounded-2xl"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
