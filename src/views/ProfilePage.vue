<template>
  <div class="profile-page" :class="{ 'dark-mode': isDark }">
    <!-- Page title -->
    <div class="page-title-row">
      <v-icon size="22" class="page-title-icon">mdi-account-circle-outline</v-icon>
      <span class="page-title-text">My Profile</span>
    </div>

    <!-- Profile header -->
    <div class="profile-header">
      <div class="profile-avatar-wrapper">
        <v-avatar size="120" class="profile-avatar">
          <img :src="profileImageUrl" alt="Profile photo" />
        </v-avatar>
        <v-btn icon size="small" class="avatar-edit-btn">
          <v-icon size="18">mdi-camera</v-icon>
        </v-btn>
      </div>
      <div class="profile-header-info">
        <div class="profile-identity">
          <h1 class="profile-display-name">{{ profile?.firstName }} {{ profile?.lastName }}</h1>
          <span class="profile-handle">@{{ profile?.username }}</span>
        </div>
        <div class="profile-actions">
          <v-btn variant="outlined" class="edit-btn" rounded @click="openEditProfile">
            <v-icon size="18" class="mr-1">mdi-pencil-outline</v-icon>
            Edit Profile
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Profile content -->
    <div class="profile-content">
      <v-row>
        <!-- Left column - About -->
        <v-col cols="12" md="5">
          <div class="info-card">
            <div class="info-card-title">
              <v-icon size="20">mdi-information-outline</v-icon>
              <span>About</span>
            </div>
            <p v-if="profile?.bio" class="bio-text">{{ profile.bio }}</p>
            <p v-else class="bio-text empty-field">No bio yet</p>
            <div class="about-items">
              <div class="about-item">
                <v-icon size="18" class="about-icon">mdi-map-marker-outline</v-icon>
                <span v-if="profile?.city || profile?.country">
                  Lives in {{ [profile.city, profile.country].filter(Boolean).join(', ') }}
                </span>
                <span v-else class="empty-field">Location</span>
              </div>
              <div class="about-item">
                <v-icon size="18" class="about-icon">mdi-briefcase-outline</v-icon>
                <span v-if="profile?.workplace">Works at {{ profile.workplace }}</span>
                <span v-else class="empty-field">Workplace</span>
              </div>
              <div class="about-item">
                <v-icon size="18" class="about-icon">mdi-school-outline</v-icon>
                <span v-if="profile?.university">Studies at {{ profile.university }}</span>
                <span v-else class="empty-field">University</span>
              </div>
              <div class="about-item">
                <v-icon size="18" class="about-icon">mdi-calendar-outline</v-icon>
                <span v-if="profile?.dateOfBirth">Born on {{ formatDate(profile.dateOfBirth) }}</span>
                <span v-else class="empty-field">Date of birth</span>
              </div>
              <div class="about-item">
                <v-icon size="18" class="about-icon">mdi-email-outline</v-icon>
                <span v-if="profile?.email">{{ profile.email }}</span>
                <span v-else class="empty-field">Email</span>
              </div>
              <div class="about-item">
                <v-icon size="18" class="about-icon">mdi-link-variant</v-icon>
                <a v-if="profile?.website" :href="profile.website" target="_blank" class="about-link">{{ profile.website }}</a>
                <span v-else class="empty-field">Website</span>
              </div>
            </div>
          </div>

          <!-- Friends preview card -->
          <div class="info-card mt-4">
            <div class="info-card-title">
              <v-icon size="20">mdi-account-group-outline</v-icon>
              <span>Friends</span>
              <span class="see-all">See all</span>
            </div>
            <div class="friends-grid">
              <div v-for="friend in previewFriends" :key="friend.id" class="friend-preview">
                <v-avatar size="58" rounded="lg">
                  <img :src="friend.avatar" :alt="friend.name" />
                </v-avatar>
                <span class="friend-preview-name">{{ friend.name }}</span>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Right column - Posts -->
        <v-col cols="12" md="7">
          <!-- Create post -->
          <div class="create-post-card">
            <div class="create-post-top">
              <v-avatar size="44" class="create-avatar">
                <img :src="profileImageUrl" alt="Me" />
              </v-avatar>
              <div class="create-post-input">
                What's buzzing, {{ profile?.firstName }}?
              </div>
            </div>
            <div class="create-post-bottom">
              <button class="create-action">
                <v-icon size="18" color="#f44336">mdi-image-outline</v-icon>
                <span>Photo</span>
              </button>
              <button class="create-action">
                <v-icon size="18" color="#ffc107">mdi-emoticon-happy-outline</v-icon>
                <span>Feeling</span>
              </button>
            </div>
          </div>

          <!-- Posts -->
          <div v-for="post in posts" :key="post.id" class="post-card mt-4">
            <div class="post-top">
              <v-avatar size="44">
                <img :src="profileImageUrl" alt="Me" />
              </v-avatar>
              <div class="post-meta">
                <span class="post-author">{{ profile?.firstName }} {{ profile?.lastName }}</span>
                <span class="post-timestamp">
                  <v-icon size="12">mdi-clock-outline</v-icon>
                  {{ post.time }}
                </span>
              </div>
              <button class="post-options-btn">
                <v-icon size="20">mdi-dots-horizontal</v-icon>
              </button>
            </div>
            <p class="post-body">{{ post.content }}</p>
            <div v-if="post.image" class="post-image-wrapper">
              <img :src="post.image" class="post-image" />
            </div>
            <div class="reactions-bar">
              <div class="reactions-left">
                <div class="reaction-icons">
                  <span class="reaction-emoji">❤️</span>
                  <span class="reaction-emoji">👍</span>
                </div>
                <span class="reaction-count">{{ post.likes }}</span>
              </div>
              <span class="reactions-right">{{ post.comments }} comments</span>
            </div>
            <div class="post-actions">
              <button class="action-btn">
                <v-icon size="20">mdi-heart-outline</v-icon>
                <span>Like</span>
              </button>
              <button class="action-btn">
                <v-icon size="20">mdi-comment-processing-outline</v-icon>
                <span>Comment</span>
              </button>
              <button class="action-btn">
                <v-icon size="20">mdi-share-variant-outline</v-icon>
                <span>Share</span>
              </button>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <!-- Edit Profile Dialog -->
    <v-dialog v-model="showEditDialog" max-width="560" persistent>
      <v-card class="edit-dialog" :class="{ 'dark-mode': isDark }">
        <div class="edit-dialog-header">
          <h2 class="edit-dialog-title">Edit Profile</h2>
          <v-btn icon variant="text" size="small" @click="closeEditDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="edit-dialog-body">
          <!-- Profile image -->
          <div class="edit-avatar-section">
            <v-avatar size="80" class="edit-avatar">
              <img :src="editImagePreview" alt="Profile" />
            </v-avatar>
            <div class="edit-avatar-actions">
              <v-file-input
                v-model="editImageFile"
                placeholder="Change photo"
                prepend-inner-icon="mdi-camera-outline"
                prepend-icon=""
                accept="image/*"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
                :loading="imageUploading"
                :error-messages="imageError"
                @update:model-value="onEditImageSelected"
              ></v-file-input>
              <span v-if="editUploadedFileName && editUploadedFileName !== editForm.image" class="upload-success-text">
                <v-icon size="14" color="#22c55e">mdi-check-circle</v-icon>
                New image uploaded
              </span>
            </div>
          </div>

          <v-form ref="editFormRef" @submit.prevent="saveProfile" class="edit-form">
            <!-- Name row -->
            <div class="edit-row">
              <div class="edit-field">
                <label class="edit-label">First Name *</label>
                <v-text-field
                  v-model="editForm.firstName"
                  placeholder="First name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  class="edit-input"
                ></v-text-field>
              </div>
              <div class="edit-field">
                <label class="edit-label">Last Name *</label>
                <v-text-field
                  v-model="editForm.lastName"
                  placeholder="Last name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  class="edit-input"
                ></v-text-field>
              </div>
            </div>

            <div class="edit-field">
              <label class="edit-label">Username *</label>
              <v-text-field
                v-model="editForm.username"
                placeholder="Username"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
              ></v-text-field>
            </div>

            <div class="edit-field">
              <label class="edit-label">Email *</label>
              <v-text-field
                v-model="editForm.email"
                placeholder="Email"
                type="email"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
              ></v-text-field>
            </div>

            <div class="edit-field">
              <label class="edit-label">New Password</label>
              <v-text-field
                v-model="editForm.password"
                placeholder="Leave blank to keep current"
                :type="showEditPassword ? 'text' : 'password'"
                :append-inner-icon="showEditPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click:append-inner="showEditPassword = !showEditPassword"
                :rules="[optionalPassword]"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
              ></v-text-field>
            </div>

            <div class="edit-field">
              <label class="edit-label">Bio</label>
              <v-textarea
                v-model="editForm.bio"
                placeholder="Tell us about yourself..."
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                rows="2"
                auto-grow
                class="edit-input"
              ></v-textarea>
            </div>

            <div class="edit-row">
              <div class="edit-field">
                <label class="edit-label">Country</label>
                <v-text-field
                  v-model="editForm.country"
                  placeholder="Country"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  class="edit-input"
                ></v-text-field>
              </div>
              <div class="edit-field">
                <label class="edit-label">City</label>
                <v-text-field
                  v-model="editForm.city"
                  placeholder="City"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  class="edit-input"
                ></v-text-field>
              </div>
            </div>

            <div class="edit-row">
              <div class="edit-field">
                <label class="edit-label">Workplace</label>
                <v-text-field
                  v-model="editForm.workplace"
                  placeholder="Workplace"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  class="edit-input"
                ></v-text-field>
              </div>
              <div class="edit-field">
                <label class="edit-label">University</label>
                <v-text-field
                  v-model="editForm.university"
                  placeholder="University"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  hide-details="auto"
                  class="edit-input"
                ></v-text-field>
              </div>
            </div>

            <div class="edit-field">
              <label class="edit-label">Date of Birth</label>
              <v-text-field
                v-model="editForm.dateOfBirth"
                type="date"
                :max="today"
                :rules="[rules.noFutureDate]"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
              ></v-text-field>
            </div>

            <div class="edit-field">
              <label class="edit-label">Website</label>
              <v-text-field
                v-model="editForm.website"
                placeholder="https://yoursite.com"
                variant="outlined"
                density="compact"
                rounded="lg"
                hide-details="auto"
                class="edit-input"
              ></v-text-field>
            </div>

            <div class="edit-dialog-actions">
              <button type="button" class="edit-cancel-btn" @click="closeEditDialog">Cancel</button>
              <button type="submit" class="edit-save-btn" :disabled="saving">
                <v-progress-circular v-if="saving" indeterminate size="18" width="2" color="#fff"></v-progress-circular>
                <span v-else>Save Changes</span>
              </button>
            </div>
          </v-form>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import AxiosApi from "@/plugins/axios";
