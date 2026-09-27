<template>
  <!-- NAVBAR -->
  <nav class="navbar" :class="{ 'dark-mode': isDarkTheme }">
    <div class="navbar-inner">
      <div class="navbar-brand" @click="router.push('/')">
        <v-icon class="brand-icon" size="42">mdi-bee</v-icon>
        <span class="brand-text">Buzz<span class="brand-accent">Up</span></span>
      </div>

      <div class="navbar-search" @click.stop>
        <v-text-field
          v-model="navSearchQuery"
          density="compact"
          placeholder="Search people..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          flat
          hide-details
          bg-color="rgba(255,255,255,0.12)"
          class="search-field"
          rounded
          clearable
          autocomplete="off"
          @focus="showNavSearch = true"
          @click:clear="clearNavSearch"
        ></v-text-field>
        <div
          v-if="showNavSearch && navSearchQuery.trim()"
          class="nav-search-dropdown"
          :class="{ 'dark-mode': isDarkTheme }"
        >
          <div v-if="navSearchLoading" class="nav-search-empty">Searching...</div>
          <template v-else-if="navSearchResults.length">
            <div
              v-for="person in navSearchResults"
              :key="person.id"
              class="nav-search-row"
              @click="goToSearchUser(person.id)"
            >
              <v-avatar size="40">
                <img :src="person.avatar" :alt="person.name" />
              </v-avatar>
              <div class="nav-search-info">
                <span class="nav-search-name">{{ person.name }}</span>
                <span class="nav-search-handle">@{{ person.username }}</span>
              </div>
            </div>
          </template>
          <div v-else class="nav-search-empty">No people found</div>
        </div>
      </div>

      <div class="navbar-actions">
        <!-- NOTIFICATIONS DROPDOWN -->
        <v-menu
          v-model="showNotifications"
          offset-y
          transition="slide-y-transition"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" class="nav-action-btn" v-bind="props">
              <v-badge
                v-if="unreadNotifications > 0"
                color="#ff6b6b"
                :content="unreadNotifications"
                :offset-x="-2"
                :offset-y="-2"
              >
                <v-icon>mdi-bell-outline</v-icon>
              </v-badge>
              <v-icon v-else>mdi-bell-outline</v-icon>
            </v-btn>
          </template>

          <v-card
            class="notifications-dropdown"
            min-width="340"
            max-width="380"
          >
            <div class="notif-header">
              <span class="notif-title">Notifications</span>
              <v-btn
                v-if="unreadNotifications > 0"
                variant="text"
                size="x-small"
                class="mark-read-btn"
                :disabled="markingAllRead"
                @click="markAllRead"
              >
                Mark all as read
              </v-btn>
            </div>
            <v-divider></v-divider>
            <v-list
              density="compact"
              class="notif-list"
              v-if="notifications.length"
            >
              <v-list-item
                v-for="notif in notifications"
                :key="notif.id"
                class="notif-item"
                :class="{ 'notif-unread': !notif.read }"
                @click="openNotification(notif)"
              >
                <template v-slot:prepend>
                  <v-avatar size="40">
                    <img :src="notif.avatar" :alt="notif.name" />
                  </v-avatar>
                </template>
                <div class="notif-content">
                  <span class="notif-text">
                    <strong>{{ notif.name }}</strong> {{ notif.action }}
                  </span>
                  <span class="notif-time">{{ notif.time }}</span>
                </div>
                <template v-slot:append>
                  <span v-if="!notif.read" class="notif-unread-dot"></span>
                </template>
              </v-list-item>
            </v-list>
            <div v-else-if="notificationsLoading" class="notif-empty">
              <span>Loading...</span>
            </div>
            <div v-else class="notif-empty">
              <v-icon size="36" color="#bec3c9">mdi-bell-check-outline</v-icon>
              <span>No notifications</span>
            </div>
          </v-card>
        </v-menu>

        <v-btn icon variant="text" class="nav-action-btn">
          <v-badge color="#ff6b6b" content="3">
            <v-icon>mdi-message-outline</v-icon>
          </v-badge>
        </v-btn>

        <v-divider vertical class="mx-2 nav-divider"></v-divider>

        <!-- USER AVATAR DROPDOWN -->
        <v-menu
          v-model="showUserMenu"
          offset-y
          transition="slide-y-transition"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ props }">
            <div class="user-avatar-btn" v-bind="props">
              <v-avatar size="36" class="user-avatar">
                <img :src="userAvatarUrl" alt="My profile" />
              </v-avatar>
              <v-icon size="16" class="avatar-arrow">mdi-chevron-down</v-icon>
            </div>
          </template>

          <v-card class="user-dropdown" min-width="240">
            <!-- Profile header -->
            <div class="dropdown-profile-header">
              <v-avatar size="48">
                <img :src="userAvatarUrl" alt="My profile" />
              </v-avatar>
              <div class="dropdown-profile-info">
                <span class="dropdown-profile-name">{{
                  store.getters.fullName
                }}</span>
                <span class="dropdown-profile-email">{{
                  store.getters.userEmail
                }}</span>
              </div>
            </div>
            <v-divider></v-divider>

            <v-list density="compact" class="dropdown-list">
              <!-- My Profile -->
              <v-list-item @click="goToProfile" class="dropdown-item">
                <template v-slot:prepend>
                  <v-icon size="20">mdi-account-circle-outline</v-icon>
                </template>
                <v-list-item-title>My Profile</v-list-item-title>
              </v-list-item>

              <v-list-item @click="goToSettings" class="dropdown-item">
                <template v-slot:prepend>
                  <v-icon size="20">mdi-cog-outline</v-icon>
                </template>
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item>

              <!-- Admin Dashboard (only for Admin role) -->
              <v-list-item v-if="store.getters.isAdmin" @click="goToAdmin" class="dropdown-item">
                <template v-slot:prepend>
                  <v-icon size="20">mdi-shield-lock-outline</v-icon>
                </template>
                <v-list-item-title>Admin</v-list-item-title>
              </v-list-item>

              <v-divider class="my-1"></v-divider>

              <!-- Log out -->
              <v-list-item @click="logout" class="dropdown-item logout-item">
                <template v-slot:prepend>
                  <v-icon size="20">mdi-logout</v-icon>
                </template>
                <v-list-item-title>Log out</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </div>
  </nav>

  <!-- MAIN CONTENT -->
  <div class="main-wrapper" :class="{ 'dark-mode': isDarkTheme }">
    <!-- FRIENDS SIDEBAR -->
    <aside class="friends-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title-row">
          <span class="sidebar-title">Friends</span>
          <v-chip
            size="x-small"
            color="#ffc107"
            variant="flat"
            class="friends-count"
          >
            {{ friends.length }}
          </v-chip>
        </div>
        <div class="sidebar-actions">
          <!-- Friend requests button -->
          <v-btn
            icon
            variant="text"
            size="small"
            class="sidebar-action-btn"
            @click="showRequestsDialog = true"
          >
            <v-badge
              v-if="friendRequests.length"
              color="#ff6b6b"
              :content="friendRequests.length"
              :offset-x="-2"
              :offset-y="-2"
            >
              <v-icon size="20">mdi-account-plus-outline</v-icon>
            </v-badge>
            <v-icon v-else size="20">mdi-account-plus-outline</v-icon>
          </v-btn>
          <!-- Search toggle -->
          <v-btn
            icon
            variant="text"
            size="small"
            class="sidebar-action-btn"
            @click="toggleFriendSearch"
          >
            <v-icon size="20">mdi-magnify</v-icon>
          </v-btn>
          <!-- Activity status menu -->
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                size="small"
                class="sidebar-action-btn"
                v-bind="props"
              >
                <v-icon size="20">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-card class="activity-dropdown" min-width="200">
              <v-list density="compact">
                <v-list-subheader>My Status</v-list-subheader>
                <v-list-item
                  v-for="status in activityStatuses"
                  :key="status.value"
                  @click="myStatus = status.value"
                  :class="{ 'active-status': myStatus === status.value }"
                  class="status-option"
                >
                  <template v-slot:prepend>
                    <span class="status-indicator" :class="status.value"></span>
                  </template>
                  <v-list-item-title>{{ status.label }}</v-list-item-title>
                  <template v-slot:append>
                    <v-icon
                      v-if="myStatus === status.value"
                      size="18"
                      color="#31a24c"
                      >mdi-check</v-icon
                    >
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </div>

      <!-- Expandable search bar -->
      <transition name="search-expand">
        <div v-if="showFriendSearch" class="friend-search-wrapper">
          <v-text-field
            v-model="friendSearchQuery"
            density="compact"
            placeholder="Search friends..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            rounded
            class="friend-search-input"
            autofocus
            clearable
            @click:clear="friendSearchQuery = ''"
          ></v-text-field>
        </div>
      </transition>

      <!-- Online friends -->
      <div class="online-section" v-if="filteredOnlineFriends.length">
        <div class="section-label">
          <span class="dot dot-online"></span>
          <span>Online — {{ filteredOnlineFriends.length }}</span>
        </div>
        <div class="friends-list">
          <div
            v-for="friend in filteredOnlineFriends"
            :key="friend.id"
            class="friend-item"
            @click="goToFriend(friend.id)"
          >
            <div class="friend-avatar-wrapper">
              <v-avatar size="40">
                <img :src="friend.avatar" :alt="friend.name" />
              </v-avatar>
              <span class="status-dot online"></span>
            </div>
            <div class="friend-info">
              <span class="friend-name">{{ friend.name }}</span>
            </div>
            <v-btn icon variant="text" size="small" class="friend-msg-btn" @click.stop>
              <v-icon size="18">mdi-message-text-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Offline friends -->
      <div class="offline-section" v-if="filteredOfflineFriends.length">
        <div class="section-label">
          <span class="dot dot-offline"></span>
          <span>Offline — {{ filteredOfflineFriends.length }}</span>
        </div>
        <div class="friends-list">
          <div
            v-for="friend in filteredOfflineFriends"
            :key="friend.id"
            class="friend-item offline"
            @click="goToFriend(friend.id)"
          >
            <div class="friend-avatar-wrapper">
              <v-avatar size="40">
                <img :src="friend.avatar" :alt="friend.name" />
              </v-avatar>
              <span class="status-dot"></span>
            </div>
            <div class="friend-info">
              <span class="friend-name">{{ friend.name }}</span>
            </div>
            <v-btn icon variant="text" size="small" class="friend-msg-btn" @click.stop>
              <v-icon size="18">mdi-message-text-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <div
        v-if="
          !friends.length &&
          !showFriendSearch
        "
        class="no-results"
      >
        <v-icon size="40" color="#bec3c9">mdi-account-group-outline</v-icon>
        <span>No friends yet</span>
      </div>
      <div
        v-else-if="
          showFriendSearch &&
          !filteredOnlineFriends.length &&
          !filteredOfflineFriends.length
        "
        class="no-results"
      >
        <v-icon size="40" color="#bec3c9">mdi-account-search-outline</v-icon>
        <span>No friends found</span>
      </div>
    </aside>

    <!-- CENTER CONTENT -->
    <main class="content-area">
      <router-view></router-view>
    </main>
  </div>

  <!-- FRIEND REQUESTS DIALOG -->
  <v-dialog v-model="showRequestsDialog" max-width="420">
    <v-card class="requests-dialog" rounded="xl">
      <div class="requests-dialog-header">
        <span class="requests-dialog-title">Friend Requests</span>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="showRequestsDialog = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider></v-divider>
      <div class="requests-dialog-body" v-if="friendRequests.length">
        <div v-for="req in friendRequests" :key="req.id" class="request-card">
          <div class="request-card-person" @click="goToRequestProfile(req.id)">
            <v-avatar size="50">
              <img :src="req.avatar" :alt="req.name" />
            </v-avatar>
            <div class="request-card-info">
              <span class="request-card-name">{{ req.name }}</span>
            </div>
          </div>
          <div class="request-card-actions">
            <v-btn
              size="small"
              variant="flat"
              class="req-dialog-btn accept"
              rounded
              :disabled="isRequestBusy(req.id)"
              @click="acceptRequest(req.id)"
            >
              Accept request
            </v-btn>
            <v-btn
              size="small"
              variant="tonal"
              class="req-dialog-btn decline"
              rounded
              :disabled="isRequestBusy(req.id)"
              @click="declineRequest(req.id)"
            >
              Decline
            </v-btn>
          </div>
        </div>
      </div>
      <div class="requests-dialog-empty" v-else>
        <v-icon size="48" color="#bec3c9">mdi-account-check-outline</v-icon>
        <span>No pending requests</span>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useTheme } from "vuetify";
