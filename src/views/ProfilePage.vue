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
        <v-btn icon size="small" class="avatar-edit-btn" @click="openEditProfile">
          <v-icon size="18">mdi-camera</v-icon>
        </v-btn>
      </div>
      <div class="profile-header-info">
        <div class="profile-identity">
          <h1 class="profile-display-name">{{ profile?.firstName }} {{ profile?.lastName }}</h1>
          <span class="profile-handle">@{{ profile?.username }}</span>
          <div class="profile-counts">
            <span><strong>{{ headerPostCount }}</strong> posts</span>
            <span><strong>{{ headerFriendCount }}</strong> friends</span>
          </div>
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
                <span v-if="locationLine">Lives in {{ locationLine }}</span>
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
              <span v-if="friends.length" class="see-all" @click="showFriendsDialog = true">See all</span>
            </div>
            <div v-if="friends.length" class="friends-grid">
              <div
                v-for="friend in previewFriends"
                :key="friend.id"
                class="friend-preview"
                @click="goToFriend(friend.id)"
              >
                <v-avatar size="58" rounded="lg">
                  <img :src="friend.avatar" :alt="friend.name" />
                </v-avatar>
                <span class="friend-preview-name">{{ friend.name }}</span>
              </div>
            </div>
            <p v-else class="bio-text empty-field">No friends yet</p>
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
              <button type="button" class="create-post-input" @click="openCreatePostDialog()">
                What's buzzing, {{ profile?.firstName }}?
              </button>
            </div>
            <div class="create-post-bottom">
              <button type="button" class="create-action" @click="openCreatePostDialog(true)">
                <v-icon size="18" color="#f44336">mdi-image-outline</v-icon>
                <span>Photo</span>
              </button>
              <button type="button" class="create-action" @click="openCreatePostDialog()">
                <span class="feeling-emoji feeling-emoji-sm">😊</span>
                <span>Feeling</span>
              </button>
            </div>
          </div>

          <div v-if="feedLoading" class="feed-empty">Loading posts...</div>
          <div v-else-if="!posts.length" class="feed-empty">No posts yet.</div>

          <div v-for="post in posts" :key="post.id" class="post-card post-card-open mt-4" @click="goToPost(post.id)">
            <div class="post-top">
              <v-avatar size="44">
                <img :src="profileImageUrl" alt="Me" />
              </v-avatar>
              <div class="post-meta">
                <span class="post-author">
                  {{ profile?.firstName }} {{ profile?.lastName }}
                  <span v-if="post.feelingName" class="post-feeling"> is feeling {{ post.feelingEmoji }} {{ post.feelingName }}</span>
                </span>
                <span class="post-timestamp">
                  <v-icon size="12">mdi-clock-outline</v-icon>
                  {{ post.time }}
                  <span v-if="post.location"> · {{ post.location }}</span>
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="12"
                        class="post-visibility-icon"
                      >{{ post.visibilityIcon }}</v-icon>
                    </template>
                    <span>{{ post.visibilityLabel }}</span>
                  </v-tooltip>
                </span>
              </div>
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <button class="post-options-btn" v-bind="props" @click.stop>
                    <v-icon size="20">mdi-dots-horizontal</v-icon>
                  </button>
                </template>
                <v-list density="compact">
                  <v-list-item @click="openEditPostDialog(post)">
                    <template #prepend>
                      <v-icon size="18">mdi-pencil-outline</v-icon>
                    </template>
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openDeletePostDialog(post)">
                    <template #prepend>
                      <v-icon size="18" color="#f44336">mdi-delete-outline</v-icon>
                    </template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            <p class="post-title">{{ post.title }}</p>
            <p v-if="post.description" class="post-body">{{ post.description }}</p>
            <div v-if="post.image" class="post-image-wrapper">
              <img :src="post.image" class="post-image" />
            </div>
            <div class="reactions-bar">
              <div v-if="post.likes" class="reactions-left">
                <div v-if="post.usedReactionEmojis?.length" class="reaction-icons">
                  <span
                    v-for="emoji in post.usedReactionEmojis"
                    :key="emoji"
                    class="reaction-emoji"
                  >{{ emoji }}</span>
                </div>
                <span class="reaction-count">{{ post.likes }}</span>
              </div>
              <span class="reactions-right">{{ post.comments }} comments</span>
            </div>
            <div class="post-actions" @click.stop>
              <PostReactionButton :post="post" @reaction-changed="(next) => Object.assign(post, next)" />
                <button class="action-btn" @click="goToPost(post.id)">
                  <v-icon size="20">mdi-comment-processing-outline</v-icon>
                  <span>Comment</span>
                </button>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-dialog v-model="showEditPostDialog" max-width="520" :persistent="savingPost">
      <v-card class="create-dialog" :class="{ 'dark-mode': isDark }">
        <div class="create-dialog-header">
          <h2 class="create-dialog-title">{{ editingPostId ? "Edit post" : "Create post" }}</h2>
          <v-btn icon variant="text" size="small" :disabled="savingPost" @click="closeEditPostDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="create-dialog-body">
          <div class="create-dialog-user">
            <v-avatar size="40" class="create-avatar">
              <img :src="profileImageUrl" alt="Me" />
            </v-avatar>
            <div class="create-dialog-user-meta">
              <div class="create-dialog-name">
                {{ profile?.firstName }} {{ profile?.lastName }}
                <span v-if="selectedFeeling" class="create-feeling-text"> is feeling {{ selectedFeeling.name }}</span>
              </div>
              <v-select
                v-model="editPost.visibilityTypeId"
                :items="visibilityTypes"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                class="create-visibility"
              >
                <template #prepend-inner>
                  <v-icon size="16">mdi-earth</v-icon>
                </template>
              </v-select>
            </div>
          </div>
          <v-text-field
            v-model="editPost.title"
            placeholder="Title"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            maxlength="30"
            counter="30"
            rounded="lg"
            class="create-field"
          />
          <v-textarea
            v-model="editPost.description"
            placeholder="What's on your mind?"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            rows="3"
            auto-grow
            maxlength="50"
            counter="50"
            rounded="lg"
            class="create-field"
          />
          <v-text-field
            v-model="editPost.location"
            placeholder="Location (optional)"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            prepend-inner-icon="mdi-map-marker-outline"
            maxlength="50"
            rounded="lg"
            class="create-field"
          />
          <div v-if="postUploadedFileName" class="create-photo-preview">
            <img :src="postPhotoPreviewUrl" alt="Post photo" />
            <v-btn class="create-photo-remove" icon size="small" variant="flat" @click="clearPostPhoto">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <input
            ref="postPhotoInput"
            type="file"
            accept=".jpg,.jpeg,.png"
            hidden
            @change="onPostPhotoSelected"
          />
          <div class="create-dialog-actions">
            <span class="create-actions-label">Add to your post</span>
            <div class="create-actions-right">
              <button type="button" class="create-action" :disabled="postImageUploading" @click="pickPostPhoto">
                <v-icon size="22" color="#f44336">mdi-image-outline</v-icon>
              </button>
              <v-menu location="top" :close-on-content-click="true">
                <template #activator="{ props }">
                  <button type="button" class="create-action feeling-emoji-btn" v-bind="props" title="Feeling">
                    {{ selectedFeeling?.emoji || "😊" }}
                  </button>
                </template>
                <v-list class="feeling-menu" density="compact">
                  <v-list-item :active="editPost.feelingTypeId == null" @click="editPost.feelingTypeId = null">
                    <template #prepend>
                      <span class="feeling-emoji">🚫</span>
                    </template>
                    <v-list-item-title>None</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="feeling in feelingTypes"
                    :key="feeling.id"
                    :active="editPost.feelingTypeId === feeling.id"
                    @click="editPost.feelingTypeId = feeling.id"
                  >
                    <template #prepend>
                      <span class="feeling-emoji">{{ feeling.emoji }}</span>
                    </template>
                    <v-list-item-title>{{ feeling.name }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
          <v-btn
            block
            color="#ffc107"
            rounded="lg"
            class="create-submit"
            :loading="savingPost || postImageUploading"
            :disabled="!editPost.title"
            @click="savePost"
          >
            {{ editingPostId ? "Save" : "Post" }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeletePostDialog" max-width="400">
      <v-card class="create-dialog" :class="{ 'dark-mode': isDark }">
        <div class="create-dialog-header">
          <h2 class="create-dialog-title">Delete post</h2>
          <v-btn icon variant="text" size="small" :disabled="deletingPost" @click="showDeletePostDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="create-dialog-body">
          <p class="delete-confirm-text">Are you sure you want to delete this post?</p>
          <v-btn
            block
            color="#f44336"
            rounded="lg"
            class="create-submit"
            :loading="deletingPost"
            @click="deleteMyPost"
          >
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Edit Profile Dialog -->
    <v-dialog v-model="showEditDialog" max-width="560" :persistent="saving">
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
                <CountrySelect
                  v-model="editForm.countryId"
                  :hint-name="editCountryHint"
                  placeholder="Select country"
                  density="compact"
                  input-class="edit-input"
                />
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

    <v-dialog v-model="showFriendsDialog" max-width="460">
      <v-card class="friends-dialog" rounded="xl">
        <div class="friends-dialog-header">
          <span class="friends-dialog-title">Friends</span>
          <v-btn icon variant="text" size="small" @click="showFriendsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="friends-dialog-search">
          <v-text-field
            v-model="friendSearchQuery"
            density="compact"
            placeholder="Search friends..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            rounded
            class="friend-search-input"
            clearable
            @click:clear="friendSearchQuery = ''"
          ></v-text-field>
        </div>
        <div class="friends-dialog-body" v-if="filteredFriends.length">
          <div
            v-for="friend in filteredFriends"
            :key="friend.id"
            class="friend-row"
            @click="goToFriend(friend.id)"
          >
            <v-avatar size="50">
              <img :src="friend.avatar" :alt="friend.name" />
            </v-avatar>
            <div class="friend-row-info">
              <span class="friend-row-name">{{ friend.name }}</span>
              <span class="friend-row-handle">@{{ friend.username }}</span>
              <span class="friend-row-meta">{{ friend.postCount }} posts · {{ friend.friendCount }} friends</span>
              <span v-if="friend.friendsSince" class="friend-row-meta">Friends since {{ friend.friendsSince }}</span>
            </div>
          </div>
        </div>
        <div v-else class="friends-dialog-empty">No friends found</div>
      </v-card>
    </v-dialog>
    <SnackbarComponent
      v-model:show="showSnackbar"
      :color="snackbarColor"
      :text="snackbarText"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import AxiosApi from "@/plugins/axios";
import { rules } from "@/plugins/validationMessages.js";
import CountrySelect from "@/components/CountrySelect.vue";
import PostReactionButton from "@/components/PostReactionButton.vue";
import { loadReactionTypes, uniqueReactionEmojis } from "@/services/reactionTypes";
import { formatApiDate, formatRelativeTime } from "@/services/dates";
import { countryDisplayName, normalizeCountryId } from "@/services/countries";
import { showSnackbar, snackbarColor, snackbarText } from "../snackbar";

const theme = useTheme();
const store = useStore();
const router = useRouter();
const isDark = computed(() => theme.global.name.value === "dark");

const goToPost = (id) => {
  if (!id) return;
  router.push(`/posts/${id}`);
};

const profile = computed(() => store.getters.getProfile);

const countryLabel = computed(() => countryDisplayName(profile.value));

/** Lokacija: oba → "City, Country"; samo jedno → to polje; ništa → prazan string. */
const locationLine = computed(() => {
  const city = (profile.value?.city ?? "").toString().trim();
  const country = countryLabel.value.trim();
  if (!city && !country) return "";
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  return country;
});

const feelingTypes = [
  { id: 1, name: "Happy", emoji: "😊" },
  { id: 2, name: "Sad", emoji: "😢" },
  { id: 3, name: "Excited", emoji: "🤩" },
  { id: 4, name: "Angry", emoji: "😠" },
  { id: 5, name: "Thoughtful", emoji: "🤔" },
  { id: 6, name: "Loved", emoji: "😍" },
];


const visibilityMeta = (name, id) => {
  const n = name || (id === 2 ? "Friends" : id === 3 ? "Only me" : "Public");
  if (n === "Friends") return { icon: "mdi-account-multiple-outline", label: "Friends" };
  if (n === "Only me") return { icon: "mdi-lock-outline", label: "Only me" };
  return { icon: "mdi-earth", label: "Public" };
};

const mapPost = (item) => {
  const feeling = feelingTypes.find((f) => f.id === item.feelingTypeId);
  const visibility = visibilityMeta(item.visibilityName, item.visibilityTypeId);
  return {
    id: item.id,
    visibilityTypeId: item.visibilityTypeId,
    visibilityIcon: visibility.icon,
    visibilityLabel: visibility.label,
    feelingTypeId: item.feelingTypeId,
    imageFileName: item.images?.[0] || "",
    title: item.title,
    description: item.description,
    location: item.location,
    feelingName: item.feelingName,
    feelingEmoji: feeling?.emoji || (item.feelingIcon?.startsWith?.("mdi-") ? "" : item.feelingIcon) || "",
    image: item.images?.[0] ? `http://localhost:5001/temp/${item.images[0]}` : "",
    time: formatRelativeTime(item.createdAt),
    likes: item.reactionCount ?? 0,
    myReactionTypeId: item.myReactionTypeId ?? null,
    myReactionName: item.myReactionName || "",
    myReactionIcon: item.myReactionIcon || "",
    usedReactionTypeIds: item.usedReactionTypeIds || [],
    usedReactionEmojis: uniqueReactionEmojis(item.usedReactionTypeIds),
    comments: item.commentCount ?? 0,
  };
};

const feedLoading = ref(false);
const posts = ref([]);

const loadMyPosts = async () => {
  feedLoading.value = true;
  try {
    const [, res] = await Promise.all([
      loadReactionTypes(),
      AxiosApi.get("/posts/my", { params: { perPage: 20, page: 1 } }),
    ]);
    posts.value = (res.data.data || res.data.Data || []).map(mapPost);
  } catch (e) {
    posts.value = [];
  } finally {
    feedLoading.value = false;
  }
};

const showFriendsDialog = ref(false);
const friendSearchQuery = ref("");
const friends = ref([]);
const headerPostCount = computed(() => profile.value?.postCount ?? posts.value.length);
const headerFriendCount = computed(() => profile.value?.friendCount ?? friends.value.length);
const previewFriends = computed(() => friends.value.slice(0, 6));
const filteredFriends = computed(() => {
  const q = friendSearchQuery.value.toLowerCase().trim();
  if (!q) return friends.value;
  return friends.value.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      (f.username || "").toLowerCase().includes(q)
  );
});

watch(showFriendsDialog, (open) => {
  if (!open) friendSearchQuery.value = "";
});

const formatFriendsSince = (dateStr) => formatApiDate(dateStr);

const mapFriend = (item) => ({
  id: item.id,
  name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.username,
  username: item.username,
  avatar: `http://localhost:5001/temp/${item.image || "default.png"}`,
  postCount: item.postCount ?? 0,
  friendCount: item.friendCount ?? 0,
  friendsSince: item.friendsSince ? formatFriendsSince(item.friendsSince) : "",
});

const loadFriends = async () => {
  try {
    const res = await AxiosApi.get("/friendships");
    const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.Data || [];
    friends.value = list.map(mapFriend);
  } catch (e) {
    friends.value = [];
  }
};

const goToFriend = (id) => {
  showFriendsDialog.value = false;
  if (!id || id === store.getters.getUser?.id) {
    router.push("/profile");
    return;
  }
  router.push(`/users/${id}`);
};

onMounted(async () => {
  const userId = store.getters.getUser?.id;
  if (userId) {
    try {
      const res = await AxiosApi.get(`/users/${userId}`);
      store.commit("setProfile", res.data);
    } catch (e) {
      // Profile fetch failed
    }
  }
  const refreshProfileCounts = async () => {
    const userId = store.getters.getUser?.id;
    if (!userId) return;
    try {
      const res = await AxiosApi.get(`/users/${userId}`);
      store.commit("setProfile", res.data);
    } catch (e) {
      // interceptor
    }
  };
  await Promise.all([loadMyPosts(), loadFriends(), refreshProfileCounts()]);
  window.addEventListener("buzzup-friends-changed", loadFriends);
});
onUnmounted(() => {
  window.removeEventListener("buzzup-friends-changed", loadFriends);
});

const visibilityTypes = [
  { id: 1, name: "Public" },
  { id: 2, name: "Friends" },
  { id: 3, name: "Only me" },
];

const emptyEditPost = () => ({
  title: "",
  description: "",
  location: "",
  visibilityTypeId: 1,
  feelingTypeId: null,
});

const showEditPostDialog = ref(false);
const showDeletePostDialog = ref(false);
const savingPost = ref(false);
const deletingPost = ref(false);
const editingPostId = ref(null);
const postToDelete = ref(null);
const postImageUploading = ref(false);
const postUploadedFileName = ref("");
const postPhotoInput = ref(null);
const editPost = ref(emptyEditPost());
const selectedFeeling = computed(
  () => feelingTypes.find((f) => f.id === editPost.value.feelingTypeId) || null,
);
const postPhotoPreviewUrl = computed(() =>
  postUploadedFileName.value ? `http://localhost:5001/temp/${postUploadedFileName.value}` : "",
);

const openCreatePostDialog = (pickPhotoAfter = false) => {
  editingPostId.value = null;
  editPost.value = emptyEditPost();
  postUploadedFileName.value = "";
  showEditPostDialog.value = true;
  if (pickPhotoAfter === true) {
    setTimeout(() => pickPostPhoto(), 250);
  }
};

const openEditPostDialog = (post) => {
  editingPostId.value = post.id;
  editPost.value = {
    title: post.title || "",
    description: post.description || "",
    location: post.location || "",
    visibilityTypeId: post.visibilityTypeId || 1,
    feelingTypeId: post.feelingTypeId ?? null,
  };
  postUploadedFileName.value = post.imageFileName || "";
  showEditPostDialog.value = true;
};

const closeEditPostDialog = () => {
  if (savingPost.value) return;
  showEditPostDialog.value = false;
};

const openDeletePostDialog = (post) => {
  postToDelete.value = post;
  showDeletePostDialog.value = true;
};

const pickPostPhoto = () => {
  postPhotoInput.value?.click();
};

const clearPostPhoto = () => {
  postUploadedFileName.value = "";
  if (postPhotoInput.value) postPhotoInput.value.value = "";
};

const onPostPhotoSelected = async (event) => {
  const file = event.target?.files?.[0];
  if (!file) return;

  postImageUploading.value = true;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await AxiosApi.post("/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    postUploadedFileName.value = response.data.file;
  } catch (error) {
    postUploadedFileName.value = "";
    snackbarText.value =
      error.response?.status === 415
        ? "Unsupported file type. Use JPG, PNG, or JPEG."
        : "Failed to upload image.";
    snackbarColor.value = "red";
    showSnackbar.value = true;
  } finally {
    postImageUploading.value = false;
    if (postPhotoInput.value) postPhotoInput.value.value = "";
  }
};

const savePost = async () => {
  if (!editPost.value.title?.trim()) return;

  savingPost.value = true;
  try {
    const payload = {
      title: editPost.value.title.trim(),
      description: editPost.value.description?.trim() || null,
      location: editPost.value.location?.trim() || null,
      visibilityTypeId: editPost.value.visibilityTypeId,
      feelingTypeId: editPost.value.feelingTypeId,
    };

    if (editingPostId.value) {
      await AxiosApi.put(`/posts/${editingPostId.value}`, {
        ...payload,
        image: postUploadedFileName.value || "",
      });
      snackbarText.value = "Post updated.";
    } else {
      await AxiosApi.post("/posts", {
        ...payload,
        image: postUploadedFileName.value || null,
      });
      snackbarText.value = "Post created.";
    }

    editPost.value = emptyEditPost();
    postUploadedFileName.value = "";
    editingPostId.value = null;
    showEditPostDialog.value = false;
    snackbarColor.value = "green";
    showSnackbar.value = true;
    await loadMyPosts();
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    savingPost.value = false;
  }
};

const deleteMyPost = async () => {
  if (!postToDelete.value) return;

  deletingPost.value = true;
  try {
    await AxiosApi.delete(`/posts/${postToDelete.value.id}`);
    showDeletePostDialog.value = false;
    postToDelete.value = null;
    snackbarText.value = "Post deleted.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
    await loadMyPosts();
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    deletingPost.value = false;
  }
};

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

// ===== EDIT PROFILE =====
const showEditDialog = ref(false);
const editFormRef = ref(null);
const saving = ref(false);
const editIsPrivate = ref(false);
const imageUploading = ref(false);
const imageError = ref("");
const editImageFile = ref(null);
const editUploadedFileName = ref("");

const editCountryHint = ref("");

const editForm = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  bio: "",
  countryId: null,
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
    editCountryHint.value = countryDisplayName(data);
    editForm.value = {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      username: data.username || "",
      email: data.email || "",
      bio: data.bio || "",
      countryId: normalizeCountryId(data.countryId ?? data.CountryId ?? data.country?.id),
      city: data.city || "",
      workplace: data.workplace || "",
      university: data.university || "",
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
      website: data.website || "",
      image: data.image || "",
    };
    editIsPrivate.value = !!data.isPrivate;
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
    password: null,
    bio: editForm.value.bio || null,
    countryId: normalizeCountryId(editForm.value.countryId),
    city: editForm.value.city || null,
    workplace: editForm.value.workplace || null,
    university: editForm.value.university || null,
    dateOfBirth: editForm.value.dateOfBirth || null,
    website: editForm.value.website || null,
    image: editUploadedFileName.value || editForm.value.image || null,
    isPrivate: editIsPrivate.value,
  };

  try {
    await AxiosApi.put(`/users/${userId}`, payload);

    // Refresh profile in store
    const res = await AxiosApi.get(`/users/${userId}`);
    store.commit("setProfile", res.data);

    showEditDialog.value = false;
    snackbarText.value = "Profile updated.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Error handled by axios interceptor
  } finally {
    saving.value = false;
  }
};

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

