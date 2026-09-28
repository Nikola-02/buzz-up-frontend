import AxiosApi from "@/plugins/axios";

export const reactionTypes = [
  { id: 1, name: "Like", emoji: "👍" },
  { id: 2, name: "Love", emoji: "❤️" },
  { id: 3, name: "Haha", emoji: "😂" },
  { id: 4, name: "Wow", emoji: "😮" },
  { id: 5, name: "Sad", emoji: "😢" },
  { id: 6, name: "Angry", emoji: "😠" },
];

const isMdiName = (value) =>
  typeof value === "string" && value.trim().toLowerCase().startsWith("mdi-");

const hardcodedEmoji = (typeId) =>
  reactionTypes.find((type) => type.id === Number(typeId))?.emoji || "";

const pickEmoji = (...candidates) => {
  for (const candidate of candidates) {
    if (candidate && !isMdiName(candidate)) return candidate;
  }
  return "";
};

export const reactionEmojiByTypeId = (typeId) => {
  const id = Number(typeId);
  const fromCache = cache?.find((type) => Number(type.id) === id);
  return (
    pickEmoji(fromCache?.emoji, fromCache?.icon, hardcodedEmoji(id)) || "👍"
  );
};

export const uniqueReactionEmojis = (typeIds) => {
  const seen = [];
  for (const typeId of typeIds || []) {
    const emoji = reactionEmojiByTypeId(typeId);
    if (emoji && !seen.includes(emoji)) seen.push(emoji);
  }
  return seen;
};

let cache = null;
let pending = null;

export const loadReactionTypes = async () => {
  if (cache) return cache;
  if (pending) return pending;
  pending = AxiosApi.get("/reactionTypes")
    .then((res) => {
      const types = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const source = types.length ? types : reactionTypes;
      cache = source.map((type) => ({
        ...type,
        emoji:
          pickEmoji(type.emoji, type.icon, hardcodedEmoji(type.id)) || "👍",
      }));
      return cache;
    })
    .catch(() => {
      cache = reactionTypes;
      return cache;
    })
    .finally(() => {
      pending = null;
    });
  return pending;
};
