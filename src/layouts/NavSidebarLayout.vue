<template>
  <v-container fluid>
    <!-- NAVBAR -->
    <v-app-bar color="primary" dark>
      <v-app-bar-title>My Social App</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- GLAVNI SADRŽAJ -->
    <v-container>
      <v-row>
        <!-- LEVA SEKCIJA (Prijatelji) -->
        <v-col cols="12" sm="3" class="friends-section">
          <v-card>
            <v-card-title>Friends</v-card-title>
            <v-divider></v-divider>
            <v-list>
              <v-list-item v-for="friend in friends" :key="friend.id">
                <v-list-item-avatar>
                  <v-img :src="friend.avatar"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ friend.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <router-view></router-view>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const friends = ref([
  {
    id: 1,
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
  },
]);

// const posts = ref([
//   {
//     id: 1,
//     author: "John Doe",
//     content: "Hello, world!",
//     image: "https://via.placeholder.com/400",
//   },
//   { id: 2, author: "Jane Smith", content: "Vue is awesome!", image: "" },
// ]);

const logout = () => {
  store.dispatch("logout");
  router.push("/login");
};
</script>

<style scoped>
.friends-section {
  background-color: #f5f5f5;
  padding: 10px;
}
</style>
