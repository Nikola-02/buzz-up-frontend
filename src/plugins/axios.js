import axios from "axios";
import { showErrorSnackbar } from "../snackbar";

const AxiosApi = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

AxiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 422) {
        showErrorSnackbar(error.response.data[0]?.error || "Validation error");
      } else if (error.response.status === 400) {
        showErrorSnackbar("Bad request");
      } else {
        showErrorSnackbar("Unexpected error occurred");
      }
    } else {
      showErrorSnackbar("Network error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default AxiosApi;
