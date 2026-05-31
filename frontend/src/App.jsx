import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getAuthHeaders } from "./api";
import { fetchSummariesAPI } from "./services/summaryService";
import { handleSubmitAPI } from "./services/summaryService";
import { handleDeleteAPI } from "./services/summaryService";
import { loginAPI } from "./services/authService";
import { logoutAPI } from "./services/authService";
import { registerAPI } from "./services/authService";
import { handleAISummaryAPI } from "./services/aiService";
import { handleArticleSummaryAPI } from "./services/aiService";

// Main App component
function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [editingId, setEditingId] = useState(null);
  //const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [articleUrl, setArticleUrl] = useState("");
  const [cachedResult, setCachedResult] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [rssEnabled, setRssEnabled] = useState(false);
  const [rssFeedUrl, setRssFeedUrl] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  // {
  //   user && <p className="mb-4">Welcome {user.email}</p>;
  // }
  //===================API Calls=================
  // const fetchSummaries = async () => {
  //   const token = localStorage.getItem("token");

  //   if (!token) {
  //     return;
  //   }

  //   try {
  //     const response = await axios.get(
  //       `${API_URL}/api/summaries`,
  //       getAuthHeaders(),
  //     );
  //     setSummaries(response.data.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // Tách API call ra thành service riêng để tái sử dụng
  const fetchSummaries = async () => {
    try {
      const data = await fetchSummariesAPI();
      setSummaries(data);
    } catch (error) {
      console.log(error);
    }
  };

  // tao filter summaries
  const filteredSummaries = selectedTag
    ? summaries.filter((summary) => summary.tags?.includes(selectedTag))
    : summaries;

  // API endpoint cho lấy tất cả summaries
  useEffect(() => {
    const fetchRssConfig = async () => {
      const response = await axios.get(`${API_URL}/api/rss-config`);
      setRssEnabled(response.data.rssEnabled);
      setRssFeedUrl(response.data.rssFeedUrl);
    };

    // API endpoint cho auto-login
    const autoLogin = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/profile`,
          getAuthHeaders(),
        );

        setUser(response.data.user);
        await fetchSummaries();

        console.log("✅ Auto login success");
      } catch (error) {
        console.log(error);

        localStorage.removeItem("token");
      }
    };
    //fetchSummaries();
    autoLogin();
    fetchRssConfig();
  }, []);

  // API endpoint cho tạo mới hoặc cập nhật summary
  const handleSubmit = async (e) => {
    const success = await handleSubmitAPI(e, title, content, source, editingId);

    if (!success) {
      alert("Save failed 😢");
      return;
    }

    alert(`Summary ${editingId ? "updated" : "created"} 😄`);
    setTitle("");
    setContent("");
    setSource("");
    setEditingId(null);
    fetchSummaries();
  };

  // API endpoint cho xóa summary
  // const handleDelete = async (id) => {
  //   await fetch(`${API_URL}/api/summaries/${id}`, {
  //     ...getAuthHeaders(),
  //     method: "DELETE",
  //   });

  const handleDelete = async (id) => {
    const success = await handleDeleteAPI(id);

    if (!success) {
      alert("Delete failed 😢");
      return;
    }
    alert("Summary deleted 😄");
    fetchSummaries();
    setSelectedTag("");
    setArticleUrl("");
    setContent("");
    setTitle("");
    setSource("");
  };

  // Lọc summaries dựa trên search query
  // const filteredSummaries = summaries.filter(
  //   (summary) =>
  //     summary.title.toLowerCase().includes(search.toLowerCase()) ||
  //     summary.content.toLowerCase().includes(search.toLowerCase()),
  // );

  // API endpoint cho AI-summary từ content
  // const handleAISummary = async () => {
  //   setAiLoading(true);
  //   try {
  //     const response = await fetch(`${API_URL}/api/ai-summary`, {
  //       ...getAuthHeaders(),
  //       method: "POST",
  //       body: JSON.stringify({
  //         content,
  //       }),
  //     });
  //     const data = await response.json();
  //     setContent(data.summary);
  //     setAiLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //     setAiLoading(false);
  //   }
  // };
  const handleAISummary = async () => {
    setAiLoading(true);
    try {
      const summary = await handleAISummaryAPI(content);
      setContent(summary);
      setAiLoading(false);
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };

  // API endpoint cho AI-summary từ URL
  // const handleArticleSummary = async () => {
  //   setAiLoading(true);
  //   try {
  //     const response = await fetch(`${API_URL}/api/article-summary`, {
  //       ...getAuthHeaders(),
  //       method: "POST",
  //       body: JSON.stringify({
  //         url: articleUrl,
  //       }),
  //     });
  //     const data = await response.json();
  //     // Lưu trạng thái cache vào state
  //     setCachedResult(data.cached || false);
  //     setContent(data.summary);
  //     setTitle(data.title);
  //     setSource(articleUrl);
  //     fetchSummaries();
  //     setAiLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //     setAiLoading(false);
  //   }
  // };
  const handleArticleSummary = async () => {
    setAiLoading(true);
    try {
      const data = await handleArticleSummaryAPI(articleUrl);
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

  // API endpoint cho lưu cấu hình RSS
  const saveRssConfig = async () => {
    await axios.post(`${API_URL}/api/rss-config`, {
      ...getAuthHeaders(),
      enabled: rssEnabled,
      feedUrl: rssFeedUrl,
    });

    alert("RSS Config Saved 😄");
  };

  // API endpoint cho login
  // const login = async () => {
  //   try {
  //     const response = await axios.post(`${API_URL}/api/login`, {
  //       email,
  //       password,
  //     });

  //     const token = response.data.token;

  //     // SAVE TOKEN
  //     localStorage.setItem("token", token);

  //     // SAVE USER
  //     setUser(response.data.user);
  //     fetchSummaries();
  //     alert("Login success 😄");
  //   } catch (error) {
  //     console.log(error);

  //     alert("Login failed 😢");
  //   }
  // };
  //
  const login = async () => {
    try {
      const data = await loginAPI(email, password);
      setUser(data.user);
      fetchSummaries();
      alert("Login success 😄");
    } catch (error) {
      console.log(error);
      alert("Login failed 😢");
    }
  };

  // API endpoint cho logout
  const logout = () => {
    const success = logoutAPI();

    if (!success) {
      alert("Logout failed 😢");
      return;
    }
    alert("Logged out 😄");
    setUser(null);
    setSummaries([]);
    setEmail("");
    setPassword("");
    setContent("");
    setTitle("");
    setSource("");
    setArticleUrl;
  };

  // API endpoint cho register
  // const Register = async () => {
  //   try {
  //     await axios.post(`${API_URL}/api/register`, {
  //       email,
  //       password,
  //     });

  //     alert("Registration successful 😄");
  //   } catch (error) {
  //     console.log(error);
  //     alert("Registration failed hoặc email đã tồn tại 😢");
  //   }
  // };
  //
  const Register = async () => {
    try {
      await registerAPI(email, password);
      alert("Registration successful 😄");
    } catch (error) {
      console.error(error);
      alert("Registration failed hoặc email đã tồn tại 😢");
    }
  };

  //===================Hien thi ra Browser=================
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-3">VinhAn-ai-os 🚀</h1>

          <span className="text-zinc-400 text-lg">
            AI-powered summaries dashboard
            <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
              {!user && (
                <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
                  <h2 className="text-2xl font-bold mb-4">Login</h2>

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
                  />

                  <button
                    onClick={login}
                    className="text-white bg-blue-600 px-5 py-3 rounded-xl"
                  >
                    Login
                  </button>
                </div>
              )}
              {user && (
                <div className=" bg-green-900 p-6 rounded-2xl mb-6 flex items-center">
                  <h2 className="text-blue-400 text-2xl font-bold mb-2">
                    Logged In 😄
                  </h2>

                  <p>Welcome {user.email}</p>
                  <button
                    onClick={logout}
                    className=" ml-auto text-white bg-yellow-600 px-4 py-2 rounded-xl hover:bg-yellow-300 transition  font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
              <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
                <h2 className="text-2xl font-bold mb-4">Register</h2>

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-800 mb-4"
                />

                <button
                  onClick={Register}
                  className="text-white bg-green-600 px-5 py-3 rounded-xl, ml-4 "
                >
                  Register
                </button>
              </div>
            </div>
            <div className="mb-8">
              {/* <input
                type="text"
                placeholder="Search summaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-blue-500"
              /> */}

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
          </span>
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
        {/* form chính */}
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
        {/* load du liệu */}
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
        {/* load more button */}
        {visibleCount < filteredSummaries.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount(visibleCount + 3)}
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
