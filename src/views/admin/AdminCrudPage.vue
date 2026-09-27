<template>
  <div class="crud-page" :class="{ 'dark-mode': isDark }" v-if="config">
    <div class="crud-header">
      <div>
        <h1 class="crud-title">{{ config.title }}</h1>
        <p class="crud-subtitle">{{ config.subtitle }}</p>
      </div>
      <v-btn class="create-btn" rounded @click="openCreateDialog">
        <v-icon size="20" class="mr-1">mdi-plus</v-icon>
        Create
      </v-btn>
    </div>

    <div class="crud-card">
      <div class="table-toolbar">
        <v-text-field
          v-model="search"
          :placeholder="`Search ${config.title.toLowerCase()}...`"
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
        <v-progress-linear v-if="loading" indeterminate color="#0f3460"></v-progress-linear>
        <table class="data-table" v-if="!loading">
          <thead>
            <tr>
              <th v-for="col in config.columns" :key="col.key">{{ col.label }}</th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td
                v-for="col in config.columns"
                :key="col.key"
                :class="{ 'id-cell': col.key === 'id' }"
              >
                <img
                  v-if="col.type === 'image'"
                  :src="cellValue(col, item)"
                  :alt="`${item.username || 'User'} image`"
                  class="table-avatar"
                />
                <v-chip
                  v-else-if="col.chip"
                  :color="col.chip.colorMap?.[cellValue(col, item)] || col.chip.default"
                  size="small"
                  variant="flat"
                  class="role-chip"
                >
                  {{ cellValue(col, item) }}
                </v-chip>
                <template v-else>{{ cellValue(col, item) }}</template>
              </td>
              <td class="actions-cell">
                <v-btn icon variant="text" size="small" class="action-edit" @click="openEditDialog(item)">
                  <v-icon size="18">mdi-pencil-outline</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small" class="action-delete" @click="confirmDelete(item)">
                  <v-icon size="18">mdi-delete-outline</v-icon>
                </v-btn>
              </td>
            </tr>
            <tr v-if="!filteredItems.length">
              <td :colspan="config.columns.length + 1" class="empty-row">
                <v-icon size="40" class="empty-icon">mdi-database-off-outline</v-icon>
                <span>No {{ config.title.toLowerCase() }} found</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-pagination" v-if="!loading && totalCount > 0">
        <div class="pagination-summary">
          Showing {{ paginationStart }}-{{ paginationEnd }} of {{ totalCount }}
        </div>
        <div class="pagination-controls">
          <v-select
            :model-value="perPage"
            :items="perPageOptions"
            density="compact"
            variant="outlined"
            hide-details
            class="per-page-select"
            @update:model-value="onPerPageChange"
          ></v-select>
          <v-pagination
            :model-value="page"
            :length="totalPages"
            :total-visible="7"
            density="comfortable"
            @update:model-value="setPage"
          ></v-pagination>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <!-- Allow closing via ESC / clicking outside when not saving -->
    <v-dialog v-model="showFormDialog" max-width="520" :persistent="saving" :z-index="3000">
      <v-card class="form-dialog" :class="{ 'dark-mode': isDark }">
        <div class="form-dialog-header">
          <h2 class="form-dialog-title">{{ isEditing ? 'Edit' : 'Create' }} {{ config.title.replace(/s$/, '') }}</h2>
          <v-btn icon variant="text" size="small" @click="showFormDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="form-dialog-body">
          <v-form :key="dialogKey" ref="formRef" @submit.prevent="saveItem">
            <div class="form-fields">
              <template v-for="field in visibleFields" :key="field.key">
                <div class="form-field" :class="{ half: field.half }">
                  <label class="form-label">{{ fieldLabel(field) }}{{ fieldIsRequired(field) ? ' *' : '' }}</label>
                  <v-select
                    v-if="field.type === 'select'"
                    v-model="formData[field.key]"
                    :placeholder="fieldPlaceholder(field)"
                    :rules="fieldRules(field)"
                    :items="field.options"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details="auto"
                    class="form-input"
                  ></v-select>
                  <v-textarea
                    v-else-if="field.type === 'textarea'"
                    v-model="formData[field.key]"
                    :placeholder="fieldPlaceholder(field)"
                    :rules="fieldRules(field)"
                    :rows="2"
                    auto-grow
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details="auto"
                    class="form-input"
                  ></v-textarea>
                  <CountrySelect
                    v-else-if="field.type === 'countrySelect'"
                    v-model="formData[field.key]"
                    :hint-name="adminCountryHint"
                    :placeholder="fieldPlaceholder(field)"
                    :rules="fieldRules(field)"
                    input-class="form-input"
                  />
                  <template v-else-if="field.type === 'imageUpload'">
                    <div v-if="editImagePreviewUrl" class="admin-edit-image-preview">
                      <img :src="editImagePreviewUrl" alt="Profile preview" />
                    </div>
                    <v-file-input
                      v-model="editImageFile"
                      placeholder="Upload a photo"
                      prepend-inner-icon="mdi-camera-outline"
                      prepend-icon=""
                      accept="image/*"
                      variant="outlined"
                      density="compact"
                      rounded="lg"
                      hide-details="auto"
                      class="form-input"
                      :loading="editImageUploading"
                      :error-messages="editImageError"
                      @update:model-value="onEditImageSelected"
                    ></v-file-input>
                    <span v-if="editUploadedImageFileName" class="admin-upload-success">
                      <v-icon size="14" color="#22c55e">mdi-check-circle</v-icon>
                      Image uploaded
                    </span>
                  </template>
                  <v-text-field
                    v-else
                    v-model="formData[field.key]"
                    :placeholder="fieldPlaceholder(field)"
                    :type="fieldInputType(field)"
                    :rules="fieldRules(field)"
                    :max="field.type === 'date' ? today : undefined"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    hide-details="auto"
                    class="form-input"
                  ></v-text-field>
                </div>
              </template>
            </div>
            <div class="form-dialog-actions">
              <button type="button" class="cancel-btn" @click="showFormDialog = false">Cancel</button>
              <button type="submit" class="save-btn" :disabled="saving">
                <v-progress-circular v-if="saving" indeterminate size="18" width="2" color="#fff"></v-progress-circular>
                <span v-else>{{ isEditing ? 'Save Changes' : 'Create' }}</span>
              </button>
            </div>
          </v-form>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="delete-dialog" :class="{ 'dark-mode': isDark }">
        <div class="delete-dialog-body">
          <v-icon size="48" color="#e53935">mdi-alert-circle-outline</v-icon>
          <h3 class="delete-title">Delete {{ config.title.replace(/s$/, '') }}</h3>
          <p class="delete-text">
            Are you sure you want to delete
            <strong>{{ deleteTarget?.[config.identifierKey || 'id'] }}</strong>?
            This action cannot be undone.
          </p>
        </div>
        <div class="delete-dialog-actions">
          <button class="cancel-btn" @click="showDeleteDialog = false">Cancel</button>
          <button class="delete-btn" :disabled="deleting" @click="deleteItem">
            <v-progress-circular v-if="deleting" indeterminate size="18" width="2" color="#fff"></v-progress-circular>
            <span v-else>Delete</span>
          </button>
        </div>
      </v-card>
    </v-dialog>
  </div>

  <!-- Unknown table -->
  <div v-else class="crud-page" :class="{ 'dark-mode': isDark }">
    <div class="empty-state">
      <v-icon size="64" class="empty-icon">mdi-table-off</v-icon>
      <h2>Table not found</h2>
      <p>The table "{{ tableName }}" does not exist in the configuration.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";
