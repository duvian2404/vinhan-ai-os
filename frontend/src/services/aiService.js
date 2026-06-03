import axios from "axios";
import { API_URL, getAuthHeaders } from "../api";

// API endpoint cho AI-summary
export const generateSummaryAPI = async (content) => {
  const response = await axios.post(
    `${API_URL}/api/ai-summary`,
    {
      content,
    },
    getAuthHeaders(),
  );
  return response.data;
};

// API endpoint cho Article-summary
export const generateArticleSummaryAPI = async (articleUrl) => {
  const response = await axios.post(
    `${API_URL}/api/article-summary`,
    {
      url: articleUrl,
    },
    getAuthHeaders(),
  );
  return response.data;
};
