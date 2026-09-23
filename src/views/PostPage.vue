<template>
  <div class="post-page" :class="{ 'dark-mode': isDark }">
    <div class="page-title-row">
      <v-icon size="22" class="page-title-icon">mdi-post-outline</v-icon>
      <span class="page-title-text">Post</span>
    </div>

    <div v-if="loading || !post" class="feed-empty">Loading post...</div>

    <div v-else class="post-wrap">
      <div class="post-card">
        <div class="post-top">
          <v-avatar size="44" class="post-author-hit" @click="goToAuthor">
            <img :src="post.authorAvatar" :alt="post.authorName" />
          </v-avatar>
          <div class="post-meta">
            <span class="post-author">
              <button type="button" class="post-author-name post-author-hit" @click="goToAuthor">
                {{ post.authorName }}
              </button>
              <span v-if="post.feelingName" class="post-feeling"> is feeling {{ post.feelingEmoji }} {{ post.feelingName }}</span>
            </span>
            <span class="post-timestamp">
              <v-icon size="12">mdi-clock-outline</v-icon>
              {{ post.time }}
              <span v-if="post.location"> · {{ post.location }}</span>
              <v-tooltip v-if="isOwn" location="top">
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
          <button class="action-btn" @click="sharePost">
            <v-icon size="20">mdi-share-variant-outline</v-icon>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>

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
import { showSnackbar, snackbarColor, snackbarText } from "../snackbar";

const theme = useTheme();
const store = useStore();
const route = useRoute();
const router = useRouter();
const isDark = computed(() => theme.global.name.value === "dark");
const currentUserId = computed(() => store.getters.getProfile?.id || store.getters.getUser?.id);

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

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const minutes = Math.floor((now - date) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString();
};

const postId = computed(() => Number(route.params.id));
const loading = ref(false);
const post = ref(null);
const isOwn = computed(() => post.value?.userId && post.value.userId === currentUserId.value);

const mapPost = (item) => {
  const feeling = feelingTypes.find((f) => f.id === item.feelingTypeId);
  const visibility = visibilityMeta(item.visibilityName, item.visibilityTypeId);
  return {
    id: item.id,
    userId: item.userId,
    visibilityIcon: visibility.icon,
    visibilityLabel: visibility.label,
    authorName: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.username,
    authorAvatar: `http://localhost:5001/temp/${item.image || "default.png"}`,
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

const loadPost = async () => {
  if (!postId.value) {
    router.replace("/");
    return;
  }
  loading.value = true;
  post.value = null;
  try {
    const res = await AxiosApi.get(`/posts/${postId.value}`);
    post.value = mapPost(res.data);
  } catch (e) {
    router.replace("/");
    return;
  } finally {
    loading.value = false;
  }
};

const goToAuthor = () => {
  const id = post.value?.userId;
  if (!id || id === currentUserId.value) {
    router.push("/profile");
    return;
  }
  router.push(`/users/${id}`);
};

const sharePost = async () => {
  const url = `${window.location.origin}/posts/${post.value.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: post.value.title || "BuzzUp post", url });
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

onMounted(loadPost);
watch(postId, loadPost);
</script>

<style scoped>
.post-page {
  --card-bg: #fff;
  --card-border: rgba(0, 0, 0, 0.06);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --hover-bg: #f1f5f9;
  --divider: #e2e8f0;
  max-width: 100%;
}

.post-page.dark-mode {
  --card-bg: #1e1e2e;
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --hover-bg: #2a2a3e;
  --divider: #334155;
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

.post-wrap {
  padding: 16px 24px 40px;
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

.post-author-name {
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  font-weight: 700;
  color: inherit;
  cursor: pointer;
}

.post-author-hit {
  cursor: pointer;
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
