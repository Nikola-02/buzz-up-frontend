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
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    isAuthenticated(state) {
      return !!state.user;
    },
  },
});
