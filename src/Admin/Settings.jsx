import { useState } from "react";
import { DEFAULTS, getSettings, saveSettings } from "./settingsStore.js";

// everything the demo keeps in the browser
const RESET_KEYS = [
  "admin-products",
  "admin-categories",
  "admin-orders",
  "admin-banners",
  "admin-settings",
  "cart",
  "delivery",
  "recent",
];

// 0801 234 5678 -> 2348012345678
function normalizePhone(p) {
  const d = String(p).replace(/\D/g, "");
  return d.startsWith("0") ? "234" + d.slice(1) : d;
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

function Field({ label, hint, error, wide, children }) {
  return (
    <label className={wide ? "pr-f st-wide" : "pr-f"}>
      <span>{label}</span>
      {children}
      {hint && <small className="st-hint">{hint}</small>}
      {error && <em>{error}</em>}
    </label>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState(getSettings);
  const [f, setF] = useState(getSettings);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const dirty = JSON.stringify(f) !== JSON.stringify(saved);
  const set = (k) => (e) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    setDone(false);
  };
  const flip = (k) => (v) => {
    setF((p) => ({ ...p, [k]: v }));
    setDone(false);
  };

  const save = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!f.storeName.trim()) e.storeName = "Enter the store name";
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email";
    const wa = normalizePhone(f.whatsapp);
    if (wa.length < 11 || wa.length > 15) e.whatsapp = "Enter the full WhatsApp number, e.g. 2348012345678";
    if (!f.deliveryNote.trim()) e.deliveryNote = "Enter the delivery message";
    const key = f.paystackKey.trim();
    if (key.startsWith("sk_")) e.paystackKey = "That is a SECRET key. Only paste the public key (pk_…).";
    else if (key && !key.startsWith("pk_")) e.paystackKey = "A Paystack public key starts with pk_";
    if (f.announceOn && !f.announceText.trim()) e.announceText = "Enter the announcement text";
    setErrors(e);
    if (Object.keys(e).length) return;

    const next = { ...f, whatsapp: wa, paystackKey: key };
    if (!saveSettings(next)) {
      alert("The browser could not save this (storage is full).");
      return;
    }
    setF(next);
    setSaved(next);
    setDone(true);
  };

  const discard = () => {
    setF(saved);
    setErrors({});
    setDone(false);
  };

  const resetDemo = () => {
    if (
      window.confirm(
        "Reset all demo data? Products, categories, orders, banners, settings and the cart go back to the starting demo. You stay signed in."
      )
    ) {
      RESET_KEYS.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      window.location.reload();
    }
  };

  return (
    <form onSubmit={save} noValidate>
      <div className="ov-head">
        <div>
          <h2>Settings</h2>
          <p>Your store details, delivery, payments and the announcement bar</p>
        </div>
      </div>

      <section className="ov-card st-card">
        <h3>Store info</h3>
        <p>Used on the store and in the messages customers send you.</p>
        <div className="st-grid">
          <Field label="Store name" error={errors.storeName}>
            <input value={f.storeName} onChange={set("storeName")} />
          </Field>
          <Field label="Tagline">
            <input value={f.tagline} onChange={set("tagline")} />
          </Field>
          <Field label="WhatsApp number" error={errors.whatsapp} hint="Country code first, no + and no spaces. Orders from the cart go to this number.">
            <input value={f.whatsapp} onChange={set("whatsapp")} inputMode="tel" placeholder="2348012345678" />
          </Field>
          <Field label="Phone number">
            <input value={f.phone} onChange={set("phone")} inputMode="tel" placeholder="0801 234 5678" />
          </Field>
          <Field label="Email" error={errors.email}>
            <input value={f.email} onChange={set("email")} type="email" placeholder="hello@yourstore.com" />
          </Field>
          <Field label="Shop address">
            <input value={f.address} onChange={set("address")} placeholder="Street, city, state" />
          </Field>
        </div>
      </section>

      <section className="ov-card st-card">
        <h3>Delivery</h3>
        <p>This message shows on the product page and in the cart.</p>
        <div className="st-grid">
          <Field label="Delivery message" error={errors.deliveryNote} wide>
            <input value={f.deliveryNote} onChange={set("deliveryNote")} />
          </Field>
        </div>
      </section>

      <section className="ov-card st-card">
        <h3>Payments</h3>
        <p>Online payment with Paystack. Customers can always order on WhatsApp.</p>
        <div className="st-switch">
          <span>Accept online payment (Paystack)</span>
          <Switch on={f.paystackOn} onChange={flip("paystackOn")} label="Paystack" />
        </div>
        <div className="st-grid">
          <Field
            label="Paystack public key"
            error={errors.paystackKey}
            hint="Only the PUBLIC key (starts with pk_). Never paste the secret key (sk_) anywhere in the website."
            wide
          >
            <input value={f.paystackKey} onChange={set("paystackKey")} placeholder="pk_live_…" autoComplete="off" />
          </Field>
        </div>
      </section>

      <section className="ov-card st-card">
        <h3>Social links</h3>
        <p>Shown in the footer of the store.</p>
        <div className="st-grid">
          <Field label="Instagram">
            <input value={f.instagram} onChange={set("instagram")} placeholder="https://instagram.com/yourstore" />
          </Field>
          <Field label="TikTok">
            <input value={f.tiktok} onChange={set("tiktok")} placeholder="https://tiktok.com/@yourstore" />
          </Field>
          <Field label="Facebook">
            <input value={f.facebook} onChange={set("facebook")} placeholder="https://facebook.com/yourstore" />
          </Field>
        </div>
      </section>

      <section className="ov-card st-card">
        <h3>Announcement bar</h3>
        <p>A thin yellow strip at the very top of every store page, for a promo or a notice.</p>
        <div className="st-switch">
          <span>Show the announcement bar</span>
          <Switch on={f.announceOn} onChange={flip("announceOn")} label="Announcement bar" />
        </div>
        <div className="st-grid">
          <Field label="Text" error={errors.announceText} wide>
            <input value={f.announceText} onChange={set("announceText")} />
          </Field>
          <Field label="Where it goes when tapped (optional)" wide>
            <input value={f.announceLink} onChange={set("announceLink")} placeholder="/shop" />
          </Field>
        </div>
        {f.announceOn && f.announceText.trim() && (
          <div className="st-preview">{f.announceText}</div>
        )}
      </section>

      <section className="ov-card st-card">
        <h3>Admin account</h3>
        <p>Changing the admin password will work once the backend is connected.</p>
      </section>

      <section className="ov-card st-card st-danger">
        <h3>Demo data</h3>
        <p>
          Everything in this admin is saved in this browser while we build the store. Reset it to start the demo
          clean.
        </p>
        <button type="button" className="ad-btn ghost st-reset" onClick={resetDemo}>Reset demo data</button>
      </section>

      <div className="st-bar">
        <span>{done ? "Saved ✓" : dirty ? "You have unsaved changes" : "All changes saved"}</span>
        <div>
          <button type="button" className="ad-btn ghost" onClick={discard} disabled={!dirty}>Discard</button>
          <button type="submit" className="ad-btn" disabled={!dirty}>Save changes</button>
        </div>
      </div>
    </form>
  );
}