<template>
  <div class="user-profile-page" :class="{ 'dark-mode': isDark }">
    <div class="page-title-row">
      <v-icon size="22" class="page-title-icon">mdi-account-circle-outline</v-icon>
      <span class="page-title-text">Profile</span>
    </div>

    <div v-if="loading" class="feed-empty">Loading profile...</div>
    <div v-else-if="!profile" class="feed-empty">User not found.</div>

    <template v-else>
      <div class="profile-header">
        <v-avatar size="120" class="profile-avatar">
          <img :src="profileImageUrl" :alt="displayName" />
        </v-avatar>
        <div class="profile-header-info">
          <div class="profile-identity">
            <h1 class="profile-display-name">{{ displayName }}</h1>
            <span class="profile-handle">@{{ profile.username }}</span>
          </div>
          <div class="profile-counts">
            <span><strong>{{ profile.postCount ?? 0 }}</strong> posts</span>
            <span><strong>{{ profile.friendCount ?? 0 }}</strong> friends</span>
          </div>
          <div v-if="!isOwn" class="profile-actions">
            <v-btn
              class="add-friend-btn"
              rounded
              :disabled="primaryDisabled"
              @click="onPrimaryAction"
            >
              <v-icon size="18" class="mr-1">{{ primaryIcon }}</v-icon>
              {{ primaryLabel }}
            </v-btn>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <v-row>
          <v-col cols="12" md="5">
            <div class="info-card">
              <div class="info-card-title">
                <v-icon size="20">mdi-information-outline</v-icon>
                <span>About</span>
              </div>
              <p v-if="profile.bio" class="bio-text">{{ profile.bio }}</p>
              <div v-if="hasAboutDetails" class="about-items">
                <div v-if="locationLine" class="about-item">
                  <v-icon size="18" class="about-icon">mdi-map-marker-outline</v-icon>
                  <span>Lives in {{ locationLine }}</span>
                </div>
                <div v-if="workplaceLine" class="about-item">
                  <v-icon size="18" class="about-icon">mdi-briefcase-outline</v-icon>
                  <span>Works at {{ workplaceLine }}</span>
                </div>
                <div v-if="universityLine" class="about-item">
                  <v-icon size="18" class="about-icon">mdi-school-outline</v-icon>
                  <span>Studies at {{ universityLine }}</span>
                </div>
              </div>
              <p v-if="!profile.bio && !hasAboutDetails" class="bio-text empty-field">No info yet</p>
            </div>
          </v-col>

          <v-col cols="12" md="7">
            <div v-if="feedLoading" class="feed-empty">Loading posts...</div>
            <div v-else-if="!posts.length" class="feed-empty">No posts yet.</div>
            <div v-for="post in posts" :key="post.id" class="post-card">
              <div class="post-top">
                <v-avatar size="44">
                  <img :src="profileImageUrl" :alt="displayName" />
                </v-avatar>
                <div class="post-meta">
                  <span class="post-author">
                    {{ displayName }}
                    <span v-if="post.feelingName" class="post-feeling"> is feeling {{ post.feelingEmoji }} {{ post.feelingName }}</span>
                  </span>
                  <span class="post-timestamp">
                    <v-icon size="12">mdi-clock-outline</v-icon>
                    {{ post.time }}
                    <span v-if="post.location"> · {{ post.location }}</span>
                  </span>
                </div>
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <button class="post-options-btn" v-bind="props">
                      <v-icon size="20">mdi-dots-horizontal</v-icon>
                    </button>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="savePostSoon">
                      <template #prepend>
                        <v-icon size="18">mdi-bookmark-outline</v-icon>
                      </template>
                      <v-list-item-title>Save</v-list-item-title>
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
                <button class="action-btn" @click="sharePost(post)">
                  <v-icon size="20">mdi-share-variant-outline</v-icon>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </template>

    <SnackbarComponent
      v-model:show="showSnackbar"
      :color="snackbarColor"
      :text="snackbarText"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import AxiosApi from "@/plugins/axios";
