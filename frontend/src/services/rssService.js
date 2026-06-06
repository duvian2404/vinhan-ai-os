//import axios from "axios";
import { API_URL, getAuthHeaders } from "../api";
import apiClient from "./apiClient";

export const saveRssConfigAPI = async (rssEnabled, rssFeedUrl) => {
  await apiClient.post(
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
  const response = await apiClient.get(
    `${API_URL}/api/rss-config`,
    getAuthHeaders(),
  );
  return response.data;
};
