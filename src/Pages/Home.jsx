import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../Css/home.css";

// Put the photos in public/ as hero-1.jpg ... hero-4.jpg
const slides = [
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

// DEMO DATA for the client preview.
// Photos go in public/categories/ (bags.jpg, belts.jpg ...).
// When the backend is ready, replace this array with a fetch from /api/categories
// (each item: name, slug, image, count).
const categories = [
  { name: "Bags", slug: "bags", image: "/categories/bags.jpg", count: 37 },
  { name: "Belts", slug: "belts", image: "/categories/belts.jpg", count: 65 },
  { name: "Caps", slug: "caps", image: "/categories/caps.jpg", count: 47 },
  { name: "Glasses", slug: "glasses", image: "/categories/glasses.jpg", count: 10 },
  { name: "Hoodies", slug: "hoodies", image: "/categories/hoodies.jpg", count: 30 },
  { name: "Jackets", slug: "jackets", image: "/categories/jackets.jpg", count: 87 },
  { name: "Jeans", slug: "jeans", image: "/categories/jeans.jpg", count: 120 },
  { name: "Sneakers", slug: "sneakers", image: "/categories/sneakers.jpg", count: 64 },
  { name: "Tees", slug: "tees", image: "/categories/tees.jpg", count: 173 },
];

// DEMO DATA for the client preview.
// Photos go in public/products/ (p1.jpg ... p4.jpg).
// Later this array will come from the admin / backend.
const latest = [
  { id: 1, name: "Monogram Sketch Print Short Sleeve Shirt", price: 22100, image: "/products/p1.jpg", colors: ["#f5d90a", "#5ac8fa", "#111111", "#ffffff"] },
  { id: 2, name: "Cropped Long Sleeve Sweatshirt", price: 26000, image: "/products/p2.jpg" },
  { id: 3, name: "Tan Baggy Jeans with Embroidery and Studs", price: 23400, image: "/products/p3.jpg" },
  { id: 4, name: "Beige Baggy Jeans with Studs and Rips", price: 23400, image: "/products/p4.jpg" },
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
      {p.colors && p.colors.length > 1 && (
        <div className="prod-colors">
          <span className="prod-dots">
            {p.colors.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
          {p.colors.length} colors
        </div>
      )}
    </Link>
  );
}

// DEMO DATA for the client preview.
// Photos go in public/products/ (see the file names below).
// Later each row will come from the admin / backend by category.
const rows = [
  {
    title: "SPILL THE TEE",
    slug: "tees",
    items: [
      { id: 101, name: "Nice Day Bunny Pocket T-Shirt", price: 14300, image: "/products/tee-1.jpg" },
      { id: 102, name: "Canada Maple Leaf T-Shirt", price: 14300, image: "/products/tee-2.jpg", colors: ["#ffffff", "#111111"] },
      { id: 103, name: "Life Rope Knot T-Shirt", price: 14300, image: "/products/tee-3.jpg", colors: ["#111111", "#8a1fa8"] },
      { id: 104, name: "Oversized Graphic T-Shirt", price: 15800, image: "/products/tee-4.jpg" },
    ],
  },
  {
    title: "SHIRTS",
    slug: "shirts",
    items: [
      { id: 201, name: "Monogram Sketch Print Short Sleeve Shirt", price: 22100, image: "/products/shirt-1.jpg", colors: ["#f5d90a", "#5ac8fa", "#111111", "#ffffff"] },
      { id: 202, name: "Cuban Collar Linen Shirt", price: 19500, image: "/products/shirt-2.jpg" },
      { id: 203, name: "Striped Short Sleeve Shirt", price: 18200, image: "/products/shirt-3.jpg" },
      { id: 204, name: "Premium Plain Shirt", price: 17000, image: "/products/shirt-4.jpg" },
    ],
  },
  {
    title: "BOXERS",
    slug: "boxers",
    emoji: "🩲",
    items: [
      { id: 401, name: "Lacoste 3-Pack Singlet", price: 16900, image: "/products/boxer-1.jpg" },
      { id: 402, name: "Pulafit Men's Boxer", price: 6500, image: "/products/boxer-2.jpg", colors: ["#e53935", "#111111", "#1e6bff", "#8a4b1f"] },
      { id: 403, name: "Pro Jack Exclusive Men's Boxer", price: 5900, image: "/products/boxer-3.jpg", soldOut: true, colors: ["#e53935", "#1e6bff", "#8a1fa8", "#111111"] },
      { id: 404, name: "Big Band Boxer Briefs", price: 9100, image: "/products/boxer-4.jpg", colors: ["#7a7a85", "#00a3a3", "#ffd60a", "#e53935"] },
    ],
  },
  {
    title: "JERSEYS",
    slug: "jerseys",
    emoji: "⚽",
    items: [
      { id: 501, name: "Retro Football Jersey", price: 18500, image: "/products/jersey-1.jpg", colors: ["#e53935", "#ffffff", "#111111"] },
      { id: 502, name: "Classic Striped Jersey", price: 17000, image: "/products/jersey-2.jpg" },
      { id: 503, name: "Basketball Mesh Jersey", price: 16000, image: "/products/jersey-3.jpg", soldOut: true },
      { id: 504, name: "Away Kit Jersey", price: 19500, image: "/products/jersey-4.jpg", colors: ["#1e6bff", "#ffd60a"] },
    ],
  },
  {
    title: "SHOES",
    slug: "shoes",
    emoji: "👟",
    items: [
      { id: 601, name: "Chunky Street Sneakers", price: 38500, image: "/products/shoes-1.jpg", colors: ["#ffffff", "#111111", "#e53935"] },
      { id: 602, name: "Leather Low-Top Sneakers", price: 34000, image: "/products/shoes-2.jpg" },
      { id: 603, name: "Classic Canvas Shoes", price: 22500, image: "/products/shoes-3.jpg", colors: ["#ffffff", "#111111"] },
      { id: 604, name: "Men's Loafers", price: 29500, image: "/products/shoes-4.jpg" },
    ],
  },
  {
    title: "EYEGLASSES",
    slug: "eyeglasses",
    emoji: "🕶️",
    items: [
      { id: 701, name: "Rimless Square Glasses", price: 12500, image: "/products/glasses-1.jpg" },
      { id: 702, name: "Black Frame Sunglasses", price: 9800, image: "/products/glasses-2.jpg", colors: ["#111111", "#8a4b1f"] },
      { id: 703, name: "Round Metal Glasses", price: 11000, image: "/products/glasses-3.jpg" },
      { id: 704, name: "Shield Sport Sunglasses", price: 13500, image: "/products/glasses-4.jpg", soldOut: true },
    ],
  },
  {
    title: "TROUSERS",
    slug: "trousers",
    items: [
      { id: 801, name: "Slim Fit Chinos", price: 19000, image: "/products/trousers-1.jpg", colors: ["#c8b08a", "#111111", "#1f3a5f"] },
      { id: 802, name: "Pleated Wide Leg Trousers", price: 21500, image: "/products/trousers-2.jpg" },
      { id: 803, name: "Cargo Trousers", price: 20500, image: "/products/trousers-3.jpg" },
      { id: 804, name: "Corporate Straight Trousers", price: 18000, image: "/products/trousers-4.jpg" },
    ],
  },
  {
    title: "CAPS",
    slug: "caps",
    emoji: "🧢",
    items: [
      { id: 901, name: "Embroidered Baseball Cap", price: 7500, image: "/products/cap-1.jpg", colors: ["#111111", "#ffffff", "#1f3a5f"] },
      { id: 902, name: "Flat Brim Snapback", price: 8500, image: "/products/cap-2.jpg" },
      { id: 903, name: "Distressed Dad Cap", price: 7000, image: "/products/cap-3.jpg" },
      { id: 904, name: "Bucket Hat", price: 6500, image: "/products/cap-4.jpg", soldOut: true },
    ],
  },
  {
    title: "JOGGERS",
    slug: "joggers",
    items: [
      { id: 1001, name: "Cuffed Cotton Joggers", price: 15500, image: "/products/joggers-1.jpg", colors: ["#111111", "#7a7a85"] },
      { id: 1002, name: "Zip Pocket Joggers", price: 16800, image: "/products/joggers-2.jpg" },
      { id: 1003, name: "Tech Fleece Joggers", price: 18500, image: "/products/joggers-3.jpg" },
      { id: 1004, name: "Striped Track Pants", price: 14500, image: "/products/joggers-4.jpg" },
    ],
  },
  {
    title: "ARMLESS",
    slug: "armless",
    items: [
      { id: 1101, name: "Ribbed Muscle Vest", price: 8500, image: "/products/armless-1.jpg", colors: ["#ffffff", "#111111"] },
      { id: 1102, name: "Oversized Graphic Tank", price: 9500, image: "/products/armless-2.jpg" },
      { id: 1103, name: "Basketball Style Vest", price: 10500, image: "/products/armless-3.jpg" },
      { id: 1104, name: "Mesh Gym Tank", price: 8000, image: "/products/armless-4.jpg" },
    ],
  },
  {
    title: "JEANS",
    slug: "jeans",
    items: [
      { id: 301, name: "Tan Baggy Jeans with Embroidery and Studs", price: 23400, image: "/products/jeans-1.jpg" },
      { id: 302, name: "Beige Baggy Jeans with Studs and Rips", price: 23400, image: "/products/jeans-2.jpg" },
      { id: 303, name: "Washed Black Straight Jeans", price: 21000, image: "/products/jeans-3.jpg" },
      { id: 304, name: "Light Blue Wide Leg Jeans", price: 22500, image: "/products/jeans-4.jpg" },
    ],
  },
];

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
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = slides[index];

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
            {slide.title[1]}
          </h1>
          <p>{slide.text}</p>
          <Link to="/shop" className="shop-btn">{slide.button}</Link>
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
        <h2>CITY FASHION STORES — MEN'S STREETWEAR, DELIVERED ACROSS NIGERIA</h2>
        <p>
          City Fashion Stores is a Nigerian online men's fashion store for guys who dress with
          intent. We stock graphic tees, shirts, polos, jeans, jackets, hoodies, joggers,
          sneakers, caps, glasses and accessories — clean everyday fits and statement
          pieces, all menswear.
        </p>
        <p>
          Order online and pay securely, or order on WhatsApp. We deliver to Lagos, Abuja,
          Port Harcourt and every state in Nigeria. Fits Over Feelings.
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
          <p>Menswear built different — streetwear, sneakers and essentials, delivered across Nigeria.</p>
          <div className="foot-social">
            <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="foot-col">
          <h4>CUSTOMER SUPPORT</h4>
          <Link to="/size-guide">Size Guide</Link>
          <Link to="/shipping">Shipping Info</Link>
          <Link to="/returns">Returns &amp; Exchange</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="foot-col">
          <h4>QUICK LINKS</h4>
          <Link to="/shop">Shop Now</Link>
          <Link to="/account">My Account</Link>
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