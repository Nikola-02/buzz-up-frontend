<template>
  <!-- NAVBAR -->
  <nav class="navbar" :class="{ 'dark-mode': isDarkTheme }">
    <div class="navbar-inner">
      <div class="navbar-brand" @click="router.push('/')">
        <v-icon class="brand-icon" size="42">mdi-bee</v-icon>
        <span class="brand-text">Buzz<span class="brand-accent">Up</span></span>
      </div>

      <div class="navbar-search">
        <v-text-field
          density="compact"
          placeholder="Search BuzzUp..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          flat
          hide-details
          bg-color="rgba(255,255,255,0.12)"
          class="search-field"
          rounded
        ></v-text-field>
      </div>

      <div class="navbar-actions">
        <!-- NOTIFICATIONS DROPDOWN -->
        <v-menu v-model="showNotifications" offset-y transition="slide-y-transition" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" class="nav-action-btn" v-bind="props">
              <v-badge v-if="unreadNotifications > 0" color="#ff6b6b" :content="unreadNotifications" :offset-x="-2" :offset-y="-2">
                <v-icon>mdi-bell-outline</v-icon>
              </v-badge>
              <v-icon v-else>mdi-bell-outline</v-icon>
            </v-btn>
          </template>

          <v-card class="notifications-dropdown" min-width="340" max-width="380">
            <div class="notif-header">
              <span class="notif-title">Notifications</span>
              <v-btn variant="text" size="x-small" class="mark-read-btn" @click="markAllRead">
                Mark all as read
              </v-btn>
            </div>
            <v-divider></v-divider>
            <v-list density="compact" class="notif-list" v-if="notifications.length">
              <v-list-item
                v-for="notif in notifications"
                :key="notif.id"
                class="notif-item"
                :class="{ 'notif-unread': !notif.read }"
                @click="notif.read = true"
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
        <v-menu v-model="showUserMenu" offset-y transition="slide-y-transition" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <div class="user-avatar-btn" v-bind="props">
              <v-avatar size="36" class="user-avatar">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="My profile" />
              </v-avatar>
              <v-icon size="16" class="avatar-arrow">mdi-chevron-down</v-icon>
            </div>
          </template>

          <v-card class="user-dropdown" min-width="240">
            <!-- Profile header -->
            <div class="dropdown-profile-header">
              <v-avatar size="48">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="My profile" />
              </v-avatar>
              <div class="dropdown-profile-info">
                <span class="dropdown-profile-name">Alex Thompson</span>
                <span class="dropdown-profile-email">alex@buzzup.com</span>
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

              <!-- Theme toggle -->
              <v-list-item class="dropdown-item" @click="toggleTheme">
                <template v-slot:prepend>
                  <v-icon size="20">{{ isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
                </template>
                <v-list-item-title>Theme</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="x-small" :color="isDarkTheme ? '#ffc107' : '#1a1a2e'" variant="flat" class="theme-chip">
                    {{ isDarkTheme ? 'Dark' : 'Light' }}
                  </v-chip>
                </template>
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
          <v-chip size="x-small" color="#ffc107" variant="flat" class="friends-count">
            {{ friends.length }}
          </v-chip>
        </div>
        <div class="sidebar-actions">
          <!-- Friend requests button -->
          <v-btn icon variant="text" size="small" class="sidebar-action-btn" @click="showRequestsDialog = true">
            <v-badge v-if="friendRequests.length" color="#ff6b6b" :content="friendRequests.length" :offset-x="-2" :offset-y="-2">
              <v-icon size="20">mdi-account-plus-outline</v-icon>
            </v-badge>
            <v-icon v-else size="20">mdi-account-plus-outline</v-icon>
          </v-btn>
          <!-- Search toggle -->
          <v-btn icon variant="text" size="small" class="sidebar-action-btn" @click="toggleFriendSearch">
            <v-icon size="20">mdi-magnify</v-icon>
          </v-btn>
          <!-- Activity status menu -->
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn icon variant="text" size="small" class="sidebar-action-btn" v-bind="props">
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
                    <v-icon v-if="myStatus === status.value" size="18" color="#31a24c">mdi-check</v-icon>
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
            <v-btn icon variant="text" size="small" class="friend-msg-btn">
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
            <v-btn icon variant="text" size="small" class="friend-msg-btn">
              <v-icon size="18">mdi-message-text-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- No results -->
      <div v-if="showFriendSearch && !filteredOnlineFriends.length && !filteredOfflineFriends.length" class="no-results">
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
        <v-btn icon variant="text" size="small" @click="showRequestsDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider></v-divider>
      <div class="requests-dialog-body" v-if="friendRequests.length">
        <div
          v-for="req in friendRequests"
          :key="req.id"
          class="request-card"
        >
          <v-avatar size="50">
            <img :src="req.avatar" :alt="req.name" />
          </v-avatar>
          <div class="request-card-info">
            <span class="request-card-name">{{ req.name }}</span>
            <span class="request-card-mutual">{{ req.mutualFriends }} mutual friends</span>
          </div>
          <div class="request-card-actions">
            <v-btn size="small" color="#0f3460" variant="flat" class="req-dialog-btn" rounded @click="acceptRequest(req.id)">
              Accept
            </v-btn>
            <v-btn size="small" variant="tonal" class="req-dialog-btn decline" rounded @click="declineRequest(req.id)">
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useTheme } from "vuetify";

const router = useRouter();
const store = useStore();
const theme = useTheme();

// User menu dropdown
const showUserMenu = ref(false);

const goToProfile = () => {
  showUserMenu.value = false;
  router.push("/profile");
};

// Theme
const isDarkTheme = computed(() => theme.global.name.value === "dark");
const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === "light" ? "dark" : "light";
};

