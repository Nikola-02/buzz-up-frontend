<template>
  <div class="admin-dashboard" :class="{ 'dark-mode': isDark }">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Overview of your application</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper" style="background: rgba(15, 52, 96, 0.1)">
          <v-icon size="28" color="#0f3460">mdi-account-group</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">--</span>
          <span class="stat-label">Total Users</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper" style="background: rgba(34, 197, 94, 0.1)">
          <v-icon size="28" color="#22c55e">mdi-post</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">--</span>
          <span class="stat-label">Total Posts</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper" style="background: rgba(255, 193, 7, 0.1)">
          <v-icon size="28" color="#ffc107">mdi-comment-multiple</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">--</span>
          <span class="stat-label">Total Comments</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper" style="background: rgba(229, 57, 53, 0.1)">
          <v-icon size="28" color="#e53935">mdi-flag</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">--</span>
          <span class="stat-label">Reports</span>
        </div>
      </div>
    </div>

    <div class="welcome-card">
      <v-icon size="24" class="welcome-icon">mdi-information-outline</v-icon>
      <div>
        <h3 class="welcome-title">Welcome, Admin</h3>
        <p class="welcome-text">
          Use the sidebar to navigate between tables and manage your application data. 
          Each table supports full CRUD operations.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");
</script>

<style scoped>
.admin-dashboard {
  --card-bg: #fff;
  --card-border: rgba(0, 0, 0, 0.06);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
}

.admin-dashboard.dark-mode {
  --card-bg: #1e1e2e;
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.welcome-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 24px;
  display: flex;
  gap: 16px;
}

.welcome-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-top: 2px;
}

.welcome-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.welcome-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}
</style>
