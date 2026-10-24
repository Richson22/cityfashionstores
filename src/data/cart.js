import { useEffect, useState } from "react";

const KEY = "cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function save(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {}
  window.dispatchEvent(new Event("cart-change"));
}

// the same product in another size or color is its own line
const same = (x, id, size, color) =>
  x.id === id && (x.size || null) === (size || null) && (x.color || null) === (color || null);

export function addToCart(item) {
  const cart = getCart();
  const i = cart.findIndex((x) => same(x, item.id, item.size, item.color));
  if (i > -1) cart[i].qty += item.qty || 1;
  else cart.push({ ...item, qty: item.qty || 1 });
  save(cart);
}

export function setQty(id, size, qty, color = null) {
  const cart = getCart()
    .map((x) => (same(x, id, size, color) ? { ...x, qty } : x))
    .filter((x) => x.qty > 0);
  save(cart);
}

export function removeFromCart(id, size, color = null) {
  save(getCart().filter((x) => !same(x, id, size, color)));
}

export function clearCart() {
  save([]);
}

export function useCart() {
  const [cart, setCart] = useState(getCart);
  useEffect(() => {
    const sync = () => setCart(getCart());
    window.addEventListener("cart-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return cart;
}

export function useCartCount() {
  return useCart().reduce((n, i) => n + i.qty, 0);
}