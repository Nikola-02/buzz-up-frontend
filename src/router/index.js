import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/LoginPage.vue";
import SignUpPage from "@/views/SignUpPage.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { title: "BuzzUp · Login" },
  },
  {
    path: "/signup",
    name: "SignUp",
    component: SignUpPage,
    meta: { title: "BuzzUp · Register" },
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
