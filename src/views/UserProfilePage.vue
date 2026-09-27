<template>
  <div class="user-profile-page" :class="{ 'dark-mode': isDark }">
    <div class="page-title-row">
      <v-icon size="22" class="page-title-icon">mdi-account-circle-outline</v-icon>
      <span class="page-title-text">Profile</span>
    </div>

    <div v-if="loading || !profile" class="feed-empty">Loading profile...</div>

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
              :class="{ 'is-friends': isFriends }"
              rounded
              :disabled="primaryDisabled"
              @click="onPrimaryAction"
            >
              <span class="friend-btn-swap">
                <span class="friend-btn-main">
                  <v-icon size="18" class="mr-1">{{ primaryIcon }}</v-icon>
                  {{ primaryLabel }}
                </span>
                <span v-if="isFriends" class="friend-btn-unfriend">
                  <v-icon size="18" class="mr-1">mdi-account-remove-outline</v-icon>
                  Unfriend
                </span>
              </span>
            </v-btn>
            <v-btn
              v-if="canAccept"
              class="decline-friend-btn"
              variant="tonal"
              rounded
              :disabled="sending"
              @click="declineFriendRequest"
            >
              Decline
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
              <div v-if="isProfileLocked" class="private-lock">
                <v-icon size="40" class="private-lock-icon">mdi-lock-outline</v-icon>
                <span class="private-lock-title">This profile is private</span>
                <span class="private-lock-text">Add this person as a friend to see more.</span>
              </div>
              <template v-else>
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
              </template>
            </div>

            <div v-if="!isProfileLocked" class="info-card mt-4">
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

          <v-col cols="12" md="7">
            <div v-if="feedLoading" class="feed-empty">Loading posts...</div>
            <div v-else-if="!posts.length" class="feed-empty">
              {{ isProfileLocked ? "No public posts." : "No posts yet." }}
            </div>
            <div v-for="post in posts" :key="post.id" class="post-card post-card-open" @click="goToPost(post.id)">
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
                <button class="action-btn" @click="savePostSoon">
                  <v-icon size="20">mdi-bookmark-outline</v-icon>
                  <span>Save</span>
                </button>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </template>

    <v-dialog v-model="showUnfriendDialog" max-width="400">
      <v-card class="friends-dialog" rounded="xl">
        <div class="friends-dialog-header">
          <span class="friends-dialog-title">Unfriend</span>
          <v-btn icon variant="text" size="small" :disabled="unfriending" @click="showUnfriendDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="unfriend-dialog-body">
          <p class="unfriend-confirm-text">Are you sure you want to unfriend {{ displayName }}?</p>
          <v-btn
            block
            color="#f44336"
            rounded="lg"
            :loading="unfriending"
            @click="confirmUnfriend"
          >
            Unfriend
          </v-btn>
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
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import AxiosApi from "@/plugins/axios";
import PostReactionButton from "@/components/PostReactionButton.vue";
import { uniqueReactionEmojis } from "@/services/reactionTypes";
import { formatTime } from "@/services/dates";
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
const unfriending = ref(false);
const sentLocal = ref(false);
const showUnfriendDialog = ref(false);
const profile = ref(null);
const posts = ref([]);
const friendshipStatus = computed(() => profile.value?.friendshipStatus || "None");
const requestSent = computed(
  () => sentLocal.value || friendshipStatus.value === "PendingOutgoing"
);
const isFriends = computed(() => friendshipStatus.value === "Accepted");
const isProfileLocked = computed(
  () => !isOwn.value && !!profile.value?.isPrivate && !isFriends.value
);
const canAccept = computed(() => friendshipStatus.value === "PendingIncoming" && !sentLocal.value);
const primaryDisabled = computed(() => sending.value || requestSent.value);
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


const showFriendsDialog = ref(false);
const friendSearchQuery = ref("");
const friends = ref([]);
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

const mapFriend = (item) => ({
  id: item.id,
  name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.username,
  username: item.username,
  avatar: `http://localhost:5001/temp/${item.image || "default.png"}`,
  postCount: item.postCount ?? 0,
  friendCount: item.friendCount ?? 0,
});

const loadFriends = async (userId) => {
  if (!userId) {
    friends.value = [];
    return;
  }
  try {
    const res = await AxiosApi.get("/friendships", { params: { userId } });
    const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.Data || [];
    friends.value = list.map(mapFriend);
  } catch (e) {
    friends.value = [];
  }
};

const goToFriend = (id) => {
  showFriendsDialog.value = false;
  if (!id || id === currentUserId.value) {
    router.push("/profile");
    return;
  }
  router.push(`/users/${id}`);
};

const goToPost = (id) => {
  if (!id) return;
  router.push(`/posts/${id}`);
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
    likes: item.reactionCount ?? 0,
    myReactionTypeId: item.myReactionTypeId ?? null,
    myReactionName: item.myReactionName || "",
    myReactionIcon: item.myReactionIcon || "",
    usedReactionTypeIds: item.usedReactionTypeIds || [],
    usedReactionEmojis: uniqueReactionEmojis(item.usedReactionTypeIds),
    comments: item.commentCount ?? 0,
  };
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

  if (!profileId.value) {
    router.replace("/");
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
    router.replace("/");
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

  if (isProfileLocked.value) {
    friends.value = [];
    return;
  }

  await loadFriends(profileId.value);
};

