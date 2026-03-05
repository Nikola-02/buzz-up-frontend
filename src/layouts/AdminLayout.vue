<template>
  <nav class="admin-navbar" :class="{ 'dark-mode': isDark }">
    <div class="admin-navbar-inner">
      <div class="admin-brand" @click="router.push('/admin')">
        <v-icon size="36" color="#ffc107">mdi-bee</v-icon>
        <span class="brand-text">Buzz<span class="brand-accent">Up</span></span>
        <v-chip size="x-small" color="#ffc107" variant="flat" class="admin-badge">Admin</v-chip>
      </div>
      <div class="admin-navbar-actions">
        <v-btn variant="outlined" size="small" class="back-to-app-btn" rounded @click="router.push('/')">
          <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
          Back to App
        </v-btn>
        <v-btn icon variant="text" class="nav-btn" @click="toggleTheme">
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>
      </div>
    </div>
  </nav>

  <div class="admin-wrapper" :class="{ 'dark-mode': isDark }">
    <aside class="admin-sidebar">
      <div class="sidebar-section">
        <span class="sidebar-section-label">Main</span>
        <router-link to="/admin" class="sidebar-link" :class="{ active: route.path === '/admin' }">
          <v-icon size="20">mdi-view-dashboard-outline</v-icon>
          <span>Dashboard</span>
        </router-link>
      </div>

      <div class="sidebar-section">
        <span class="sidebar-section-label">Tables</span>
        <router-link
          v-for="table in tables"
          :key="table.route"
          :to="table.route"
          class="sidebar-link"
          :class="{ active: route.path === table.route }"
        >
          <v-icon size="20">{{ table.icon }}</v-icon>
          <span>{{ table.label }}</span>
        </router-link>
      </div>

      <div class="sidebar-bottom">
        <div class="sidebar-link" @click="router.push('/')">
          <v-icon size="20">mdi-home-outline</v-icon>
          <span>Back to App</span>
        </div>
      </div>
    </aside>

    <main class="admin-content">
      <slot>
        <v-main>
          <router-view />
        </v-main>
      </slot>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTheme } from "vuetify";
import { adminTableList } from "@/config/adminTables.js";

const router = useRouter();
const route = useRoute();
const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === "light" ? "dark" : "light";
};

const tables = adminTableList;
</script>

<style scoped>
/* ===== NAVBAR ===== */
.admin-navbar {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
}

.admin-navbar.dark-mode {
  background: linear-gradient(135deg, #0d0d1a 0%, #111827 50%, #0a1628 100%);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.admin-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.brand-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.brand-accent {
  color: #ffc107;
}

.admin-badge {
  font-weight: 700;
  font-size: 0.65rem !important;
  letter-spacing: 0.5px;
}

.admin-navbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-to-app-btn {
  color: rgba(255, 255, 255, 0.85) !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  text-transform: none;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0;
}

.back-to-app-btn:hover {
  border-color: #ffc107 !important;
  color: #ffc107 !important;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.7) !important;
}

.nav-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

/* ===== WRAPPER ===== */
.admin-wrapper {
  --bg-main: #f0f2f5;
  --sidebar-bg: #fff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --hover-bg: #f1f5f9;
  --active-bg: rgba(15, 52, 96, 0.08);
  --active-color: #0f3460;
  --scrollbar-thumb: #d4d4d4;

  display: flex;
  min-height: calc(100vh - 56px);
  background: var(--bg-main);
  transition: all 0.3s ease;
}

.admin-wrapper.dark-mode {
  --bg-main: #18191a;
  --sidebar-bg: #242526;
  --text-primary: #e4e6eb;
  --text-secondary: #b0b3b8;
  --text-muted: #6b7280;
  --border-color: #3e4042;
  --hover-bg: #3a3b3c;
  --active-bg: rgba(255, 193, 7, 0.1);
  --active-color: #ffc107;
  --scrollbar-thumb: #4a4b4d;
}

/* ===== SIDEBAR ===== */
.admin-sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  padding: 16px 12px;
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.admin-sidebar::-webkit-scrollbar {
  width: 4px;
}

.admin-sidebar::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.sidebar-section {
  margin-bottom: 20px;
}

.sidebar-section-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 12px;
  margin-bottom: 6px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sidebar-link:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.sidebar-link.active {
  background: var(--active-bg);
  color: var(--active-color);
  font-weight: 700;
}

.sidebar-link.active .v-icon {
  color: var(--active-color) !important;
}

.sidebar-link .v-icon {
  color: var(--text-muted);
  transition: color 0.15s ease;
}

.sidebar-link:hover .v-icon {
  color: var(--text-primary);
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

/* ===== CONTENT ===== */
.admin-content {
  flex: 1;
  padding: 24px 32px;
  min-height: calc(100vh - 56px);
  overflow-y: auto;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 200px;
    min-width: 200px;
  }

  .admin-content {
    padding: 16px;
  }
}
</style>