import AxiosApi from "@/plugins/axios";
import { adminTables } from "@/config/adminTables.js";
import { rules } from "@/plugins/validationMessages.js";
import CountrySelect from "@/components/CountrySelect.vue";
import { normalizeCountryId } from "@/services/countries";

const route = useRoute();
const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");
const today = computed(() => new Date().toISOString().split("T")[0]);

const tableName = computed(() => route.params.table);
const config = computed(() => adminTables[tableName.value] || null);

const items = ref([]);
const loading = ref(false);
const search = ref("");
const page = ref(1);
const perPage = ref(10);
const totalCount = ref(0);
const perPageOptions = [10, 20, 50, 100];
let searchDebounceTimer = null;

const cellValue = (col, item) => {
  const raw = item[col.key];
  return col.format ? col.format(raw, item) : (raw ?? "");
};

const filteredItems = computed(() => items.value);

const totalPages = computed(() => {
  if (!totalCount.value) return 1;
  return Math.max(1, Math.ceil(totalCount.value / perPage.value));
});

const paginationStart = computed(() => {
  if (!totalCount.value) return 0;
  return (page.value - 1) * perPage.value + 1;
});

const paginationEnd = computed(() => {
  if (!totalCount.value) return 0;
  return Math.min(page.value * perPage.value, totalCount.value);
});

