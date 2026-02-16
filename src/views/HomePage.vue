<template>
  <div class="home-feed" :class="{ 'dark-mode': isDark }">
    <!-- Create post -->
    <div class="create-post-card">
      <div class="create-post-top">
        <v-avatar size="44" class="create-avatar">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Me" />
        </v-avatar>
        <div class="create-post-input">
          What's buzzing, Alex?
        </div>
      </div>
      <div class="create-post-bottom">
        <button class="create-action">
          <v-icon size="20" color="#f44336">mdi-image-outline</v-icon>
          <span>Photo</span>
        </button>
        <button class="create-action">
          <v-icon size="20" color="#4dabf7">mdi-video-outline</v-icon>
          <span>Video</span>
        </button>
        <button class="create-action">
          <v-icon size="20" color="#ffc107">mdi-emoticon-happy-outline</v-icon>
          <span>Feeling</span>
        </button>
      </div>
    </div>

    <!-- Posts feed -->
    <div
      v-for="post in posts"
      :key="post.id"
      class="post-card"
    >
      <!-- Post header -->
      <div class="post-top">
        <v-avatar size="44">
          <img :src="post.authorAvatar" :alt="post.authorName" />
        </v-avatar>
        <div class="post-meta">
          <span class="post-author">{{ post.authorName }}</span>
          <span class="post-timestamp">
            <v-icon size="12">mdi-clock-outline</v-icon>
            {{ post.time }}
          </span>
        </div>
        <button class="post-options-btn">
          <v-icon size="20">mdi-dots-horizontal</v-icon>
        </button>
      </div>

      <!-- Post body -->
      <p class="post-body">{{ post.content }}</p>

      <!-- Post image -->
      <div v-if="post.image" class="post-image-wrapper">
        <img :src="post.image" class="post-image" />
      </div>

      <!-- Reactions bar -->
      <div class="reactions-bar">
        <div class="reactions-left">
          <div class="reaction-icons">
            <span class="reaction-emoji">❤️</span>
            <span class="reaction-emoji">👍</span>
          </div>
          <span class="reaction-count">{{ post.likes }}</span>
        </div>
        <div class="reactions-right">
          <span>{{ post.comments }} comments</span>
        </div>
      </div>

      <!-- Action buttons -->
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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");

const posts = ref([
  {
    id: 1,
    authorName: "Jane Smith",
    authorAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    content: "Just finished reading an amazing book about clean architecture. Highly recommend it to all devs out there!",
    image: "",
    time: "25 min ago",
    likes: 18,
    comments: 4,
  },
  {
    id: 2,
    authorName: "John Doe",
    authorAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    content: "Weekend vibes in Belgrade. Perfect weather for a walk along the river.",
    image: "https://images.unsplash.com/photo-1580910527040-c28c3db8c95a?w=600&h=400&fit=crop",
    time: "1 hour ago",
    likes: 42,
    comments: 7,
  },
  {
    id: 3,
    authorName: "Emily Davis",
    authorAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
    content: "Excited to announce that I've joined TechCo as a senior designer! New chapter, new challenges. Let's go!",
    image: "",
    time: "3 hours ago",
    likes: 89,
    comments: 23,
  },
  {
    id: 4,
    authorName: "Chris Wilson",
    authorAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
    content: "Made this pasta from scratch today. Turns out I'm a better cook than I thought!",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    time: "5 hours ago",
    likes: 35,
    comments: 11,
  },
  {
    id: 5,
    authorName: "Sarah Brown",
    authorAvatar: "https://randomuser.me/api/portraits/women/6.jpg",
    content: "Just deployed my first open-source project! Check it out on GitHub. Would love some feedback from the community.",
    image: "",
    time: "Yesterday",
    likes: 56,
    comments: 15,
  },
  {
    id: 6,
    authorName: "Mike Johnson",
    authorAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
    content: "Morning coffee and code. Name a better duo.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
    time: "Yesterday",
    likes: 27,
    comments: 3,
  },
]);
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
  margin-top: 16px;
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
  transition: color 0.3s ease;
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
  font-size: 0.85rem;
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
