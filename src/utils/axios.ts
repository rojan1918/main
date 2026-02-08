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
  (error) =>
    Promise.reject((error.response && error.response.data) || "Wrong Services")
);

export default axiosServices;
