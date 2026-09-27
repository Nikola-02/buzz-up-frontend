<template>
  <div class="home-feed" :class="{ 'dark-mode': isDark }">
    <!-- Create post trigger (Facebook-style) -->
    <div class="create-post-card">
      <div class="create-post-top">
        <v-avatar size="44" class="create-avatar">
          <img :src="avatarUrl" :alt="fullName" />
        </v-avatar>
        <button type="button" class="create-post-trigger" @click="openCreateDialog">
          What's buzzing, {{ firstName }}?
        </button>
      </div>
      <div class="create-post-bottom">
        <button type="button" class="create-action" @click="openCreateDialog(true)">
          <v-icon size="20" color="#f44336">mdi-image-outline</v-icon>
          <span>Photo</span>
        </button>
        <button type="button" class="create-action" @click="openCreateDialog">
          <span class="feeling-emoji feeling-emoji-sm">😊</span>
          <span>Feeling</span>
        </button>
      </div>
    </div>

    <v-dialog v-model="showCreateDialog" max-width="520" :persistent="posting">
      <v-card class="create-dialog" :class="{ 'dark-mode': isDark }">
        <div class="create-dialog-header">
          <h2 class="create-dialog-title">{{ editingPostId ? "Edit post" : "Create post" }}</h2>
          <v-btn icon variant="text" size="small" :disabled="posting" @click="closeCreateDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="create-dialog-body">
          <div class="create-dialog-user">
            <v-avatar size="40" class="create-avatar">
              <img :src="avatarUrl" :alt="fullName" />
            </v-avatar>
            <div class="create-dialog-user-meta">
              <div class="create-dialog-name">
                {{ fullName }}
                <span v-if="selectedFeeling" class="create-feeling-text"> is feeling {{ selectedFeeling.name }}</span>
              </div>
              <v-select
                v-model="newPost.visibilityTypeId"
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
            v-model="newPost.title"
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
            v-model="newPost.description"
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
            v-model="newPost.location"
            placeholder="Location (optional)"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            prepend-inner-icon="mdi-map-marker-outline"
            maxlength="50"
            rounded="lg"
            class="create-field"
          />

          <div v-if="uploadedFileName" class="create-photo-preview">
            <img :src="photoPreviewUrl" alt="Post photo" />
            <v-btn
              class="create-photo-remove"
              icon
              size="small"
              variant="flat"
              @click="clearPhoto"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <input
            ref="photoInput"
            type="file"
            accept=".jpg,.jpeg,.png"
            hidden
            @change="onPhotoSelected"
          />

          <div class="create-dialog-actions">
            <span class="create-actions-label">Add to your post</span>
            <div class="create-actions-right">
              <button type="button" class="create-action" :disabled="imageUploading" @click="pickPhoto">
                <v-icon size="22" color="#f44336">mdi-image-outline</v-icon>
              </button>
              <v-menu location="top" :close-on-content-click="true">
                <template #activator="{ props }">
                  <button type="button" class="create-action feeling-emoji-btn" v-bind="props" title="Feeling">
                    {{ selectedFeeling?.emoji || "😊" }}
                  </button>
                </template>
                <v-list class="feeling-menu" density="compact">
                  <v-list-item
                    :active="newPost.feelingTypeId == null"
                    @click="newPost.feelingTypeId = null"
                  >
                    <template #prepend>
                      <span class="feeling-emoji">🚫</span>
                    </template>
                    <v-list-item-title>None</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-for="feeling in feelingTypes"
                    :key="feeling.id"
                    :active="newPost.feelingTypeId === feeling.id"
                    @click="newPost.feelingTypeId = feeling.id"
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
            :loading="posting || imageUploading"
            :disabled="!newPost.title"
            @click="savePost"
          >
            {{ editingPostId ? "Save" : "Post" }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="create-dialog" :class="{ 'dark-mode': isDark }">
        <div class="create-dialog-header">
          <h2 class="create-dialog-title">Delete post</h2>
          <v-btn icon variant="text" size="small" :disabled="deleting" @click="showDeleteDialog = false">
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
            :loading="deleting"
            @click="deletePost"
          >
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showUnfriendDialog" max-width="400">
      <v-card class="create-dialog" :class="{ 'dark-mode': isDark }">
        <div class="create-dialog-header">
          <h2 class="create-dialog-title">Unfriend</h2>
          <v-btn icon variant="text" size="small" :disabled="unfriending" @click="showUnfriendDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <div class="create-dialog-body">
          <p class="delete-confirm-text">Are you sure you want to unfriend {{ peekName }}?</p>
          <v-btn
            block
            color="#f44336"
            rounded="lg"
            class="create-submit"
            :loading="unfriending"
            @click="confirmPeekUnfriend"
          >
            Unfriend
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <div v-if="feedLoading" class="feed-empty">Loading posts...</div>
    <div v-else-if="!posts.length" class="feed-empty">No posts yet. Create the first one.</div>

    <!-- Posts feed -->
    <div
      v-for="post in posts"
      :key="post.id"
      class="post-card post-card-open"
      @click="goToPost(post.id)"
    >
      <!-- Post header -->
      <div class="post-top">
        <div class="post-author-block">
          <v-avatar size="44" class="post-author-hit" @click.stop="openAuthorPeek(post)">
            <img :src="post.authorAvatar" :alt="post.authorName" />
          </v-avatar>
          <div class="post-meta">
            <span class="post-author">
              <button type="button" class="post-author-name post-author-hit" @click.stop="openAuthorPeek(post)">
                {{ post.authorName }}
              </button>
              <span v-if="post.feelingName" class="post-feeling"> is feeling {{ post.feelingEmoji }} {{ post.feelingName }}</span>
            </span>
            <span class="post-timestamp">
              <v-icon size="12">mdi-clock-outline</v-icon>
              {{ post.time }}
              <span v-if="post.location"> · {{ post.location }}</span>
              <v-tooltip v-if="isOwnPost(post)" location="top">
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
          <div
            v-if="peekPostId === post.id"
            class="author-peek"
            :class="{ 'dark-mode': isDark }"
            @click.stop
          >
            <div class="author-peek-row">
              <v-avatar size="72" class="author-peek-avatar">
                <img :src="peekAvatarUrl" :alt="peekName" />
              </v-avatar>
              <div class="author-peek-info">
                <h3 class="author-peek-name">{{ peekName }}</h3>
                <span v-if="peekUser?.username" class="author-peek-handle">@{{ peekUser.username }}</span>
                <div class="author-peek-counts">
                  <span><strong>{{ peekUser?.postCount ?? 0 }}</strong> posts</span>
                  <span><strong>{{ peekUser?.friendCount ?? 0 }}</strong> friends</span>
                </div>
              </div>
            </div>
            <div class="author-peek-actions">
              <v-btn
                v-if="showPeekPrimaryAction"
                class="author-peek-add"
                :class="{ 'is-friends': peekIsFriends }"
                rounded
                size="small"
                :disabled="peekPrimaryDisabled"
                @click="onPeekPrimaryAction"
              >
                <span class="friend-btn-swap">
                  <span class="friend-btn-main">{{ peekPrimaryLabel }}</span>
                  <span v-if="peekIsFriends" class="friend-btn-unfriend">Unfriend</span>
                </span>
              </v-btn>
              <v-btn
                v-if="peekCanAccept"
                class="author-peek-decline"
                variant="tonal"
                rounded
                size="small"
                :disabled="peekSending"
                @click="declinePeekFriendRequest"
              >
                Decline
              </v-btn>
              <v-btn variant="outlined" rounded size="small" class="author-peek-view" @click="goToPeekProfile">
                View Profile
              </v-btn>
            </div>
          </div>
        </div>
        <v-menu v-if="isOwnPost(post)" location="bottom end">
          <template #activator="{ props }">
            <button class="post-options-btn" v-bind="props" @click.stop>
              <v-icon size="20">mdi-dots-horizontal</v-icon>
            </button>
          </template>
          <v-list density="compact">
            <v-list-item @click="openEditDialog(post)">
              <template #prepend>
                <v-icon size="18">mdi-pencil-outline</v-icon>
              </template>
              <v-list-item-title>Edit</v-list-item-title>
            </v-list-item>
            <v-list-item @click="openDeleteDialog(post)">
              <template #prepend>
                <v-icon size="18" color="#f44336">mdi-delete-outline</v-icon>
              </template>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- Post body -->
      <p class="post-title">{{ post.title }}</p>
      <p v-if="post.description" class="post-body">{{ post.description }}</p>

      <!-- Post image -->
      <div v-if="post.image" class="post-image-wrapper">
        <img :src="post.image" class="post-image" />
      </div>

      <!-- Reactions bar -->
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
        <div class="reactions-right">
          <span>{{ post.comments }} comments</span>
        </div>
      </div>

      <!-- Action buttons -->
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
  </div>

  <SnackbarComponent
    v-model:show="showSnackbar"
    :color="snackbarColor"
    :text="snackbarText"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import { useStore } from "vuex";
import AxiosApi from "@/plugins/axios";
import PostReactionButton from "@/components/PostReactionButton.vue";
import { uniqueReactionEmojis } from "@/services/reactionTypes";
import { formatRelativeTime } from "@/services/dates";
import { showSnackbar, snackbarColor, snackbarText } from "../snackbar";

const theme = useTheme();
const store = useStore();
const router = useRouter();
const isDark = computed(() => theme.global.name.value === "dark");
const posting = ref(false);
const deleting = ref(false);
const feedLoading = ref(false);
const posts = ref([]);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const editingPostId = ref(null);
const postToDelete = ref(null);
const imageUploading = ref(false);
const uploadedFileName = ref("");
const photoInput = ref(null);

const fullName = computed(() => store.getters.fullName || "there");
const currentUserId = computed(() => store.getters.getProfile?.id || store.getters.getUser?.id);
const firstName = computed(() => store.getters.getProfile?.firstName || store.getters.getUser?.firstName || "there");
const avatarUrl = computed(
  () => `http://localhost:5001/temp/${store.getters.userImage || "default.png"}`,
);

const visibilityTypes = [
  { id: 1, name: "Public" },
  { id: 2, name: "Friends" },
  { id: 3, name: "Only me" },
];

const feelingTypes = [
  { id: 1, name: "Happy", emoji: "😊" },
  { id: 2, name: "Sad", emoji: "😢" },
  { id: 3, name: "Excited", emoji: "🤩" },
  { id: 4, name: "Angry", emoji: "😠" },
  { id: 5, name: "Thoughtful", emoji: "🤔" },
  { id: 6, name: "Loved", emoji: "😍" },
];

const emptyPost = () => ({
  title: "",
  description: "",
  location: "",
  visibilityTypeId: 1,
  feelingTypeId: null,
});

const newPost = ref(emptyPost());
const selectedFeeling = computed(
  () => feelingTypes.find((f) => f.id === newPost.value.feelingTypeId) || null,
);
const photoPreviewUrl = computed(() =>
  uploadedFileName.value ? `http://localhost:5001/temp/${uploadedFileName.value}` : "",
);

const isOwnPost = (post) => post.userId === currentUserId.value;

const goToPost = (id) => {
  if (!id) return;
  router.push(`/posts/${id}`);
};

const openCreateDialog = (pickPhotoAfter = false) => {
  editingPostId.value = null;
  newPost.value = emptyPost();
  uploadedFileName.value = "";
  showCreateDialog.value = true;
  if (pickPhotoAfter === true) {
    setTimeout(() => pickPhoto(), 250);
  }
};

const openEditDialog = (post) => {
  editingPostId.value = post.id;
  newPost.value = {
    title: post.title || "",
    description: post.description || "",
    location: post.location || "",
    visibilityTypeId: post.visibilityTypeId || 1,
    feelingTypeId: post.feelingTypeId ?? null,
  };
  uploadedFileName.value = post.imageFileName || "";
  showCreateDialog.value = true;
};

const closeCreateDialog = () => {
  if (posting.value) return;
  showCreateDialog.value = false;
};

const openDeleteDialog = (post) => {
  postToDelete.value = post;
  showDeleteDialog.value = true;
};

const pickPhoto = () => {
  photoInput.value?.click();
};

const clearPhoto = () => {
  uploadedFileName.value = "";
  if (photoInput.value) photoInput.value.value = "";
};

const onPhotoSelected = async (event) => {
  const file = event.target?.files?.[0];
  if (!file) return;

  imageUploading.value = true;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await AxiosApi.post("/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    uploadedFileName.value = response.data.file;
  } catch (error) {
    uploadedFileName.value = "";
    snackbarText.value =
      error.response?.status === 415
        ? "Unsupported file type. Use JPG, PNG, or JPEG."
        : "Failed to upload image.";
    snackbarColor.value = "red";
    showSnackbar.value = true;
  } finally {
    imageUploading.value = false;
    if (photoInput.value) photoInput.value.value = "";
  }
};

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
    userId: item.userId,
    visibilityTypeId: item.visibilityTypeId,
    visibilityIcon: visibility.icon,
    visibilityLabel: visibility.label,
    feelingTypeId: item.feelingTypeId,
    imageFileName: item.images?.[0] || "",
    authorName: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.username,
    authorAvatar: `http://localhost:5001/temp/${item.image || "default.png"}`,
    title: item.title,
    description: item.description,
    location: item.location,
    feelingName: item.feelingName,
    feelingEmoji: feeling?.emoji || "",
    image: item.images?.[0]
      ? `http://localhost:5001/temp/${item.images[0]}`
      : "",
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

const loadFeed = async () => {
  feedLoading.value = true;
  try {
    const res = await AxiosApi.get("/posts", { params: { perPage: 20, page: 1 } });
    posts.value = (res.data.data || res.data.Data || []).map(mapPost);
  } catch (e) {
    posts.value = [];
  } finally {
    feedLoading.value = false;
  }
};

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
  await loadFeed();
});

