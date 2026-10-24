// Demo storage in the browser. When the backend is ready, replace
// loadCategories() and saveCategories() with calls to the API.
import { CATEGORIES as DEFAULTS } from "./productsStore.js";

const KEY = "admin-categories";

export const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function saveCategories(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function loadCategories() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const first = DEFAULTS.map((c, i) => ({
    id: i + 1,
    slug: c.slug,
    name: c.name,
    image: `/categories/${c.slug === "eyeglasses" ? "glasses" : c.slug}.jpg`,
  }));
  saveCategories(first);
  return first;
}