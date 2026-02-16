import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/LoginPage.vue";
import SignUpPage from "@/views/SignUpPage.vue";
import HomePage from "@/views/HomePage.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import NotFoundPage from "@/views/NotFoundPage.vue";
import ForgotPasswordPage from "@/views/ForgotPasswordPage.vue";
import ResetPasswordPage from "@/views/ResetPasswordPage.vue";
import { store } from "@/store/store";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { title: "BuzzUp", layout: "navsidebar", requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: ProfilePage,
    meta: { title: "BuzzUp · My Profile", layout: "navsidebar", requiresAuth: true },
  },
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
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPasswordPage,
    meta: { title: "BuzzUp · Forgot Password" },
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPasswordPage,
    meta: { title: "BuzzUp · Reset Password" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFoundPage,
    meta: { title: "BuzzUp · Page Not Found" },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "BuzzUp";

  // Check if session has expired (1h)
  const sessionExpired = store.dispatch("checkSession");
  sessionExpired.then((expired) => {
    if (expired) {
      next({ name: "Login" });
      return;
    }

    const isAuthenticated = store.getters.isAuthenticated;

    // If route requires auth and user is not logged in, redirect to login
    if (to.meta.requiresAuth && !isAuthenticated) {
      next({ name: "Login" });
      return;
    }

    // If user is already logged in and tries to go to login/signup/forgot, redirect to home
    const guestPages = ["Login", "SignUp", "ForgotPassword", "ResetPassword"];
    if (guestPages.includes(to.name) && isAuthenticated) {
      next({ name: "Home" });
      return;
    }

    next();
  });
});

export default router;