const savePost = async () => {
  if (!newPost.value.title?.trim()) return;

  posting.value = true;
  try {
    const payload = {
      title: newPost.value.title.trim(),
      description: newPost.value.description?.trim() || null,
      location: newPost.value.location?.trim() || null,
      visibilityTypeId: newPost.value.visibilityTypeId,
      feelingTypeId: newPost.value.feelingTypeId,
    };

    if (editingPostId.value) {
      await AxiosApi.put(`/posts/${editingPostId.value}`, {
        ...payload,
        image: uploadedFileName.value || "",
      });
      snackbarText.value = "Post updated.";
    } else {
      await AxiosApi.post("/posts", {
        ...payload,
        image: uploadedFileName.value || null,
      });
      snackbarText.value = "Post created.";
    }

    newPost.value = emptyPost();
    uploadedFileName.value = "";
    editingPostId.value = null;
    showCreateDialog.value = false;
    snackbarColor.value = "green";
    showSnackbar.value = true;
    await loadFeed();
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    posting.value = false;
  }
};

const savePostSoon = () => {
  snackbarText.value = "Saving posts comes next.";
  snackbarColor.value = "green";
  showSnackbar.value = true;
};

const peekPostId = ref(null);
const peekUser = ref(null);
const peekSending = ref(false);
const peekSentLocal = ref(false);
const showUnfriendDialog = ref(false);
const unfriending = ref(false);
let peekRequestSeq = 0;
const isPeekOwn = computed(() => peekUser.value?.id && peekUser.value.id === currentUserId.value);
const peekStatus = computed(() => peekUser.value?.friendshipStatus || "None");
const peekRequestSent = computed(
  () => peekSentLocal.value || peekStatus.value === "PendingOutgoing"
);
const peekIsFriends = computed(() => peekStatus.value === "Accepted");
const peekCanAccept = computed(() => peekStatus.value === "PendingIncoming" && !peekSentLocal.value);
const showPeekPrimaryAction = computed(() => !isPeekOwn.value);
const peekPrimaryDisabled = computed(
  () => peekSending.value || peekRequestSent.value
);
const peekPrimaryLabel = computed(() => {
  if (peekIsFriends.value) return "Friends";
  if (peekCanAccept.value) return "Accept request";
  if (peekRequestSent.value) return "Request sent";
  return "Add Friend";
});
const peekName = computed(
  () =>
    `${peekUser.value?.firstName || ""} ${peekUser.value?.lastName || ""}`.trim() ||
    peekUser.value?.username ||
    ""
);
const peekAvatarUrl = computed(
  () => `http://localhost:5001/temp/${peekUser.value?.image || "default.png"}`
);