const mapResponseToPagination = (data) => {
  if (Array.isArray(data)) {
    return {
      rows: data,
      total: data.length,
      currentPage: page.value,
      perPage: perPage.value,
    };
  }

  if (!data || typeof data !== "object") {
    return { rows: [], total: 0, currentPage: page.value, perPage: perPage.value };
  }

  // Support both camelCase and PascalCase JSON property names.
  const rows =
    (Array.isArray(data.data) && data.data) ||
    (Array.isArray(data.Data) && data.Data) ||
    (Array.isArray(data.items) && data.items) ||
    (Array.isArray(data.Items) && data.Items) ||
    (Array.isArray(data.results) && data.results) ||
    (Array.isArray(data.Results) && data.Results) ||
    (Array.isArray(data.rows) && data.rows) ||
    (Array.isArray(data.Rows) && data.Rows) ||
    [];

  const total = data.totalCount ?? data.TotalCount ?? rows.length;
  const currentPage = data.currentPage ?? data.CurrentPage ?? page.value;
  const responsePerPage = data.perPage ?? data.PerPage ?? perPage.value;

  return {
    rows,
    total: Number(total) || 0,
    currentPage: Number(currentPage) || 1,
    perPage: Number(responsePerPage) || perPage.value,
  };
};

const fetchItems = async () => {
  if (!config.value) return;
  loading.value = true;
  try {
    const res = await AxiosApi.get(config.value.api, {
      params: {
        keyword: search.value?.trim() || undefined,
        page: page.value,
        perPage: perPage.value,
        ...(tableName.value === "users" ? { adminView: true } : {}),
      },
    });
    const mapped = mapResponseToPagination(res.data);
    items.value = mapped.rows;
    totalCount.value = mapped.total;
    page.value = mapped.currentPage;
    perPage.value = mapped.perPage;
  } catch (e) {
    items.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchItems);

watch(tableName, () => {
  search.value = "";
  page.value = 1;
  perPage.value = 10;
  items.value = [];
  totalCount.value = 0;
  showFormDialog.value = false;
  showDeleteDialog.value = false;
  fetchItems();
});

watch(search, () => {
  page.value = 1;
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchItems();
  }, 350);
});

const setPage = (nextPage) => {
  const normalized = Number(nextPage) || 1;
  if (normalized === page.value) return;
  page.value = normalized;
  fetchItems();
};

const onPerPageChange = (nextPerPage) => {
  const normalized = Number(nextPerPage) || 10;
  if (normalized === perPage.value && page.value === 1) return;
  perPage.value = normalized;
  page.value = 1;
  fetchItems();
};

// Form
const showFormDialog = ref(false);
const formRef = ref(null);
const saving = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const editingItem = ref(null);
const formData = ref({});

/** Za preselect Country dropdown kada API šalje countryName uz countryId. */
const adminCountryHint = ref("");

/** Same temp URL as user profile images (see SignUp / admin table column format). */
const TEMP_IMAGE_BASE = "http://localhost:5001/temp/";

const editImageFile = ref(null);
const editUploadedImageFileName = ref("");
const editImageUploading = ref(false);
const editImageError = ref("");
const existingImageFileName = ref(null);

const editImagePreviewUrl = computed(() => {
  if (editUploadedImageFileName.value) {
    return `${TEMP_IMAGE_BASE}${editUploadedImageFileName.value}`;
  }
  if (existingImageFileName.value) {
    return `${TEMP_IMAGE_BASE}${existingImageFileName.value}`;
  }
  return "";
});

