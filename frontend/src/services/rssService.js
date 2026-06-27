//import axios from "axios";
import { API_URL, getAuthHeaders } from "../api";
import apiClient from "./apiClient";

export const saveRssConfigAPI = async (feedUrl, enabled) => {
  const response = await apiClient.post(
    `${API_URL}/api/rss-config`,
    { feedUrl, enabled },
    getAuthHeaders(),
  );

  return response.data;
};

export const fetchRssConfigAPI = async () => {
  const response = await apiClient.get(
    `${API_URL}/api/rss-config`,
    getAuthHeaders(),
  );
  return response.data;
};
