/**
 * axios setup to use mock service
 */

import axios from "axios";

const axiosServices = axios.create({
  // Hardcoded for production hotfix to bypass Render Env Var issue
  baseURL: "https://arevo-api.onrender.com",
});

// interceptor for http
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AXIOS INTERCEPTOR ERROR:", error); // Help the user debug
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    // Fallback to error message (e.g., "Network Error") instead of "Wrong Services"
    return Promise.reject(error.message || "Wrong Services");
  }
);

export default axiosServices;