.profile-counts {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.profile-counts strong {
  color: var(--text-primary);
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
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  transition: color 0.2s;
}

.friends-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.friends-dialog-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.friends-dialog-search {
  padding: 12px 16px 0;
}

.friend-search-input :deep(.v-field) {
  font-size: 0.85rem;
}

.friends-dialog-body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}

.friends-dialog-empty {
  padding: 24px 16px 28px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.friend-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 14px;
  cursor: pointer;
}

.friend-row:hover {
  background: var(--hover-bg);
}

.friend-row-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.friend-row-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
}

.friend-row-handle {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.friend-row-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
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
  text-align: left;
  background: var(--hover-bg);
  border-radius: 24px;
  padding: 12px 20px;
  color: var(--text-muted);
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.feeling-emoji-sm {
  font-size: 1.1rem;
  line-height: 1;
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

.post-card-open {
  cursor: pointer;
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

.post-title {
  padding: 14px 20px 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.post-feeling {
  font-weight: 500;
  color: var(--text-secondary);
}

.feed-empty {
  margin-top: 16px;
  padding: 24px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
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
  font-size: 1.15rem;
  line-height: 1;
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

<style>
.create-dialog {
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

.create-dialog.dark-mode {
  --card-bg: #1e1e2e;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --hover-bg: #2a2a3e;
  --divider: #334155;
}

.create-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--divider);
}

.create-dialog-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.create-dialog-header .v-btn {
  color: var(--text-muted) !important;
}

.create-dialog-body {
  padding: 18px 20px 20px;
}

.delete-confirm-text {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.create-dialog-user {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.create-dialog-user-meta {
  flex: 1;
  min-width: 0;
}

.create-dialog-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.create-feeling-text {
  font-weight: 500;
  color: var(--text-secondary);
}

.create-visibility {
  max-width: 160px;
}

.create-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid var(--divider);
  border-radius: 12px;
  padding: 6px 10px;
  margin-bottom: 14px;
}

.create-actions-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.create-actions-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.create-dialog-actions .create-action {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.create-dialog-actions .create-action:hover:not(:disabled) {
  background: var(--hover-bg);
}

.create-dialog-actions .create-action:disabled {
  opacity: 0.45;
  cursor: default;
}

.feeling-emoji-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  border-radius: 50%;
  font-size: 1.85rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.feeling-emoji {
  font-size: 1.35rem;
  line-height: 1;
}

.feeling-menu {
  border-radius: 12px !important;
  min-width: 200px;
}

.create-dialog .create-field {
  margin-bottom: 10px;
}

.create-photo-preview {
  position: relative;
  margin: 4px 0 14px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--divider);
}

.create-photo-preview img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  display: block;
}

.create-photo-remove {
  position: absolute !important;
  top: 8px;
  right: 8px;
}

.create-dialog .create-avatar {
  border: 2px solid var(--divider);
}

.create-dialog .create-submit {
  font-weight: 700;
}
</style>
