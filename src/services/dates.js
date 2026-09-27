export const parseApiDate = (value) => {
  if (!value) return null;
  const raw = String(value);
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(raw)) return new Date(raw);
  return new Date(`${raw}Z`);
};

export const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = parseApiDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
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

export const formatTime = formatRelativeTime;
export const formatNotifTime = formatRelativeTime;

export const formatApiDate = (value) => {
  const date = parseApiDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}.`;
};

export const formatApiDateTime = (value) => {
  const date = parseApiDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};