const refreshProfileAfterUnfriend = async (userId) => {
  sentLocal.value = false;
  showFriendsDialog.value = false;
  try {
    const res = await AxiosApi.get(`/users/${userId}`);
    profile.value = res.data;
  } catch (e) {
    if (profile.value) {
      profile.value = { ...profile.value, friendshipStatus: "None" };
    }
  }

  feedLoading.value = true;
  try {
    const res = await AxiosApi.get("/posts", {
      params: { userId, perPage: 20, page: 1 },
    });
    posts.value = (res.data.data || res.data.Data || []).map(mapPost);
  } catch (e) {
    posts.value = [];
  } finally {
    feedLoading.value = false;
  }

  if (isProfileLocked.value) {
    friends.value = [];
    return;
  }

  await loadFriends(userId);
};

const onPrimaryAction = () => {
  if (isFriends.value) {
    showUnfriendDialog.value = true;
    return;
  }
  if (canAccept.value) {
    acceptFriendRequest();
    return;
  }
  sendFriendRequest();
};

const confirmUnfriend = async () => {
  if (!profile.value?.id || unfriending.value) return;
  unfriending.value = true;
  try {
    const userId = profile.value.id;
    await AxiosApi.post("/friendships/unfriend", { userId });
    showUnfriendDialog.value = false;
    await refreshProfileAfterUnfriend(userId);
    window.dispatchEvent(
      new CustomEvent("buzzup-friends-changed", {
        detail: { userId, status: "None" },
      })
    );
    snackbarText.value = "You are no longer friends.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    unfriending.value = false;
  }
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
    await loadFriends(profile.value.id);
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

const declineFriendRequest = async () => {
  if (!profile.value?.id || sending.value) return;
  sending.value = true;
  try {
    const userId = profile.value.id;
    await AxiosApi.post("/friendships/reject", { userId });
    sentLocal.value = false;
    profile.value = { ...profile.value, friendshipStatus: "None" };
    if (profile.value.isPrivate) {
      friends.value = [];
    }
    window.dispatchEvent(
      new CustomEvent("buzzup-friends-changed", {
        detail: { userId, status: "None" },
      })
    );
    snackbarText.value = "Friend request declined.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    sending.value = false;
  }
};

const onFriendsChanged = (event) => {
  const detail = event?.detail;
  if (!detail?.userId || !profile.value || detail.userId !== profile.value.id) return;
  if (detail.status === "Accepted") {
    sentLocal.value = false;
    profile.value = {
      ...profile.value,
      friendshipStatus: "Accepted",
      friendCount: (profile.value.friendCount ?? 0) + 1,
    };
    loadFriends(profile.value.id);
  }
  if (detail.status === "None") {
    if (friendshipStatus.value === "None") {
      friends.value = [];
      showFriendsDialog.value = false;
      return;
    }
    refreshProfileAfterUnfriend(profile.value.id);
  }
};

onMounted(() => {
  loadProfile();
  window.addEventListener("buzzup-friends-changed", onFriendsChanged);
});
onUnmounted(() => {
  window.removeEventListener("buzzup-friends-changed", onFriendsChanged);
});
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
  margin: 10px 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

.profile-counts strong {
  color: var(--text-primary);
}

.add-friend-btn {
  background: linear-gradient(135deg, #1a1a2e, #0f3460) !important;
  color: #fff !important;
  font-weight: 700;
  text-transform: none;
  transition: background-color 0.25s ease !important;
}

.add-friend-btn.is-friends:hover {
  background: #f44336 !important;
}

.decline-friend-btn {
  text-transform: none !important;
  font-weight: 700;
  letter-spacing: 0;
  opacity: 0.7;
}

.friend-btn-swap {
  display: grid;
  align-items: center;
  justify-items: center;
}

.friend-btn-main,
.friend-btn-unfriend {
  grid-area: 1 / 1;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  transition: opacity 0.22s ease;
}

.friend-btn-unfriend {
  opacity: 0;
  pointer-events: none;
}

.add-friend-btn.is-friends:hover .friend-btn-main {
  opacity: 0;
}

.add-friend-btn.is-friends:hover .friend-btn-unfriend {
  opacity: 1;
}

.unfriend-dialog-body {
  padding: 18px 20px 20px;
}

.unfriend-confirm-text {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 0.92rem;
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

.see-all {
  margin-left: auto;
  font-size: 0.82rem;
  color: #0f3460;
  font-weight: 500;
  cursor: pointer;
}

.see-all:hover {
  text-decoration: underline;
}

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

.friend-preview-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
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

.bio-text {
  margin: 0 0 14px;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.private-lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px 8px;
  text-align: center;
}

.private-lock-icon {
  color: var(--text-muted);
}

.private-lock-title {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.private-lock-text {
  font-size: 0.82rem;
  color: var(--text-secondary);
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

.post-card-open {
  cursor: pointer;
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
  background: var(--hover-bg);
  color: var(--text-primary);
}
</style>
