<template>
  <v-app>
    <component :is="layoutComponent" v-if="layoutComponent">
      <v-main>
        <router-view />
      </v-main>
    </component>
  </v-app>
</template>

<script setup>
import { computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";

const layoutMap = {
  empty: defineAsyncComponent(() => import("./layouts/EmptyLayout.vue")),
  sidebar: defineAsyncComponent(() => import("./layouts/NavSidebarLayout.vue")),
};

const route = useRoute();

const layout = computed(() => {
  return route.meta.layout || "empty";
});

const layoutComponent = computed(() => {
  return layoutMap[layout.value];
});
</script>