import { rules } from "@/plugins/validationMessages.js";

const theme = useTheme();
const store = useStore();
const isDark = computed(() => theme.global.name.value === "dark");

const profile = computed(() => store.getters.getProfile);

onMounted(async () => {
  if (!store.getters.getProfile) {
    const userId = store.getters.getUser?.id;
    if (userId) {
      try {
        const res = await AxiosApi.get(`/users/${userId}`);
        store.commit("setProfile", res.data);
      } catch (e) {
        // Profile fetch failed
      }
    }
  }
});

const profileImageUrl = computed(() => {
  const image = store.getters.userImage;
  return `http://localhost:5001/temp/${image}`;
});

const today = computed(() => new Date().toISOString().split("T")[0]);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const optionalPassword = (v) => {
  if (!v) return true;
  return rules.password(v);
};

// ===== EDIT PROFILE =====
const showEditDialog = ref(false);
const editFormRef = ref(null);
const saving = ref(false);
const showEditPassword = ref(false);
const imageUploading = ref(false);
const imageError = ref("");
const editImageFile = ref(null);
const editUploadedFileName = ref("");

const editForm = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  country: "",
  city: "",
  workplace: "",
  university: "",
  dateOfBirth: "",
  website: "",
  image: "",
});

const editImagePreview = computed(() => {
  if (editUploadedFileName.value && editUploadedFileName.value !== editForm.value.image) {
    return `http://localhost:5001/temp/${editUploadedFileName.value}`;
  }
  if (editForm.value.image) {
    return `http://localhost:5001/temp/${editForm.value.image}`;
  }
  return `http://localhost:5001/temp/default.png`;
});