import AxiosApi from "@/plugins/axios";
import { showSnackbar, snackbarColor, snackbarText } from "../snackbar";

const router = useRouter();
const store = useStore();
const theme = useTheme();

const userAvatarUrl = computed(() => {
  const image = store.getters.userImage;
  return `http://localhost:5001/temp/${image}`;
});

// User menu dropdown
const showUserMenu = ref(false);

const goToProfile = () => {
  showUserMenu.value = false;
  router.push("/profile");
};

const goToSettings = () => {
  showUserMenu.value = false;
  router.push("/settings");
};

const goToAdmin = () => {
  showUserMenu.value = false;
  router.push("/admin");
};

const currentUserId = computed(() => store.getters.getProfile?.id || store.getters.getUser?.id);
const navSearchQuery = ref("");
const navSearchResults = ref([]);
const navSearchLoading = ref(false);
const showNavSearch = ref(false);
let navSearchTimer = null;
let navSearchSeq = 0;

const mapSearchUser = (item) => ({
  id: item.id,
  name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.username,
  username: item.username,
  avatar: `http://localhost:5001/temp/${item.image || "default.png"}`,
});

const clearNavSearch = () => {
  navSearchQuery.value = "";
  navSearchResults.value = [];
  showNavSearch.value = false;
};

const searchPeople = async () => {
  const keyword = navSearchQuery.value.trim();
  const requestId = ++navSearchSeq;
  if (!keyword) {
    navSearchResults.value = [];
    navSearchLoading.value = false;
    return;
  }
  try {
    const res = await AxiosApi.get("/users", {
      params: { keyword, perPage: 8, page: 1 },
    });
    if (requestId !== navSearchSeq) return;
    const list = res.data?.data || res.data?.Data || [];
    navSearchResults.value = (Array.isArray(list) ? list : []).map(mapSearchUser);
  } catch (e) {
    if (requestId !== navSearchSeq) return;
    navSearchResults.value = [];
  } finally {
    if (requestId === navSearchSeq) {
      navSearchLoading.value = false;
    }
  }
};

