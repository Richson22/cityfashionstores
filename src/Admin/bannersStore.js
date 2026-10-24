// Demo storage in the browser. When the backend is ready, replace these
// functions with calls to the API.

const KEY = "admin-banners";

export function saveBanners(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

const SEED = [
  {
    tag: "",
    title: ["FITS OVER", "FEELINGS."],
    text: "Style that speaks louder than emotions. Designed for confidence. Built for presence.",
    button: "🛒 SHOP THE DROP",
    link: "/shop",
    image: "/hero-1.jpg",
  },
  {
    tag: "New Arrivals",
    title: ["BUILT", "DIFFERENT.", "WORN BETTER."],
    text: "Streetwear that keeps it clean, sharp, and unapologetic. This is City Fashion Stores.",
    button: "🔥 EXPLORE COLLECTION",
    link: "/shop",
    image: "/hero-2.jpg",
  },
  {
    tag: "NEW ARRIVALS",
    title: ["BUILT DIFFERENT.", "WORN BETTER."],
    text: "Premium fabrics. Timeless fits. Because feelings fade - style doesn't.",
    button: "🌟 SHOP PREMIUM FITS",
    link: "/shop",
    image: "/hero-3.jpg",
  },
  {
    tag: "",
    title: ["SAY LESS.", "WEAR MORE."],
    text: "Your outfit already said it. Fits over feelings - always.",
    button: "🛍️ SHOP STREETWEAR",
    link: "/shop",
    image: "/hero-4.jpg",
  },
];

export function loadBanners() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const first = SEED.map((b, i) => ({ id: i + 1, active: true, ...b }));
  saveBanners(first);
  return first;
}

// the home page asks for its slides here. Nothing saved yet, or every
// banner switched off -> it keeps using its own built-in slides.
export function getHeroSlides(fallback) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const list = JSON.parse(raw).filter((b) => b.active);
    if (!list.length) return fallback;
    return list.map((b) => ({
      tag: b.tag,
      title: b.title,
      text: b.text,
      button: b.button,
      image: b.image,
      link: b.link,
    }));
  } catch {
    return fallback;
  }
}