const openEditProfile = async () => {
  const userId = store.getters.getUser?.id;
  if (!userId) return;

  // Fetch fresh user data
  try {
    const res = await AxiosApi.get(`/users/${userId}`);
    const data = res.data;
    editForm.value = {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      username: data.username || "",
      email: data.email || "",
      password: "",
      bio: data.bio || "",
      country: data.country || "",
      city: data.city || "",
      workplace: data.workplace || "",
      university: data.university || "",
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
      website: data.website || "",
      image: data.image || "",
    };
    showEditPassword.value = false;
    editUploadedFileName.value = "";
    editImageFile.value = null;
    imageError.value = "";
    showEditDialog.value = true;
  } catch (e) {
    // Error handled by axios interceptor
  }
};

const closeEditDialog = () => {
  showEditDialog.value = false;
};

const onEditImageSelected = async (file) => {
  imageError.value = "";
  if (!file) return;

  imageUploading.value = true;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await AxiosApi.post("/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    editUploadedFileName.value = response.data.file;
  } catch (error) {
    imageError.value = error.response?.status === 415
      ? "Unsupported file type. Use JPG, PNG, or GIF."
      : "Failed to upload image.";
    editImageFile.value = null;
  } finally {
    imageUploading.value = false;
  }
};

const saveProfile = async () => {
  const { valid } = await editFormRef.value.validate();
  if (!valid) return;

  saving.value = true;
  const userId = store.getters.getUser?.id;

  const payload = {
    firstName: editForm.value.firstName,
    lastName: editForm.value.lastName,
    username: editForm.value.username,
    email: editForm.value.email,
    password: editForm.value.password || null,
    bio: editForm.value.bio || null,
    country: editForm.value.country || null,
    city: editForm.value.city || null,
    workplace: editForm.value.workplace || null,
    university: editForm.value.university || null,
    dateOfBirth: editForm.value.dateOfBirth || null,
    website: editForm.value.website || null,
    image: editUploadedFileName.value || editForm.value.image || null,
  };

  try {
    await AxiosApi.put(`/users/${userId}`, payload);

    // Refresh profile in store
    const res = await AxiosApi.get(`/users/${userId}`);
    store.commit("setProfile", res.data);

    showEditDialog.value = false;
  } catch (e) {
    // Error handled by axios interceptor
  } finally {
    saving.value = false;
  }
};

