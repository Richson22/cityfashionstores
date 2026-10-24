// Demo storage in the browser. When the backend is ready, replace
// getSettings() and saveSettings() with calls to the API.

const KEY = "admin-settings";

export const DEFAULTS = {
  storeName: "City Fashion Stores",
  tagline: "Fits Over Feelings",
  email: "",
  phone: "",
  whatsapp: "234XXXXXXXXXX", // country code first, no + and no spaces
  address: "",
  deliveryNote: "Delivered in 3–4 business days across Nigeria",
  paystackOn: false,
  paystackKey: "", // PUBLIC key only (starts with pk_)
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/",
  facebook: "https://facebook.com/",
  announceOn: false,
  announceText: "🔥 Get 10% OFF your first order — use code SAVE10",
  announceLink: "/shop",
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}