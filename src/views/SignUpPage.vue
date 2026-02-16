<template>
  <div class="signup-page">
    <!-- Left side - branding -->
    <div class="signup-branding">
      <div class="branding-content">
        <div class="brand-logo">
          <v-icon size="56" color="#ffc107">mdi-bee</v-icon>
          <span class="brand-name"
            >Buzz<span class="brand-accent">Up</span></span
          >
        </div>
        <p class="brand-tagline">
          Join the hive. Create your account and start connecting today.
        </p>
        <div class="brand-features">
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-shield-check</v-icon
            >
            <span>Secure and private</span>
          </div>
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)"
              >mdi-lightning-bolt</v-icon
            >
            <span>Set up in seconds</span>
          </div>
          <div class="brand-feature">
            <v-icon size="22" color="rgba(255,255,255,0.8)">mdi-earth</v-icon>
            <span>Connect worldwide</span>
          </div>
        </div>
      </div>
      <div class="branding-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- Right side - signup form -->
    <div class="signup-form-side">
      <div class="signup-form-wrapper">
        <div class="form-header">
          <h1 class="form-title">Create account</h1>
          <p class="form-subtitle">Fill in your details to get started</p>
        </div>

        <v-form ref="form" @submit.prevent="register" class="signup-form">
          <!-- Name row -->
          <div class="input-row">
            <div class="input-group">
              <label class="input-label">First Name</label>
              <v-text-field
                v-model="user.firstName"
                placeholder="First name"
                prepend-inner-icon="mdi-account-outline"
                :rules="[rules.required]"
                :error-messages="serverErrors.FirstName"
                @update:model-value="serverErrors.FirstName = ''"
                required
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details="auto"
                class="modern-input"
              ></v-text-field>
            </div>
            <div class="input-group">
              <label class="input-label">Last Name</label>
              <v-text-field
                v-model="user.lastName"
                placeholder="Last name"
                prepend-inner-icon="mdi-account-outline"
                :rules="[rules.required]"
                :error-messages="serverErrors.LastName"
                @update:model-value="serverErrors.LastName = ''"
                required
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details="auto"
                class="modern-input"
              ></v-text-field>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">Email</label>
            <v-text-field
              v-model="user.email"
              placeholder="you@example.com"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              :rules="[rules.required, rules.email]"
              :error-messages="serverErrors.Email"
              @update:model-value="serverErrors.Email = ''"
              required
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              class="modern-input"
            ></v-text-field>
          </div>

          <div class="input-group">
            <label class="input-label">Username</label>
            <v-text-field
              v-model="user.username"
              placeholder="Choose a username"
              prepend-inner-icon="mdi-at"
              :rules="[rules.required]"
              :error-messages="serverErrors.Username"
              @update:model-value="serverErrors.Username = ''"
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
              placeholder="Create a password"
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

          <!-- Optional section -->
          <button
            type="button"
            class="optional-toggle"
            @click="showOptional = !showOptional"
          >
            <v-icon size="18">{{
              showOptional ? "mdi-chevron-up" : "mdi-chevron-down"
            }}</v-icon>
            <span>{{ showOptional ? "Hide" : "Show" }} optional details</span>
          </button>

          <transition name="slide">
            <div v-if="showOptional" class="optional-fields">
              <div class="input-group">
                <label class="input-label optional-label">Profile Image</label>
                <v-file-input
                  v-model="user.image"
                  placeholder="Upload a photo"
                  prepend-inner-icon="mdi-camera-outline"
                  prepend-icon=""
                  accept="image/*"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details="auto"
                  class="modern-input"
                ></v-file-input>
              </div>

              <div class="input-row">
                <div class="input-group">
                  <label class="input-label optional-label">Country</label>
                  <v-text-field
                    v-model="user.country"
                    placeholder="Country"
                    prepend-inner-icon="mdi-earth"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                    class="modern-input"
                  ></v-text-field>
                </div>
                <div class="input-group">
                  <label class="input-label optional-label">City</label>
                  <v-text-field
                    v-model="user.city"
                    placeholder="City"
                    prepend-inner-icon="mdi-city-variant-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                    class="modern-input"
                  ></v-text-field>
                </div>
              </div>

              <div class="input-row">
                <div class="input-group">
                  <label class="input-label optional-label">Workplace</label>
                  <v-text-field
                    v-model="user.workplace"
                    placeholder="Workplace"
                    prepend-inner-icon="mdi-briefcase-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                    class="modern-input"
                  ></v-text-field>
                </div>
                <div class="input-group">
                  <label class="input-label optional-label">University</label>
                  <v-text-field
                    v-model="user.university"
                    placeholder="University"
                    prepend-inner-icon="mdi-school-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                    class="modern-input"
                  ></v-text-field>
                </div>
              </div>
            </div>
          </transition>

          <button type="submit" class="signup-btn" :disabled="loading">
            <v-progress-circular
              v-if="loading"
              indeterminate
              size="20"
              width="2"
              color="#fff"
            ></v-progress-circular>
            <span v-else>Create Account</span>
          </button>
        </v-form>

        <div class="form-footer">
          <span class="footer-text">Already have an account?</span>
          <button class="login-link" @click="redirectToLogin">Sign in</button>
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import CryptoJS from "crypto-js";
import AxiosApi from "@/plugins/axios";
import { rules } from "@/plugins/validationMessages.js";
import { showSnackbar, snackbarColor, snackbarText } from "../snackbar";