watch(navSearchQuery, () => {
  showNavSearch.value = true;
  clearTimeout(navSearchTimer);
  const keyword = navSearchQuery.value.trim();
  if (!keyword) {
    navSearchSeq += 1;
    navSearchResults.value = [];
    navSearchLoading.value = false;
    return;
  }
  navSearchResults.value = [];
  navSearchLoading.value = true;
  navSearchTimer = setTimeout(searchPeople, 300);
});

const goToSearchUser = (id) => {
  clearNavSearch();
  if (!id || id === currentUserId.value) {
    router.push("/profile");
    return;
  }
  router.push(`/users/${id}`);
};

const onDocClick = () => {
  showNavSearch.value = false;
};

// Theme
const isDarkTheme = computed(() => theme.global.name.value === "dark");

// Notifications
const showNotifications = ref(false);
const notifications = ref([]);
const notificationsLoading = ref(false);

const parseApiDate = (value) => {
  const raw = String(value);
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(raw)) return new Date(raw);
  return new Date(`${raw}Z`);
};

const formatNotifTime = (value) => {
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

const notificationAction = (item) => {
  if (item.type === "FriendRequest") return "sent you a friend request.";
  if (item.type === "FriendAccepted") return "accepted your friend request.";
  if (item.type === "Comment") return "commented on your post.";
  if (item.type === "Reaction") {
    const name = (item.reactionTypeName || "").toLowerCase();
    if (name === "like") return "liked your post.";
    if (name) return `left a ${name} reaction on your post.`;
    return "left a reaction on your post.";
  }
  return "sent you a notification.";
};

const mapNotification = (item) => ({
  id: item.id,
  actorId: item.actorId,
  postId: item.postId,
  type: item.type,
  name: `${item.actorFirstName || ""} ${item.actorLastName || ""}`.trim() || item.actorUsername,
  avatar: `http://localhost:5001/temp/${item.actorImage || "default.png"}`,
  action: notificationAction(item),
  time: formatNotifTime(item.createdAt),
  read: !!item.isRead,
});

const loadNotifications = async () => {
  notificationsLoading.value = notifications.value.length === 0;
  try {
    const res = await AxiosApi.get("/notifications");
    const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.Data || [];
    notifications.value = list.map(mapNotification);
  } catch (e) {
    notifications.value = [];
  } finally {
    notificationsLoading.value = false;
  }
};

const unreadNotifications = computed(() => {
  return notifications.value.filter((n) => !n.read).length;
});

const markingAllRead = ref(false);

const markAllRead = async () => {
  if (markingAllRead.value || unreadNotifications.value === 0) return;
  markingAllRead.value = true;
  try {
    await AxiosApi.post("/notifications/read");
    notifications.value.forEach((n) => {
      n.read = true;
    });
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    markingAllRead.value = false;
  }
};

const openNotification = async (notif) => {
  if (!notif.read) {
    try {
      await AxiosApi.post(`/notifications/${notif.id}/read`);
      notif.read = true;
    } catch (e) {
      // Axios interceptor already shows the error snackbar
    }
  }
  showNotifications.value = false;
  if (notif.postId) {
    router.push(`/posts/${notif.postId}`);
    return;
  }
  if (!notif.actorId || notif.actorId === currentUserId.value) {
    router.push("/profile");
    return;
  }
  router.push(`/users/${notif.actorId}`);
};

watch(showNotifications, (open) => {
  if (open) loadNotifications();
});

// Activity status
const myStatus = ref("active");
const activityStatuses = [
  { value: "active", label: "Active" },
  { value: "away", label: "Away" },
  { value: "inactive", label: "Inactive" },
];

// Friends search
const showFriendSearch = ref(false);
const friendSearchQuery = ref("");

const toggleFriendSearch = () => {
  showFriendSearch.value = !showFriendSearch.value;
  if (!showFriendSearch.value) {
    friendSearchQuery.value = "";
  }
};

// Friend requests
const showRequestsDialog = ref(false);
const friendRequests = ref([]);
const busyRequestIds = ref([]);

const isRequestBusy = (id) => busyRequestIds.value.includes(id);

const markRequestBusy = (id, busy) => {
  busyRequestIds.value = busy
    ? [...busyRequestIds.value, id]
    : busyRequestIds.value.filter((x) => x !== id);
};

const acceptRequest = async (id) => {
  if (isRequestBusy(id)) return;
  markRequestBusy(id, true);
  try {
    await AxiosApi.post("/friendships/accept", { userId: id });
    snackbarText.value = "You are now friends.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
    window.dispatchEvent(
      new CustomEvent("buzzup-friends-changed", {
        detail: { userId: id, status: "Accepted" },
      })
    );
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    markRequestBusy(id, false);
  }
};

const declineRequest = async (id) => {
  if (isRequestBusy(id)) return;
  markRequestBusy(id, true);
  try {
    await AxiosApi.post("/friendships/reject", { userId: id });
    snackbarText.value = "Friend request declined.";
    snackbarColor.value = "green";
    showSnackbar.value = true;
    window.dispatchEvent(
      new CustomEvent("buzzup-friends-changed", {
        detail: { userId: id, status: "None" },
      })
    );
  } catch (e) {
    // Axios interceptor already shows the error snackbar
  } finally {
    markRequestBusy(id, false);
  }
};

const friends = ref([]);

const mapFriend = (item) => ({
  id: item.id,
  name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.username,
  avatar: `http://localhost:5001/temp/${item.image || "default.png"}`,
  isOnline: !!item.isOnline,
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
  router.push(`/users/${id}`);
};

const goToRequestProfile = (id) => {
  showRequestsDialog.value = false;
  goToFriend(id);
};

const loadIncoming = async () => {
  try {
    const res = await AxiosApi.get("/friendships/incoming");
    const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.Data || [];
    friendRequests.value = list.map(mapFriend);
  } catch (e) {
    friendRequests.value = [];
  }
};

const onFriendsChanged = () => {
  loadFriends();
  loadIncoming();
  loadNotifications();
};
onMounted(() => {
  loadFriends();
  loadIncoming();
  loadNotifications();
  window.addEventListener("buzzup-friends-changed", onFriendsChanged);
  document.addEventListener("click", onDocClick);
});
onUnmounted(() => {
  window.removeEventListener("buzzup-friends-changed", onFriendsChanged);
  document.removeEventListener("click", onDocClick);
  clearTimeout(navSearchTimer);
});

const filteredOnlineFriends = computed(() => {
  const q = friendSearchQuery.value.toLowerCase();
  return friends.value.filter(
    (f) => f.isOnline && f.name.toLowerCase().includes(q),
  );
});

const filteredOfflineFriends = computed(() => {
  const q = friendSearchQuery.value.toLowerCase();
  return friends.value.filter(
    (f) => !f.isOnline && f.name.toLowerCase().includes(q),
  );
});

// const posts = ref([
//   {
//     id: 1,
//     author: "John Doe",
//     content: "Hello, world!",
//     image: "https://via.placeholder.com/400",
//   },
//   { id: 2, author: "Jane Smith", content: "Vue is awesome!", image: "" },
// ]);

const logout = () => {
  store.dispatch("logout");
  router.push("/login");
};
</script>

<style scoped>
/* ===== THEME VARIABLES ===== */
.navbar {
  --nav-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --text-primary: #1c1e21;
  --text-secondary: #65676b;
  --bg-main: #f0f2f5;
  --bg-surface: #fff;
  --bg-hover: #f0f2f5;
  --border-color: #e4e6eb;
  --status-dot-border: #fff;
  --sidebar-bg: #fff;
  --scrollbar-thumb: #d4d4d4;
  --scrollbar-hover: #aaa;
}

/* ===== NAVBAR ===== */
.navbar {
  background: var(--nav-bg);
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
}

.navbar-inner {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-icon {
  color: #ffc107;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.brand-accent {
  color: #ffc107;
}

.navbar-search {
  position: relative;
  flex: 1 1 420px;
  margin: 0 24px;
  max-width: 480px;
}

.nav-search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
  padding: 8px;
  z-index: 20;
  max-height: 360px;
  overflow-y: auto;
}

.nav-search-dropdown.dark-mode {
  background: #1e1e2e;
}

.nav-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
}

.nav-search-row:hover {
  background: rgba(0, 0, 0, 0.05);
}

.nav-search-dropdown.dark-mode .nav-search-row:hover {
  background: #2a2a3e;
}

.nav-search-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nav-search-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.nav-search-dropdown.dark-mode .nav-search-name {
  color: #e2e8f0;
}

.nav-search-handle {
  font-size: 0.75rem;
  color: #64748b;
}

.nav-search-empty {
  padding: 16px 12px;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
}

.search-field {
  color: rgba(255, 255, 255, 0.9) !important;
}

.search-field :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

.search-field :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.5) !important;
}

