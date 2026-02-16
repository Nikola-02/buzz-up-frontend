import axios from "axios";
import { showErrorSnackbar } from "../snackbar";
import { store } from "@/store/store";
import router from "@/router";

const AxiosApi = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Check if JWT token is expired using the exp claim
function isTokenExpired() {
  const user = store.getters.getUser;
  if (!user || !user.token) return true;

  try {
    const payload = JSON.parse(atob(user.token.split(".")[1]));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Helper: clear auth and redirect to login
function handleAuthExpired() {
  store.dispatch("logout");
  router.push("/login");
}

// Request interceptor - attach token to every request
AxiosApi.interceptors.request.use(
  (config) => {
    const user = store.getters.getUser;
    const token = user?.token;

    if (token) {
      if (isTokenExpired()) {
        handleAuthExpired();
        return Promise.reject(new axios.Cancel("Session expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
AxiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show snackbar for cancelled requests (token expired)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Only redirect to login if user was authenticated (token expired/invalid)
        // Don't redirect if it's a login attempt with wrong credentials
        const isAuthenticated = store.getters.isAuthenticated;
        if (isAuthenticated) {
          handleAuthExpired();
        }
      } else if (status === 400) {
        showErrorSnackbar("Bad request. Please check your input.");
      } else if (status === 403) {
        showErrorSnackbar("Access denied. You don't have permission.");
      } else if (status === 404) {
        showErrorSnackbar("Resource not found.");
      } else if (status === 409) {
        showErrorSnackbar("Conflict. The resource already exists.");
      } else if (status === 422) {
        showErrorSnackbar(error.response.data[0]?.error || "Validation error.");
      } else if (status >= 500) {
        showErrorSnackbar("Server error. Please try again later.");
      } else {
        showErrorSnackbar("An unexpected error occurred. Please try again.");
      }
    } else if (error.request) {
      showErrorSnackbar("No response from server. Please check your connection.");
    } else {
      showErrorSnackbar("Network error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default AxiosApi;
