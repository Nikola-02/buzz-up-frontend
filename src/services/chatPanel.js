import { ref } from "vue";

export const chatPanelUserId = ref(null);

export function openChatWithUser(userId) {
  if (!userId) return;
  chatPanelUserId.value = userId;
}

export function closeChatPanel() {
  chatPanelUserId.value = null;
}
