import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../Css/shop.css";
import { useCatalog } from "../data/catalog.js";

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
            {p.colors.map((c, i) => (
              <i key={`${c}-${i}`} style={{ background: c }} />
            ))}
          </span>
          {p.colors.length} colors
        </div>
      )}
    </Link>
  );
}

export default function Shop() {
  // products and categories come from the admin
  const { categories: CATS, allCategories, products: PRODUCTS, slugsFor, loading } = useCatalog();
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
    // a main category also shows everything inside its sub-categories
    const slugs = category === "all" ? null : slugsFor(category);
    let items = PRODUCTS.filter((p) => {
      if (slugs && !slugs.includes(p.category)) return false;
      if (show === "featured" && !p.featured) return false;
      if (search && !p.name.toLowerCase().includes(search)) return false;
      return true;
    });
    items = [...items];
    const time = (p) => new Date(p.createdAt).getTime() || 0;
    if (sort === "latest") items.sort((a, b) => time(b) - time(a));
    if (sort === "az") items.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "low") items.sort((a, b) => a.price - b.price);
    if (sort === "high") items.sort((a, b) => b.price - a.price);
    return items;
  }, [PRODUCTS, slugsFor, category, show, sort, search]);

  const current = allCategories.find((c) => c.slug === category);
  // the main category that is open (the one picked, or the one that owns the picked sub-category)
  const openTop = CATS.find((c) => c.slug === category || c.subs.some((s) => s.slug === category));
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
              <Fragment key={c.slug}>
                <button className={category === c.slug ? "on" : ""} onClick={() => pickCategory(c.slug)}>
                  {c.name}
                </button>
                {openTop && openTop.slug === c.slug &&
                  c.subs.map((s) => (
                    <button
                      key={s.slug}
                      className={category === s.slug ? "on sub" : "sub"}
                      onClick={() => pickCategory(s.slug)}
                    >
                      {s.name}
                    </button>
                  ))}
              </Fragment>
            ))}
          </div>
        </aside>

        <main className="sh-main">
          <div className="sh-head">
            <h1>{title}</h1>
            <span>{list.length} products</span>
          </div>

          {loading && PRODUCTS.length === 0 ? (
            <p className="sh-empty">Loading…</p>
          ) : list.length === 0 ? (
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