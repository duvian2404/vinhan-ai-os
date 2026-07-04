import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getAuthHeaders } from "./api";
import {
  fetchSummariesAPI,
  saveSummaryAPI,
  deleteSummaryAPI,
} from "./services/summaryService";
import { loginAPI, logoutAPI, registerAPI } from "./services/authService";
import {
  generateArticleSummaryAPI,
  generateSummaryAPI,
} from "./services/aiService";
import { saveRssConfigAPI, fetchRssConfigAPI } from "./services/rssService";

import AuthSection from "./components/authSection";
import RSSSettings from "./components/RSSSettings";

import SummaryForm from "./components/summaryFrom";
import SummaryList from "./components/summaryList";
import SearchBar from "./components/searchBar";
import SortSelector from "./components/sortSelection";

import { sortSummaries } from "./utils/sortUtils";
import { filterSummaries } from "./utils/sortUtils";

import StatsCards from "./components/starsCards";
//import RecentArticles from "./components/recentArticles";

import Sidebar from "./components/layout/Sidebar";
import DashboardLayout from "./components/layout/DashboardLayout";
import LeftPanel from "./components/layout/LeftPanel";
import RightPanel from "./components/layout/RightPanel";

// Main App components
function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [articleUrl, setArticleUrl] = useState("");
  const [cachedResult, setCachedResult] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [rssEnabled, setRssEnabled] = useState(false);
  const [rssFeedUrl, setRssFeedUrl] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  // API endpoint cho lấy tất cả summaries
  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const data = await fetchSummariesAPI();
      setSummaries(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRssConfig = async () => {
      const data = await fetchRssConfigAPI();
      setRssEnabled(data.rssEnabled);
      setRssFeedUrl(data.rssFeedUrl);
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
    e.preventDefault();
    try {
      if (!title || !content || !source) {
        alert("Please fill in all fields 😢");
        return;
      }
      await saveSummaryAPI(title, content, source, editingId);
      e.preventDefault();
      alert(`Summary ${editingId ? "updated" : "created"} 😄`);
      resetForm();
      setEditingId(null);
      fetchSummaries();
    } catch (error) {
      console.error(error);
      alert("Save failed 😢");
    }
  };

  const filteredSummaries = filterSummaries(summaries, selectedTag, searchTerm);

  const sortedSummaries = sortSummaries(filteredSummaries, sortBy);

  const totalArticles = summaries.length;

  const totalTags = new Set(
    summaries.flatMap((summary) => summary.tags?.split(",") || []),
  ).size;

  const showingResults = sortedSummaries.length;

  // API endpoint cho delete summary
  const handleDelete = async (id) => {
    await deleteSummaryAPI(id);
    alert("Summary deleted 😄");
    resetForm();
    fetchSummaries();
  };

  // API endpoint cho AI-summary từ content
  const handleAISummary = async () => {
    setAiLoading(true);
    try {
      if (!content) {
        alert("Please enter content to summarize 😢");
        setAiLoading(false);
        return;
      }
      const summary = await generateSummaryAPI(content);

      setContent(summary);
      setAiLoading(false);
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };

  // API endpoint cho AI-summary từ URL
  const handleArticleSummary = async () => {
    setAiLoading(true);
    try {
      if (!articleUrl) {
        alert("Please enter article URL to summarize 😢");
        setAiLoading(false);
        return;
      }
      const data = await generateArticleSummaryAPI(articleUrl);
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
    try {
      await saveRssConfigAPI(rssFeedUrl, rssEnabled);
      await fetchSummaries();
      // alert("RSS Config Saved 😄");
    } catch (error) {
      console.error(error);
      alert("Failed to save RSS config 😢");
    }
  };

  // API endpoint cho login
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
    resetUI();
  };

  // API endpoint cho register
  const register = async () => {
    try {
      await registerAPI(email, password);
      alert("Registration successful 😄");
    } catch (error) {
      console.error(error);
      alert("Registration failed hoặc email đã tồn tại 😢");
    }
  };
  // Hàm reset form sau khi tạo/cập nhật summary hoặc logout
  const resetForm = () => {
    setTitle("");
    setContent("");
    setSource("");
    setArticleUrl("");
    setSelectedTag("");
  };

  const resetUI = () => {
    setUser(null);
    setSummaries([]);
    setEmail("");
    setPassword("");
    setSource("");
    resetForm();
  };
  //===================Hien thi ra Browser=================
  // return (
  //   <div className="min-h-screen bg-zinc-950 text-white p-8">
  //     <div className="max-w-4xl mx-auto">
  //       <AuthSection
  //         email={email}
  //         setEmail={setEmail}
  //         password={password}
  //         setPassword={setPassword}
  //         user={user}
  //         login={login}
  //         logout={logout}
  //         register={register}
  //       />
  //       <StatsCards
  //         summaries={summaries}
  //         filteredSummaries={filteredSummaries}
  //         totalArticles={totalArticles}
  //         totalTags={totalTags}
  //         showingResults={showingResults}
  //       />
  //       <RecentArticles summaries={summaries} />
  //       <RSSSettings
  //         cachedResult={cachedResult}
  //         rssEnabled={rssEnabled}
  //         setRssEnabled={setRssEnabled}
  //         rssFeedUrl={rssFeedUrl}
  //         setRssFeedUrl={setRssFeedUrl}
  //         saveRssConfig={saveRssConfig}
  //       />
  //       <SummaryForm
  //         articleUrl={articleUrl}
  //         setArticleUrl={setArticleUrl}
  //         handleSubmit={handleSubmit}
  //         handleArticleSummary={handleArticleSummary}
  //         handleAISummary={handleAISummary}
  //         aiLoading={aiLoading}
  //         title={title}
  //         setTitle={setTitle}
  //         content={content}
  //         setContent={setContent}
  //         source={source}
  //         setSource={setSource}
  //         editingId={editingId}
  //         filteredSummaries={filteredSummaries}
  //         selectedTag={selectedTag}
  //         setSelectedTag={setSelectedTag}
  //       />
  //       <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
  //       <SortSelector sortBy={sortBy} setSortBy={setSortBy} />
  //       <SummaryList
  //         summaries={summaries}
  //         loading={loading}
  //         filteredSummaries={sortedSummaries}
  //         setSelectedTag={setSelectedTag}
  //         setVisibleCount={setVisibleCount}
  //         setEditingId={setEditingId}
  //         setTitle={setTitle}
  //         setContent={setContent}
  //         setSource={setSource}
  //         handleDelete={handleDelete}
  //         visibleCount={visibleCount}
  //       />
  //     </div>
  //   </div>
  // );
  return (
    <DashboardLayout>
      <Sidebar />

      <div className="flex-1 p-8">
        <AuthSection
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          user={user}
          login={login}
          logout={logout}
          register={register}
        />

        <StatsCards
          summaries={summaries}
          filteredSummaries={filteredSummaries}
          totalArticles={totalArticles}
          totalTags={totalTags}
          showingResults={showingResults}
        />

        <div className="flex gap-8 mt-8">
          <LeftPanel>
            <RSSSettings
              cachedResult={cachedResult}
              rssEnabled={rssEnabled}
              setRssEnabled={setRssEnabled}
              rssFeedUrl={rssFeedUrl}
              setRssFeedUrl={setRssFeedUrl}
              saveRssConfig={saveRssConfig}
            />

            <SummaryForm
              articleUrl={articleUrl}
              setArticleUrl={setArticleUrl}
              handleSubmit={handleSubmit}
              handleArticleSummary={handleArticleSummary}
              handleAISummary={handleAISummary}
              aiLoading={aiLoading}
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              source={source}
              setSource={setSource}
              editingId={editingId}
              filteredSummaries={filteredSummaries}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />
          </LeftPanel>

          <RightPanel>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <SortSelector sortBy={sortBy} setSortBy={setSortBy} />

            <SummaryList
              summaries={summaries}
              loading={loading}
              filteredSummaries={sortedSummaries}
              setSelectedTag={setSelectedTag}
              setVisibleCount={setVisibleCount}
              setEditingId={setEditingId}
              setTitle={setTitle}
              setContent={setContent}
              setSource={setSource}
              handleDelete={handleDelete}
              visibleCount={visibleCount}
            />
          </RightPanel>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;
