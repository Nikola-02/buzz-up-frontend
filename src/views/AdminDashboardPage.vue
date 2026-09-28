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
          <span class="stat-value">{{ statsLoading ? "--" : stats.totalUsers }}</span>
          <span class="stat-label">Total Users</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper" style="background: rgba(34, 197, 94, 0.1)">
          <v-icon size="28" color="#22c55e">mdi-post</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ statsLoading ? "--" : stats.totalPosts }}</span>
          <span class="stat-label">Total Posts</span>
        </div>
      </div>
    </div>

    <div class="logs-card">
      <div class="logs-header">
        <div>
          <h2 class="logs-title">Logs</h2>
          <p class="logs-subtitle">Use case executions</p>
        </div>
      </div>
      <div class="table-toolbar">
        <v-text-field
          v-model="logSearch"
          placeholder="Search logs..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          class="search-input"
          clearable
        ></v-text-field>
      </div>
      <div class="table-wrapper">
        <v-progress-linear v-if="logsLoading" indeterminate color="#0f3460"></v-progress-linear>
        <table class="data-table" v-if="!logsLoading">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Use Case</th>
              <th>Data</th>
              <th>Executed At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="id-cell">{{ log.id }}</td>
              <td>{{ log.username }}</td>
              <td>{{ log.useCaseName }}</td>
              <td class="data-cell" :title="log.useCaseData || ''">{{ previewLogData(log.useCaseData) }}</td>
              <td>{{ formatApiDateTime(log.executedAt) }}</td>
            </tr>
            <tr v-if="!logs.length">
              <td colspan="5" class="empty-row">
                <v-icon size="40" class="empty-icon">mdi-text-box-search-outline</v-icon>
                <span>No logs found</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-pagination" v-if="!logsLoading && logTotalCount > 0">
        <AppPagination
          :page="logPage"
          :per-page="logPerPage"
          :total-count="logTotalCount"
          show-per-page
          @update:page="setPage"
          @update:perPage="onPerPageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";
import AxiosApi from "@/plugins/axios";
import { formatApiDateTime } from "@/services/dates";
import AppPagination from "@/components/AppPagination.vue";

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");

const statsLoading = ref(true);
const stats = ref({ totalUsers: 0, totalPosts: 0 });

const logsLoading = ref(false);
const logs = ref([]);
const logSearch = ref("");
const logPage = ref(1);
const logPerPage = ref(10);
const logTotalCount = ref(0);
let searchDebounceTimer = null;

const previewLogData = (value) => {
  if (!value) return "/";
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
};

const mapLogsResponse = (data) => {
  if (!data || typeof data !== "object") {
    return { rows: [], total: 0, currentPage: logPage.value, perPage: logPerPage.value };
  }
  const rows =
    (Array.isArray(data.data) && data.data) ||
    (Array.isArray(data.Data) && data.Data) ||
    [];
  const total = data.totalCount ?? data.TotalCount ?? rows.length;
  const currentPage = data.currentPage ?? data.CurrentPage ?? logPage.value;
  const responsePerPage = data.perPage ?? data.PerPage ?? logPerPage.value;
  return {
    rows,
    total: Number(total) || 0,
    currentPage: Number(currentPage) || 1,
    perPage: Number(responsePerPage) || logPerPage.value,
  };
};

const fetchStats = async () => {
  statsLoading.value = true;
  try {
    const res = await AxiosApi.get("/admin/stats");
    stats.value = {
      totalUsers: res.data?.totalUsers ?? res.data?.TotalUsers ?? 0,
      totalPosts: res.data?.totalPosts ?? res.data?.TotalPosts ?? 0,
    };
  } catch (e) {
    stats.value = { totalUsers: 0, totalPosts: 0 };
  } finally {
    statsLoading.value = false;
  }
};

const fetchLogs = async () => {
  logsLoading.value = true;
  try {
    const res = await AxiosApi.get("/admin/logs", {
      params: {
        keyword: logSearch.value?.trim() || undefined,
        page: logPage.value,
        perPage: logPerPage.value,
      },
    });
    const mapped = mapLogsResponse(res.data);
    logs.value = mapped.rows;
    logTotalCount.value = mapped.total;
    logPage.value = mapped.currentPage;
    logPerPage.value = mapped.perPage;
  } catch (e) {
    logs.value = [];
    logTotalCount.value = 0;
  } finally {
    logsLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
  fetchLogs();
});

watch(logSearch, () => {
  logPage.value = 1;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchLogs();
  }, 350);
});

const setPage = (nextPage) => {
  const normalized = Number(nextPage) || 1;
  if (normalized === logPage.value) return;
  logPage.value = normalized;
  fetchLogs();
};

const onPerPageChange = (nextPerPage) => {
  const normalized = Number(nextPerPage) || 10;
  if (normalized === logPerPage.value && logPage.value === 1) return;
  logPerPage.value = normalized;
  logPage.value = 1;
  fetchLogs();
};
</script>

<style scoped>
.admin-dashboard {
  --card-bg: #fff;
  --card-border: rgba(0, 0, 0, 0.06);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --hover-bg: #f8fafc;
  --divider: #e2e8f0;
  --table-header-bg: #f8fafc;
  --table-stripe: rgba(0, 0, 0, 0.015);
}

.admin-dashboard.dark-mode {
  --card-bg: #1e1e2e;
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --hover-bg: #2a2a3e;
  --divider: #334155;
  --table-header-bg: #252536;
  --table-stripe: rgba(255, 255, 255, 0.02);
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

.logs-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  overflow: hidden;
}

.logs-header {
  padding: 20px 20px 0;
}

.logs-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.logs-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 2px 0 0;
}

.table-toolbar {
  padding: 16px 20px;
  border-bottom: 1px solid var(--divider);
}

.search-input {
  max-width: 320px;
}

.search-input :deep(.v-field) {
  font-size: 0.85rem;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  background: var(--table-header-bg);
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  font-size: 0.88rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--divider);
}

.data-table tbody tr:hover {
  background: var(--hover-bg);
}

.data-table tbody tr:nth-child(even) {
  background: var(--table-stripe);
}

.data-table tbody tr:nth-child(even):hover {
  background: var(--hover-bg);
}

.id-cell {
  font-weight: 600;
  color: var(--text-muted) !important;
  font-size: 0.82rem !important;
}

.data-cell {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  font-size: 0.82rem !important;
}

.empty-row {
  text-align: center !important;
  padding: 48px 16px !important;
  color: var(--text-muted) !important;
}

.empty-row .empty-icon {
  color: var(--text-muted);
  display: block;
  margin: 0 auto 8px;
}

.empty-row span {
  display: block;
  font-size: 0.9rem;
}

.table-pagination {
  padding: 4px 16px 10px;
  border-top: 1px solid var(--divider);
}
</style>
