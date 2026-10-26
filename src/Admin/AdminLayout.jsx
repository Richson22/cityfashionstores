import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../Css/admin.css";
import { logout } from "./auth.js";

const Ico = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const NAV = [
  {
    to: "/admin",
    label: "Overview",
    end: true,
    icon: (
      <Ico>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </Ico>
    ),
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: (
      <Ico>
        <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
        <path d="M3 7l9 4 9-4M12 11v10" />
      </Ico>
    ),
  },
  {
    to: "/admin/categories",
    label: "Categories",
    icon: (
      <Ico>
        <path d="M12 3l9 5-9 5-9-5z" />
        <path d="M3 13l9 5 9-5" />
      </Ico>
    ),
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: (
      <Ico>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6M9 12h6" />
      </Ico>
    ),
  },
  {
    to: "/admin/banners",
    label: "Banners",
    icon: (
      <Ico>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="M21 16l-5-5-8 8" />
      </Ico>
    ),
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: (
      <Ico>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
      </Ico>
    ),
  },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const current = NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));

  return (
    <div className="ad">
      <div className={open ? "ad-overlay open" : "ad-overlay"} onClick={() => setOpen(false)} />

      <aside className={open ? "ad-side open" : "ad-side"}>
        <Link to="/admin" className="ad-brand">
          <img src="/logo.png" alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
          <span>City Fashion<br /><small>ADMIN</small></span>
        </Link>

        <nav className="ad-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "on" : "")}>
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="ad-store">← View store</Link>
      </aside>

      <div className="ad-main">
        <header className="ad-top">
          <button type="button" className="ad-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <h1>{current ? current.label : "Admin"}</h1>
          <div className="ad-top-right">
            <button
              type="button"
              className="ad-theme"
              aria-label="Toggle theme"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            <span className="ad-avatar" title="Admin">A</span>
            <button type="button" className="ad-logout" onClick={signOut}>Logout</button>
          </div>
        </header>

        <main className="ad-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}