import { useEffect, useState } from "react";
import { sizesFor } from "./productsStore.js";
import { api } from "../data/api.js";

const PAGE = 10;
const MAX_PHOTOS = 5;

// typing "White, Red, Blue" adds each color with its own shade
const COLOR_HEX = {
  black: "#111111",
  white: "#ffffff",
  red: "#e53935",
  blue: "#1e6bff",
  "sky blue": "#5ac8fa",
  navy: "#1f3a5f",
  yellow: "#ffd60a",
  gold: "#d4a017",
  green: "#2e9e5b",
  olive: "#556b2f",
  grey: "#7a7a85",
  gray: "#7a7a85",
  silver: "#c0c0c8",
  brown: "#8a4b1f",
  beige: "#c8b08a",
  cream: "#f3ead7",
  khaki: "#bda97a",
  maroon: "#7a1f2b",
  purple: "#8a1fa8",
  pink: "#ff8fb1",
  orange: "#ff8a1f",
  teal: "#00a3a3",
  ash: "#b2beb5",
  "navy blue": "#1f3a5f",
  "light blue": "#8ec5ff",
  "dark blue": "#0d2a6b",
  "royal blue": "#2b4fd8",
  "off white": "#f5f1e8",
  "light grey": "#c9c9d1",
  "dark grey": "#4a4a52",
  charcoal: "#36454f",
  wine: "#722f37",
  burgundy: "#800020",
  mustard: "#d9a400",
  lemon: "#fff44f",
  peach: "#ffcba4",
  lilac: "#c8a2c8",
  coffee: "#6f4e37",
  "dark green": "#1f5c3a",
  "army green": "#4b5320",
  "light green": "#9be39b",
  sky: "#5ac8fa",
};
const money = (n) => `₦${Number(n).toLocaleString()}`;
const shadeOf = (name, fallback) => {
  const n = name.toLowerCase().trim();
  if (COLOR_HEX[n]) return COLOR_HEX[n];
  for (const w of n.split(/\s+/)) if (COLOR_HEX[w]) return COLOR_HEX[w];
  return fallback;
};
const catName = (cats, slug) => (cats.find((c) => c.slug === slug) || {}).name || "—";

// shrink a photo in the browser before saving it (large enough to stay sharp on the product page)
function shrink(file, max = 1400) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject();
    };
    img.src = url;
  });
}

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={on ? "pr-switch on" : "pr-switch"}
      onClick={() => onChange(!on)}
    >
      <i />
    </button>
  );
}

function Thumb({ src }) {
  const [bad, setBad] = useState(false);
  return (
    <span className="pr-thumb">
      {src && !bad && <img src={src} alt="" onError={() => setBad(true)} />}
    </span>
  );
}

