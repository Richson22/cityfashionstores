import { useEffect, useState } from "react";
import { loadBanners, saveBanners } from "./bannersStore.js";
import { loadCategories } from "./categoriesStore.js";
import { shrink } from "./image.js";

function Pic({ src, className }) {
  const [bad, setBad] = useState(false);
  return (
    <div className={className}>
      {src && !bad && <img src={src} alt="" onError={() => setBad(true)} />}
    </div>
  );
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

const lines = (b) => (b.title || []).filter(Boolean);

/* ---------- add / edit panel ---------- */
function BannerForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(() => ({
    tag: initial ? initial.tag || "" : "",
    l1: initial ? initial.title[0] || "" : "",
    l2: initial ? initial.title[1] || "" : "",
    l3: initial ? initial.title[2] || "" : "",
    text: initial ? initial.text || "" : "",
    button: initial ? initial.button || "" : "",
    link: initial ? initial.link || "/shop" : "/shop",
    image: initial ? initial.image || "" : "",
    active: initial ? initial.active : true,
  }));
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const errs = {};
  if (!f.l1.trim()) errs.l1 = "Enter the headline";
  if (!f.button.trim()) errs.button = "Enter the button name";
  if (!f.link.trim()) errs.link = "Enter where the button goes";
  const e = tried ? errs : {};

  const links = [
    "/shop",
    "/categories",
    ...loadCategories().map((c) => `/shop?category=${c.slug}`),
  ];

  const pick = async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      set("image", await shrink(file, 1200));
    } catch {}
    setBusy(false);
  };

  const title = [f.l1, f.l2, f.l3].map((s) => s.trim()).filter(Boolean);

  const submit = (ev) => {
    ev.preventDefault();
    setTried(true);
    if (Object.keys(errs).length) return;
    onSave({
      ...(initial || {}),
      tag: f.tag.trim(),
      title,
      text: f.text.trim(),
      button: f.button.trim(),
      link: f.link.trim(),
      image: f.image,
      active: f.active,
    });
  };

  return (
    <>
      <div className="pr-overlay" onClick={onClose} />
      <form className="pr-drawer" onSubmit={submit} noValidate>
        <div className="pr-drawer-head">
          <h2>{initial ? "Edit banner" : "Add banner"}</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pr-drawer-body">
          <div className="bp">
            <div className="bp-text">
              {f.tag.trim() && <span className="bp-tag">{f.tag}</span>}
              <h3>
                {title.length ? title.map((t, i) => <span key={i}>{i > 0 && <br />}{t}</span>) : "YOUR HEADLINE"}
              </h3>
              {f.text.trim() && <p>{f.text}</p>}
              <i>{f.button.trim() || "BUTTON"}</i>
            </div>
            <Pic src={f.image} className="bp-img" />
          </div>

          <label className="pr-f">
            <span>Small tag above the headline (optional)</span>
            <input value={f.tag} onChange={(ev) => set("tag", ev.target.value)} placeholder="e.g. New Arrivals" />
          </label>

          <div className="pr-f">
            <span>Headline (up to 3 lines)</span>
            <input value={f.l1} onChange={(ev) => set("l1", ev.target.value)} placeholder="Line 1, e.g. FITS OVER" />
            <input value={f.l2} onChange={(ev) => set("l2", ev.target.value)} placeholder="Line 2, e.g. FEELINGS." />
            <input value={f.l3} onChange={(ev) => set("l3", ev.target.value)} placeholder="Line 3 (optional)" />
            {e.l1 && <em>{e.l1}</em>}
          </div>

          <label className="pr-f">
            <span>Text under the headline</span>
            <textarea rows={3} value={f.text} onChange={(ev) => set("text", ev.target.value)} placeholder="One or two short sentences" />
          </label>

          <div className="pr-two">
            <label className="pr-f">
              <span>Button name</span>
              <input value={f.button} onChange={(ev) => set("button", ev.target.value)} placeholder="🛒 SHOP THE DROP" />
              {e.button && <em>{e.button}</em>}
            </label>
            <label className="pr-f">
              <span>Button goes to</span>
              <input list="banner-links" value={f.link} onChange={(ev) => set("link", ev.target.value)} placeholder="/shop" />
              <datalist id="banner-links">
                {links.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              {e.link && <em>{e.link}</em>}
            </label>
          </div>

          <div className="pr-f">
            <span>Photo (a clean photo with a plain or dark background works best)</span>
            <div className="cg-pick">
              <Pic src={f.image} className="cg-prev" />
              <div>
                <label className="ad-btn ghost cg-upload">
                  {busy ? "Adding…" : f.image ? "Change photo" : "+ Add photo"}
                  <input type="file" accept="image/*" onChange={pick} hidden />
                </label>
                {f.image && (
                  <button type="button" className="cg-clear" onClick={() => set("image", "")}>Remove photo</button>
                )}
              </div>
            </div>
          </div>

          <div className="pr-flags">
            <div>
              <span>Show this slide on the home page</span>
              <Switch on={f.active} onChange={(v) => set("active", v)} label="Active" />
            </div>
          </div>
        </div>

        <div className="pr-drawer-foot">
          <button type="button" className="ad-btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="ad-btn" disabled={busy}>{initial ? "Save changes" : "Add banner"}</button>
        </div>
      </form>
    </>
  );
}

/* ---------- the page ---------- */
export default function Banners() {
  const [list, setList] = useState(loadBanners);
  const [editing, setEditing] = useState(null); // null | "new" | banner

  const commit = (next) => {
    setList(next);
    if (!saveBanners(next)) {
      alert("The browser could not save this (storage is full). Try a smaller photo.");
    }
  };

  const save = (data) => {
    if (data.id) {
      commit(list.map((b) => (b.id === data.id ? data : b)));
    } else {
      const id = list.reduce((m, b) => Math.max(m, b.id), 0) + 1;
      commit([...list, { ...data, id }]);
    }
    setEditing(null);
  };

  const remove = (b) => {
    if (window.confirm("Delete this banner?")) commit(list.filter((x) => x.id !== b.id));
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const activeCount = list.filter((b) => b.active).length;

  return (
    <>
      <div className="ov-head">
        <div>
          <h2>Banners</h2>
          <p>
            {activeCount} of {list.length} slides showing on the home page · the order here is the order on the page
          </p>
        </div>
        <div className="ov-actions">
          <button type="button" className="ad-btn" onClick={() => setEditing("new")}>+ Add banner</button>
        </div>
      </div>

      <div className="bnr-list">
        {list.map((b, i) => (
          <div className={b.active ? "bnr-card" : "bnr-card off"} key={b.id}>
            <Pic src={b.image} className="bnr-img" />
            <div className="bnr-text">
              <small>SLIDE {i + 1}{b.tag ? ` · ${b.tag}` : ""}</small>
              <b>{lines(b).join(" ")}</b>
              {b.text && <p>{b.text}</p>}
              <span>Button: {b.button} → {b.link}</span>
            </div>
            <div className="bnr-act">
              <div className="bnr-on">
                <span>{b.active ? "Showing" : "Hidden"}</span>
                <Switch on={b.active} onChange={(v) => commit(list.map((x) => (x.id === b.id ? { ...x, active: v } : x)))} label="Showing" />
              </div>
              <div className="bnr-btns">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                <button type="button" onClick={() => setEditing(b)}>Edit</button>
                <button type="button" className="del" onClick={() => remove(b)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="pr-empty">No banners yet. Add your first one.</p>}
      </div>

      {editing && (
        <BannerForm
          initial={editing === "new" ? null : editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}