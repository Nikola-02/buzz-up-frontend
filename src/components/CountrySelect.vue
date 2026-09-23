<template>
  <v-autocomplete
    :model-value="syncedId"
    :items="mergedItems"
    item-title="name"
    item-value="id"
    :loading="loading"
    :error-messages="errorMessages"
    :placeholder="placeholder"
    :prepend-inner-icon="prependInnerIcon"
    :variant="variant"
    :density="density"
    :rounded="rounded"
    :hide-details="hideDetails"
    :rules="rules"
    :class="inputClass"
    clearable
    autocomplete="off"
    no-data-text="No countries match your search"
    @update:model-value="onInput"
  ></v-autocomplete>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { fetchCountries } from "@/services/countries";

const props = defineProps({
  modelValue: { type: [Number, String], default: null },
  /** Ako id nije u listi (stari podatak), prikaži ovaj naziv. */
  hintName: { type: String, default: "" },
  placeholder: { type: String, default: "Select country" },
  prependInnerIcon: { type: String, default: "mdi-earth" },
  variant: { type: String, default: "outlined" },
  density: { type: String, default: "compact" },
  rounded: { type: [String, Boolean], default: "lg" },
  hideDetails: { type: [String, Boolean], default: "auto" },
  rules: { type: Array, default: () => [] },
  inputClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const items = ref([]);
const loading = ref(false);
const loadError = ref("");

const mergedItems = computed(() => {
  const list = items.value;
  const v = props.modelValue;
  if (v === null || v === undefined || v === "") return list;
  const has = list.some((c) => c.id === v || String(c.id) === String(v));
  if (has) return list;
  const hint = props.hintName && props.hintName.trim();
  if (hint) return [{ id: v, name: hint }, ...list];
  return list;
});

/** Isti id kao u stavkama (npr. broj umesto stringa) da bi se prikazao izbor. */
const syncedId = computed(() => {
  const v = props.modelValue;
  if (v === null || v === undefined || v === "") return null;
  const found = mergedItems.value.find((c) => String(c.id) === String(v));
  return found ? found.id : v;
});

const errorMessages = computed(() => {
  if (loadError.value) return loadError.value;
  return undefined;
});

function onInput(val) {
  if (val === undefined || val === null) {
    emit("update:modelValue", null);
    return;
  }
  const found = mergedItems.value.find((c) => String(c.id) === String(val));
  emit("update:modelValue", found ? found.id : val);
}

onMounted(async () => {
  loading.value = true;
  loadError.value = "";
  try {
    items.value = await fetchCountries();
  } catch {
    loadError.value = "Could not load countries. Try again later.";
    items.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
