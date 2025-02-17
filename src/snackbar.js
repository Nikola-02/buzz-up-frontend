import { ref } from "vue";

export const showSnackbar = ref(false);
export const snackbarColor = ref("");
export const snackbarText = ref("");

export function showErrorSnackbar(message) {
  snackbarText.value = message;
  snackbarColor.value = "red";
  showSnackbar.value = true;
}