.search-field :deep(.v-field) {
  color: #fff !important;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nav-action-btn {
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.2s ease;
}

.nav-action-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.nav-divider {
  border-color: rgba(255, 255, 255, 0.15) !important;
  height: 24px !important;
  align-self: center;
}

/* ===== USER AVATAR DROPDOWN ===== */
.user-avatar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px 4px 4px;
  border-radius: 24px;
  transition: background 0.2s ease;
}

.user-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: border-color 0.2s ease;
}



.user-avatar-btn:hover .user-avatar {
  border-color: #ffc107;
}

.avatar-arrow {
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.2s ease;
}

.user-dropdown {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
  margin-top: 8px;
}

.dropdown-profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.dropdown-profile-info {
  display: flex;
  flex-direction: column;
}

.dropdown-profile-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.dropdown-profile-email {
  font-size: 0.8rem;
  opacity: 0.7;
}

.dropdown-list {
  padding: 4px 8px !important;
}

.dropdown-item {
  border-radius: 8px !important;
  margin-bottom: 2px;
}

.dropdown-item :deep(.v-list-item-title) {
  font-size: 0.9rem;
  font-weight: 500;
}

.theme-chip {
  font-size: 0.7rem !important;
  font-weight: 600;
  color: #fff !important;
}

.logout-item {
  color: #e53935 !important;
}

