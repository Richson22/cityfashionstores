import { Link, useLocation } from "react-router-dom";

const Ico = ({ children }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

// the app-style tab bar at the bottom of the screen on phones
export default function BottomNav({ cartCount = 0 }) {
  const { pathname } = useLocation();

  const tabs = [
    {
      to: "/",
      label: "Home",
      on: pathname === "/",
      icon: (
        <Ico>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </Ico>
      ),
    },
    {
      to: "/shop",
      label: "Shop",
      on: pathname === "/shop" || pathname.startsWith("/product"),
      icon: (
        <Ico>
          <path d="M4 8l1-4h14l1 4" />
          <path d="M4 8h16v2a3 3 0 0 1-6 0 3 3 0 0 1-4 0 3 3 0 0 1-6 0z" />
          <path d="M5 12v8h14v-8" />
        </Ico>
      ),
    },
    {
      to: "/categories",
      label: "Categories",
      on: pathname === "/categories",
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
      to: "/cart",
      label: "Cart",
      on: pathname === "/cart",
      badge: cartCount,
      icon: (
        <Ico>
          <path d="M6 7h12l1 13H5z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </Ico>
      ),
    },
  ];

  return (
    <nav className="bnav" aria-label="Main">
      {tabs.map((t) => (
        <Link key={t.to} to={t.to} className={t.on ? "on" : ""}>
          {t.icon}
          {t.badge > 0 && <i>{t.badge}</i>}
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}