const previewFriends = ref([
  { id: 1, name: "John", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
  { id: 2, name: "Jane", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
  { id: 3, name: "Mike", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
  { id: 4, name: "Emily", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
  { id: 5, name: "Chris", avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
  { id: 6, name: "Sarah", avatar: "https://randomuser.me/api/portraits/women/6.jpg" },
]);

const posts = ref([
  {
    id: 1,
    content: "Just shipped a new feature! Feeling great about how the team came together on this one. Sometimes the best code is the code you write with awesome people.",
    image: "",
    time: "2 hours ago",
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    content: "Beautiful sunset from my balcony today. Belgrade never disappoints.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    time: "Yesterday",
    likes: 67,
    comments: 12,
  },
  {
    id: 3,
    content: "New blog post is up! Wrote about building scalable Vue.js applications. Link in bio.",
    image: "",
    time: "3 days ago",
    likes: 38,
    comments: 8,
  },
]);
</script>

<style scoped>
/* ===== THEME VARS ===== */
.profile-page {
  --card-bg: #fff;
  --card-border: rgba(0, 0, 0, 0.06);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --text-heading: #1a1a2e;
  --hover-bg: #f1f5f9;
  --divider: #e2e8f0;
  --action-hover: rgba(15, 52, 96, 0.08);
  --avatar-border: #fff;
  --edit-btn-color: #1a1a2e;
  --link-color: #0f3460;
  --about-icon-color: #94a3b8;
  max-width: 100%;
}

.profile-page.dark-mode {
  --card-bg: #1e1e2e;
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-heading: #e2e8f0;
  --hover-bg: #2a2a3e;
  --divider: #334155;
  --action-hover: rgba(255, 193, 7, 0.1);
  --avatar-border: #1e1e2e;
  --edit-btn-color: #e2e8f0;
  --link-color: #ffc107;
  --about-icon-color: #64748b;
}

/* ===== PAGE TITLE ===== */
.page-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px 0;
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

/* ===== PROFILE HEADER ===== */
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 24px 20px;
  flex-wrap: wrap;
}

.profile-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  border: 4px solid var(--avatar-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transition: border-color 0.3s ease;
}

.profile-avatar img {
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: var(--card-bg) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.profile-header-info {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 0;
}

.profile-identity {
  flex: 1;
}

.profile-display-name {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--text-heading);
  line-height: 1.2;
  margin: 0;
  transition: color 0.3s ease;
}

.profile-handle {
  font-size: 0.9rem;
  color: var(--text-muted);
  display: block;
  margin-top: 2px;
}

.profile-stats-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.profile-stats-inline strong {
  color: var(--text-heading);
}

.stats-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
}

.profile-actions {
  padding-top: 4px;
}

.edit-btn {
  border-color: var(--edit-btn-color) !important;
  color: var(--edit-btn-color) !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: var(--edit-btn-color) !important;
  color: var(--card-bg) !important;
}

/* ===== INFO CARDS ===== */
.info-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-heading);
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.info-card-title .v-icon {
  color: var(--text-muted) !important;
}

.see-all {
  margin-left: auto;
  font-size: 0.82rem;
  color: var(--link-color);
  font-weight: 500;
  cursor: pointer;
}

.see-all:hover {
  text-decoration: underline;
}

.bio-text {
  font-size: 0.92rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.about-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.about-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.about-icon {
  color: var(--about-icon-color) !important;
}

.about-link {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
}

.about-link:hover {
  text-decoration: underline;
}

.empty-field {
  font-style: italic;
  color: var(--text-muted) !important;
  opacity: 0.7;
}

/* ===== FRIENDS PREVIEW ===== */
.friends-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.friend-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.friend-preview:hover .friend-preview-name {
  color: var(--link-color);
}

.friend-preview .v-avatar img {
  object-fit: cover;
}

.friend-preview-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  transition: color 0.2s;
}

/* ===== CREATE POST ===== */
.create-post-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.create-post-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.create-avatar {
  border: 2px solid var(--divider);
}

.create-post-input {
  flex: 1;
  background: var(--hover-bg);
  border-radius: 24px;
  padding: 12px 20px;
  color: var(--text-muted);
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.create-post-input:hover {
  border-color: var(--divider);
  background: var(--card-bg);
}

.create-post-bottom {
  display: flex;
  gap: 4px;
  border-top: 1px solid var(--divider);
  padding-top: 14px;
}

.create-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.create-action:hover {
  background: var(--hover-bg);
}

/* ===== POST CARD ===== */
.post-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.post-card:hover {
  border-color: var(--divider);
}

.post-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 0;
}

.post-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.post-author {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.post-timestamp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.post-options-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.post-options-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.post-body {
  padding: 14px 20px 16px;
  font-size: 0.93rem;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}

.post-image-wrapper {
  margin: 0;
}

.post-image {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 400px;
}

.reactions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.reactions-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reaction-icons {
  display: flex;
  gap: 2px;
}

.reaction-emoji {
  font-size: 0.85rem;
}

.reaction-count {
  font-weight: 600;
  color: var(--text-secondary);
}

.reactions-right {
  font-size: 0.8rem;
}

.post-actions {
  display: flex;
  gap: 4px;
  padding: 4px 12px 12px;
  border-top: 1px solid var(--divider);
  margin: 0 8px;
  padding-top: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 0;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--action-hover);
  color: var(--text-primary);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 12px;
  }

  .profile-display-name {
    font-size: 1.3rem;
  }

  .friends-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}


</style>

<style>
/* Edit Profile Dialog - unscoped because v-dialog teleports outside component */
.edit-dialog {
  --card-bg: #fff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --hover-bg: #f1f5f9;
  --divider: #e2e8f0;
  border-radius: 16px !important;
  overflow: hidden;
  background: var(--card-bg) !important;
}

.edit-dialog.dark-mode {
  --card-bg: #1e1e2e;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --hover-bg: #2a2a3e;
  --divider: #334155;
}

.edit-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--divider);
}

