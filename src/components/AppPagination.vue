<template>
  <div
    v-if="totalCount > 0"
    class="app-pagination"
    :class="{ 'dark-mode': isDark }"
  >
    <span class="app-pagination-summary">
      Showing {{ start }}–{{ end }} of {{ totalCount }}
    </span>
    <div class="app-pagination-controls">
      <v-select
        v-if="showPerPage"
        :model-value="perPage"
        :items="perPageOptions"
        density="compact"
        variant="outlined"
        hide-details
        rounded="lg"
        class="app-pagination-per-page"
        @update:model-value="$emit('update:perPage', Number($event) || perPage)"
      ></v-select>
      <div v-if="totalPages > 1" class="app-pagination-pages">
        <button
          type="button"
          class="page-nav"
          :disabled="page <= 1"
          aria-label="Previous page"
          @click="goTo(page - 1)"
        >
          <v-icon size="18">mdi-chevron-left</v-icon>
        </button>
        <template v-for="(item, index) in visiblePages" :key="`${item}-${index}`">
          <span v-if="item === '…'" class="page-ellipsis">…</span>
          <button
            v-else
            type="button"
            class="page-num"
            :class="{ active: item === page }"
            @click="goTo(item)"
          >
            {{ item }}
          </button>
        </template>
        <button
          type="button"
          class="page-nav"
          :disabled="page >= totalPages"
          aria-label="Next page"
          @click="goTo(page + 1)"
        >
          <v-icon size="18">mdi-chevron-right</v-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTheme } from "vuetify";

const props = defineProps({
  page: { type: Number, required: true },
  perPage: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  showPerPage: { type: Boolean, default: false },
  perPageOptions: { type: Array, default: () => [10, 20, 50, 100] },
});

const emit = defineEmits(["update:page", "update:perPage"]);

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");

const totalPages = computed(() =>
  Math.max(1, Math.ceil((props.totalCount || 0) / (props.perPage || 10)) || 1)
);

const start = computed(() => {
  if (!props.totalCount) return 0;
  return (props.page - 1) * props.perPage + 1;
});

const end = computed(() => {
  if (!props.totalCount) return 0;
  return Math.min(props.page * props.perPage, props.totalCount);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = props.page;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const marks = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    marks.add(2);
    marks.add(3);
    marks.add(4);
  }
  if (current >= total - 2) {
    marks.add(total - 3);
    marks.add(total - 2);
    marks.add(total - 1);
  }

  const sorted = [...marks].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const withGaps = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) {
      withGaps.push("…");
    }
    withGaps.push(n);
  });
  return withGaps;
});

const goTo = (nextPage) => {
  const normalized = Math.min(totalPages.value, Math.max(1, Number(nextPage) || 1));
  if (normalized === props.page) return;
  emit("update:page", normalized);
};
</script>

<style scoped>
.app-pagination {
  --pg-text: #64748b;
  --pg-btn-bg: #fff;
  --pg-btn-border: rgba(15, 52, 96, 0.12);
  --pg-btn-color: #0f3460;
  --pg-hover: rgba(15, 52, 96, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 4px 4px;
}

.app-pagination.dark-mode {
  --pg-text: #94a3b8;
  --pg-btn-bg: #1e1e2e;
  --pg-btn-border: rgba(255, 255, 255, 0.1);
  --pg-btn-color: #e2e8f0;
  --pg-hover: rgba(255, 193, 7, 0.12);
}

.app-pagination-summary {
  font-size: 0.82rem;
  color: var(--pg-text);
  font-weight: 600;
}

.app-pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.app-pagination-per-page {
  width: 92px;
}

.app-pagination-pages {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-nav,
.page-num {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid var(--pg-btn-border);
  border-radius: 10px;
  background: var(--pg-btn-bg);
  color: var(--pg-btn-color);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-nav:hover:not(:disabled),
.page-num:hover:not(.active) {
  background: var(--pg-hover);
}

.page-num.active {
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  border-color: transparent;
  color: #fff;
  cursor: default;
}

.page-nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.page-ellipsis {
  color: var(--pg-text);
  min-width: 16px;
  text-align: center;
  font-weight: 700;
}

.app-pagination.dark-mode .page-num.active {
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
}
</style>
