import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import router from "./router";
import SnackbarComponent from "./components/SnackbarComponent.vue";

loadFonts();

const app = createApp(App);

app.component("SnackbarComponent", SnackbarComponent);

app.use(vuetify).use(router).mount("#app");