.logout-item :deep(.v-icon) {
  color: #e53935 !important;
}

/* ===== MAIN LAYOUT ===== */
.main-wrapper {
  display: flex;
  min-height: calc(100vh - 64px);
  background: var(--bg-main);
  transition: background 0.3s ease;
}

/* ===== FRIENDS SIDEBAR ===== */
.friends-sidebar {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  padding: 20px 14px;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.friends-sidebar::-webkit-scrollbar {
  width: 5px;
}

.friends-sidebar::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.friends-sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-hover);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sidebar-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.friends-count {
  font-weight: 700;
  font-size: 0.7rem;
}

.sidebar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.sidebar-action-btn {
  color: var(--text-secondary) !important;
  transition: all 0.2s ease;
}

.sidebar-action-btn:hover {
  color: var(--text-primary) !important;
  background: var(--bg-hover) !important;
}

/* ===== FRIEND SEARCH ===== */
.friend-search-wrapper {
  margin-bottom: 14px;
  padding: 2px 0;
}

.friend-search-input :deep(.v-field) {
  font-size: 0.85rem;
}

.search-expand-enter-active,
.search-expand-leave-active {
  transition: all 0.25s ease;
  max-height: 80px;
  opacity: 1;
}

.search-expand-enter-from,
.search-expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0 !important;
  padding: 0 !important;
  overflow: hidden;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: #bec3c9;
  font-size: 0.85rem;
}

