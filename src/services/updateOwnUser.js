import AxiosApi from "@/plugins/axios";
import { store } from "@/store/store";
import { normalizeCountryId } from "@/services/countries";

export async function updateOwnUser(patch = {}) {
  const userId = store.getters.getUser?.id;
  if (!userId) return null;

  const res = await AxiosApi.get(`/users/${userId}`);
  const data = res.data;
  const payload = {
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    email: data.email,
    password: Object.prototype.hasOwnProperty.call(patch, "password")
      ? patch.password
      : null,
    bio: data.bio || null,
    countryId: normalizeCountryId(data.countryId ?? data.CountryId),
    city: data.city || null,
    workplace: data.workplace || null,
    university: data.university || null,
    dateOfBirth: data.dateOfBirth || null,
    website: data.website || null,
    image: data.image || null,
    isPrivate: Object.prototype.hasOwnProperty.call(patch, "isPrivate")
      ? !!patch.isPrivate
      : !!data.isPrivate,
  };

  await AxiosApi.put(`/users/${userId}`, payload);
  const fresh = await AxiosApi.get(`/users/${userId}`);
  store.commit("setProfile", fresh.data);
  return fresh.data;
}