const onEditImageSelected = async (file) => {
  editUploadedImageFileName.value = "";
  editImageError.value = "";

  if (!file) return;

  editImageUploading.value = true;

  const fd = new FormData();
  fd.append("file", file);

  try {
    const response = await AxiosApi.post("/files", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    editUploadedImageFileName.value = response.data.file;
  } catch (error) {
    editImageError.value =
      error.response?.status === 415
        ? "Unsupported file type. Use JPG, PNG, or JPEG."
        : "Failed to upload image. Please try again.";
    editImageFile.value = null;
  } finally {
    editImageUploading.value = false;
  }
};

// Remount the form when switching between Create/Edit.
// Prevents stale values lingering between modal openings.
const dialogKey = computed(() => (isEditing.value ? `edit-${editingId.value}` : "create"));

const visibleFields = computed(() => {
  if (!config.value) return [];
  return config.value.form.fields.filter((f) => {
    if (f.createOnly && isEditing.value) return false;
    if (f.editOnly && !isEditing.value) return false;
    return true;
  });
});

const fieldLabel = (field) => {
  if (isEditing.value && field.editLabel) return field.editLabel;
  return field.label;
};

const fieldPlaceholder = (field) => {
  if (isEditing.value && field.editPlaceholder) return field.editPlaceholder;
  return field.placeholder || "";
};

const fieldRules = (field) => {
  if (isEditing.value && field.editRules !== undefined) return field.editRules;
  if (!isEditing.value && field.createRules !== undefined) return field.createRules;
  return field.rules || [];
};

const fieldIsRequired = (field) => {
  const rulesForMode = fieldRules(field);
  if (Array.isArray(rulesForMode) && rulesForMode.length > 0) {
    return rulesForMode.includes(rules.required);
  }
  return !!field.required;
};

const fieldInputType = (field) => {
  if (field.type === "password") return "password";
  if (field.type === "email") return "email";
  if (field.type === "date") return "date";
  return undefined;
};

const openCreateDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  editingItem.value = null;
  adminCountryHint.value = "";
  formData.value = { ...config.value.form.defaults };
  existingImageFileName.value = null;
  editUploadedImageFileName.value = "";
  editImageFile.value = null;
  editImageError.value = "";
  showFormDialog.value = true;
};

const openEditDialog = (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  editingItem.value = item;
  const cn = item?.countryName ?? item?.CountryName;
  adminCountryHint.value = typeof cn === "string" ? cn.trim() : "";
  existingImageFileName.value = null;
  editUploadedImageFileName.value = "";
  editImageFile.value = null;
  editImageError.value = "";

  const data = {};
  config.value.form.fields.forEach((f) => {
    if (f.type === "password") {
      // Keep password input empty; leaving it empty on save means "keep current password".
      data[f.key] = "";
    } else if (f.type === "imageUpload") {
      // Image is handled via upload + preview; do not put fileName in formData.
    } else if (f.type === "date") {
      const raw = item[f.key];
      if (!raw) {
        data[f.key] = "";
      } else if (typeof raw === "string") {
        data[f.key] = raw.slice(0, 10);
      } else if (raw instanceof Date) {
        data[f.key] = raw.toISOString().slice(0, 10);
      } else {
        data[f.key] = "";
      }
    } else if (f.type === "countrySelect") {
      const raw =
        f.key === "countryId" ? item.countryId ?? item.CountryId : item[f.key];
      data[f.key] = normalizeCountryId(raw);
    } else {
      data[f.key] = item[f.key] ?? "";
    }
  });
  existingImageFileName.value = item.image || null;
  formData.value = data;
  showFormDialog.value = true;
};

const saveItem = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = { ...formData.value };

    if (tableName.value === "users" && isEditing.value && editingItem.value) {
      const src = editingItem.value;
      payload.image = src.image || null;
      payload.countryId = src.countryId ?? src.CountryId ?? null;
      payload.city = src.city || null;
      payload.workplace = src.workplace || null;
      payload.university = src.university || null;
      payload.dateOfBirth = src.dateOfBirth || null;
      payload.website = src.website || null;
      payload.bio = src.bio || null;
      payload.isPrivate = !!src.isPrivate;
    }

    // For password fields, treat empty value as "not provided".
    // Backend can then keep the old password (edit) or auto-generate (create).
    config.value.form.fields.forEach((f) => {
      if (f.type !== "password") return;

      // If password is edit-only, don't send it at all on create.
      if (!isEditing.value && f.editOnly) {
        delete payload[f.key];
        return;
      }

      const v = payload[f.key];
      if (v === undefined || v === null) return;

      if (typeof v === "string") {
        payload[f.key] = v.trim() ? v : null;
      } else {
        payload[f.key] = !v ? null : v;
      }
    });

    if (isEditing.value) {
      await AxiosApi.put(`${config.value.api}/${editingId.value}`, payload);
    } else {
      const createEndpoint = config.value.createApi || config.value.api;
      await AxiosApi.post(createEndpoint, payload);
    }
    showFormDialog.value = false;
    await fetchItems();
  } catch (e) {
    // Handled by interceptor
  } finally {
    saving.value = false;
  }
};

