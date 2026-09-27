<template>
  <div class="reaction-wrap">
    <v-menu
      v-model="showPicker"
      open-on-hover
      :open-on-click="false"
      location="top"
      :close-on-content-click="false"
      offset="8"
    >
      <template #activator="{ props: menuProps }">
        <button
          class="action-btn"
          :class="{ 'is-reacted': !!viewerReactionTypeId }"
          v-bind="menuProps"
          :disabled="busy"
          @click.stop="onLikeClick"
        >
          <span class="reaction-btn-emoji">{{ buttonEmoji }}</span>
          <span>{{ buttonLabel }}</span>
        </button>
      </template>
      <div class="reaction-picker" :class="{ 'dark-mode': isDark }" @click.stop>
        <button
          v-for="type in types"
          :key="type.id"
          type="button"
          class="reaction-pick"
          :class="{ active: viewerReactionTypeId === type.id }"
          :title="type.name"
          @click="react(type)"
        >
          <span class="reaction-pick-emoji">{{ type.emoji }}</span>
        </button>
      </div>
    </v-menu>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";
import AxiosApi from "@/plugins/axios";
import { loadReactionTypes, reactionEmojiByTypeId, uniqueReactionEmojis } from "@/services/reactionTypes";

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === "dark");

const props = defineProps({
  post: { type: Object, required: true },
});

const emit = defineEmits(["reaction-changed"]);

const types = ref([]);
const busy = ref(false);
const showPicker = ref(false);
const likesCount = ref(0);
const viewerReactionTypeId = ref(null);
const viewerReactionName = ref("");
const usedReactionTypeIds = ref([]);

const syncFromPost = () => {
  likesCount.value = props.post.likes || 0;
  viewerReactionTypeId.value = props.post.myReactionTypeId ?? null;
  viewerReactionName.value = props.post.myReactionName || "";
  usedReactionTypeIds.value = [...(props.post.usedReactionTypeIds || [])];
};

watch(
  () => [
    props.post.id,
    props.post.likes,
    props.post.myReactionTypeId,
    props.post.myReactionName,
    props.post.usedReactionTypeIds,
  ],
  syncFromPost,
  { immediate: true }
);

const likeType = computed(() => types.value.find((t) => t.name === "Like") || types.value[0]);

const buttonLabel = computed(() => viewerReactionName.value || "Like");
const buttonEmoji = computed(() =>
  viewerReactionTypeId.value ? reactionEmojiByTypeId(viewerReactionTypeId.value) : "👍"
);

onMounted(async () => {
  types.value = await loadReactionTypes();
});

const snapshot = (likes, typeId, typeName, typeIds) => ({
  likes,
  myReactionTypeId: typeId,
  myReactionName: typeName,
  usedReactionTypeIds: typeIds,
  usedReactionEmojis: uniqueReactionEmojis(typeIds),
});

const currentReaction = () =>
  snapshot(
    likesCount.value,
    viewerReactionTypeId.value,
    viewerReactionName.value,
    [...usedReactionTypeIds.value]
  );

const nextUsedTypeIds = (previousTypeId, nextTypeId, nextLikes) => {
  if (nextLikes === 0) return [];
  const typeIds = usedReactionTypeIds.value.filter((typeId) => typeId !== previousTypeId);
  if (nextTypeId && !typeIds.includes(nextTypeId)) {
    typeIds.push(nextTypeId);
  }
  return typeIds;
};

const publishReaction = (nextReaction) => {
  likesCount.value = nextReaction.likes;
  viewerReactionTypeId.value = nextReaction.myReactionTypeId;
  viewerReactionName.value = nextReaction.myReactionName;
  usedReactionTypeIds.value = nextReaction.usedReactionTypeIds || [];
  emit("reaction-changed", nextReaction);
};

const nextReactionAfterClick = (chosenType) => {
  const previousTypeId = viewerReactionTypeId.value;
  const alreadyHasReaction = !!previousTypeId;
  const clickedSameType = alreadyHasReaction && chosenType && previousTypeId === chosenType.id;
  if (!chosenType || clickedSameType) {
    const nextLikes = Math.max(0, likesCount.value - (alreadyHasReaction ? 1 : 0));
    return snapshot(nextLikes, null, "", nextUsedTypeIds(previousTypeId, null, nextLikes));
  }
  const nextLikes = alreadyHasReaction ? likesCount.value : likesCount.value + 1;
  return snapshot(
    nextLikes,
    chosenType.id,
    chosenType.name,
    nextUsedTypeIds(previousTypeId, chosenType.id, nextLikes)
  );
};

const applyServerReactionSummary = (item) => {
  if (!item) return;
  publishReaction(
    snapshot(
      item.reactionCount ?? 0,
      item.myReactionTypeId ?? null,
      item.myReactionName || "",
      item.usedReactionTypeIds || []
    )
  );
};

const react = async (type) => {
  if (!props.post.id || busy.value || !type) return;
  busy.value = true;
  showPicker.value = false;
  const reactionBeforeRequest = currentReaction();
  publishReaction(nextReactionAfterClick(type));
  try {
    await AxiosApi.post(`/posts/${props.post.id}/reactions`, { reactionTypeId: type.id });
    const res = await AxiosApi.get(`/posts/${props.post.id}`);
    applyServerReactionSummary(res.data);
  } catch (e) {
    publishReaction(reactionBeforeRequest);
  } finally {
    busy.value = false;
  }
};

const onLikeClick = () => {
  if (viewerReactionTypeId.value) {
    const currentType = types.value.find((t) => t.id === viewerReactionTypeId.value);
    react(currentType || likeType.value);
    return;
  }
  react(likeType.value);
};
</script>

<style scoped>
.reaction-wrap {
  flex: 1;
}

.action-btn {
  width: 100%;
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

.action-btn:hover,
.action-btn.is-reacted {
  background: var(--action-hover, rgba(0, 0, 0, 0.04));
  color: var(--text-primary, #0f172a);
}

.reaction-btn-emoji {
  font-size: 1.2rem;
  line-height: 1;
}

.reaction-picker {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

.reaction-picker.dark-mode {
  background: #1e1e2e;
}

.reaction-pick {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, background 0.15s ease;
}

.reaction-pick:hover {
  transform: scale(1.2);
  background: var(--action-hover, rgba(0, 0, 0, 0.04));
}

.reaction-pick.active {
  background: var(--action-hover, rgba(0, 0, 0, 0.08));
}

.reaction-pick-emoji {
  font-size: 1.35rem;
  line-height: 1;
}
</style>
