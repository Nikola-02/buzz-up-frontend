<template>
  <v-snackbar v-bind="snackbar" :color="props.color" timeout="2000">
    Error while..

    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>
<script setup>
import { defineProps, ref } from "vue";

const props = defineProps({
  showSnackbar: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "",
  },
});

const snackbar = ref(true);
</script>