const router = useRouter();
const loading = ref(false);
const form = ref(null);
const showPassword = ref(false);
const showOptional = ref(false);

const serverErrors = ref({
  Email: "",
  FirstName: "",
  LastName: "",
  Username: "",
});

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

const register = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  const hashedPassword = CryptoJS.SHA256(user.value.password).toString();

  const formData = new FormData();
  formData.append("username", user.value.username);
  formData.append("email", user.value.email);
  formData.append("firstName", user.value.firstName);
  formData.append("lastName", user.value.lastName);
  formData.append("password", hashedPassword);

  // Append image file only if user selected one
  if (user.value.image) {
    formData.append("image", user.value.image);
  }

  if (user.value.country) formData.append("country", user.value.country);
  if (user.value.city) formData.append("city", user.value.city);
  if (user.value.workplace) formData.append("workplace", user.value.workplace);
  if (user.value.university) formData.append("university", user.value.university);

  // Clear previous server errors
  serverErrors.value = { Email: "", FirstName: "", LastName: "", Username: "" };

  try {
    await AxiosApi.post("/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    router.push("/login");
  } catch (error) {
    const errors = error.response?.data;
    if (Array.isArray(errors)) {
      errors.forEach((err) => {
        if (err.property && err.property in serverErrors.value) {
          serverErrors.value[err.property] = err.error;
        }
      });
      // If none of the errors matched a known property, show generic snackbar
      const hasFieldError = errors.some(
        (err) => err.property && err.property in serverErrors.value,
      );
      if (!hasFieldError) {
        snackbarText.value = "Error while registering your account.";
      }
    } else {
      snackbarText.value = "Error while registering your account.";
    }
  } finally {
    loading.value = false;
  }
};

const redirectToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.signup-page {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* ===== LEFT BRANDING ===== */
.signup-branding {
  flex: 0 0 42%;
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
  max-width: 380px;
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
.signup-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  overflow-y: auto;
}

.signup-form-wrapper {
  width: 100%;
  max-width: 520px;
}

.form-header {
  margin-bottom: 28px;
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
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.input-row .input-group {
  flex: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 0.83rem;
  font-weight: 600;
  color: #334155;
  padding-left: 4px;
}

.optional-label {
  color: #94a3b8;
}

.modern-input :deep(.v-field) {
  font-size: 0.9rem;
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

.modern-input :deep(.v-field__prepend-inner .v-icon),
.modern-input :deep(.v-field__append-inner .v-icon) {
  color: #94a3b8;
  opacity: 1;
}

/* ===== OPTIONAL TOGGLE ===== */
.optional-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.2s;
}

.optional-toggle:hover {
  color: #0f3460;
}

.optional-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 14px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0 16px !important;
}

/* ===== SUBMIT BUTTON ===== */
.signup-btn {
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
  margin-top: 4px;
}

.signup-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(15, 52, 96, 0.3);
}

.signup-btn:active {
  transform: translateY(0);
}

.signup-btn:disabled {
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
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.footer-text {
  font-size: 0.9rem;
  color: #64748b;
}

.login-link {
  background: none;
  border: none;
  color: #0f3460;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s;
}

.login-link:hover {
  color: #ffc107;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .signup-page {
    flex-direction: column;
  }

  .signup-branding {
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

  .signup-form-side {
    padding: 28px 20px;
  }

  .form-title {
    font-size: 1.6rem;
  }

  .input-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
