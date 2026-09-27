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
        <div class="post-actions">
          <PostReactionButton :post="post" @reaction-changed="(next) => Object.assign(post, next)" />
          <button class="action-btn" @click="scrollToComments">
            <v-icon size="20">mdi-comment-processing-outline</v-icon>
            <span>Comment</span>
          </button>
          <button class="action-btn" @click="savePostSoon">
            <v-icon size="20">mdi-bookmark-outline</v-icon>
            <span>Save</span>
          </button>
        </div>
        <div id="comments" class="comments-section">
          <div v-if="commentsLoading" class="comments-empty">Loading comments...</div>
          <div v-else-if="!comments.length" class="comments-empty">No comments yet.</div>
          <div v-if="comments.length" class="comment-list">
            <CommentThread
              v-for="comment in comments"
              :key="comment.id"
              :comment="comment"
              :my-avatar="myAvatar"
              :posting="postingComment"
              :current-user-id="currentUserId"
              :post-author-id="post.userId"
              @author-click="goToCommentAuthor"
              @reply="submitReply"
              @edit="submitEdit"
              @ask-delete="askDeleteComment"
            />
          </div>
          <form class="comment-composer" @submit.prevent="submitComment">
            <v-avatar size="32">
              <img :src="myAvatar" alt="Me" />
            </v-avatar>
            <input
              ref="commentInput"
              v-model="newComment"
              class="comment-input"
              type="text"
              maxlength="2000"
              placeholder="Write a comment..."
              :disabled="postingComment"
            />
            <button class="comment-send" type="submit" :disabled="!newComment.trim() || postingComment">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>

    <v-dialog v-model="showDeleteCommentDialog" max-width="400">
      <v-card class="create-dialog" :class="{ 'dark-mode': isDark }">
        <div class="create-dialog-header">
          <h2 class="create-dialog-title">Delete comment</h2>
          <v-btn icon variant="text" size="small" :disabled="postingComment" @click="showDeleteCommentDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="create-dialog-body">
          <p class="delete-confirm-text">Are you sure you want to delete this comment? Replies will be deleted too.</p>
          <v-btn
            block
            color="#f44336"
            rounded="lg"
            class="create-submit"
            :loading="postingComment"
            @click="confirmDeleteComment"
          >
            Delete
          </v-btn>
        </div>
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
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import AxiosApi from "@/plugins/axios";
import PostReactionButton from "@/components/PostReactionButton.vue";
import CommentThread from "@/components/CommentThread.vue";
import { uniqueReactionEmojis } from "@/services/reactionTypes";
import { formatTime } from "@/services/dates";
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
    likes: item.reactionCount ?? 0,
    myReactionTypeId: item.myReactionTypeId ?? null,
    myReactionName: item.myReactionName || "",
    myReactionIcon: item.myReactionIcon || "",
    usedReactionTypeIds: item.usedReactionTypeIds || [],
    usedReactionEmojis: uniqueReactionEmojis(item.usedReactionTypeIds),
    comments: item.commentCount ?? 0,
  };
};

const comments = ref([]);
const commentsLoading = ref(false);
const showDeleteCommentDialog = ref(false);
const commentToDelete = ref(null);
const newComment = ref("");
const postingComment = ref(false);
const commentInput = ref(null);
const myAvatar = computed(
  () => `http://localhost:5001/temp/${store.getters.getProfile?.image || store.getters.getUser?.image || "default.png"}`
);

const mapComment = (item) => ({
  id: item.id,
  userId: item.userId,
  authorName: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.username,
  authorAvatar: `http://localhost:5001/temp/${item.image || "default.png"}`,
  content: item.content,
  time: formatTime(item.createdAt),
  replies: (item.replies || []).map(mapComment),
});

const countComments = (list) =>
  (list || []).reduce((total, comment) => total + 1 + countComments(comment.replies), 0);

