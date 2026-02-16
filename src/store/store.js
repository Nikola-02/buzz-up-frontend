import { createStore } from "vuex";

export const store = createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user")) || null,
  },
  mutations: {
    setUser(state, userData) {
      state.user = userData;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  actions: {
    login({ commit }, userData) {
      commit("setUser", userData);
      localStorage.setItem("user", JSON.stringify(userData));
    },
    logout({ commit }) {
      commit("clearUser");
      localStorage.removeItem("user");
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
    isAuthenticated(state) {
      return !!state.user;
    },
    fullName(state) {
      if (!state.user) return "";
      return `${state.user.firstName} ${state.user.lastName}`.trim();
    },
    userEmail(state) {
      return state.user?.email || "";
    },
    useCaseIds(state) {
      return state.user?.useCaseIds || [];
    },
  },
});
