<template>
  <div class="comment-thread">
    <div class="comment-row">
      <v-avatar size="32" class="comment-avatar-hit" @click="$emit('author-click', comment)">
        <img :src="comment.authorAvatar" :alt="comment.authorName" />
      </v-avatar>
      <div class="comment-body">
        <div class="comment-bubble">
          <button type="button" class="comment-author" @click="$emit('author-click', comment)">
            {{ comment.authorName }}
          </button>
          <form v-if="isEditing" class="comment-edit-form" @submit.prevent="saveEdit">
            <input
              ref="editInput"
              v-model="editText"
              class="comment-input"
              type="text"
              maxlength="2000"
              :disabled="posting"
            />
            <button class="comment-send" type="submit" :disabled="!editText.trim() || posting">Save</button>
            <button type="button" class="comment-reply-btn" :disabled="posting" @click="cancelEdit">Cancel</button>
          </form>
          <p v-else class="comment-text">{{ comment.content }}</p>
        </div>
        <div class="comment-meta">
          <span class="comment-time">{{ comment.time }}</span>
          <button type="button" class="comment-reply-btn" @click="toggleReply">Reply</button>
          <button v-if="canEdit" type="button" class="comment-reply-btn" @click="startEdit">Edit</button>
          <button v-if="canDelete" type="button" class="comment-reply-btn" @click="confirmDelete">Delete</button>
        </div>
        <form v-if="showReply" class="comment-composer comment-composer-reply" @submit.prevent="submitReply">
          <v-avatar size="24">
            <img :src="myAvatar" alt="Me" />
          </v-avatar>
          <input
            ref="replyInput"
            v-model="replyText"
            class="comment-input"
            type="text"
            maxlength="2000"
            :placeholder="`Reply to ${comment.authorName}...`"
            :disabled="posting"
          />
          <button class="comment-send" type="submit" :disabled="!replyText.trim() || posting">
            Post
          </button>
        </form>
        <div v-if="comment.replies?.length" class="comment-replies">
          <CommentThread
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :my-avatar="myAvatar"
            :posting="posting"
            :current-user-id="currentUserId"
            :post-author-id="postAuthorId"
            @author-click="$emit('author-click', $event)"
            @reply="$emit('reply', $event)"
            @edit="$emit('edit', $event)"
            @ask-delete="$emit('ask-delete', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import CommentThread from "@/components/CommentThread.vue";

const props = defineProps({
  comment: { type: Object, required: true },
  myAvatar: { type: String, required: true },
  posting: { type: Boolean, default: false },
  currentUserId: { type: Number, default: null },
  postAuthorId: { type: Number, default: null },
});

const emit = defineEmits(["author-click", "reply", "edit", "ask-delete"]);

const showReply = ref(false);
const isEditing = ref(false);
const replyText = ref("");
const editText = ref("");
const replyInput = ref(null);
const editInput = ref(null);

const canEdit = computed(() => props.comment.userId === props.currentUserId);
const canDelete = computed(
  () => props.comment.userId === props.currentUserId || props.postAuthorId === props.currentUserId
);

const toggleReply = async () => {
  showReply.value = !showReply.value;
  if (showReply.value) {
    await nextTick();
    replyInput.value?.focus();
  }
};

const submitReply = () => {
  const content = replyText.value.trim();
  if (!content) return;
  emit("reply", { parentId: props.comment.id, content });
  replyText.value = "";
  showReply.value = false;
};

const startEdit = async () => {
  isEditing.value = true;
  showReply.value = false;
  editText.value = props.comment.content;
  await nextTick();
  editInput.value?.focus();
};

const cancelEdit = () => {
  isEditing.value = false;
  editText.value = props.comment.content;
};

const saveEdit = () => {
  const content = editText.value.trim();
  if (!content || content === props.comment.content) {
    cancelEdit();
    return;
  }
  emit("edit", { commentId: props.comment.id, content });
  isEditing.value = false;
};

const confirmDelete = () => {
  emit("ask-delete", props.comment);
};
</script>

<style scoped>
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
  flex: 1;
}

.comment-bubble {
  background: var(--hover-bg, #f1f5f9);
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
  color: var(--text-primary, #0f172a);
  cursor: pointer;
}

.comment-text {
  margin: 2px 0 0;
  font-size: 0.88rem;
  color: var(--text-primary, #0f172a);
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
  padding-left: 12px;
}

.comment-time {
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
}

.comment-reply-btn {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary, #64748b);
  cursor: pointer;
}

.comment-composer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.comment-input {
  flex: 1;
  min-width: 0;
  border: none;
  border-radius: 18px;
  background: var(--hover-bg, #f1f5f9);
  color: var(--text-primary, #0f172a);
  padding: 8px 14px;
  font-size: 0.88rem;
  outline: none;
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

.comment-edit-form {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.comment-replies {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: 8px;
  border-left: 2px solid var(--divider, #e2e8f0);
}
</style>
