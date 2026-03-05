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
  navsidebar: defineAsyncComponent(() =>
    import("./layouts/NavSidebarLayout.vue")
  ),
  admin: defineAsyncComponent(() => import("./layouts/AdminLayout.vue")),
};

const route = useRoute();

const layout = computed(() => {
  return route.meta.layout || "empty";
});

const layoutComponent = computed(() => {
  return layoutMap[layout.value];
});
</script>
<style>
.container {
  width: 90%;
  margin: 0px auto;
}

.v-avatar img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
