<template>
  <v-snackbar v-model="snackbar" :color="color" timeout="4000">
    {{ text }}

    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="closeSnackbar"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps({
  show: Boolean,
  color: String,
  text: String,
});

const emit = defineEmits(["update:show"]);

const snackbar = ref(false);

watch(
  () => props.show,
  (newVal) => {
    snackbar.value = newVal;
  }
);

watch(snackbar, (val) => {
  if (!val) emit("update:show", false);
});

const closeSnackbar = () => {
  snackbar.value = false;
};
</script>
