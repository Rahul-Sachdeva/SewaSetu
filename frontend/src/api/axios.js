import axios from "axios";

/* REQUEST INTERCEPTOR */
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* RESPONSE INTERCEPTOR */
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error === "jwt expired") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;
