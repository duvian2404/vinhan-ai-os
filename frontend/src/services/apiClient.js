import axios from "axios";
const apiClient = axios.create({
  baseURL: "http://localhost:5000", // Thay đổi nếu backend chạy ở địa chỉ khác
  headers: {
    "Content-Type": "application/json",
  },
});
export default apiClient;
