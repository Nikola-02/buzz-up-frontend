import AxiosApi from "@/plugins/axios";

/** GET /countries — stavke kao `{ id, name }` u JSON-u. */

function pickId(row) {
  if (!row || typeof row !== "object") return undefined;
  const id = row.id;
  if (id === "" || id === undefined || id === null) return undefined;
  const n = Number(id);
  return Number.isNaN(n) ? id : n;
}

function pickName(row) {
  if (!row || typeof row !== "object") return "";
  const n = row.name;
  return typeof n === "string" ? n.trim() : "";
}

function normalizeCountry(row) {
  if (row == null) return null;
  if (typeof row === "string") {
    const s = row.trim();
    return s ? { id: s, name: s } : null;
  }
  if (typeof row === "object") {
    const id = pickId(row);
    const name = pickName(row);
    if (id === undefined && name) return { id: name, name };
    if (id !== undefined && name) return { id, name };
  }
  return null;
}

function normalizeList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeCountry).filter(Boolean);
  }
  if (typeof raw === "object") {
    if (Array.isArray(raw.data)) return normalizeList(raw.data);
    if (Array.isArray(raw.Data)) return normalizeList(raw.Data);
    if (Array.isArray(raw.countries)) return normalizeList(raw.countries);
    if (Array.isArray(raw.Countries)) return normalizeList(raw.Countries);
  }
  return [];
}

export async function fetchCountries() {
  const res = await AxiosApi.get("/countries");
  const list = normalizeList(res.data);
  const byId = new Map();
  for (const c of list) {
    if (!byId.has(c.id)) byId.set(c.id, c);
  }
  const unique = [...byId.values()];
  unique.sort((a, b) =>
    String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" }),
  );
  return unique;
}

export function normalizeCountryId(raw) {
  if (raw === "" || raw === undefined || raw === null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

/** Ime države za prikaz (npr. `countryName` na user DTO). */
export function countryDisplayName(row) {
  if (row == null || typeof row !== "object") return "";
  if (typeof row.countryName === "string" && row.countryName.trim()) return row.countryName.trim();
  if (typeof row.CountryName === "string" && row.CountryName.trim()) return row.CountryName.trim();
  if (typeof row.country === "string" && row.country.trim()) return row.country.trim();
  const nested = row.country;
  if (nested && typeof nested === "object" && typeof nested.name === "string" && nested.name.trim()) {
    return nested.name.trim();
  }
  return "";
}