const closeAuthorPeek = () => {
  peekPostId.value = null;
};

const openAuthorPeek = async (post) => {
  const requestId = ++peekRequestSeq;
  peekSentLocal.value = false;
  peekPostId.value = null;
  peekUser.value = null;
  if (!post.userId) return;

  try {
    const res = await AxiosApi.get(`/users/${post.userId}`);
    if (requestId !== peekRequestSeq) return;
    peekUser.value = res.data;
  } catch (e) {
    if (requestId !== peekRequestSeq) return;
    peekUser.value = {
      id: post.userId,
      firstName: post.authorName,
      lastName: "",
      image: post.authorAvatar?.split("/temp/")[1] || "default.png",
      postCount: 0,
      friendCount: 0,
      friendshipStatus: "None",
    };
  }

  if (requestId !== peekRequestSeq) return;
  peekPostId.value = post.id;
};

const onPeekPrimaryAction = () => {
  if (peekIsFriends.value) {
    showUnfriendDialog.value = true;
    return;
  }
  if (peekCanAccept.value) {
    acceptPeekFriendRequest();
    return;
  }
  sendPeekFriendRequest();
};

const confirmPeekUnfriend = async () => {
  if (!peekUser.value?.id || unfriending.value) return;
  unfriending.value = true;
  try {
    const userId = peekUser.value.id;
    await AxiosApi.post("/friendships/unfriend", { userId });
    showUnfriendDialog.value = false;
    peekSentLocal.value = false;
    peekUser.value = { ...peekUser.value, friendshipStatus: "None" };
    window.dispatchEvent(
      new CustomEvent("buzzup-friends-changed", {
        detail: { userId, status: "None" },
      })
    );
    await loadFeed();
    snackbarText.value = "You are no longer friends.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    unfriending.value = false;
  }
};

