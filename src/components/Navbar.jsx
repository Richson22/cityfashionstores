import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { useCartCount } from "../data/cart.js";
import { getSettings } from "../Admin/settingsStore.js";

export default function Navbar() {
  const cartCount = useCartCount();
  const st = getSettings();
  const [query, setQuery] = useState("");
  const [logoMissing, setLogoMissing] = useState(false);
  const [nameMissing, setNameMissing] = useState(false);
  const navigate = useNavigate();

  // dark / light theme (remembered between visits)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setNameMissing(false); // try the right picture again after switching
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // "More" dropdown
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false); // phone side menu
  const moreLinks = [
    { label: "T-shirts", slug: "tees" },
    { label: "Jeans", slug: "jeans" },
    { label: "Sneakers", slug: "sneakers" },
    { label: "Polos", slug: "polos" },
  ];

  useEffect(() => {
    const close = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // which page are we on? (for the highlight in the nav)
  const { pathname, search: query_ } = useLocation();
  const currentCat = new URLSearchParams(query_).get("category");
  const onMore = pathname === "/shop" && moreLinks.some((l) => l.slug === currentCat);
  const isShop = (pathname === "/shop" && !onMore) || pathname.startsWith("/product");
  const isCats = pathname === "/categories";

  // phone menu: close on page change, lock page scroll while open, Esc to close
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, query_]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
    {st.announceOn && st.announceText && (
      <div className="announce">
        {st.announceLink ? <Link to={st.announceLink}>{st.announceText}</Link> : st.announceText}
      </div>
    )}
    <header className="navbar">
      <Link to="/" className="nav-brand">
        {/* LOGO: put your logo icon at public/logo.png */}
        {logoMissing ? (
          <span className="logo-slot">LOGO</span>
        ) : (
          <img
            className="nav-logo-img"
            src="/logo.png"
            alt="City Fashion Stores logo"
            onError={() => setLogoMissing(true)}
          />
        )}

        {/* NAME (picture): put your name design at public/name.png */}
        {nameMissing ? (
          <span className="name-slot">City Fashion Stores</span>
        ) : (
          <img
            className="nav-name-img"
            src={theme === "light" ? "/name-light.png" : "/name.png"}
            alt="City Fashion Stores"
            onError={() => setNameMissing(true)}
          />
        )}
      </Link>

      <nav className="nav-links">
        <Link to="/shop" className={isShop ? "active" : ""}>Shop Now!</Link>
        <Link to="/categories" className={isCats ? "active" : ""}>All Categories</Link>
        <div className="nav-more" ref={moreRef}>
          <button
            type="button"
            className={`more-btn${moreOpen ? " open" : ""}${onMore ? " active" : ""}`}
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
          >
            More
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {moreOpen && (
            <div className="more-menu">
              {moreLinks.map((l) => (
                <Link
                  key={l.slug}
                  to={`/shop?category=${l.slug}`}
                  className={pathname === "/shop" && currentCat === l.slug ? "active" : ""}
                  onClick={() => setMoreOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <form className="nav-search" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" aria-label="Search">🔍</button>
      </form>

      <div className="nav-actions">
        {/* <Link to="/signin" className="nav-signin">Sign in</Link>
        <Link to="/signup" className="nav-signup">Sign up</Link> */}
        <Link to="/cart" className="nav-cart" aria-label="Cart">
          🛒
          {cartCount > 0 && <span className="nav-count">{cartCount}</span>}
        </Link>
        <button
          type="button"
          className="nav-theme"
          aria-label="Toggle theme"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>      </div>
      <button type="button" className="nav-burger" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div className={menuOpen ? "side-overlay open" : "side-overlay"} onClick={() => setMenuOpen(false)} />
      <aside className={menuOpen ? "side-menu open" : "side-menu"} aria-hidden={!menuOpen}>
        <div className="side-head">
          <span>Menu</span>
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <nav className="side-links">
          <Link to="/" className={pathname === "/" ? "active" : ""} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" className={isShop ? "active" : ""} onClick={() => setMenuOpen(false)}>Shop Now!</Link>          <Link to="/categories" className={isCats ? "active" : ""} onClick={() => setMenuOpen(false)}>All Categories</Link>
          <h4>MORE</h4>
          {moreLinks.map((l) => (
            <Link
              key={l.slug}
              to={`/shop?category=${l.slug}`}
              className={pathname === "/shop" && currentCat === l.slug ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
    </header>
    </>
  );
}