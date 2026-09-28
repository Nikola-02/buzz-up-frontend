<template>
  <div class="settings-page" :class="{ 'dark-mode': isDark }">
    <div class="page-title-row">
      <div class="page-title-left">
        <v-icon size="22" class="page-title-icon">mdi-cog-outline</v-icon>
        <span class="page-title-text">Settings</span>
      </div>
      <v-btn variant="outlined" size="small" rounded class="back-home-btn" @click="goHome">
        <v-icon size="18" class="mr-1">mdi-home-outline</v-icon>
        Home
      </v-btn>
    </div>

    <div class="settings-layout">
      <aside class="settings-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="settings-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <v-icon size="18">{{ tab.icon }}</v-icon>
          <span>{{ tab.label }}</span>
        </button>
      </aside>

      <section class="settings-panel">
        <template v-if="activeTab === 'profile'">
          <h2 class="panel-title">Profile settings</h2>
          <p class="panel-hint">Choose who can see your About and friends.</p>
          <div class="visibility-choices">
            <button
              type="button"
              class="visibility-choice"
              :class="{ active: !isPrivate }"
              :disabled="savingPrivacy"
              @click="setPrivate(false)"
            >
              <v-icon size="18">mdi-earth</v-icon>
              <span>Public</span>
            </button>
            <button
              type="button"
              class="visibility-choice"
              :class="{ active: isPrivate }"
              :disabled="savingPrivacy"
              @click="setPrivate(true)"
            >
              <v-icon size="18">mdi-lock-outline</v-icon>
              <span>Private</span>
            </button>
          </div>

          <h2 class="panel-title section-gap">Theme</h2>
          <p class="panel-hint">Appearance for the whole app.</p>
          <div class="visibility-choices">
            <button
              type="button"
              class="visibility-choice"
              :class="{ active: !isDark }"
              @click="setTheme('light')"
            >
              <v-icon size="18">mdi-weather-sunny</v-icon>
              <span>Light</span>
            </button>
            <button
              type="button"
              class="visibility-choice"
              :class="{ active: isDark }"
              @click="setTheme('dark')"
            >
              <v-icon size="18">mdi-weather-night</v-icon>
              <span>Dark</span>
            </button>
          </div>
        </template>

        <template v-else-if="activeTab === 'password'">
          <h2 class="panel-title">Change password</h2>
          <p class="panel-hint">Leave empty to keep your current password.</p>
          <v-form ref="passwordFormRef" @submit.prevent="savePassword">
            <div class="edit-field">
              <label class="edit-label">New password</label>
              <v-text-field
                v-model="newPassword"
                placeholder="New password"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="showPassword = !showPassword"
                :rules="[optionalPassword]"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
                autocomplete="new-password"
              ></v-text-field>
            </div>
            <div class="edit-field">
              <label class="edit-label">Confirm password</label>
              <v-text-field
                v-model="confirmPassword"
                placeholder="Confirm password"
                :type="showConfirm ? 'text' : 'password'"
                :append-inner-icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="showConfirm = !showConfirm"
                :rules="[confirmRule]"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
                autocomplete="new-password"
              ></v-text-field>
            </div>
            <button type="submit" class="save-btn" :disabled="savingPassword">
              Save password
            </button>
          </v-form>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useTheme } from "vuetify";
import { rules } from "@/plugins/validationMessages.js";
import AxiosApi from "@/plugins/axios";
import { updateOwnUser } from "@/services/updateOwnUser";
import { showSnackbar, snackbarColor, snackbarText } from "../snackbar";

const store = useStore();
const router = useRouter();
const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");

const goHome = () => {
  router.push("/");
};

const tabs = [
  { id: "profile", label: "Profile settings", icon: "mdi-account-cog-outline" },
  { id: "password", label: "Change password", icon: "mdi-lock-reset" },
];
const activeTab = ref("profile");

const isPrivate = ref(false);
const savingPrivacy = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirm = ref(false);
const savingPassword = ref(false);
const passwordFormRef = ref(null);

const optionalPassword = (v) => {
  if (!v) return true;
  return rules.password(v);
};

const confirmRule = (v) => {
  if (!newPassword.value && !v) return true;
  return v === newPassword.value || "Passwords do not match";
};

const loadPrivacy = async () => {
  const userId = store.getters.getUser?.id;
  if (!userId) return;
  try {
    const res = await AxiosApi.get(`/users/${userId}`);
    isPrivate.value = !!res.data.isPrivate;
    store.commit("setProfile", res.data);
  } catch (e) {
    isPrivate.value = !!store.getters.getProfile?.isPrivate;
  }
};

const setPrivate = async (value) => {
  if (savingPrivacy.value || isPrivate.value === value) return;
  savingPrivacy.value = true;
  try {
    const data = await updateOwnUser({ isPrivate: value });
    isPrivate.value = !!data?.isPrivate;
    snackbarText.value = value ? "Profile is now private." : "Profile is now public.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // interceptor
  } finally {
    savingPrivacy.value = false;
  }
};

const setTheme = (name) => {
  theme.global.name.value = name;
};

const savePassword = async () => {
  const { valid } = await passwordFormRef.value.validate();
  if (!valid) return;
  if (!newPassword.value) {
    snackbarText.value = "Enter a new password to change it.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
    return;
  }
  savingPassword.value = true;
  try {
    await updateOwnUser({ password: newPassword.value });
    newPassword.value = "";
    confirmPassword.value = "";
    showPassword.value = false;
    showConfirm.value = false;
    snackbarText.value = "Password updated.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // interceptor
  } finally {
    savingPassword.value = false;
  }
};

onMounted(loadPrivacy);
</script>

<style scoped>
.settings-page {
  --card-bg: #fff;
  --card-border: rgba(0, 0, 0, 0.06);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --text-heading: #1a1a2e;
  --hover-bg: #f1f5f9;
  --divider: #e2e8f0;
  max-width: 100%;
}

.settings-page.dark-mode {
  --card-bg: #1e1e2e;
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-heading: #e2e8f0;
  --hover-bg: #2a2a3e;
  --divider: #334155;
}

.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px 0;
}

.page-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-home-btn {
  border-color: var(--text-heading) !important;
  color: var(--text-heading) !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.back-home-btn:hover {
  background: var(--text-heading) !important;
  color: var(--card-bg) !important;
}

.page-title-icon {
  color: var(--text-muted);
}

.page-title-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-layout {
  display: flex;
  gap: 20px;
  padding: 20px 24px 40px;
  align-items: flex-start;
}

.settings-nav {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 10px;
}

.settings-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.settings-tab.active {
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
}

.settings-panel {
  flex: 1;
  min-width: 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 22px 24px 24px;
}

.panel-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-heading);
}

.panel-title.section-gap {
  margin-top: 28px;
}

.panel-hint {
  margin: 6px 0 14px;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.visibility-choices {
  display: flex;
  gap: 10px;
  max-width: 420px;
}

.visibility-choice {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--divider);
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.visibility-choice.active {
  background: #1a1a2e;
  border-color: #1a1a2e;
  color: #fff;
}

.visibility-choice:disabled {
  opacity: 0.7;
  cursor: default;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
  max-width: 420px;
}

.edit-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding-left: 4px;
}

.edit-input .v-field {
  font-size: 0.88rem;
  background: var(--card-bg) !important;
}

.save-btn {
  margin-top: 4px;
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

@media (max-width: 800px) {
  .settings-layout {
    flex-direction: column;
  }

  .settings-nav {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }
}
</style>
