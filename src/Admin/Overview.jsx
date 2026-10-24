import { Link } from "react-router-dom";

// DEMO NUMBERS: they become real when the backend is connected.
const money = (n) => `₦${n.toLocaleString()}`;
const short = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(1)}m` : `${Math.round(n / 1000)}k`);

const STATS = [
  { label: "Revenue this month", value: money(2845000), note: "+12% compared to last month" },
  { label: "Orders this month", value: "126", note: "14 waiting to be processed" },
  { label: "Active products", value: "1,838", note: "42 sold out" },
  { label: "Low stock", value: "9", note: "products with 3 or fewer left" },
];

const SALES = [
  { d: "Mon", v: 185000 },
  { d: "Tue", v: 242000 },
  { d: "Wed", v: 131000 },
  { d: "Thu", v: 318000 },
  { d: "Fri", v: 402000 },
  { d: "Sat", v: 469000 },
  { d: "Sun", v: 276000 },
];

const STATUS = [
  { label: "Pending", n: 14 },
  { label: "Paid", n: 31 },
  { label: "Shipped", n: 22 },
  { label: "Delivered", n: 59 },
];

const ORDERS = [
  { no: "#1042", who: "Chinedu Okafor", items: 2, total: 45500, status: "Pending", when: "Today, 10:42" },
  { no: "#1041", who: "Amaka Eze", items: 1, total: 23400, status: "Paid", when: "Today, 09:15" },
  { no: "#1040", who: "Tunde Bello", items: 3, total: 68900, status: "Shipped", when: "Yesterday" },
  { no: "#1039", who: "Ngozi Umeh", items: 1, total: 14300, status: "Delivered", when: "Yesterday" },
  { no: "#1038", who: "Ibrahim Musa", items: 2, total: 52000, status: "Delivered", when: "2 days ago" },
  { no: "#1037", who: "Folake Adeyemi", items: 1, total: 22100, status: "Paid", when: "2 days ago" },
];

const LOW = [
  { name: "Scott Made It Polo Shirt", left: 1 },
  { name: "Tan Baggy Jeans", left: 2 },
  { name: "Olive Bomber Jacket", left: 2 },
  { name: "Retro Football Jersey", left: 3 },
  { name: "Pulafit Men's Boxer", left: 3 },
];

export default function Overview() {
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  const max = Math.max(...SALES.map((s) => s.v));
  const week = SALES.reduce((n, s) => n + s.v, 0);
  const totalOrders = STATUS.reduce((n, s) => n + s.n, 0);

  return (
    <>
      <div className="ov-head">
        <div>
          <h2>Welcome back 👋</h2>
          <p>{today} · here is what is happening in your store</p>
        </div>
        <div className="ov-actions">
          <Link to="/admin/products" className="ad-btn">+ Add product</Link>
          <Link to="/admin/categories" className="ad-btn ghost">+ Add category</Link>
        </div>
      </div>

      <div className="ov-stats">
        {STATS.map((s) => (
          <div className="ov-stat" key={s.label}>
            <span>{s.label}</span>
            <b>{s.value}</b>
            <small>{s.note}</small>
          </div>
        ))}
      </div>

      <div className="ov-two">
        <section className="ov-card">
          <div className="ov-card-head">
            <h3>Sales, last 7 days</h3>
            <b>{money(week)}</b>
          </div>
          <div className="ov-chart">
            {SALES.map((s) => (
              <div className="ov-bar" key={s.d} title={`${s.d}: ${money(s.v)}`}>
                <em>{short(s.v)}</em>
                <i style={{ height: `${Math.max(6, (s.v / max) * 100)}%` }} />
                <span>{s.d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ov-card">
          <div className="ov-card-head">
            <h3>Orders by status</h3>
            <b>{totalOrders} total</b>
          </div>
          <ul className="ov-status">
            {STATUS.map((s) => (
              <li key={s.label}>
                <div>
                  <span>{s.label}</span>
                  <b>{s.n}</b>
                </div>
                <div className="ov-track">
                  <i style={{ width: `${(s.n / totalOrders) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="ov-two wide-left">
        <section className="ov-card">
          <div className="ov-card-head">
            <h3>Recent orders</h3>
            <Link to="/admin/orders">View all →</Link>
          </div>
          <div className="ov-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((o) => (
                  <tr key={o.no}>
                    <td><b>{o.no}</b></td>
                    <td>{o.who}</td>
                    <td>{o.items}</td>
                    <td>{money(o.total)}</td>
                    <td><span className={`ad-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                    <td className="mute">{o.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ov-card">
          <div className="ov-card-head">
            <h3>Running low</h3>
            <Link to="/admin/products">Manage →</Link>
          </div>
          <ul className="ov-low">
            {LOW.map((p) => (
              <li key={p.name}>
                <span>{p.name}</span>
                <b className={p.left <= 1 ? "red" : ""}>{p.left} left</b>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}