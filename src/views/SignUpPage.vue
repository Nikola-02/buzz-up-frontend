<template>
  <v-container class="fill-height background-image" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary text-center" dark flat>
            <v-toolbar-title class="text-h5">Sign Up</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-form @submit.prevent="register">
              <v-text-field
                v-model="user.firstName"
                label="First Name"
                prepend-icon="mdi-account"
                required
                outlined
              ></v-text-field>

              <v-text-field
                v-model="user.lastName"
                label="Last Name"
                prepend-icon="mdi-account"
                required
                outlined
              ></v-text-field>

              <v-text-field
                v-model="user.email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
                outlined
              ></v-text-field>

              <v-text-field
                v-model="user.username"
                label="Username"
                prepend-icon="mdi-account"
                required
                outlined
              ></v-text-field>

              <v-text-field
                v-model="user.password"
                label="Password"
                prepend-icon="mdi-lock"
                type="password"
                required
                outlined
              ></v-text-field>

              <v-file-input
                v-model="user.image"
                label="Profile Image (Optional)"
                prepend-icon="mdi-camera"
                accept="image/*"
                outlined
              ></v-file-input>

              <v-text-field
                v-model="user.country"
                label="Country (Optional)"
                prepend-icon="mdi-earth"
                outlined
              ></v-text-field>

              <v-text-field
                v-model="user.city"
                label="City (Optional)"
                prepend-icon="mdi-city"
                outlined
              ></v-text-field>

              <v-text-field
                v-model="user.workplace"
                label="Workplace (Optional)"
                prepend-icon="mdi-briefcase"
                outlined
              ></v-text-field>

              <v-text-field
                v-model="user.university"
                label="University (Optional)"
                prepend-icon="mdi-school"
                outlined
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                block
                large
                :loading="loading"
              >
                Sign Up
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-center">
            <span>Already have an account?</span>
            <v-btn variant="text" color="primary" @click="goToLogin">
              Login
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

const router = useRouter();
const loading = ref(false);

const user = ref({
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  image: null,
  country: "",
  city: "",
  workplace: "",
  university: "",
});

async function register() {
  loading.value = true;

  // Simulacija poziva API-ju za registraciju
  setTimeout(async () => {
    const newUser = {
      username: user.value.username,
      email: user.value.email,
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      password: user.value.password,
      image: user.value.image,
      country: user.value.country || null,
      city: user.value.city || null,
      workplace: user.value.workplace || null,
      university: user.value.university || null,
    };

    console.log("User registered:", newUser);
    loading.value = false;

    router.push("/login");
  }, 2000);
}

function goToLogin() {
  router.push("/login");
}
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
  background-color: rgba(0, 0, 139, 0.5);
}

.v-container {
  position: relative;
  z-index: 1;
}
</style>