/* ===== ACTIVITY STATUS DROPDOWN ===== */
.activity-dropdown {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}

.status-option {
  border-radius: 8px !important;
  margin: 0 6px 2px;
}

.active-status {
  background: rgba(49, 162, 76, 0.1) !important;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

.status-indicator.active {
  background: #31a24c;
}

.status-indicator.away {
  background: #ffc107;
}

.status-indicator.inactive {
  background: #bec3c9;
}

/* ===== SECTION LABELS ===== */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding: 0 8px;
  transition: color 0.3s ease;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-online {
  background: #31a24c;
}

.dot-offline {
  background: #bec3c9;
}

.online-section {
  margin-bottom: 16px;
}

/* ===== FRIEND ITEMS ===== */
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.friend-item:hover {
  background: var(--bg-hover);
}

.friend-item:hover .friend-msg-btn {
  opacity: 1;
}

.friend-item.offline {
  opacity: 0.65;
}

.friend-item.offline:hover {
  opacity: 1;
}

.friend-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.friend-avatar-wrapper .v-avatar img {
  object-fit: cover;
}

.status-dot {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--status-dot-border);
  background: #bec3c9;
  transition: border-color 0.3s ease;
}

.status-dot.online {
  background: #31a24c;
}

.friend-info {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.friend-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.friend-msg-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #0f3460 !important;
  flex-shrink: 0;
}

