import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5173/api", // change if your backend runs on a different port
  withCredentials: true,
});

export default api;
