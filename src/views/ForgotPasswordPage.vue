<template>
  <div class="forgot-page">
    <!-- Left side - branding -->
    <div class="forgot-branding">
      <div class="branding-content">
        <div class="brand-logo">
          <v-icon size="56" color="#ffc107">mdi-bee</v-icon>
          <span class="brand-name"
            >Buzz<span class="brand-accent">Up</span></span
          >
        </div>
        <p class="brand-tagline">
          Forgot your password? No worries — we'll help you get back in.
        </p>
        <div class="brand-features">
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-email-fast-outline</v-icon
            >
            <span>Check your inbox for a reset link</span>
          </div>
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-lock-reset</v-icon
            >
            <span>Set a new password securely</span>
          </div>
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-shield-check</v-icon
            >
            <span>Your account stays protected</span>
          </div>
        </div>
      </div>
      <div class="branding-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- Right side - form -->
    <div class="forgot-form-side">
      <div class="forgot-form-wrapper">
        <!-- Default state: enter email -->
        <template v-if="!emailSent">
          <div class="form-header">
            <h1 class="form-title">Reset password</h1>
            <p class="form-subtitle">
              Enter the email address associated with your account and we'll
              send you a link to reset your password.
            </p>
          </div>

          <v-form
            ref="form"
            @submit.prevent="sendResetEmail"
            class="forgot-form"
          >
            <div class="input-group">
              <label class="input-label">Email address</label>
              <v-text-field
                v-model="email"
                placeholder="you@example.com"
                prepend-inner-icon="mdi-email-outline"
                type="email"
                :rules="[rules.required, rules.email]"
                required
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details="auto"
                class="modern-input"
              ></v-text-field>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              <v-progress-circular
                v-if="loading"
                indeterminate
                size="20"
                width="2"
                color="#fff"
              ></v-progress-circular>
              <span v-else>Send Reset Link</span>
            </button>
          </v-form>
        </template>

        <!-- Success state: email sent -->
        <template v-else>
          <div class="success-state">
            <div class="success-icon">
              <v-icon size="56" color="#22c55e">mdi-email-check-outline</v-icon>
            </div>
            <h1 class="form-title">Check your email</h1>
            <p class="form-subtitle">
              We've sent a password reset link to <strong>{{ email }}</strong
              >. Please check your inbox and click the link to reset your
              password.
            </p>
            <p class="resend-text">
              Didn't receive the email?
              <button class="resend-link" @click="resetForm">Try again</button>
            </p>
          </div>
        </template>

        <div class="form-footer">
          <v-icon size="16" class="mr-1" color="#64748b">mdi-arrow-left</v-icon>
          <button class="back-link" @click="goToLogin">Back to Sign In</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AxiosApi from "@/plugins/axios";
import { rules } from "@/plugins/validationMessages.js";

const router = useRouter();
const loading = ref(false);
const form = ref(null);
const email = ref("");
const emailSent = ref(false);

const sendResetEmail = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;

  try {
    await AxiosApi.post("/users/forgot-password", JSON.stringify(email.value), {
      headers: { "Content-Type": "application/json" },
    });
    emailSent.value = true;
  } catch (error) {
    // Error handled by axios interceptor
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  emailSent.value = false;
  email.value = "";
};

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.forgot-page {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* ===== LEFT BRANDING ===== */
.forgot-branding {
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
  font-size: 1.15rem;
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
.forgot-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}

.forgot-form-wrapper {
  width: 100%;
  max-width: 420px;
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

/* ===== FORM ===== */
.forgot-form {
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

.submit-btn {
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
  letter-spacing: 0.3px;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(15, 52, 96, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* ===== SUCCESS STATE ===== */
.success-state {
  text-align: center;
  margin-bottom: 32px;
}

.success-icon {
  margin-bottom: 20px;
}

.success-state .form-title {
  margin-bottom: 12px;
}

.success-state .form-subtitle {
  margin-bottom: 24px;
}

.success-state .form-subtitle strong {
  color: #0f172a;
}

.resend-text {
  font-size: 0.88rem;
  color: #94a3b8;
}

.resend-link {
  background: none;
  border: none;
  color: #0f3460;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s;
}

.resend-link:hover {
  color: #ffc107;
}

/* ===== FOOTER ===== */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.back-link {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.back-link:hover {
  color: #0f3460;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .forgot-page {
    flex-direction: column;
  }

  .forgot-branding {
    flex: none;
    padding: 40px 24px;
    min-height: 240px;
  }

  .brand-name {
    font-size: 2rem;
  }

  .brand-tagline {
    font-size: 1rem;
    margin-bottom: 20px;
  }

  .brand-features {
    display: none;
  }

  .forgot-form-side {
    padding: 32px 24px;
  }

  .form-title {
    font-size: 1.6rem;
  }
}
</style>
