// Demo storage in the browser. When the backend is ready, replace these
// functions with calls to the API (GET orders, PUT status, POST new order).

const KEY = "admin-orders";

export const STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

export function saveOrders(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

const PEOPLE = [
  ["Chinedu Okafor", "08012345678", "chinedu@example.com", "Lagos", "Ikeja", "12 Allen Avenue, Ikeja"],
  ["Amaka Eze", "08098765432", "amaka@example.com", "Anambra", "Awka", "5 Zik Avenue, Awka"],
  ["Tunde Bello", "07033221100", "tunde@example.com", "Oyo", "Ibadan", "22 Ring Road, Ibadan"],
  ["Ngozi Umeh", "08155667788", "ngozi@example.com", "Enugu", "Independence Layout", "14 Ogui Road, Enugu"],
  ["Ibrahim Musa", "09011223344", "ibrahim@example.com", "FCT Abuja", "Wuse 2", "Plot 8, Aminu Kano Crescent, Wuse 2"],
  ["Folake Adeyemi", "08077889900", "folake@example.com", "Ogun", "Abeokuta", "3 Oke-Ilewo Road, Abeokuta"],
];

const ITEMS = [
  { id: 1, name: "Scott Made It Polo Shirt", price: 22100, size: "L", color: "Blue", image: "/products/shirt-1.jpg" },
  { id: 2, name: "Tan Baggy Jeans with Embroidery", price: 23400, size: "XL", color: null, image: "/products/jeans-1.jpg" },
  { id: 3, name: "Nice Day Bunny Pocket T-Shirt", price: 14300, size: "M", color: "Black", image: "/products/tee-1.jpg" },
  { id: 4, name: "Retro Football Jersey", price: 18500, size: "L", color: "Red", image: "/products/jersey-1.jpg" },
  { id: 5, name: "Chunky Street Sneakers", price: 38500, size: "43", color: "White", image: "/products/shoes-1.jpg" },
  { id: 6, name: "Embroidered Baseball Cap", price: 7500, size: null, color: "Black", image: "/products/cap-1.jpg" },
];

const FLOW = ["Pending", "Paid", "Shipped", "Delivered", "Delivered", "Cancelled", "Paid", "Delivered", "Shipped", "Delivered", "Pending", "Delivered"];

function seed() {
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => {
    const p = PEOPLE[i % PEOPLE.length];
    const items = Array.from({ length: 1 + (i % 3) }, (__, k) => ({
      ...ITEMS[(i + k * 2) % ITEMS.length],
      qty: 1 + ((i + k) % 2),
    }));
    return {
      no: 1012 - i,
      items,
      customer: { name: p[0], phone: p[1], email: p[2], state: p[3], city: p[4], address: p[5], note: i % 4 === 0 ? "Call me before you arrive" : "" },
      total: items.reduce((n, it) => n + it.price * it.qty, 0),
      method: i % 3 === 0 ? "Paystack" : "WhatsApp",
      status: FLOW[i % FLOW.length],
      createdAt: now - (i * 9 + 2) * 3600000,
    };
  });
}

export function loadOrders() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const first = seed();
  saveOrders(first);
  return first;
}

// called by the store's cart when a customer places an order
export function placeOrder({ items, customer, total, method }) {
  const list = loadOrders();
  const no = list.reduce((m, o) => Math.max(m, o.no), 1000) + 1;
  const order = {
    no,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      size: i.size || null,
      color: i.color || null,
      image: i.image || "",
    })),
    customer,
    total,
    method,
    status: "Pending",
    createdAt: Date.now(),
  };
  saveOrders([order, ...list]);
  return order;
}