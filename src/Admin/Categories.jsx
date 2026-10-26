import { useEffect, useState } from "react";
import { slugify } from "./categoriesStore.js";
import { api } from "../data/api.js";
import { uploadPhoto } from "./upload.js";

function Pic({ src, className }) {
  const [bad, setBad] = useState(false);
  return (
    <div className={className}>
      {src && !bad && <img src={src} alt="" onError={() => setBad(true)} />}
    </div>
  );
}

/* ---------- add / edit panel ---------- */
function CatForm({ initial, existing, parentPreset, onSave, onClose }) {
  const [name, setName] = useState(initial ? initial.name : "");
  const [image, setImage] = useState(initial ? initial.image : "");
  const [parent, setParent] = useState(initial ? initial.parent || "" : parentPreset || "");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // an existing category keeps its link, so products never lose it
  const slug = initial ? initial.slug : slugify(name);

  // only main categories can be a parent, and a category that has sub-categories cannot become one
  const hasKids = initial ? existing.some((c) => c.parent === initial.slug) : false;
  const parents = existing.filter((c) => !c.parent && (!initial || c.id !== initial.id));

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
      setImage(await uploadPhoto(file, 700));
    } catch (err) {
      alert(err.message || "Photo upload failed");
    }
    setBusy(false);
  };

  const submit = (ev) => {
    ev.preventDefault();
    setTried(true);
    if (error) return;
    onSave({ ...(initial || {}), name: name.trim(), slug, image, parent });
  };

  return (
    <>
      <div className="pr-overlay" onClick={onClose} />
      <form className="pr-drawer" onSubmit={submit} noValidate>
        <div className="pr-drawer-head">
          <h2>{initial ? "Edit category" : parent ? "Add sub-category" : "Add category"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pr-drawer-body">
          <label className="pr-f">
            <span>Name</span>
            <input value={name} onChange={(ev) => setName(ev.target.value)} placeholder="e.g. Polo Shirts" />
            {tried && error && <em>{error}</em>}
          </label>

          <label className="pr-f">
            <span>Inside which main category? (optional)</span>
            <select value={parent} onChange={(ev) => setParent(ev.target.value)} disabled={hasKids}>
              <option value="">None, this is a main category</option>
              {parents.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            {hasKids && <small className="st-hint">It has sub-categories, so it stays a main category.</small>}
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
          <button type="submit" className="ad-btn" disabled={busy}>{initial ? "Save changes" : "Add"}</button>
        </div>
      </form>
    </>
  );
}

/* ---------- the page ---------- */
export default function Categories() {
  const [list, setList] = useState(null);
  const [counts, setCounts] = useState({});
  const [editing, setEditing] = useState(null); // null | "new" | category | { parentPreset }
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
      const body = { name: data.name, slug: data.slug, image: data.image, parent: data.parent || "" };
      if (data.id) await api(`/categories/${data.id}`, { method: "PUT", auth: true, body });
      else await api("/categories", { method: "POST", auth: true, body: { ...body, order: list.length } });
      setEditing(null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const subsOf = (slug) => list.filter((c) => c.parent === slug);
  const total = (c) => (counts[c.slug] || 0) + subsOf(c.slug).reduce((n, s) => n + (counts[s.slug] || 0), 0);

  const remove = async (c) => {
    const kids = subsOf(c.slug).length;
    if (kids > 0) {
      alert(`"${c.name}" still has ${kids} sub-categor${kids === 1 ? "y" : "ies"}. Delete or move them first.`);
      return;
    }
    const n = counts[c.slug] || 0;
    if (n > 0) {
      alert(`"${c.name}" still has ${n} product${n === 1 ? "" : "s"}. Move or delete them first.`);
      return;
    }
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await api(`/categories/${c.id}`, { method: "DELETE", auth: true });
      await load();
    } catch (e) {
      alert(e.message);
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

  const tops = list.filter((c) => !c.parent).sort((a, b) => a.order - b.order);

  const move = async (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= tops.length) return;
    const next = [...tops];
    [next[i], next[j]] = [next[j], next[i]];
    const orderOf = new Map(next.map((c, idx) => [c.id, idx]));
    const changed = next.filter((c, idx) => c.order !== idx);
    setList(list.map((c) => (orderOf.has(c.id) ? { ...c, order: orderOf.get(c.id) } : c)));
    try {
      await Promise.all(
        changed.map((c) =>
          api(`/categories/${c.id}`, { method: "PUT", auth: true, body: { order: orderOf.get(c.id) } })
        )
      );
    } catch (e) {
      alert(e.message);
      load();
    }
  };

  const isPreset = editing && editing !== "new" && !editing.id;

  return (
    <>
      <div className="ov-head">
        <div>
          <h2>Categories</h2>
          <p>
            {tops.length} main categories · {list.length - tops.length} sub-categories · the order here is the order
            in the store
          </p>
        </div>
        <div className="ov-actions">
          <button type="button" className="ad-btn" onClick={() => setEditing("new")}>+ Add category</button>
        </div>
      </div>

      {tops.length === 0 ? (
        <p className="ad-soon" style={{ padding: 0 }}>No categories yet. Add your first one.</p>
      ) : (
        <div className="cg-grid">
          {tops.map((c, i) => (
            <div className="cg-card" key={c.id}>
              <div className="cg-img">
                <Pic src={c.image} className="cg-pic" />
                <div className="cg-shade" />
                <div className="cg-info">
                  <b>{c.name}</b>
                  <span>{total(c)} items</span>
                </div>
              </div>
              <div className="cg-subs">
                {subsOf(c.slug).map((s) => (
                  <span className="cg-sub" key={s.id}>
                    <button type="button" className="cg-sub-name" onClick={() => setEditing(s)}>
                      {s.name} <small>{counts[s.slug] || 0}</small>
                    </button>
                    <button type="button" className="cg-sub-x" aria-label={`Delete ${s.name}`} onClick={() => remove(s)}>✕</button>
                  </span>
                ))}
                <button type="button" className="cg-sub add" onClick={() => setEditing({ parentPreset: c.slug })}>
                  + Sub-category
                </button>
              </div>
              <div className="cg-act">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move left">←</button>
                <button type="button" disabled={i === tops.length - 1} onClick={() => move(i, 1)} aria-label="Move right">→</button>
                <button type="button" className="grow" onClick={() => setEditing(c)}>Edit</button>
                <button type="button" className="del" onClick={() => remove(c)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CatForm
          key={editing === "new" ? "new" : editing.id || `sub-${editing.parentPreset}`}
          initial={editing === "new" || isPreset ? null : editing}
          parentPreset={isPreset ? editing.parentPreset : ""}
          existing={list}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}