const loadComments = async () => {
  if (!postId.value) return;
  commentsLoading.value = true;
  try {
    const res = await AxiosApi.get(`/posts/${postId.value}/comments`);
    comments.value = (Array.isArray(res.data) ? res.data : []).map(mapComment);
  } catch (e) {
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
};

const loadPost = async () => {
  if (!postId.value) {
    router.replace("/");
    return;
  }
  loading.value = true;
  post.value = null;
  comments.value = [];
  try {
    const res = await AxiosApi.get(`/posts/${postId.value}`);
    post.value = mapPost(res.data);
    await loadComments();
  } catch (e) {
    router.replace("/");
    return;
  } finally {
    loading.value = false;
  }
};

const goToUser = (userId) => {
  if (!userId || userId === currentUserId.value) {
    router.push("/profile");
    return;
  }
  router.push(`/users/${userId}`);
};

const goToAuthor = () => {
  goToUser(post.value?.userId);
};

const goToCommentAuthor = (comment) => {
  goToUser(comment.userId);
};

const scrollToComments = async () => {
  document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  await nextTick();
  commentInput.value?.focus();
};

const submitReply = async ({ parentId, content }) => {
  if (!post.value?.id || !content || postingComment.value) return;
  postingComment.value = true;
  try {
    await AxiosApi.post(`/posts/${post.value.id}/comments`, { content, parentId });
    await loadComments();
    if (post.value) post.value.comments = countComments(comments.value);
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    postingComment.value = false;
  }
};

const submitEdit = async ({ commentId, content }) => {
  if (!commentId || !content || postingComment.value) return;
  postingComment.value = true;
  try {
    await AxiosApi.put(`/comments/${commentId}`, { content });
    await loadComments();
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    postingComment.value = false;
  }
};

const askDeleteComment = (comment) => {
  commentToDelete.value = comment;
  showDeleteCommentDialog.value = true;
};

const confirmDeleteComment = async () => {
  const commentId = commentToDelete.value?.id;
  if (!commentId || postingComment.value) return;
  postingComment.value = true;
  try {
    await AxiosApi.delete(`/comments/${commentId}`);
    showDeleteCommentDialog.value = false;
    commentToDelete.value = null;
    await loadComments();
    if (post.value) post.value.comments = countComments(comments.value);
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    postingComment.value = false;
  }
};

const submitComment = async () => {
  const content = newComment.value.trim();
  if (!post.value?.id || !content || postingComment.value) return;
  postingComment.value = true;
  try {
    await AxiosApi.post(`/posts/${post.value.id}/comments`, { content });
    newComment.value = "";
    await loadComments();
    if (post.value) post.value.comments = countComments(comments.value);
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    postingComment.value = false;
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

.comments-section {
  border-top: 1px solid var(--divider);
  margin: 0 8px;
  padding: 12px 12px 16px;
}

.comments-empty {
  font-size: 0.85rem;
  color: var(--text-muted);
  padding: 4px 4px 8px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.comment-avatar-hit {
  cursor: pointer;
  flex-shrink: 0;
}

.comment-body {
  min-width: 0;
}

.comment-bubble {
  background: var(--hover-bg);
  border-radius: 14px;
  padding: 8px 12px;
}

.comment-author {
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--text-primary);
  cursor: pointer;
}

.comment-text {
  margin: 2px 0 0;
  font-size: 0.88rem;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-time {
  display: block;
  margin-top: 4px;
  padding-left: 12px;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.comment-composer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.comment-input {
  flex: 1;
  min-width: 0;
  border: none;
  border-radius: 18px;
  background: var(--hover-bg);
  color: var(--text-primary);
  padding: 8px 14px;
  font-size: 0.88rem;
  outline: none;
}

.comment-input::placeholder {
  color: var(--text-muted);
}

.comment-send {
  border: none;
  border-radius: 18px;
  padding: 8px 14px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  cursor: pointer;
}

.comment-send:disabled {
  opacity: 0.45;
  cursor: default;
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

.create-submit {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-weight: 700 !important;
}
</style>