import { countryDisplayName } from "@/services/countries";
import { showSnackbar, snackbarColor, snackbarText } from "../snackbar";

const theme = useTheme();
const store = useStore();
const route = useRoute();
const router = useRouter();
const isDark = computed(() => theme.global.name.value === "dark");

const currentUserId = computed(() => store.getters.getProfile?.id || store.getters.getUser?.id);
const profileId = computed(() => Number(route.params.id));
const isOwn = computed(() => profileId.value && profileId.value === currentUserId.value);

const loading = ref(false);
const feedLoading = ref(false);
const sending = ref(false);
const sentLocal = ref(false);
const profile = ref(null);
const posts = ref([]);
const friendshipStatus = computed(() => profile.value?.friendshipStatus || "None");
const requestSent = computed(
  () => sentLocal.value || friendshipStatus.value === "PendingOutgoing"
);
const isFriends = computed(() => friendshipStatus.value === "Accepted");
const canAccept = computed(() => friendshipStatus.value === "PendingIncoming" && !sentLocal.value);
const primaryDisabled = computed(() => sending.value || requestSent.value || isFriends.value);
const primaryLabel = computed(() => {
  if (isFriends.value) return "Friends";
  if (canAccept.value) return "Accept request";
  if (requestSent.value) return "Request sent";
  return "Add Friend";
});
const primaryIcon = computed(() => {
  if (isFriends.value || requestSent.value) return "mdi-check";
  if (canAccept.value) return "mdi-account-check-outline";
  return "mdi-account-plus-outline";
});
const hasAboutDetails = computed(
  () => !!(locationLine.value || workplaceLine.value || universityLine.value)
);

const displayName = computed(() =>
  `${profile.value?.firstName || ""} ${profile.value?.lastName || ""}`.trim() || profile.value?.username || ""
);
const profileImageUrl = computed(
  () => `http://localhost:5001/temp/${profile.value?.image || "default.png"}`
);
const locationLine = computed(() => {
  const city = (profile.value?.city ?? "").toString().trim();
  const country = countryDisplayName(profile.value).trim();
  if (city && country) return `${city}, ${country}`;
  return city || country;
});
const workplaceLine = computed(() => (profile.value?.workplace ?? "").toString().trim());
const universityLine = computed(() => (profile.value?.university ?? "").toString().trim());

const feelingTypes = [
  { id: 1, name: "Happy", emoji: "😊" },
  { id: 2, name: "Sad", emoji: "😢" },
  { id: 3, name: "Excited", emoji: "🤩" },
  { id: 4, name: "Angry", emoji: "😠" },
  { id: 5, name: "Thoughtful", emoji: "🤔" },
  { id: 6, name: "Loved", emoji: "😍" },
];

const parseApiDate = (value) => {
  const raw = String(value);
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(raw)) return new Date(raw);
  return new Date(`${raw}Z`);
};

const formatTime = (value) => {
  if (!value) return "";
  const date = parseApiDate(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString();
};

const mapPost = (item) => {
  const feeling = feelingTypes.find((f) => f.id === item.feelingTypeId);
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    location: item.location,
    feelingName: item.feelingName,
    feelingEmoji: feeling?.emoji || "",
    image: item.images?.[0] ? `http://localhost:5001/temp/${item.images[0]}` : "",
    time: formatTime(item.createdAt),
    likes: 0,
    comments: 0,
  };
};

