import { useEffect, useState } from "react";
import { api } from "./api.js";

const EMPTY = { categories: [], products: [], latest: [], rows: [] };

function buildCatalog(all, cats) {
  const products = all.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image || (p.images && p.images[0]) || "",
    images: p.images && p.images.length ? p.images : undefined,
    colors: (p.colors || []).map((c) => c.hex), // for the small color dots
    colorOptions: p.colors && p.colors.length ? p.colors : undefined, // with names
    sizes: p.sizes,
    details: p.details,
    featured: p.featured,
    soldOut: p.soldOut || p.stock <= 0,
    stock: p.stock,
    createdAt: p.createdAt,
  }));

  const counts = {};
  products.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });

  const categories = cats.map((c) => ({
    name: c.name,
    slug: c.slug,
    image: c.image,
    count: counts[c.slug] || 0,
  }));

  const newest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
  const latest = [...products].sort(newest).slice(0, 4);
  const rows = categories
    .filter((c) => c.count > 0)
    .slice(0, 8)
    .map((c) => ({
      title: c.name.toUpperCase(),
      slug: c.slug,
      items: products.filter((p) => p.category === c.slug).sort(newest).slice(0, 4),
    }));

  return { categories, products, latest, rows };
}

// keep the result for 30 seconds so moving between pages is instant
let cache = null;
let cacheAt = 0;
let inflight = null;

function fetchCatalog() {
  if (cache && Date.now() - cacheAt < 30000) return Promise.resolve(cache);
  if (!inflight) {
    inflight = Promise.all([api("/products"), api("/categories")])
      .then(([p, c]) => {
        cache = buildCatalog(p, c);
        cacheAt = Date.now();
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useCatalog() {
  const [state, setState] = useState(() => ({ ...(cache || EMPTY), loading: !cache, error: "" }));
  useEffect(() => {
    let alive = true;
    fetchCatalog()
      .then((c) => alive && setState({ ...c, loading: false, error: "" }))
      .catch((e) => alive && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}