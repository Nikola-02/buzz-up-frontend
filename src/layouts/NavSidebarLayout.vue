<template>
  <div class="container pt-5">
    <!-- NAVBAR -->
    <div class="nav">
      <div class="title">
        <h1>Buzz Up</h1>
      </div>
    </div>

    <!-- GLAVNI SADRŽAJ -->
    <v-container class="mt-12">
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
      <v-row>
        <!-- LEVA SEKCIJA (Prijatelji) -->
        <v-col cols="12" sm="3" class="friends-section">
          <v-card>
            <v-card-title>Friends</v-card-title>
            <v-divider></v-divider>
            <v-list class="w-100">
              <v-list-item
                v-for="friend in friends"
                :key="friend.id"
                class="d-flex flex-md-nowrap align-center"
              >
                <div class="friend d-flex align-items justify-start">
                  <div class="friend-image">
                    <img
                      :src="friend.avatar"
                      :alt="friend.name"
                      class="w-25 rounded"
                    />
                  </div>

                  <div class="friend-name d-flex align-center text-start">
                    <span>{{ friend.name }}</span>
                  </div>
                </div>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <router-view></router-view>
      </v-row>
    </v-container>
  </div>
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