const sendPeekFriendRequest = async () => {
  if (!peekUser.value?.id || isPeekOwn.value || peekSending.value || peekRequestSent.value || peekIsFriends.value) return;
  peekSending.value = true;
  try {
    await AxiosApi.post("/friendships", { userId: peekUser.value.id });
    peekSentLocal.value = true;
    peekUser.value = { ...peekUser.value, friendshipStatus: "PendingOutgoing" };
    snackbarText.value = "Friend request sent.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    peekSending.value = false;
  }
};

const acceptPeekFriendRequest = async () => {
  if (!peekUser.value?.id || peekSending.value) return;
  peekSending.value = true;
  try {
    await AxiosApi.post("/friendships/accept", { userId: peekUser.value.id });
    peekUser.value = { ...peekUser.value, friendshipStatus: "Accepted", friendCount: (peekUser.value.friendCount ?? 0) + 1 };
    snackbarText.value = "You are now friends.";
    window.dispatchEvent(new CustomEvent("buzzup-friends-changed"));
    snackbarColor.value = "green";
    showSnackbar.value = true;
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    peekSending.value = false;
  }
};

const declinePeekFriendRequest = async () => {
  if (!peekUser.value?.id || peekSending.value) return;
  peekSending.value = true;
  try {
    const userId = peekUser.value.id;
    await AxiosApi.post("/friendships/reject", { userId });
    peekSentLocal.value = false;
    peekUser.value = { ...peekUser.value, friendshipStatus: "None" };
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
    peekSending.value = false;
  }
};

