import axios from "axios";
import { ref } from "vue";

const AxiosApi = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const showSnackbar = ref(false);
export const snackbarColor = ref("");
export const snackbarText = ref("");

AxiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 422) {
        snackbarText.value = error.response.data[0].error;
      } else if (error.response.status === 400) {
        snackbarText.value = "Bad request";
      } else {
        snackbarText.value = "Unexpected error occurred";
      }
    } else {
      snackbarText.value = "Network error. Please try again later.";
    }

    snackbarColor.value = "red";
    showSnackbar.value = true;

    return Promise.reject(error);
  }
);

export default AxiosApi;
