import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../Css/shop.css";

// DEMO DATA for the client preview.
// Later this list will come from the admin / backend (same fields).
export const CATS = [
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

// photo file prefix per category: /products/<prefix>-1.jpg ... -4.jpg
const IMG = { tees: "tee", shirts: "shirt", boxers: "boxer", jerseys: "jersey", eyeglasses: "glasses", caps: "cap" };
const PALETTE = ["#111111", "#ffffff", "#e53935", "#1e6bff", "#ffd60a", "#7a7a85"];

export const PRODUCTS = CATS.flatMap((c, ci) =>
  [1, 2, 3, 4].map((i) => ({
    id: i * 100 + ci, // higher id = newer
    name: `${c.name} Style ${i}`,
    category: c.slug,
    price: 7500 + ((ci * 3 + i * 5) % 12) * 1500,
    image: `/products/${IMG[c.slug] || c.slug}-${i}.jpg`,
    featured: i === 1,
    soldOut: (ci + i) % 9 === 0,
    colors: i % 2 === 0 ? PALETTE.slice(0, 2 + (ci % 3)) : undefined,
  }))
);

const SORTS = [
  { key: "latest", label: "Latest arrivals" },
  { key: "az", label: "Alphabetic A-Z" },
  { key: "low", label: "Price: Low to high" },
  { key: "high", label: "Price: High to low" },
];

const PAGE = 12;

function ShopCard({ p }) {
  const [missing, setMissing] = useState(false);
  return (
    <Link to={`/product/${p.id}`} state={{ product: p }} className={p.soldOut ? "sh-card sold" : "sh-card"}>
      <div className="sh-img">
        {p.soldOut && <span className="sh-sold">SOLD OUT</span>}
        {p.image && !missing && (
          <img src={p.image} alt={p.name} loading="lazy" onError={() => setMissing(true)} />
        )}
      </div>
      <h3>{p.name}</h3>
      <b>₦{p.price.toLocaleString()}</b>
      {p.colors && p.colors.length > 1 && (
        <div className="sh-colors">
          <span className="sh-dots">
            {p.colors.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
          {p.colors.length} colors
        </div>
      )}
    </Link>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const search = (params.get("search") || "").trim().toLowerCase();

  const [show, setShow] = useState("all");
  const [sort, setSort] = useState("latest");
  const [visible, setVisible] = useState(PAGE);

  // back to the first page and the top when the category or search changes (also from the nav)
  useEffect(() => {
    setVisible(PAGE);
    window.scrollTo(0, 0);
  }, [category, search]);

  const pickCategory = (slug) => {
    const next = new URLSearchParams(params);
    if (slug === "all") next.delete("category");
    else next.set("category", slug);
    setParams(next);
    setVisible(PAGE);
  };

  const list = useMemo(() => {
    let items = PRODUCTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (show === "featured" && !p.featured) return false;
      if (search && !p.name.toLowerCase().includes(search)) return false;
      return true;
    });
    items = [...items];
    if (sort === "latest") items.sort((a, b) => b.id - a.id);
    if (sort === "az") items.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "low") items.sort((a, b) => a.price - b.price);
    if (sort === "high") items.sort((a, b) => b.price - a.price);
    return items;
  }, [category, show, sort, search]);

  const current = CATS.find((c) => c.slug === category);
  const title = search ? `RESULTS FOR "${search}"` : current ? current.name.toUpperCase() : "ALL PRODUCTS";

  return (
    <>
      <Navbar />
      <div className="shop">
        <aside className="sh-side">
          <div className="sh-group">
            <h4>SHOW</h4>
            <button className={show === "all" ? "on" : ""} onClick={() => { setShow("all"); setVisible(PAGE); }}>
              All products
            </button>
            <button className={show === "featured" ? "on" : ""} onClick={() => { setShow("featured"); setVisible(PAGE); }}>
              Featured only
            </button>
          </div>

          <div className="sh-group">
            <h4>SORT BY</h4>
            {SORTS.map((s) => (
              <button key={s.key} className={sort === s.key ? "on" : ""} onClick={() => setSort(s.key)}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="sh-group">
            <h4>CATEGORIES</h4>
            <button className={category === "all" ? "on" : ""} onClick={() => pickCategory("all")}>
              All
            </button>
            {CATS.map((c) => (
              <button key={c.slug} className={category === c.slug ? "on" : ""} onClick={() => pickCategory(c.slug)}>
                {c.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="sh-main">
          <div className="sh-head">
            <h1>{title}</h1>
            <span>{list.length} products</span>
          </div>

          {list.length === 0 ? (
            <p className="sh-empty">No products found.</p>
          ) : (
            <div className="sh-grid">
              {list.slice(0, visible).map((p) => (
                <ShopCard key={p.id} p={p} />
              ))}
            </div>
          )}

          {visible < list.length && (
            <div className="sh-more">
              <button type="button" onClick={() => setVisible((v) => v + PAGE)}>
                Load more
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}