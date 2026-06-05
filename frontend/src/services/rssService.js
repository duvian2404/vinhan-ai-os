import axios from "axios";
import { API_URL, getAuthHeaders } from "../api";

export const saveRssConfigAPI = async (rssEnabled, rssFeedUrl) => {
  await axios.post(
    `${API_URL}/api/rss-config`,
    {
      enabled: rssEnabled,
      feedUrl: rssFeedUrl,
    },
    getAuthHeaders(),
  );
  return true;
};

export const fetchRssConfigAPI = async () => {
  const response = await axios.get(
    `${API_URL}/api/rss-config`,
    getAuthHeaders(),
  );
  return response.data;
};
