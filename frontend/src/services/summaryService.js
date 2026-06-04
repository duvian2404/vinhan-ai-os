import axios from "axios";
import { API_URL, getAuthHeaders } from "../api";

// API endpoint cho fetch summaries
export const fetchSummariesAPI = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return;
  }
  try {
    const response = await axios.get(
      `${API_URL}/api/summaries`,
      getAuthHeaders(),
    );

    return response.data.data;
  } catch (error) {
    console.error("Error fetching summaries:", error);
    throw error;
  }
};

// API endpoint cho tạo mới hoặc cập nhật summary
export const saveSummaryAPI = async (title, content, source, editingId) => {
  // e.preventDefault();
  const url = editingId
    ? `${API_URL}/api/summaries/${editingId}`
    : `${API_URL}/api/summaries`;

  const method = editingId ? "PUT" : "POST";

  const response = await axios(url, {
    method,
    ...getAuthHeaders(),
    data: {
      title,
      content,
      source,
    },
  });

  return response.data;
};

// API endpoint cho delete summary
export const deleteSummaryAPI = async (id) => {
  await axios.delete(`${API_URL}/api/summaries/${id}`, {
    ...getAuthHeaders(),
  });
};
