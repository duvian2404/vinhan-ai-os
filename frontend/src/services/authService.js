import axios from "axios";
import { API_URL } from "../api";

// API endpoint cho login
export const loginAPI = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/login`, {
      email,
      password,
    });
    const token = response.data.token;
    localStorage.setItem("token", token);
    return response.data;
    //   setUser(response.data.user);
    //   fetchSummaries();
    //   alert("Login success 😄");
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// API endpoint cho logout
export const logoutAPI = () => {
  localStorage.removeItem("token");
  return true;
  // setUser(null);
  // setSummaries([]);
};
// API endpoint cho register
export const registerAPI = async (email, password) => {
  await axios.post(`${API_URL}/api/register`, {
    email,
    password,
  });
  return true;
};
