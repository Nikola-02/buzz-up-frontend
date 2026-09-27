import AxiosApi from "@/plugins/axios";

export const reactionTypes = [
  { id: 1, name: "Like", emoji: "👍" },
  { id: 2, name: "Love", emoji: "❤️" },
  { id: 3, name: "Haha", emoji: "😂" },
  { id: 4, name: "Wow", emoji: "😮" },
  { id: 5, name: "Sad", emoji: "😢" },
  { id: 6, name: "Angry", emoji: "😠" },
];

export const reactionEmojiByTypeId = (typeId) =>
  reactionTypes.find((type) => type.id === Number(typeId))?.emoji || "👍";

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
      cache = (types.length ? types : reactionTypes).map((type) => ({
        ...type,
        emoji: reactionEmojiByTypeId(type.id),
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
