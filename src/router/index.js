import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/LoginPage.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
    meta: { title: "BuzzUp · Login" },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "BuzzUp";
  next();
});

export default router;
