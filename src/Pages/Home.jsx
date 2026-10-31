import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../Css/home.css";
import { useCatalog } from "../data/catalog.js";
import { useSettings } from "../data/settings.js";
import { useHeroSlides } from "../data/banners.js";

// Put the photos in public/ as hero-1.jpg ... hero-4.jpg
const defaultSlides = [
  {
    tag: "",
    title: ["FITS OVER", "FEELINGS."],
    text: "Style that speaks louder than emotions. Designed for confidence. Built for presence.",
    button: "🛒 SHOP THE DROP",
    image: "/hero-1.jpg",
  },
  {
    tag: "New Arrivals",
    title: ["BUILT", "DIFFERENT.", "WORN BETTER."],
    text: "Streetwear that keeps it clean, sharp, and unapologetic. This is City Fashion Stores.",
    button: "🔥 EXPLORE COLLECTION",
    image: "/hero-2.jpg",
  },
  {
    tag: "NEW ARRIVALS",
    title: ["BUILT DIFFERENT.", "WORN BETTER."],
    text: "Premium fabrics. Timeless fits. Because feelings fade - style doesn't.",
    button: "🌟 SHOP PREMIUM FITS",
    image: "/hero-3.jpg",
  },
  {
    tag: "",
    title: ["SAY LESS.", "WEAR MORE."],
    text: "Your outfit already said it. Fits over feelings - always.",
    button: "🛍️ SHOP STREETWEAR",
    image: "/hero-4.jpg",
  },
];

function ProductCard({ p }) {
  const [missing, setMissing] = useState(false);
  return (
    <Link to={`/product/${p.id}`} state={{ product: p }} className={p.soldOut ? "prod sold" : "prod"}>
      <div className="prod-img">
        {p.soldOut && <span className="sold-tag">SOLD OUT</span>}
        {p.image && !missing && (
          <img src={p.image} alt={p.name} loading="lazy" onError={() => setMissing(true)} />
        )}
      </div>
      <h3>{p.name}</h3>
      <b className="prod-price">₦{p.price.toLocaleString()}</b>
      {p.colors && p.colors.length > 0 && (
        <div className="prod-colors">
          <span className="prod-dots">
            {p.colors.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
          {p.colors.length} {p.colors.length === 1 ? "color" : "colors"}
        </div>
      )}
    </Link>
  );
}

function CategoryTile({ cat }) {
  const [missing, setMissing] = useState(false);
  return (
    <Link to={`/shop?category=${cat.slug}`} className="cat-tile">
      {cat.image && !missing && (
        <img src={cat.image} alt={cat.name} loading="lazy" onError={() => setMissing(true)} />
      )}
      <div className="cat-shade" />
      <div className="cat-info">
        <b>{cat.name}</b>
        {cat.count !== undefined && <span>{cat.count} items</span>}
      </div>
    </Link>
  );
}

export default function Home() {
  // slides come from the admin Banners page (or the built-in ones above)
  const slides = useHeroSlides(defaultSlides);
  const settings = useSettings();

  // categories, latest arrivals and the product rows come from the admin
  const { categories, latest, rows } = useCatalog();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[index % slides.length];

  return (
    <>
    <Navbar />
    <div className="home">
      <section
        className="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="hero-text" key={`t${index}`}>
          {slide.tag && <span className="hero-tag">{slide.tag}</span>}
          <h1>
            {slide.title[0]}
            <br />
           {slide.title.slice(1).map((t, i) => (
              <span key={i}>{i > 0 && <br />}{t}</span>
            ))}
          </h1>
          <p>{slide.text}</p>
          <Link to={slide.link || "/shop"} className="shop-btn">{slide.button}</Link>
        </div>

        <div className="hero-image" key={`i${index}`}>
          <img src={slide.image} alt="" />
        </div>

        <div className="dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={i === index ? "dot active" : "dot"}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="arr">
        <div className="arr-head">
          <h2>LATEST ARRIVALS</h2>
          <Link to="/shop" className="arr-all">
            View all
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
        <div className="arr-grid">
          {latest.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <div className="rows">
        {rows.map((r) => (
          <section className="arr" key={r.slug}>
            <div className="arr-head">
              <h2>
                {r.title}
                {r.emoji && <span className="arr-emoji">{r.emoji}</span>}
              </h2>
              <Link to={`/shop?category=${r.slug}`} className="arr-all">
                View all
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
            <div className="arr-grid">
              {r.items.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="about">
        <span className="about-eyebrow">ABOUT US</span>
        <h2>CITY FASHION STORES.</h2>
        <p>
          We are a fashion retail business at 106 Old Enugu Road, Mile 50, Abakaliki, Ebonyi State, committed to
          providing stylish, quality-conscious, and affordable fashion that helps you look good and feel confident on
          every occasion. Now you can shop with us online from anywhere in Nigeria.
        </p>
        <p>
          <Link to="/about" className="arr-all">Read our story →</Link>
        </p>
      </section>

      <section className="cats">
        <div className="cats-head">
          <div>
            <span className="cats-eyebrow">SHOP BY</span>
            <h2>CATEGORIES</h2>
          </div>
          <button type="button" className="cats-all" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show less" : "View all"}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <div className={showAll ? "cats-grid" : "cats-row"}>
          {categories.map((c) => (
            <CategoryTile key={c.slug} cat={c} />
          ))}
        </div>
      </section>
    </div>
          <section className="trust">
        <a href="/cac.png" target="_blank" rel="noreferrer" className="trust-img" aria-label="View our CAC certificate">
          <img src="/cac.png" alt="CAC registration certificate" loading="lazy" />
        </a>
        <div className="trust-text">
          <h3>Registered with the Corporate Affairs Commission (CAC)</h3>
          <p>City Fashion Stores is a registered business.</p>
          <a href="/cac.png" target="_blank" rel="noreferrer">View certificate →</a>
        </div>
      </section>

      <footer className="foot">
      <div className="foot-top">
        <div className="foot-brand">
          <Link to="/" className="foot-logo">
            <img src="/logo.png" alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
            <img className="foot-name" src="/name.png" alt="City Fashion Stores" />
          </Link>
          <h3>
            FITS OVER
            <br />
            <em>FEELINGS.</em>
          </h3>
          <p>Menswear built different, streetwear, sneakers and essentials, delivered across Nigeria.</p>
          <div className="foot-social">
            <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href={settings.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="foot-col">
          <h4>CUSTOMER SUPPORT</h4>
          <Link to="/shipping">Shipping Info</Link>
          <Link to="/returns">Returns &amp; Exchange</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="foot-col">
          <h4>QUICK LINKS</h4>
          <Link to="/shop">Shop Now</Link>
          <Link to="/about">About Us</Link>
          <Link to="/policy">Policy</Link>
          <Link to="/track">Track Order</Link>
        </div>
      </div>

      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} City Fashion Stores. All rights reserved.</span>
        <div>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
    </>
  );
}