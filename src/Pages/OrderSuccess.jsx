import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { api } from "../data/api.js";
import { getSettings } from "../Admin/settingsStore.js";
import "../Css/track.css";

export default function OrderSuccess() {
  const { no } = useParams();
  const { state } = useLocation();
  const fromCart = state && state.order && String(state.order.no) === no ? state.order : null;
  const [order, setOrder] = useState(fromCart);
  const [loading, setLoading] = useState(!fromCart);
  const [settings, setSettings] = useState(getSettings);

  useEffect(() => {
    api("/settings")
      .then((s) => {
        if (s && Object.keys(s).length) setSettings((p) => ({ ...p, ...s }));
      })
      .catch(() => {});
    if (fromCart) return;
    // opened without the cart (new tab, shared link): only basic details are public
    api(`/orders/summary/${no}`)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [no]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="tk"><div className="tk-card"><p>Loading…</p></div></div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="tk">
          <div className="tk-card">
            <h1>Order not found</h1>
            <p>We could not find this order.</p>
            <Link to="/track" className="tk-btn">TRACK AN ORDER</Link>
          </div>
        </div>
      </>
    );
  }

  const c = order.customer;
  const again = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    `Hi, I placed order #${order.no}.${c ? ` My name is ${c.name}.` : ""}`
  )}`;

  return (
    <>
      <Navbar />
      <div className="tk">
        <div className="tk-card center">
          <div className="tk-check" aria-hidden="true">✓</div>
          <h1>Thank you{c ? `, ${c.name.split(" ")[0]}` : ""}!</h1>
          <p>Your order has been received. Please send it on WhatsApp so we can confirm it.</p>

          <div className="tk-number">
            <span>ORDER NUMBER</span>
            <b>#{order.no}</b>
          </div>
          <p className="tk-small">
            Keep this number. With the phone number you used{c ? ` (${c.phone})` : ""} you can track your order any time.
          </p>

          <div className="tk-sum">
            {order.items && (
              <div><span>Items</span><b>{order.items.reduce((n, i) => n + i.qty, 0)}</b></div>
            )}
            <div><span>Total</span><b>₦{order.total.toLocaleString()}</b></div>
            {c && <div><span>Deliver to</span><b>{c.address}, {c.city}, {c.state}</b></div>}
          </div>

          <div className="tk-actions">
            <Link to={`/track?no=${order.no}`} className="tk-btn">TRACK ORDER</Link>
            <a href={again} target="_blank" rel="noreferrer" className="tk-btn ghost">Open WhatsApp again</a>
            <Link to="/shop" className="tk-link">Continue shopping</Link>
          </div>
        </div>
      </div>
    </>
  );
}