/* ===== CONTENT AREA ===== */
.content-area {
  flex: 1;
  padding: 24px 32px;
  min-height: calc(100vh - 64px);
  max-width: 900px;
  margin: 0 auto;
}

/* ===== NOTIFICATIONS DROPDOWN ===== */
.notifications-dropdown {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
  margin-top: 8px;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
}

.notif-title {
  font-weight: 700;
  font-size: 1.05rem;
}

.mark-read-btn {
  text-transform: none !important;
  font-weight: 600;
  font-size: 0.78rem !important;
  color: #4dabf7 !important;
  letter-spacing: 0;
}

.notif-list {
  max-height: 360px;
  overflow-y: auto;
  padding: 4px 8px !important;
}

.notif-item {
  border-radius: 10px !important;
  margin-bottom: 2px;
  padding: 10px 12px !important;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notif-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.notif-unread {
  background: rgba(77, 171, 247, 0.08) !important;
}

.notif-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notif-text {
  font-size: 0.85rem;
  line-height: 1.35;
}

.notif-time {
  font-size: 0.75rem;
  color: #65676b;
}

.notif-unread-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4dabf7;
  flex-shrink: 0;
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: #bec3c9;
  font-size: 0.9rem;
}

/* ===== FRIEND REQUESTS DIALOG ===== */
.requests-dialog {
  overflow: hidden;
}

