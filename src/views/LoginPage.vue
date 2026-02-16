<template>
  <div class="login-page">
    <!-- Left side - branding -->
    <div class="login-branding">
      <div class="branding-content">
        <div class="brand-logo">
          <v-icon size="56" color="#ffc107">mdi-bee</v-icon>
          <span class="brand-name"
            >Buzz<span class="brand-accent">Up</span></span
          >
        </div>
        <p class="brand-tagline">
          Connect with friends, share moments, and stay in the buzz.
        </p>
        <div class="brand-features">
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-account-group</v-icon
            >
            <span>Find and connect with friends</span>
          </div>
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-image-multiple</v-icon
            >
            <span>Share photos and moments</span>
          </div>
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-message-text</v-icon
            >
            <span>Real-time messaging</span>
          </div>
        </div>
      </div>
      <div class="branding-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- Right side - login form -->
    <div class="login-form-side">
      <div class="login-form-wrapper">
        <div class="form-header">
          <h1 class="form-title">Welcome back</h1>
          <p class="form-subtitle">Sign in to your account to continue</p>
        </div>

        <v-form ref="form" @submit.prevent="login" class="login-form">
          <div class="input-group">
            <label class="input-label">Username</label>
            <v-text-field
              v-model="user.username"
              placeholder="Enter your username"
              prepend-inner-icon="mdi-account-outline"
              :rules="[rules.required]"
              required
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="modern-input"
            ></v-text-field>
          </div>

          <div class="input-group">
            <label class="input-label">Password</label>
            <v-text-field
              v-model="user.password"
              placeholder="Enter your password"
              prepend-inner-icon="mdi-lock-outline"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="
                showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              @click:append-inner="showPassword = !showPassword"
              :rules="[rules.required, rules.password]"
              required
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="modern-input"
            ></v-text-field>
          </div>

          <div v-if="loginError" class="login-error">
            <v-icon size="16" class="mr-1">mdi-alert-circle-outline</v-icon>
            {{ loginError }}
          </div>

          <div class="form-options">
            <a class="forgot-link" @click.prevent="goToForgotPassword"
              >Forgot password?</a
            >
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <v-progress-circular
              v-if="loading"
              indeterminate
              size="20"
              width="2"
              color="#fff"
            ></v-progress-circular>
            <span v-else>Sign In</span>
          </button>
        </v-form>

        <div class="form-footer">
          <span class="footer-text">Don't have an account?</span>
          <button class="signup-link" @click="redirectToRegister">
            Create one
          </button>
        </div>
      </div>
    </div>
  </div>
  <SnackbarComponent
    v-model:show="showSnackbar"
    :color="snackbarColor"
    :text="snackbarText"
  />
</template>

<script setup>
import AxiosApi from "@/plugins/axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import CryptoJS from "crypto-js";
import { rules } from "@/plugins/validationMessages.js";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const loading = ref(false);
const form = ref(null);
const showPassword = ref(false);
const loginError = ref("");

const user = ref({
  username: "",
  password: "",
});

const login = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  loginError.value = "";
  const hashedPassword = CryptoJS.SHA256(user.value.password).toString();

  const loginUserData = {
    username: user.value.username,
    password: hashedPassword,
  };

  try {
    let response = await AxiosApi.post("/auth/login", loginUserData);
    const token = response.data.token;

    // Decode JWT payload to extract user info
    const payload = JSON.parse(atob(token.split(".")[1]));

    const userData = {
      token,
      username: user.value.username,
      firstName: payload.FirstName || "",
      lastName: payload.LastName || "",
      email: payload.Email || "",
      useCaseIds: payload.UseCaseIds || [],
    };

    store.dispatch("login", userData);

    router.push("/");
  } catch (error) {
    if (error.response?.status === 401) {
      loginError.value = "Invalid username or password. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};

const redirectToRegister = () => {
  router.push("/signup");
};

const goToForgotPassword = () => {
  router.push("/forgot-password");
};
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* ===== LEFT BRANDING ===== */
.login-branding {
  flex: 0 0 48%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 48px;
}

.branding-content {
  position: relative;
  z-index: 2;
  max-width: 420px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.brand-name {
  font-size: 2.8rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
}

.brand-accent {
  color: #ffc107;
}

.brand-tagline {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin-bottom: 40px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand-feature {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  font-weight: 500;
}

/* Decorative circles */
.branding-circles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 193, 7, 0.1);
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.06), transparent 70%);
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -80px;
  left: -60px;
  background: radial-gradient(circle, rgba(15, 52, 96, 0.3), transparent 70%);
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 40%;
  right: 10%;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.08), transparent 70%);
}

/* ===== RIGHT FORM SIDE ===== */
.login-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-header {
  margin-bottom: 36px;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

/* ===== FORM ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  padding-left: 4px;
}

.modern-input :deep(.v-field) {
  font-size: 0.92rem;
  color: #0f172a;
}

.modern-input :deep(.v-field input) {
  color: #0f172a !important;
}

.modern-input :deep(.v-field input::placeholder) {
  color: #94a3b8 !important;
}

.modern-input :deep(.v-field__outline) {
  color: #e2e8f0 !important;
}

.modern-input :deep(.v-field--focused .v-field__outline) {
  color: #0f3460 !important;
}

.modern-input :deep(.v-field__prepend-inner .v-icon) {
  color: #94a3b8;
  opacity: 1;
}

.modern-input :deep(.v-field__append-inner .v-icon) {
  color: #94a3b8;
  opacity: 1;
}

.login-error {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 500;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.forgot-link {
  font-size: 0.85rem;
  color: #0f3460;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #ffc107;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  letter-spacing: 0.3px;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(15, 52, 96, 0.3);
}

.login-btn:active {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* ===== FOOTER ===== */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.footer-text {
  font-size: 0.9rem;
  color: #64748b;
}

.signup-link {
  background: none;
  border: none;
  color: #0f3460;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s;
}

.signup-link:hover {
  color: #ffc107;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .login-page {
    flex-direction: column;
  }

  .login-branding {
    flex: none;
    padding: 40px 24px;
    min-height: 280px;
  }

  .brand-name {
    font-size: 2rem;
  }

  .brand-tagline {
    font-size: 1rem;
    margin-bottom: 24px;
  }

  .brand-features {
    display: none;
  }

  .login-form-side {
    padding: 32px 24px;
  }

  .form-title {
    font-size: 1.6rem;
  }
}
</style>
