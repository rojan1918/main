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
    // LOG THE EXACT URL THAT FAILED
    const fullUrl = (error.config?.baseURL || '') + (error.config?.url || '');
    console.error(`AXIOS FAIL: ${error.message} | URL: ${fullUrl}`);

    // Pass the FULL error object so the component can read status and URL
    return Promise.reject(error);
  }
);

export default axiosServices;