/* ---------- add / edit panel ---------- */
function ProductForm({ initial, categories: CATEGORIES, onSave, onClose }) {
  const [f, setF] = useState(() =>
    initial
      ? { ...initial, price: String(initial.price), stock: String(initial.stock) }
      : { name: "", category: "", price: "", stock: "", details: "", sizes: [], colors: [], images: [], featured: false, soldOut: false, visible: true }
  );
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cName, setCName] = useState("");
  const [cHex, setCHex] = useState("#111111");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const sizeOpts = sizesFor(f.category);

  const errs = {};
  if (!f.name.trim()) errs.name = "Enter the product name";
  if (!f.category) errs.category = "Choose a category";
  if (!(Number(f.price) > 0)) errs.price = "Enter the price";
  if (f.stock === "" || Number.isNaN(Number(f.stock)) || Number(f.stock) < 0) errs.stock = "Enter the stock";
  const e = tried ? errs : {};

  const toggleSize = (s) =>
    set("sizes", f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s]);

  const addColor = () => {
    const parts = cName.split(",").map((s) => s.trim()).filter(Boolean);
    const names = parts.length ? parts : [`Color ${f.colors.length + 1}`];
    const added = [...f.colors];
    names.forEach((n) => {
      const hex = shadeOf(n, cHex);
      if (!added.some((c) => c.name.toLowerCase() === n.toLowerCase())) added.push({ name: n, hex });
    });
    set("colors", added);
    setCName("");
  };

  const addPhotos = async (ev) => {
    const files = [...ev.target.files].slice(0, MAX_PHOTOS - f.images.length);
    ev.target.value = "";
    if (!files.length) return;
    setBusy(true);
    const out = [];
    for (const file of files) {
      try {
        out.push(await shrink(file));
      } catch {}
    }
    setBusy(false);
    setF((p) => ({ ...p, images: [...p.images, ...out] }));
  };

  const makeMain = (i) =>
    set("images", [f.images[i], ...f.images.filter((_, k) => k !== i)]);

  const submit = (ev) => {
    ev.preventDefault();
    setTried(true);
    if (Object.keys(errs).length) return;
    onSave({
      ...f,
      name: f.name.trim(),
      price: Number(f.price),
      stock: Number(f.stock),
      sizes: f.sizes.filter((s) => sizeOpts.includes(s)),
      image: f.images[0] || "",
    });
  };

  return (
    <>
      <div className="pr-overlay" onClick={onClose} />
      <form className="pr-drawer" onSubmit={submit} noValidate>
        <div className="pr-drawer-head">
          <h2>{initial ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pr-drawer-body">
          <label className="pr-f">
            <span>Product name</span>
            <input value={f.name} onChange={(ev) => set("name", ev.target.value)} placeholder="e.g. Scott Made It Polo Shirt" />
            {e.name && <em>{e.name}</em>}
          </label>

          <div className="pr-two">
            <label className="pr-f">
              <span>Category</span>
              <select value={f.category} onChange={(ev) => set("category", ev.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
              {e.category && <em>{e.category}</em>}
            </label>
            <label className="pr-f">
              <span>Price (₦)</span>
              <input type="number" min="0" value={f.price} onChange={(ev) => set("price", ev.target.value)} placeholder="22100" />
              {e.price && <em>{e.price}</em>}
            </label>
          </div>

          <label className="pr-f">
            <span>Stock (how many in hand)</span>
            <input type="number" min="0" value={f.stock} onChange={(ev) => set("stock", ev.target.value)} placeholder="10" />
            {e.stock && <em>{e.stock}</em>}
          </label>

          <div className="pr-f">
            <span>Photos (first one is the main photo, up to {MAX_PHOTOS})</span>
            <div className="pr-photos">
              {f.images.map((src, i) => (
                <div className="pr-photo" key={i}>
                  <Thumb src={src} />
                  {i === 0 ? (
                    <b>Main</b>
                  ) : (
                    <button type="button" onClick={() => makeMain(i)}>Make main</button>
                  )}
                  <button type="button" className="x" aria-label="Remove photo" onClick={() => set("images", f.images.filter((_, k) => k !== i))}>✕</button>
                </div>
              ))}
              {f.images.length < MAX_PHOTOS && (
                <label className="pr-add-photo">
                  {busy ? "Adding…" : "+ Add photo"}
                  <input type="file" accept="image/*" multiple onChange={addPhotos} hidden />
                </label>
              )}
            </div>
          </div>

          {sizeOpts.length > 0 && (
            <div className="pr-f">
              <span>Sizes available</span>
              <div className="pr-chips">
                {sizeOpts.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={f.sizes.includes(s) ? "on" : ""}
                    onClick={() => toggleSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pr-f">
            <span>Colors</span>
            {f.colors.length > 0 && (
              <div className="pr-colors">
                {f.colors.map((c, i) => (
                  <span key={`${c.name}-${i}`} className="pr-color">
                    <i style={{ background: c.hex }} />
                    {c.name}
                    <button type="button" aria-label={`Remove ${c.name}`} onClick={() => set("colors", f.colors.filter((_, k) => k !== i))}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <div className="pr-color-add">
              <input type="color" value={cHex} onChange={(ev) => setCHex(ev.target.value)} aria-label="Pick a color" />
              <input value={cName} onChange={(ev) => setCName(ev.target.value)} placeholder="One color, or several: White, Red, Blue" />
              <button type="button" onClick={addColor}>Add</button>
            </div>
          </div>

          <label className="pr-f">
            <span>Details (shown on the product page)</span>
            <textarea rows={4} value={f.details} onChange={(ev) => set("details", ev.target.value)} placeholder="Describe the fabric, the fit and how to wear it" />
          </label>

          <div className="pr-flags">
            <div><span>Visible in the store</span><Switch on={f.visible} onChange={(v) => set("visible", v)} label="Visible" /></div>
            <div><span>Featured</span><Switch on={f.featured} onChange={(v) => set("featured", v)} label="Featured" /></div>
            <div><span>Sold out</span><Switch on={f.soldOut} onChange={(v) => set("soldOut", v)} label="Sold out" /></div>
          </div>
        </div>

        <div className="pr-drawer-foot">
          <button type="button" className="ad-btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ad-btn" disabled={busy}>{initial ? "Save changes" : "Add product"}</button>
        </div>
      </form>
    </>
  );
}

/* ---------- the page ---------- */
export default function Products() {
  const [CATEGORIES, setCategories] = useState([]);
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | "new" | product

  const load = async () => {
    try {
      const [cats, prods] = await Promise.all([
        api("/categories/all", { auth: true }),
        api("/products/all", { auth: true }),
      ]);
      setCategories(cats);
      setList(prods);
      setError("");
    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patch = async (id, change) => {
    setList(list.map((p) => (p.id === id ? { ...p, ...change } : p)));
    try {
      await api(`/products/${id}`, { method: "PUT", auth: true, body: change });
    } catch (e) {
      alert(e.message);
      load();
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/products/${p.id}`, { method: "DELETE", auth: true });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const save = async (data) => {
    const body = {
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock,
      details: data.details,
      sizes: data.sizes,
      colors: data.colors,
      images: data.images,
      featured: data.featured,
      soldOut: data.soldOut,
      visible: data.visible,
    };
    try {
      if (data.id) await api(`/products/${data.id}`, { method: "PUT", auth: true, body });
      else await api("/products", { method: "POST", auth: true, body });
      setEditing(null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (error) {
    return (
      <>
        <div className="ov-head"><div><h2>Products</h2></div></div>
        <p className="al-error">{error}</p>
        <button type="button" className="ad-btn ghost" onClick={load}>Try again</button>
      </>
    );
  }
  if (!list) return <p>Loading…</p>;

  const shown = list
    .filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (q.trim() && !p.name.toLowerCase().includes(q.trim().toLowerCase())) return false;
      if (status === "instock" && !(p.stock > 0 && !p.soldOut)) return false;
      if (status === "low" && !(p.stock > 0 && p.stock <= 3)) return false;
      if (status === "out" && !(p.stock === 0 || p.soldOut)) return false;
      if (status === "hidden" && p.visible) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pages = Math.max(1, Math.ceil(shown.length / PAGE));
  const cur = Math.min(page, pages);
  const rows = shown.slice((cur - 1) * PAGE, cur * PAGE);
  const filt = (setter) => (ev) => {
    setter(ev.target.value);
    setPage(1);
  };

  return (
    <>
      <div className="ov-head">
        <div>
          <h2>Products</h2>
          <p>{list.length} products in total</p>
        </div>
        <div className="ov-actions">
          <button type="button" className="ad-btn" onClick={() => setEditing("new")}>+ Add product</button>
        </div>
      </div>

      <div className="pr-filters">
        <input type="search" value={q} onChange={filt(setQ)} placeholder="Search products…" />
        <select value={cat} onChange={filt(setCat)} aria-label="Category">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select value={status} onChange={filt(setStatus)} aria-label="Status">
          <option value="all">All status</option>
          <option value="instock">In stock</option>
          <option value="low">Low stock (3 or fewer)</option>
          <option value="out">Sold out</option>
          <option value="hidden">Hidden from store</option>
        </select>
      </div>

      <section className="ov-card pr-card">
        <div className="ov-table">
          <table className="pr-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sold out</th>
                <th>Featured</th>
                <th>Visible</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="pr-name">
                      <Thumb src={p.image} />
                      <b>{p.name}</b>
                    </div>
                  </td>
                  <td>{catName(CATEGORIES, p.category)}</td>
                  <td>{money(p.price)}</td>
                  <td className={p.stock <= 3 ? "pr-low" : ""}>{p.stock === 0 ? "0 (out)" : p.stock}</td>
                  <td><Switch on={p.soldOut} onChange={(v) => patch(p.id, { soldOut: v })} label="Sold out" /></td>
                  <td><Switch on={p.featured} onChange={(v) => patch(p.id, { featured: v })} label="Featured" /></td>
                  <td><Switch on={p.visible} onChange={(v) => patch(p.id, { visible: v })} label="Visible" /></td>
                  <td className="pr-act">
                    <button type="button" onClick={() => setEditing(p)}>Edit</button>
                    <button type="button" className="del" onClick={() => remove(p)}>Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="pr-empty">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pr-pager">
            <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)}>← Previous</button>
            <span>Page {cur} of {pages}</span>
            <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next →</button>
          </div>
        )}
      </section>

      {editing && (
        <ProductForm
          categories={CATEGORIES}
          initial={editing === "new" ? null : editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}