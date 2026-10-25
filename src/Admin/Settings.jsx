import { useEffect, useState } from "react";
import { DEFAULTS, getSettings } from "./settingsStore.js";
import { api } from "../data/api.js";

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
  const [saved, setSaved] = useState(DEFAULTS);
  const [f, setF] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/settings/all", { auth: true })
      .then((d) => {
        setSaved({ ...DEFAULTS, ...d });
        // anything you saved in this browser earlier carries over, so you can push it with one click on Save
        setF({ ...DEFAULTS, ...getSettings(), ...d });
        setReady(true);
      })
      .catch((e) =>
        setError(e.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : e.message)
      );
  }, []);

  const dirty = JSON.stringify(f) !== JSON.stringify(saved);
  const set = (k) => (e) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    setDone(false);
  };
  const flip = (k) => (v) => {
    setF((p) => ({ ...p, [k]: v }));
    setDone(false);
  };

  const save = async (ev) => {
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
    setBusy(true);
    try {
      const out = await api("/settings", { method: "PUT", auth: true, body: next });
      setF(out);
      setSaved(out);
      setDone(true);
    } catch (err) {
      alert(err.message);
    }
    setBusy(false);
  };

  const discard = () => {
    setF(saved);
    setErrors({});
    setDone(false);
  };

  if (error) {
    return (
      <>
        <div className="ov-head"><div><h2>Settings</h2></div></div>
        <p className="al-error">{error}</p>
      </>
    );
  }
  if (!ready) return <p>Loading…</p>;

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
        <p>The admin email and password are set in the backend's .env file.</p>
      </section>

      <div className="st-bar">
        <span>{done ? "Saved ✓" : dirty ? "You have unsaved changes" : "All changes saved"}</span>
        <div>
          <button type="button" className="ad-btn ghost" onClick={discard} disabled={!dirty}>Discard</button>
          <button type="submit" className="ad-btn" disabled={!dirty || busy}>{busy ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </form>
  );
}