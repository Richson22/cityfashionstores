import { useEffect, useState } from "react";
import { STATUSES } from "./ordersStore.js";
import { api } from "../data/api.js";

const PAGE = 10;
const money = (n) => `₦${Number(n).toLocaleString()}`;
const when = (t) =>
  new Date(t).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const qtyOf = (o) => o.items.reduce((n, i) => n + i.qty, 0);

// 0801 234 5678 -> 2348012345678 (for the WhatsApp link)
function waNumber(phone) {
  const d = String(phone).replace(/\D/g, "");
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return "234" + d.slice(1);
  return d;
}

function Badge({ status }) {
  return <span className={`ad-badge ${status.toLowerCase()}`}>{status}</span>;
}

function Pic({ src }) {
  const [bad, setBad] = useState(false);
  return (
    <span className="pr-thumb">
      {src && !bad && <img src={src} alt="" onError={() => setBad(true)} />}
    </span>
  );
}

/* ---------- order details panel ---------- */
function Detail({ order, onStatus, onDelete, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const c = order.customer;
  const msg = `Hello ${c.name}, this is City Fashion Stores about your order #${order.no}.`;

  return (
    <>
      <div className="pr-overlay" onClick={onClose} />
      <aside className="pr-drawer">
        <div className="pr-drawer-head">
          <h2>Order #{order.no}</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pr-drawer-body">
          <div className="or-block">
            <h4>STATUS</h4>
            <div className="pr-chips">
              {STATUSES.map((s) => (
                <button key={s} type="button" className={order.status === s ? "on" : ""} onClick={() => onStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="or-block">
            <h4>CUSTOMER</h4>
            <div className="or-rows">
              <div><span>Name</span><b>{c.name}</b></div>
              <div><span>Phone</span><b><a href={`tel:${c.phone}`}>{c.phone}</a></b></div>
              <div><span>Email</span><b>{c.email}</b></div>
              <div><span>Deliver to</span><b>{c.address}, {c.city}, {c.state}</b></div>
              {c.note && <div><span>Note</span><b>{c.note}</b></div>}
            </div>
          </div>

          <div className="or-block">
            <h4>ITEMS ({qtyOf(order)})</h4>
            <div className="or-items">
              {order.items.map((i, k) => (
                <div className="or-item" key={k}>
                  <Pic src={i.image} />
                  <div>
                    <b>{i.name}</b>
                    <small>
                      {[i.color, i.size && `Size ${i.size}`].filter(Boolean).join(" · ")}
                      {(i.color || i.size) && " · "}
                      {i.qty} × {money(i.price)}
                    </small>
                  </div>
                  <b>{money(i.price * i.qty)}</b>
                </div>
              ))}
            </div>
            <div className="or-total">
              <span>Total</span>
              <b>{money(order.total)}</b>
            </div>
          </div>

          <div className="or-block">
            <h4>ORDER INFO</h4>
            <div className="or-rows">
              <div><span>Placed</span><b>{when(order.createdAt)}</b></div>
              <div><span>Ordered through</span><b>{order.method}</b></div>
            </div>
          </div>
        </div>

        <div className="pr-drawer-foot or-foot">
          <button type="button" className="ad-btn ghost or-del" onClick={onDelete}>Delete order</button>
          <a
            className="ad-btn"
            href={`https://wa.me/${waNumber(c.phone)}?text=${encodeURIComponent(msg)}`}
            target="_blank"
            rel="noreferrer"
          >
            Message on WhatsApp
          </a>
        </div>
      </aside>
    </>
  );
}

/* ---------- the page ---------- */
export default function Orders() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [openNo, setOpenNo] = useState(null);

  const load = async () => {
    try {
      setList(await api("/orders", { auth: true }));
      setError("");
    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (no, status) => {
    const prev = list;
    setList(list.map((o) => (o.no === no ? { ...o, status } : o)));
    try {
      await api(`/orders/${no}`, { method: "PATCH", auth: true, body: { status } });
    } catch (e) {
      alert(e.message);
      setList(prev);
    }
  };

  const remove = async (o) => {
    if (!window.confirm(`Delete order #${o.no}? This cannot be undone.`)) return;
    try {
      await api(`/orders/${o.no}`, { method: "DELETE", auth: true });
      setList(list.filter((x) => x.no !== o.no));
      setOpenNo(null);
    } catch (e) {
      alert(e.message);
    }
  };

  if (error) {
    return (
      <>
        <div className="ov-head"><div><h2>Orders</h2></div></div>
        <p className="al-error">{error}</p>
        <button type="button" className="ad-btn ghost" onClick={load}>Try again</button>
      </>
    );
  }
  if (!list) return <p>Loading…</p>;
  const counts = { All: list.length };
  STATUSES.forEach((s) => (counts[s] = list.filter((o) => o.status === s).length));

  const text = q.trim().toLowerCase();
  const shown = list
    .filter((o) => {
      if (tab !== "All" && o.status !== tab) return false;
      if (!text) return true;
      return (
        String(o.no).includes(text.replace("#", "")) ||
        o.customer.name.toLowerCase().includes(text) ||
        o.customer.phone.replace(/\s/g, "").includes(text.replace(/\s/g, ""))
      );
    })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pages = Math.max(1, Math.ceil(shown.length / PAGE));
  const cur = Math.min(page, pages);
  const rows = shown.slice((cur - 1) * PAGE, cur * PAGE);
  const open = list.find((o) => o.no === openNo);

  return (
    <>
      <div className="ov-head">
        <div>
          <h2>Orders</h2>
          <p>{list.length} orders in total</p>
        </div>
      </div>

      <div className="or-tabs">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            className={tab === s ? "on" : ""}
            onClick={() => {
              setTab(s);
              setPage(1);
            }}
          >
            {s}
            <b>{counts[s]}</b>
          </button>
        ))}
      </div>

      <div className="pr-filters">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search by order number, name or phone…"
        />
      </div>

      <section className="ov-card pr-card">
        <div className="ov-table">
          <table className="pr-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Through</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.no} className="or-row" onClick={() => setOpenNo(o.no)}>
                  <td><b>#{o.no}</b></td>
                  <td>
                    <div className="or-cust">
                      <b>{o.customer.name}</b>
                      <small>{o.customer.city}, {o.customer.state}</small>
                    </div>
                  </td>
                  <td>{qtyOf(o)}</td>
                  <td>{money(o.total)}</td>
                  <td>{o.method}</td>
                  <td><Badge status={o.status} /></td>
                  <td className="mute">{when(o.createdAt)}</td>
                  <td className="pr-act">
                    <button type="button" onClick={() => setOpenNo(o.no)}>View</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="pr-empty">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pr-pager">
            <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)}>← Previous</button>
            <span>Page {cur} of {pages}</span>
            <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next →</button>
          </div>
        )}
      </section>

      {open && (
        <Detail
          order={open}
          onStatus={(s) => setStatus(open.no, s)}
          onDelete={() => remove(open)}
          onClose={() => setOpenNo(null)}
        />
      )}
    </>
  );
}