// Delete
const showDeleteDialog = ref(false);
const deleteTarget = ref(null);
const deleting = ref(false);

const confirmDelete = (item) => {
  deleteTarget.value = item;
  showDeleteDialog.value = true;
};

const deleteItem = async () => {
  deleting.value = true;
  try {
    await AxiosApi.delete(`${config.value.api}/${deleteTarget.value.id}`);
    showDeleteDialog.value = false;
    await fetchItems();
  } catch (e) {
    // Handled by interceptor
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.crud-page {
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

.crud-page.dark-mode {
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

.crud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.crud-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.crud-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 2px 0 0;
}

.create-btn {
  background: linear-gradient(135deg, #1a1a2e, #0f3460) !important;
  color: #fff !important;
  text-transform: none;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0;
  padding: 0 20px !important;
}

.crud-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  overflow: hidden;
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

.role-chip {
  font-weight: 600;
  font-size: 0.72rem !important;
  color: #fff !important;
}

.table-avatar {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid var(--divider);
  background: var(--table-header-bg);
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-top: 1px solid var(--divider);
}

.pagination-summary {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.per-page-select {
  width: 92px;
}

.actions-col {
  text-align: center;
  width: 100px;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

.action-edit {
  color: #0f3460 !important;
}

.action-edit:hover {
  background: rgba(15, 52, 96, 0.1) !important;
}

.action-delete {
  color: #e53935 !important;
}

.action-delete:hover {
  background: rgba(229, 57, 53, 0.1) !important;
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}

.empty-state h2 {
  color: var(--text-primary);
  margin: 16px 0 8px;
}

.empty-state p {
  color: var(--text-secondary);
}
</style>

<style>
/* Form/Delete dialogs - unscoped for v-dialog teleport */
.form-dialog,
.delete-dialog {
  --card-bg: #fff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --divider: #cbd5e1;
  --hover-bg: #f1f5f9;
  border-radius: 16px !important;
  overflow: hidden;
  background: var(--card-bg) !important;
}

.form-dialog.dark-mode,
.delete-dialog.dark-mode {
  --card-bg: #1e1e2e;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --divider: #334155;
  --hover-bg: #2a2a3e;
}

.form-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--divider);
}

.form-dialog-header .v-btn {
  color: var(--text-muted) !important;
}

.form-dialog-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.form-dialog-body {
  padding: 20px 24px 24px;
  position: relative;
  z-index: 1;
}

.admin-edit-image-preview {
  margin-bottom: 10px;
}

.admin-edit-image-preview img {
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--divider);
}

.admin-upload-success {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  color: #22c55e;
  margin-top: 6px;
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: 1 / -1;
}

.form-field.half {
  grid-column: span 1;
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding-left: 4px;
}

.form-input .v-field {
  font-size: 0.88rem;
  background: var(--card-bg) !important;
  pointer-events: auto !important;
  min-height: 44px !important;
}

.form-input .v-field input,
.form-input .v-field textarea {
  color: var(--text-primary) !important;
  pointer-events: auto !important;
}

.form-input {
  width: 100%;
  display: block;
}

.form-input.v-input {
  min-height: 44px !important;
}

.form-input .v-field__field {
  min-height: 44px !important;
  align-items: center;
}

@media (max-width: 700px) {
  .form-fields {
    grid-template-columns: 1fr;
  }

  .form-field.half {
    grid-column: 1 / -1;
  }
}

.form-input .v-field input::placeholder,
.form-input .v-field textarea::placeholder {
  color: var(--text-muted) !important;
}

.form-input .v-field__outline {
  color: var(--divider) !important;
}

.form-dialog:not(.dark-mode) .form-input .v-field__outline,
.delete-dialog:not(.dark-mode) .form-input .v-field__outline {
  color: #94a3b8 !important;
}

.form-input .v-field--focused .v-field__outline {
  color: #0f3460 !important;
}

.form-dialog-actions,
.delete-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--divider);
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--divider);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: var(--hover-bg);
}

.save-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(15, 52, 96, 0.3);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.delete-dialog-body {
  padding: 32px 24px 20px;
  text-align: center;
}

.delete-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 12px 0 8px;
}

.delete-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.delete-dialog-actions {
  padding: 16px 24px 24px;
  justify-content: center;
}

.delete-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: #e53935;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.delete-btn:hover {
  background: #c62828;
  transform: translateY(-1px);
}

.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>
