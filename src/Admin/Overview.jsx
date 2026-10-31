import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../data/api.js";

const money = (n) => `₦${(n || 0).toLocaleString()}`;
const short = (n) => (n >= 1000000 ? `${(n / 1000000).toFixed(1)}m` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
const when = (d) =>
  new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/stats", { auth: true })
      .then(setData)
      .catch((e) => setError(e.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : e.message));
  }, []);

  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });

  const head = (
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
  );

  if (error) return <>{head}<p className="al-error">{error}</p></>;
  if (!data) return <>{head}<p>Loading…</p></>;

  const { sales = [], status = [], recent = [], low = [] } = data;
  const max = Math.max(1, ...sales.map((s) => s.v));
  const week = sales.reduce((n, s) => n + s.v, 0);
  const totalOrders = status.reduce((n, s) => n + s.n, 0);

  let change = "No sales last month yet";
  if (data.revenuePrev > 0) {
    const pct = Math.round(((data.revenueMonth - data.revenuePrev) / data.revenuePrev) * 100);
    change = `${pct >= 0 ? "+" : ""}${pct}% compared to last month`;
  }

  const STATS = [
    { label: "Revenue this month", value: money(data.revenueMonth), note: change },
    { label: "Orders this month", value: String(data.ordersMonth), note: `${data.pending} waiting to be processed` },
    { label: "Active products", value: String(data.activeProducts), note: `${data.soldOut} sold out` },
    { label: "Low stock", value: String(data.lowCount), note: "products with 3 or fewer left" },
  ];

  return (
    <>
      {head}

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
            {sales.map((s, i) => (
              <div className="ov-bar" key={i} title={`${s.d}: ${money(s.v)}`}>
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
            {status.map((s) => (
              <li key={s.label}>
                <div>
                  <span>{s.label}</span>
                  <b>{s.n}</b>
                </div>
                <div className="ov-track">
                  <i style={{ width: `${totalOrders ? (s.n / totalOrders) * 100 : 0}%` }} />
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
          {recent.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
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
                  {recent.map((o, i) => (
                    <tr key={o.no ?? i}>
                      <td><b>#{o.no}</b></td>
                      <td>{o.who}</td>
                      <td>{o.items}</td>
                      <td>{money(o.total)}</td>
                      <td><span className={`ad-badge ${String(o.status || "unknown").toLowerCase()}`}>{o.status || "Unknown"}</span></td>
                      <td className="mute">{when(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="ov-card">
          <div className="ov-card-head">
            <h3>Running low</h3>
            <Link to="/admin/products">Manage →</Link>
          </div>
          {low.length === 0 ? (
            <p>Nothing is running low.</p>
          ) : (
            <ul className="ov-low">
              {low.map((p) => (
                <li key={p.name}>
                  <span>{p.name}</span>
                  <b className={p.left <= 1 ? "red" : ""}>{p.left} left</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}