<template>
  <v-container class="fill-height background-image" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title class="d-flex flex-column align-center">
              <v-img
                src="@/assets/logo.png"
                alt="Logo projekta"
                contain
                height="40"
                width="auto"
                class="mr-2"
              ></v-img>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-icon="mdi-account"
                required
                outlined
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                prepend-icon="mdi-lock"
                type="password"
                required
                outlined
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                block
                large
                :loading="loading"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center">
            <span>Don't have an account?</span>
            <v-btn variant="text" color="primary" @click="redirectToRegister">
              Sign up
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const loading = ref(false);
const router = useRouter();

function login() {
  loading.value = true;

  setTimeout(() => {
    loading.value = false;
    router.push("/dashboard");
  }, 2000);
}

const redirectToRegister = () => {
  router.push("/signup");
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}

.background-image {
  position: relative;
  background-image: url("@/assets/login-background3.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.background-image::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(24, 103, 192, 0.6);
}

.v-container {
  position: relative;
  z-index: 1;
}

.v-toolbar-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.text-uppercase {
  text-transform: uppercase;
}

.font-weight-bold {
  font-weight: bold;
}
</style>
