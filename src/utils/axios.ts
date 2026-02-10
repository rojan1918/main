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
    const fullUrl = (error.config?.baseURL || '') + (error.config?.url || '');
    console.error(`API Error: ${error.message} | URL: ${fullUrl}`, error.response?.data);

    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message || "Wrong Services");
  }
);

export default axiosServices;