const goToPeekProfile = () => {
  const id = peekUser.value?.id;
  closeAuthorPeek();
  if (!id || id === currentUserId.value) {
    router.push("/profile");
    return;
  }
  router.push(`/users/${id}`);
};

const onFriendsChanged = (event) => {
  const detail = event?.detail;
  if (!detail?.userId || !peekUser.value || detail.userId !== peekUser.value.id) return;
  if (detail.status === "Accepted") {
    peekSentLocal.value = false;
    peekUser.value = {
      ...peekUser.value,
      friendshipStatus: "Accepted",
      friendCount: (peekUser.value.friendCount ?? 0) + 1,
    };
  }
  if (detail.status === "None") {
    peekSentLocal.value = false;
    peekUser.value = { ...peekUser.value, friendshipStatus: "None" };
  }
};

onMounted(() => {
  document.addEventListener("click", closeAuthorPeek);
  window.addEventListener("buzzup-friends-changed", onFriendsChanged);
});

onUnmounted(() => {
  document.removeEventListener("click", closeAuthorPeek);
  window.removeEventListener("buzzup-friends-changed", onFriendsChanged);
});

const deletePost = async () => {
  if (!postToDelete.value) return;

  deleting.value = true;
  try {
    await AxiosApi.delete(`/posts/${postToDelete.value.id}`);
    showDeleteDialog.value = false;
    postToDelete.value = null;
    snackbarText.value = "Post deleted.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
    await loadFeed();
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    deleting.value = false;
  }
};
</script>