const sharePost = async (post) => {
  const url = `${window.location.origin}/posts/${post.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: post.title || "BuzzUp post", url });
      return;
    }
    await navigator.clipboard.writeText(url);
    snackbarText.value = "Link copied.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    if (e?.name === "AbortError") return;
    snackbarText.value = "Could not copy link.";
    snackbarColor.value = "red";
    showSnackbar.value = true;
  }
};

const savePostSoon = () => {
  snackbarText.value = "Saving posts comes next.";
  snackbarColor.value = "green";
  showSnackbar.value = true;
};

const loadProfile = async () => {
  if (isOwn.value) {
    router.replace("/profile");
    return;
  }

  loading.value = true;
  sentLocal.value = false;
  profile.value = null;
  posts.value = [];

  try {
    const res = await AxiosApi.get(`/users/${profileId.value}`);
    profile.value = res.data;
  } catch (e) {
    profile.value = null;
    return;
  } finally {
    loading.value = false;
  }

  feedLoading.value = true;
  try {
    const res = await AxiosApi.get("/posts", {
      params: { userId: profileId.value, perPage: 20, page: 1 },
    });
    posts.value = (res.data.data || res.data.Data || []).map(mapPost);
  } catch (e) {
    posts.value = [];
  } finally {
    feedLoading.value = false;
  }
};

const onPrimaryAction = () => {
  if (canAccept.value) {
    acceptFriendRequest();
    return;
  }
  sendFriendRequest();
};

const sendFriendRequest = async () => {
  if (!profile.value?.id || sending.value || requestSent.value || isFriends.value) return;
  sending.value = true;
  try {
    await AxiosApi.post("/friendships", { userId: profile.value.id });
    sentLocal.value = true;
    profile.value = { ...profile.value, friendshipStatus: "PendingOutgoing" };
    snackbarText.value = "Friend request sent.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    sending.value = false;
  }
};

const acceptFriendRequest = async () => {
  if (!profile.value?.id || sending.value) return;
  sending.value = true;
  try {
    await AxiosApi.post("/friendships/accept", { userId: profile.value.id });
    profile.value = {
      ...profile.value,
      friendshipStatus: "Accepted",
      friendCount: (profile.value.friendCount ?? 0) + 1,
    };
    snackbarText.value = "You are now friends.";
    window.dispatchEvent(new CustomEvent("buzzup-friends-changed"));
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    sending.value = false;
  }
};

onMounted(loadProfile);
watch(profileId, loadProfile);
</script>

<style scoped>
.user-profile-page {
  --card-bg: #fff;
  --card-border: rgba(0, 0, 0, 0.06);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --text-heading: #1a1a2e;
  --hover-bg: #f1f5f9;
  --divider: #e2e8f0;
  --about-icon-color: #94a3b8;
  max-width: 100%;
}

.user-profile-page.dark-mode {
  --card-bg: #1e1e2e;
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-heading: #e2e8f0;
  --hover-bg: #2a2a3e;
  --divider: #334155;
  --about-icon-color: #64748b;
}

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

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  flex-wrap: wrap;
}

.profile-avatar {
  border: 4px solid var(--card-bg);
  box-shadow: 0 0 0 1px var(--divider);
}

.profile-avatar img {
  object-fit: cover;
}

.profile-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-display-name {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text-heading);
}

.profile-handle {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.profile-counts {
  display: flex;
  gap: 16px;
  margin: 10px 0 14px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.profile-counts strong {
  color: var(--text-primary);
}

.add-friend-btn {
  background: #1a1a2e !important;
  color: #fff !important;
  font-weight: 700;
  text-transform: none;
}

.profile-content {
  padding: 0 24px 40px;
}

.info-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 18px 20px;
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.bio-text {
  margin: 0 0 14px;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.empty-field {
  color: var(--text-muted);
}

.about-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.about-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.about-icon {
  color: var(--about-icon-color);
}

.feed-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 28px 12px;
  font-size: 0.92rem;
}

.post-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
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

.post-author {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.post-feeling {
  font-weight: 500;
  color: var(--text-secondary);
}

.post-timestamp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.post-title {
  padding: 14px 20px 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.post-body {
  padding: 8px 20px 0;
  margin: 0;
  color: var(--text-secondary);
}

.post-image-wrapper {
  margin-top: 14px;
}

.post-image {
  width: 100%;
  display: block;
  max-height: 420px;
  object-fit: cover;
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
  background: var(--hover-bg);
  color: var(--text-primary);
}
</style>
