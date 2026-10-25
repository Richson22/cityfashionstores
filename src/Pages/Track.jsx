import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { api } from "../data/api.js";
import { getSettings } from "../Admin/settingsStore.js";
import "../Css/track.css";

const STEPS = [
  { key: "Pending", title: "Order placed", note: "We received your order." },
  { key: "Paid", title: "Payment confirmed", note: "Your payment has been confirmed." },
  { key: "Shipped", title: "On the way", note: "Your order has been handed over for delivery." },
  { key: "Delivered", title: "Delivered", note: "Your order has arrived." },
];

const when = (t) =>
  new Date(t).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function Track() {
  const [params] = useSearchParams();
  const [no, setNo] = useState(params.get("no") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(getSettings);
  useEffect(() => {
    api("/settings")
      .then((s) => {
        if (s && Object.keys(s).length) setSettings((p) => ({ ...p, ...s }));
      })
      .catch(() => {});
  }, []);

    const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    if (!no.trim() || !phone.trim()) {
      setError("Enter your order number and phone number.");
      return;
    }
    setBusy(true);
    try {
      setOrder(await api("/orders/track", { method: "POST", body: { no: no.replace(/\D/g, ""), phone } }));
    } catch (err) {
      const m = err.message;
      setError(
        m === "Failed to fetch"
          ? "Cannot reach the server. Please try again."
          : m.startsWith("Too many")
          ? m
          : "We could not find that order. Check the order number and the phone number you used."
      );
    }
    setBusy(false);
  };
  

  const step = order ? STEPS.findIndex((s) => s.key === order.status) : -1;
  const cancelled = order && order.status === "Cancelled";

  return (
    <>
      <Navbar />
      <div className="tk">
        <div className="tk-wrap">
          <h1 className="tk-title">TRACK YOUR ORDER</h1>
          <p className="tk-sub">Enter your order number and the phone number you used when you ordered.</p>

          <form className="tk-form" onSubmit={submit} noValidate>
            <label>
              <span>Order number</span>
              <input value={no} onChange={(e) => setNo(e.target.value)} placeholder="e.g. 1042" inputMode="numeric" />
            </label>
            <label>
              <span>Phone number</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801 234 5678" inputMode="tel" />
            </label>
            <button type="submit" className="tk-btn" disabled={busy}>{busy ? "CHECKING…" : "TRACK"}</button>
          </form>

          {error && <p className="tk-error" role="alert">{error}</p>}

          {order && (
            <div className="tk-result">
              <div className="tk-result-head">
                <h2>Order #{order.no}</h2>
                <span className={`tk-badge ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <p className="tk-small">Placed on {when(order.createdAt)}</p>

              {cancelled ? (
                <p className="tk-cancel">This order was cancelled. Message us on WhatsApp if you have a question.</p>
              ) : (
                <ol className="tk-steps">
                  {STEPS.map((s, i) => (
                    <li key={s.key} className={i < step ? "done" : i === step ? "now" : ""}>
                      <i>{i <= step ? "✓" : i + 1}</i>
                      <div>
                        <b>{s.title}</b>
                        <small>{i <= step ? s.note : "Waiting"}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              <div className="tk-box">
                <h3>ITEMS</h3>
                {order.items.map((i, k) => (
                  <div className="tk-item" key={k}>
                    <span>
                      {i.name}
                      <small>
                        {[i.color, i.size && `Size ${i.size}`].filter(Boolean).join(" · ")}
                        {(i.color || i.size) && " · "}
                        Qty {i.qty}
                      </small>
                    </span>
                    <b>₦{(i.price * i.qty).toLocaleString()}</b>
                  </div>
                ))}
                <div className="tk-item total">
                  <span>Total</span>
                  <b>₦{order.total.toLocaleString()}</b>
                </div>
              </div>

              <div className="tk-box">
                <h3>DELIVERING TO</h3>
                <p>
                  {order.customer.name}
                  <br />
                  {order.customer.address}, {order.customer.city}, {order.customer.state}
                </p>
              </div>

              <a
                className="tk-btn ghost"
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Hi, about my order #${order.no}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                Ask about this order on WhatsApp
              </a>
            </div>
          )}

          <Link to="/shop" className="tk-link">← Continue shopping</Link>
        </div>
      </div>
    </>
  );
}