.requests-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.requests-dialog-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.requests-dialog-body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.request-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.02);
  transition: background 0.2s ease;
}

.request-card:hover {
  background: rgba(0, 0, 0, 0.05);
}

.request-card-person {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.request-card-info {
  flex: 1;
  min-width: 0;
}

.request-card-name:hover {
  text-decoration: underline;
}

.request-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  display: block;
}

.req-dialog-btn.accept {
  background: linear-gradient(135deg, #1a1a2e, #0f3460) !important;
  color: #fff !important;
}

.request-card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.req-dialog-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  font-size: 0.8rem !important;
}

.req-dialog-btn.decline {
  opacity: 0.7;
}

.requests-dialog-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  font-size: 0.9rem;
  opacity: 0.6;
}

/* ===== DARK THEME OVERRIDES ===== */
.dark-mode {
  --text-primary: #e4e6eb;
  --text-secondary: #b0b3b8;
  --bg-main: #18191a;
  --bg-surface: #242526;
  --bg-hover: #3a3b3c;
  --border-color: #3e4042;
  --status-dot-border: #242526;
  --sidebar-bg: #242526;
  --scrollbar-thumb: #4a4b4d;
  --scrollbar-hover: #606162;
}

.dark-mode.navbar {
  background: linear-gradient(135deg, #0d0d1a 0%, #111827 50%, #0a1628 100%);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
}

.dark-mode .friend-msg-btn {
  color: #ffc107 !important;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 960px) {
  .friends-sidebar {
    width: 240px;
    min-width: 240px;
    max-width: 240px;
  }

  .content-area {
    padding: 20px 16px;
  }
}

@media (max-width: 600px) {
  .navbar {
    padding: 0 12px;
  }

  .navbar-search {
    display: none;
  }

  .friends-sidebar {
    display: none;
  }

  .content-area {
    padding: 16px;
  }
}
</style>