<style scoped>
.home-feed {
  --card-bg: #fff;
  --card-border: rgba(0, 0, 0, 0.06);
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --hover-bg: #f1f5f9;
  --divider: #e2e8f0;
  --action-hover: rgba(15, 52, 96, 0.08);
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.home-feed.dark-mode {
  --card-bg: #1e1e2e;
  --card-border: rgba(255, 255, 255, 0.06);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --hover-bg: #2a2a3e;
  --divider: #334155;
  --action-hover: rgba(255, 193, 7, 0.1);
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

.create-post-trigger {
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

.create-post-trigger:hover {
  border-color: var(--divider);
  background: var(--card-bg);
}

.create-post-bottom {
  display: flex;
  gap: 4px;
  border-top: 1px solid var(--divider);
  padding-top: 14px;
  align-items: center;
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

.create-action:hover:not(:disabled) {
  background: var(--hover-bg);
}

.create-action:disabled {
  opacity: 0.45;
  cursor: default;
}

.feeling-emoji-sm {
  font-size: 1.15rem;
  line-height: 1;
}

/* ===== POST CARD ===== */
.post-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  margin-top: 16px;
  overflow: visible;
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

.post-author-block {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
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
  transition: color 0.3s ease;
}

.post-author-name {
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.post-author-hit {
  cursor: pointer;
}

.post-author-name:hover {
  text-decoration: underline;
}

.post-feeling {
  font-weight: 500;
  color: var(--text-secondary);
}

.post-title {
  padding: 14px 20px 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.feed-empty {
  text-align: center;
  color: var(--text-muted);
  padding: 28px 12px;
  font-size: 0.92rem;
}

.post-timestamp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
  transition: color 0.3s ease;
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
  transition: color 0.3s ease;
}

.post-image-wrapper {
  margin: 0 0 0;
}

.post-image {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 440px;
}

/* ===== REACTIONS BAR ===== */
.reactions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  font-size: 0.8rem;
  color: var(--text-muted);
  transition: color 0.3s ease;
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

/* ===== ACTION BUTTONS ===== */
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

.feeling-label {
  flex: 1;
  text-align: left;
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

.author-peek {
  --card-bg: #fff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --divider: #e2e8f0;
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 20;
  width: 320px;
  padding: 14px;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--divider);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.18);
}

.author-peek.dark-mode {
  --card-bg: #1e1e2e;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --divider: #334155;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
}

.author-peek-row {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.author-peek-avatar {
  border: 2px solid var(--divider);
  flex-shrink: 0;
}

.author-peek-avatar img {
  object-fit: cover;
}

.author-peek-info {
  min-width: 0;
}

.author-peek-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
}

.author-peek-handle {
  display: block;
  color: var(--text-muted);
  font-size: 0.82rem;
  margin-top: 1px;
}

.author-peek-counts {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.author-peek-counts strong {
  color: var(--text-primary);
}

.author-peek-actions {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 12px;
}

.author-peek-add,
.author-peek-decline,
.author-peek-view {
  flex: 1;
}

.author-peek-add {
  background: linear-gradient(135deg, #1a1a2e, #0f3460) !important;
  color: #fff !important;
  font-weight: 700;
  text-transform: none;
  transition: background-color 0.25s ease !important;
}

.author-peek-add.is-friends:hover {
  background: #f44336 !important;
}

.author-peek-decline {
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

.author-peek-add.is-friends:hover .friend-btn-main {
  opacity: 0;
}

.author-peek-add.is-friends:hover .friend-btn-unfriend {
  opacity: 1;
}

.author-peek-view {
  text-transform: none;
  font-weight: 600;
  color: var(--text-primary) !important;
}
</style>