// Notifications
const showNotifications = ref(false);
const notifications = ref([
  {
    id: 1,
    name: "Jane Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    action: "liked your post.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    action: "sent you a friend request.",
    time: "15 min ago",
    read: false,
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    action: "commented on your photo.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    action: "shared your post.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    name: "Sarah Brown",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    action: "started following you.",
    time: "Yesterday",
    read: true,
  },
]);

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

const markAllRead = () => {
  notifications.value.forEach(n => { n.read = true; });
};

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
const friendRequests = ref([
  {
    id: 101,
    name: "David Kim",
    avatar: "https://randomuser.me/api/portraits/men/15.jpg",
    mutualFriends: 3,
  },
  {
    id: 102,
    name: "Lisa Wang",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    mutualFriends: 7,
  },
  {
    id: 103,
    name: "Tom Harris",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    mutualFriends: 1,
  },
]);

const acceptRequest = (id) => {
  friendRequests.value = friendRequests.value.filter(r => r.id !== id);
};

const declineRequest = (id) => {
  friendRequests.value = friendRequests.value.filter(r => r.id !== id);
};

const friends = ref([
  {
    id: 1,
    name: "John Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    isOnline: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    isOnline: true,
  },
  {
    id: 3,
    name: "Mike Johnson",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    isOnline: false,
  },
  {
    id: 4,
    name: "Emily Davis",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    isOnline: true,
  },
  {
    id: 5,
    name: "Chris Wilson",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    isOnline: false,
  },
  {
    id: 6,
    name: "Sarah Brown",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    isOnline: false,
  },
]);

const filteredOnlineFriends = computed(() => {
  const q = friendSearchQuery.value.toLowerCase();
  return friends.value.filter(f => f.isOnline && f.name.toLowerCase().includes(q));
});

const filteredOfflineFriends = computed(() => {
  const q = friendSearchQuery.value.toLowerCase();
  return friends.value.filter(f => !f.isOnline && f.name.toLowerCase().includes(q));
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
  flex: 1 1 420px;
  margin: 0 24px;
  max-width: 480px;
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

.request-card-info {
  flex: 1;
  min-width: 0;
}

.request-card-name {
  font-size: 0.92rem;
  font-weight: 700;
  display: block;
}

.request-card-mutual {
  font-size: 0.78rem;
  opacity: 0.6;
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
