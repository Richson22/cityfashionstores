// Demo storage in the browser. When the backend is ready, replace
// loadProducts() and saveProducts() with calls to the API (GET / POST / PUT / DELETE).

const KEY = "admin-products";

export const CATEGORIES = [
  { slug: "armless", name: "Armless" },
  { slug: "bags", name: "Bags" },
  { slug: "belts", name: "Belts" },
  { slug: "boxers", name: "Boxers" },
  { slug: "caps", name: "Caps" },
  { slug: "eyeglasses", name: "Eyeglasses" },
  { slug: "hoodies", name: "Hoodies" },
  { slug: "jackets", name: "Jackets" },
  { slug: "jeans", name: "Jeans" },
  { slug: "jerseys", name: "Jerseys" },
  { slug: "joggers", name: "Joggers" },
  { slug: "polos", name: "Polos" },
  { slug: "shirts", name: "Shirts" },
  { slug: "shoes", name: "Shoes" },
  { slug: "sneakers", name: "Sneakers" },
  { slug: "tees", name: "T-shirts" },
  { slug: "trousers", name: "Trousers" },
];

export const CLOTHES = ["S", "M", "L", "XL", "XXL"];
export const SHOES = ["40", "41", "42", "43", "44", "45"];
const NO_SIZE = ["caps", "bags", "belts", "eyeglasses"];

export function sizesFor(slug) {
  if (!slug || NO_SIZE.includes(slug)) return [];
  return ["shoes", "sneakers"].includes(slug) ? SHOES : CLOTHES;
}

const IMG = { tees: "tee", shirts: "shirt", boxers: "boxer", jerseys: "jersey", eyeglasses: "glasses", caps: "cap" };
const PAL = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#ffffff" },
  { name: "Red", hex: "#e53935" },
  { name: "Blue", hex: "#1e6bff" },
];

function seed() {
  let id = 0;
  return CATEGORIES.flatMap((c, ci) =>
    [1, 2].map((i) => {
      id += 1;
      const img = `/products/${IMG[c.slug] || c.slug}-${i}.jpg`;
      return {
        id,
        name: `${c.name} Style ${i}`,
        category: c.slug,
        price: 7500 + ((ci * 3 + i * 5) % 12) * 1500,
        stock: [0, 2, 5, 12, 30][(ci + i) % 5],
        details: "",
        sizes: sizesFor(c.slug),
        colors: i % 2 === 0 ? PAL.slice(0, 2 + (ci % 3)) : [],
        images: [img],
        image: img,
        featured: i === 1,
        soldOut: (ci + i) % 9 === 0,
        visible: true,
        createdAt: Date.now() - id * 3600000,
      };
    })
  );
}

export function saveProducts(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function loadProducts() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const first = seed();
  saveProducts(first);
  return first;
}