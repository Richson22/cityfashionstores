import { useEffect, useState } from "react";
import { slugify } from "./categoriesStore.js";
import { api } from "../data/api.js";
import { shrink } from "./image.js";

function Pic({ src, className }) {
  const [bad, setBad] = useState(false);
  return (
    <div className={className}>
      {src && !bad && <img src={src} alt="" onError={() => setBad(true)} />}
    </div>
  );
}

/* ---------- add / edit panel ---------- */
function CatForm({ initial, existing, onSave, onClose }) {
  const [name, setName] = useState(initial ? initial.name : "");
  const [image, setImage] = useState(initial ? initial.image : "");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // an existing category keeps its link, so products never lose it
  const slug = initial ? initial.slug : slugify(name);

  let error = "";
  if (!name.trim()) error = "Enter the category name";
  else if (!slug) error = "Use letters or numbers in the name";
  else if (existing.some((c) => c.slug === slug && (!initial || c.id !== initial.id)))
    error = "A category with this name already exists";

  const pick = async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      setImage(await shrink(file, 700));
    } catch {}
    setBusy(false);
  };

  const submit = (ev) => {
    ev.preventDefault();
    setTried(true);
    if (error) return;
    onSave({ ...(initial || {}), name: name.trim(), slug, image });
  };

  return (
    <>
      <div className="pr-overlay" onClick={onClose} />
      <form className="pr-drawer" onSubmit={submit} noValidate>
        <div className="pr-drawer-head">
          <h2>{initial ? "Edit category" : "Add category"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pr-drawer-body">
          <label className="pr-f">
            <span>Category name</span>
            <input value={name} onChange={(ev) => setName(ev.target.value)} placeholder="e.g. Sneakers" />
            {tried && error && <em>{error}</em>}
          </label>

          <div className="pr-f">
            <span>Photo (shown on the category tile)</span>
            <div className="cg-pick">
              <Pic src={image} className="cg-prev" />
              <div>
                <label className="ad-btn ghost cg-upload">
                  {busy ? "Adding…" : image ? "Change photo" : "+ Add photo"}
                  <input type="file" accept="image/*" onChange={pick} hidden />
                </label>
                {image && (
                  <button type="button" className="cg-clear" onClick={() => setImage("")}>Remove photo</button>
                )}
              </div>
            </div>
          </div>

          {slug && (
            <p className="cg-link">
              Link in the store: <b>/shop?category={slug}</b>
            </p>
          )}
        </div>

        <div className="pr-drawer-foot">
          <button type="button" className="ad-btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ad-btn" disabled={busy}>{initial ? "Save changes" : "Add category"}</button>
        </div>
      </form>
    </>
  );
}

/* ---------- the page ---------- */
export default function Categories() {
  const [list, setList] = useState(null);
  const [counts, setCounts] = useState({});
  const [editing, setEditing] = useState(null); // null | "new" | category
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [cats, prods] = await Promise.all([
        api("/categories/all", { auth: true }),
        api("/products/all", { auth: true }),
      ]);
      const c = {};
      prods.forEach((p) => {
        c[p.category] = (c[p.category] || 0) + 1;
      });
      setCounts(c);
      setList(cats);
      setError("");
    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (data) => {
    try {
      const body = { name: data.name, slug: data.slug, image: data.image };
      if (data.id) await api(`/categories/${data.id}`, { method: "PUT", auth: true, body });
      else await api("/categories", { method: "POST", auth: true, body: { ...body, order: list.length } });
      setEditing(null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const remove = async (c) => {
    const n = counts[c.slug] || 0;
    if (n > 0) {
      alert(`"${c.name}" still has ${n} product${n === 1 ? "" : "s"}. Move or delete them first.`);
      return;
    }
    if (!window.confirm(`Delete the category "${c.name}"?`)) return;
    try {
      await api(`/categories/${c.id}`, { method: "DELETE", auth: true });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const move = async (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    const withOrder = next.map((c, idx) => ({ ...c, order: idx }));
    setList(withOrder);
    try {
      await Promise.all(
        withOrder
          .filter((c, idx) => list[idx].id !== c.id || list[idx].order !== idx)
          .map((c) => api(`/categories/${c.id}`, { method: "PUT", auth: true, body: { order: c.order } }))
      );
    } catch (e) {
      alert(e.message);
      load();
    }
  };

  if (error) {
    return (
      <>
        <div className="ov-head"><div><h2>Categories</h2></div></div>
        <p className="al-error">{error}</p>
        <button type="button" className="ad-btn ghost" onClick={load}>Try again</button>
      </>
    );
  }
  if (!list) return <p>Loading…</p>;

  return (
    <>
      <div className="ov-head">
        <div>
          <h2>Categories</h2>
          <p>{list.length} categories · the order here is the order in the store</p>
        </div>
        <div className="ov-actions">
          <button type="button" className="ad-btn" onClick={() => setEditing("new")}>+ Add category</button>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="ad-soon" style={{ padding: 0 }}>No categories yet. Add your first one.</p>
      ) : (
        <div className="cg-grid">
          {list.map((c, i) => (
            <div className="cg-card" key={c.id}>
              <div className="cg-img">
                <Pic src={c.image} className="cg-pic" />
                <div className="cg-shade" />
                <div className="cg-info">
                  <b>{c.name}</b>
                  <span>{counts[c.slug] || 0} items</span>
                </div>
              </div>
              <div className="cg-act">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move left">←</button>
                <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move right">→</button>
                <button type="button" className="grow" onClick={() => setEditing(c)}>Edit</button>
                <button type="button" className="del" onClick={() => remove(c)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CatForm
          initial={editing === "new" ? null : editing}
          existing={list}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}