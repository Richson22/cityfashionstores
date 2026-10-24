import { useEffect, useState } from "react";
import { loadProducts, saveProducts, sizesFor } from "./productsStore.js";
import { loadCategories } from "./categoriesStore.js";

const PAGE = 10;
const MAX_PHOTOS = 5;
const money = (n) => `₦${Number(n).toLocaleString()}`;
const catName = (slug) => (loadCategories().find((c) => c.slug === slug) || {}).name || "—";

// shrink a photo in the browser before saving it
function shrink(file, max = 800) {
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
      resolve(c.toDataURL("image/jpeg", 0.78));
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
function ProductForm({ initial, onSave, onClose }) {
  const CATEGORIES = loadCategories();
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
    const name = cName.trim() || "Color";
    if (f.colors.some((c) => c.hex.toLowerCase() === cHex.toLowerCase())) return;
    set("colors", [...f.colors, { name, hex: cHex }]);
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
                {f.colors.map((c) => (
                  <span key={c.hex} className="pr-color">
                    <i style={{ background: c.hex }} />
                    {c.name}
                    <button type="button" aria-label={`Remove ${c.name}`} onClick={() => set("colors", f.colors.filter((x) => x.hex !== c.hex))}>✕</button>
                  </span>
                ))}
              </div>
            )}
            <div className="pr-color-add">
              <input type="color" value={cHex} onChange={(ev) => setCHex(ev.target.value)} aria-label="Pick a color" />
              <input value={cName} onChange={(ev) => setCName(ev.target.value)} placeholder="Color name, e.g. Olive" />
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
  const CATEGORIES = loadCategories();
  const [list, setList] = useState(loadProducts);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | "new" | product

  const commit = (next) => {
    setList(next);
    if (!saveProducts(next)) {
      alert("The browser could not save this (storage is full). Try fewer or smaller photos.");
    }
  };

  const patch = (id, change) => commit(list.map((p) => (p.id === id ? { ...p, ...change } : p)));

  const remove = (p) => {
    if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      commit(list.filter((x) => x.id !== p.id));
    }
  };

  const save = (data) => {
    if (data.id) {
      commit(list.map((p) => (p.id === data.id ? data : p)));
    } else {
      const id = list.reduce((m, p) => Math.max(m, p.id), 0) + 1;
      commit([{ ...data, id, createdAt: Date.now() }, ...list]);
    }
    setEditing(null);
  };

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
    .sort((a, b) => b.createdAt - a.createdAt);

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
                  <td>{catName(p.category)}</td>
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
          initial={editing === "new" ? null : editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}