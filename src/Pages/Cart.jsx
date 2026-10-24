import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useCart, setQty, removeFromCart, clearCart } from "../data/cart.js";
import "../Css/cart.css";

// The client's WhatsApp number: country code first, no + and no spaces. Example: 2348012345678
const WHATSAPP = "234XXXXXXXXXX";

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const EMPTY = { name: "", phone: "", email: "", state: "", city: "", address: "", note: "" };

function loadForm() {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem("delivery")) };
  } catch {
    return EMPTY;
  }
}

function validate(f) {
  const e = {};
  if (f.name.trim().length < 3) e.name = "Enter your full name";
  const digits = f.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 14) e.phone = "Enter a valid phone number";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "Enter a valid email";
  if (!f.state) e.state = "Choose your state";
  if (f.city.trim().length < 2) e.city = "Enter your city or area";
  if (f.address.trim().length < 5) e.address = "Enter your full delivery address";
  return e;
}

function Line({ item }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className="ca-item">
      <Link to={`/product/${item.id}`} state={{ product: item }} className="ca-img">
        {item.image && !missing && (
          <img src={item.image} alt={item.name} onError={() => setMissing(true)} />
        )}
      </Link>

      <div className="ca-main">
        <Link to={`/product/${item.id}`} state={{ product: item }} className="ca-name">
          {item.name}
        </Link>
        {item.color && <span className="ca-size">Color: {item.color}</span>}
        {item.size && <span className="ca-size">Size: {item.size}</span>}
        <span className="ca-unit">₦{item.price.toLocaleString()}</span>

        <div className="ca-qty">
          <button type="button" onClick={() => setQty(item.id, item.size, item.qty - 1, item.color)} aria-label="Less">−</button>
          <span>{item.qty}</span>
          <button type="button" onClick={() => setQty(item.id, item.size, item.qty + 1, item.color)} aria-label="More">+</button>
        </div>
      </div>

      <div className="ca-side">
        <b>₦{(item.price * item.qty).toLocaleString()}</b>
        <button type="button" className="ca-remove" onClick={() => removeFromCart(item.id, item.size, item.color)}>
          Remove
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, wide, children }) {
  return (
    <label className={wide ? "ca-field wide" : "ca-field"}>
      <span>{label}</span>
      {children}
      {error && <em>{error}</em>}
    </label>
  );
}

export default function Cart() {
  const cart = useCart();
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((n, i) => n + i.price * i.qty, 0);

  const [form, setForm] = useState(loadForm);
  const [tried, setTried] = useState(false);
  const formRef = useRef(null);
  const errors = tried ? validate(form) : {};

  const set = (key) => (e) => {
    const next = { ...form, [key]: e.target.value };
    setForm(next);
    try {
      localStorage.setItem("delivery", JSON.stringify(next));
    } catch {}
  };

  const lines = cart
    .map((i) => `• ${i.name}${i.color ? ` (${i.color})` : ""}${i.size ? ` (Size ${i.size})` : ""} x${i.qty} - ₦${(i.price * i.qty).toLocaleString()}`)
    .join("\n");
  const msg =
    `Hi, I want to order:\n${lines}\n\nTotal: ₦${total.toLocaleString()}\n\n` +
    `DELIVERY DETAILS\nName: ${form.name.trim()}\nPhone: ${form.phone.trim()}\nEmail: ${form.email.trim()}\n` +
    `Address: ${form.address.trim()}, ${form.city.trim()}, ${form.state}` +
    (form.note.trim() ? `\nNote: ${form.note.trim()}` : "");
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

  // both buttons check the delivery details first
  const proceed = (kind) => {
    setTried(true);
    if (Object.keys(validate(form)).length) {
      if (formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (kind === "wa") {
      window.open(wa, "_blank", "noopener");
    } else {
      // Paystack will be connected here when the backend is ready.
      alert("Online payment with Paystack will be connected soon. Please order on WhatsApp for now.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="ca">
        <div className="ca-head">
          <h1>YOUR CART</h1>
          {cart.length > 0 && <span>{count} {count === 1 ? "item" : "items"}</span>}
        </div>

        {cart.length === 0 ? (
          <div className="ca-empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="ca-btn">CONTINUE SHOPPING</Link>
          </div>
        ) : (
          <div className="ca-grid">
            <div className="ca-list">
              {cart.map((item) => (
                <Line key={`${item.id}-${item.size}-${item.color}`} item={item} />
              ))}
              <div className="ca-tools">
                <Link to="/shop">← Continue shopping</Link>
                <button type="button" onClick={clearCart}>Clear cart</button>
              </div>

              <section className="ca-form" ref={formRef}>
                <h2>DELIVERY DETAILS</h2>
                <p>Where should we deliver your order?</p>

                <div className="ca-fields">
                  <Field label="Full name" error={errors.name}>
                    <input type="text" value={form.name} onChange={set("name")} autoComplete="name" placeholder="e.g. Chinedu Okafor" />
                  </Field>
                  <Field label="Phone number" error={errors.phone}>
                    <input type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="e.g. 0801 234 5678" />
                  </Field>
                  <Field label="Email" error={errors.email} wide>
                    <input type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" />
                  </Field>
                  <Field label="State" error={errors.state}>
                    <select value={form.state} onChange={set("state")} autoComplete="address-level1">
                      <option value="">Select state</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Closest Motor Park" error={errors.city}>
                    <input type="text" value={form.city} onChange={set("city")} autoComplete="address-level2" placeholder="e.g. Ikeja" />
                  </Field>
                  <Field label="Full delivery address" error={errors.address} wide>
                    <textarea rows={3} value={form.address} onChange={set("address")} autoComplete="street-address" placeholder="House number, street, landmark" />
                  </Field>
                  <Field label="Note for the seller (optional)" wide>
                    <input type="text" value={form.note} onChange={set("note")} placeholder="e.g. Call me before you arrive" />
                  </Field>
                </div>
              </section>
            </div>

            <aside className="ca-summary">
              <h2>ORDER SUMMARY</h2>
              <div className="ca-row">
                <span>Subtotal</span>
                <b>₦{total.toLocaleString()}</b>
              </div>
              <div className="ca-row">
                <span>Delivery</span>
                <span>Confirmed on order</span>
              </div>
              <div className="ca-row total">
                <span>Total</span>
                <b>₦{total.toLocaleString()}</b>
              </div>

              {tried && Object.keys(errors).length > 0 && (
                <p className="ca-alert">Please fill in your delivery details first.</p>
              )}

              <button type="button" className="ca-pay" onClick={() => proceed("pay")}>PAY WITH PAYSTACK</button>
              <button type="button" className="ca-wa" onClick={() => proceed("wa")}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                ORDER ON WHATSAPP
              </button>

              <ul className="ca-notes">
                <li>Delivered in 3–4 business days across Nigeria</li>
                <li>Secure checkout with Paystack</li>
                <li>Returns &amp; exchanges — <Link to="/returns">see policy</Link></li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}