.edit-dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.edit-dialog-header .v-btn {
  color: var(--text-muted) !important;
}

.edit-dialog-body {
  padding: 20px 24px 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.edit-avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--divider);
}

.edit-avatar {
  flex-shrink: 0;
  border: 3px solid var(--divider);
}

.edit-avatar-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-success-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 500;
  padding-left: 4px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.edit-row {
  display: flex;
  gap: 12px;
}

.edit-row .edit-field {
  flex: 1;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.edit-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  padding-left: 4px;
}

.edit-input .v-field {
  font-size: 0.88rem;
  color: var(--text-primary);
  background: var(--card-bg) !important;
}

.edit-input .v-field input,
.edit-input .v-field textarea {
  color: var(--text-primary) !important;
}

.edit-input .v-field input::placeholder,
.edit-input .v-field textarea::placeholder {
  color: var(--text-muted) !important;
}

.edit-input .v-field__outline {
  color: var(--divider) !important;
}

.edit-input .v-field--focused .v-field__outline {
  color: #0f3460 !important;
}

.edit-input .v-field__prepend-inner .v-icon,
.edit-input .v-field__append-inner .v-icon {
  color: var(--text-muted);
  opacity: 1;
}

.edit-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--divider);
}

.edit-cancel-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid var(--divider);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-cancel-btn:hover {
  background: var(--hover-bg);
}

.edit-save-btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.edit-save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(15, 52, 96, 0.3);
}

.edit-save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 600px) {
  .edit-row {
    flex-direction: column;
    gap: 14px;
  }

  .edit-avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
