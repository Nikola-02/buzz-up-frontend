import { createStore } from "vuex";

export const store = createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    profile: JSON.parse(localStorage.getItem("profile")) || null,
  },
  mutations: {
    setUser(state, userData) {
      state.user = userData;
    },
    clearUser(state) {
      state.user = null;
    },
    setProfile(state, profileData) {
      state.profile = profileData;
      localStorage.setItem("profile", JSON.stringify(profileData));
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
  actions: {
    login({ commit }, userData) {
      commit("setUser", userData);
      localStorage.setItem("user", JSON.stringify(userData));
    },
    logout({ commit }) {
      commit("clearUser");
      commit("clearProfile");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
    },
    // Returns true if token expired and user was logged out
    checkSession({ state, dispatch }) {
      if (!state.user || !state.user.token) return false;

      try {
        const payload = JSON.parse(atob(state.user.token.split(".")[1]));
        if (!payload.exp || payload.exp * 1000 < Date.now()) {
          dispatch("logout");
          return true;
        }
      } catch {
        dispatch("logout");
        return true;
      }

      return false;
    },
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getProfile(state) {
      return state.profile;
    },
    isAuthenticated(state) {
      return !!state.user;
    },
    fullName(state) {
      if (state.profile) return `${state.profile.firstName} ${state.profile.lastName}`.trim();
      if (state.user) return `${state.user.firstName} ${state.user.lastName}`.trim();
      return "";
    },
    userEmail(state) {
      return state.profile?.email || state.user?.email || "";
    },
    userImage(state) {
      return state.profile?.image || "default.png";
    },
    useCaseIds(state) {
      return state.user?.useCaseIds || [];
    },
    userRole(state) {
      return state.user?.role || "";
    },
    isAdmin(state) {
      return state.user?.role === "Admin";
    },
  },
});
