// Edit this file to change the store details, categories and products.
// To use real photos, put images in /public and set `image: "/your-photo.jpg"` on a product.

export const STORE = {
  name: "City Fashion Stores",
  whatsapp: "2340000000000", // replace with your number, country code first, no + or spaces
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/",
  facebook: "https://www.facebook.com/",
  email: "hello@cityfashionstores.com",
  promoCode: "SAVE10",
};

export const CATEGORIES = [
  { id: "tshirts", label: "T-Shirts", emoji: "👕" },
  { id: "jeans", label: "Jeans", emoji: "👖" },
  { id: "jackets", label: "Jackets", emoji: "🧥" },
  { id: "hoodies", label: "Hoodies", emoji: "🧶" },
  { id: "sneakers", label: "Sneakers", emoji: "👟" },
  { id: "slides", label: "Slides", emoji: "🩴" },
  { id: "caps", label: "Caps", emoji: "🧢" },
  { id: "bags", label: "Bags", emoji: "🎒" },
];

export const PRODUCTS = [
  { id: 1, name: "Graphic Pocket T-Shirt", price: 14300, category: "tshirts", tag: "New", colors: 2 },
  { id: 2, name: "Oversized Street Tee", price: 14300, category: "tshirts", colors: 3 },
  { id: 3, name: "Baggy Jeans with Studs", price: 23400, category: "jeans", tag: "Hot" },
  { id: 4, name: "Distressed Baggy Jeans", price: 23400, category: "jeans" },
  { id: 5, name: "Contrast Collar Jacket", price: 35100, category: "jackets", colors: 5 },
  { id: 6, name: "Olive Bomber Jacket", price: 32500, category: "jackets" },
  { id: 7, name: "Zip-Up Graphic Hoodie", price: 27300, category: "hoodies", tag: "New", colors: 3 },
  { id: 8, name: "Cropped Sweatshirt", price: 26000, category: "hoodies", colors: 5 },
  { id: 9, name: "Classic Court Sneakers", price: 58500, category: "sneakers", tag: "Hot" },
  { id: 10, name: "Retro Runner Sneakers", price: 65000, category: "sneakers" },
  { id: 11, name: "Cross-Strap Slides", price: 37700, category: "slides" },
  { id: 12, name: "Everyday Slides", price: 19500, category: "slides", colors: 2 },
  { id: 13, name: "Boucle Beanie", price: 7200, category: "caps", colors: 3 },
  { id: 14, name: "Embellished Knit Cap", price: 7200, category: "caps" },
  { id: 15, name: "Leather Duffel Bag", price: 36400, category: "bags", colors: 4 },
  { id: 16, name: "Street Backpack", price: 36400, category: "bags", colors: 4 },
];

export const naira = (n) => "₦" + n.toLocaleString("en-NG");
