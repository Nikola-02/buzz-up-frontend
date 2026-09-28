<template>
  <div v-if="chatPanelUserId" class="chat-panel" :class="{ 'dark-mode': isDark }">
    <div class="chat-panel-header">
      <div class="chat-panel-person" @click="goToOtherProfile">
        <v-avatar size="36">
          <img :src="otherUserImageUrl" :alt="otherUserName" />
        </v-avatar>
        <div class="chat-panel-info">
          <span class="chat-panel-name">{{ loading ? "Opening..." : otherUserName }}</span>
          <span v-if="otherUser?.username" class="chat-panel-handle">@{{ otherUser.username }}</span>
        </div>
      </div>
      <v-btn icon variant="text" size="small" class="chat-panel-close" @click="closeChatPanel">
        <v-icon size="18">mdi-close</v-icon>
      </v-btn>
    </div>
    <div ref="messagesContainer" class="chat-panel-body">
      <p v-if="loading" class="chat-panel-placeholder">Opening...</p>
      <p v-else-if="!messages.length" class="chat-panel-placeholder">No messages yet.</p>
      <div
        v-for="message in messages"
        :key="message.id"
        class="chat-bubble-row"
        :class="{ mine: message.isMine }"
      >
        <div class="chat-bubble">
          <span class="chat-bubble-text">{{ message.content }}</span>
          <span class="chat-bubble-time">{{ message.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";
import AxiosApi from "@/plugins/axios";
import { formatTime } from "@/services/dates";
import { chatPanelUserId, closeChatPanel } from "@/services/chatPanel";

const theme = useTheme();
const router = useRouter();
const isDark = computed(() => theme.global.name.value === "dark");

const loading = ref(false);
const otherUser = ref(null);
const messages = ref([]);
const messagesContainer = ref(null);
let openRequestId = 0;

const otherUserName = computed(
  () =>
    `${otherUser.value?.firstName || ""} ${otherUser.value?.lastName || ""}`.trim() ||
    otherUser.value?.username ||
    ""
);
const otherUserImageUrl = computed(
  () => `http://localhost:5001/temp/${otherUser.value?.image || "default.png"}`
);

const mapMessage = (item) => ({
  id: item.id,
  content: item.content,
  isMine: !!(item.isMine ?? item.IsMine),
  time: formatTime(item.createdAt || item.CreatedAt),
});

const scrollMessagesToBottom = async () => {
  await nextTick();
  const container = messagesContainer.value;
  if (!container) return;
  container.scrollTop = container.scrollHeight;
};

const loadOpenedChat = async (otherUserId) => {
  const requestId = ++openRequestId;
  loading.value = true;
  otherUser.value = null;
  messages.value = [];
  try {
    const openedChatRes = await AxiosApi.post("/chats", { userId: otherUserId });
    if (requestId !== openRequestId) return;
    const openedChat = openedChatRes.data;
    otherUser.value = openedChat.otherUser || openedChat.OtherUser;
    const openedChatId = openedChat.id;
    const messagesRes = await AxiosApi.get(`/chats/${openedChatId}/messages`);
    if (requestId !== openRequestId) return;
    const list = Array.isArray(messagesRes.data)
      ? messagesRes.data
      : messagesRes.data.data || messagesRes.data.Data || [];
    messages.value = list.map(mapMessage);
    window.dispatchEvent(new CustomEvent("buzzup-chats-changed"));
    await scrollMessagesToBottom();
  } catch (e) {
    if (requestId !== openRequestId) return;
    closeChatPanel();
  } finally {
    if (requestId === openRequestId) {
      loading.value = false;
    }
  }
};

const goToOtherProfile = () => {
  if (!otherUser.value?.id) return;
  router.push(`/users/${otherUser.value.id}`);
};

watch(
  chatPanelUserId,
  (otherUserId) => {
    if (!otherUserId) {
      openRequestId += 1;
      otherUser.value = null;
      messages.value = [];
      loading.value = false;
      return;
    }
    loadOpenedChat(otherUserId);
  },
  { immediate: true }
);
</script>

<style scoped>
.chat-panel {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 360px;
  height: 480px;
  z-index: 90;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.chat-panel.dark-mode {
  background: #1e1e2e;
  border-color: rgba(255, 255, 255, 0.06);
}

.chat-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 10px 12px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.chat-panel.dark-mode .chat-panel-header {
  border-bottom-color: #334155;
}

.chat-panel-person {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  cursor: pointer;
  flex: 1;
}

.chat-panel-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-panel-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-panel.dark-mode .chat-panel-name {
  color: #e2e8f0;
}

.chat-panel-handle {
  font-size: 0.75rem;
  color: #94a3b8;
}

.chat-panel-close {
  color: #64748b !important;
  flex-shrink: 0;
}

.chat-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-panel-placeholder {
  margin: auto 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

.chat-bubble-row {
  display: flex;
  justify-content: flex-start;
}

.chat-bubble-row.mine {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 78%;
  padding: 8px 12px;
  border-radius: 14px;
  background: #f0f2f5;
}

.chat-panel.dark-mode .chat-bubble {
  background: #2a2a3e;
}

.chat-bubble-row.mine .chat-bubble {
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
}

.chat-bubble-text {
  display: block;
  font-size: 0.88rem;
  line-height: 1.35;
  color: #0f172a;
  word-break: break-word;
}

.chat-panel.dark-mode .chat-bubble-text {
  color: #e2e8f0;
}

.chat-bubble-row.mine .chat-bubble-text {
  color: #fff;
}

.chat-bubble-time {
  display: block;
  margin-top: 4px;
  font-size: 0.68rem;
  color: #94a3b8;
}

.chat-bubble-row.mine .chat-bubble-time {
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 600px) {
  .chat-panel {
    right: 12px;
    left: 12px;
    width: auto;
    height: 70vh;
  }
}
</style>
