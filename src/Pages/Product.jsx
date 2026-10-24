import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { PRODUCTS, CATS } from "./Shop.jsx";
import { addToCart } from "../data/cart.js";
import "../Css/product.css";

// The client's WhatsApp number: country code first, no + and no spaces. Example: 2348012345678
const WHATSAPP = "234XXXXXXXXXX";

const CLOTHES = ["S", "M", "L", "XL", "XXL"];
const SHOES = ["40", "41", "42", "43", "44", "45"];
const NO_SIZE = ["caps", "bags", "belts", "eyeglasses"];

// color names for the swatches (the admin can later send { name, hex } instead)
const COLOR_NAMES = {
  "#111111": "Black",
  "#ffffff": "White",
  "#e53935": "Red",
  "#1e6bff": "Blue",
  "#ffd60a": "Yellow",
  "#f5d90a": "Yellow",
  "#5ac8fa": "Sky blue",
  "#7a7a85": "Grey",
  "#8a1fa8": "Purple",
  "#8a4b1f": "Brown",
  "#c8b08a": "Beige",
  "#1f3a5f": "Navy",
  "#00a3a3": "Teal",
};
const toColor = (c, i) =>
  typeof c === "string" ? { hex: c, name: COLOR_NAMES[c.toLowerCase()] || `Color ${i + 1}` } : c;

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

/* ---------- recently viewed (saved in the browser) ---------- */
function getRecent() {
  try {
    return JSON.parse(localStorage.getItem("recent")) || [];
  } catch {
    return [];
  }
}
function pushRecent(p) {
  const keep = { id: p.id, name: p.name, price: p.price, image: p.image, category: p.category, colors: p.colors, soldOut: p.soldOut };
  const list = [keep, ...getRecent().filter((x) => x.id !== p.id)].slice(0, 12);
  try {
    localStorage.setItem("recent", JSON.stringify(list));
  } catch {}
}

/* ---------- small product card used in the rows ---------- */
function ItemCard({ p }) {
  const [missing, setMissing] = useState(false);
  return (
    <Link to={`/product/${p.id}`} state={{ product: p }} className={p.soldOut ? "pd-card sold" : "pd-card"}>
      <div className="pd-card-img">
        {p.soldOut && <span className="pd-sold sm">SOLD OUT</span>}
        {p.image && !missing && (
          <img src={p.image} alt={p.name} loading="lazy" onError={() => setMissing(true)} />
        )}
      </div>
      <h3>{p.name}</h3>
      <b>₦{p.price.toLocaleString()}</b>
      {p.colors && p.colors.length > 1 && (
        <div className="pd-card-colors">
          <span className="pd-dots">
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

/* ---------- a row you scroll sideways ---------- */
function ScrollRow({ title, items }) {
  const ref = useRef(null);
  const go = (dir) => {
    if (ref.current) ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  };
  if (!items.length) return null;
  return (
    <section className="pd-sec">
      <h2>{title}</h2>
      <div className="pd-rowwrap">
        <button type="button" className="pd-arrow l" onClick={() => go(-1)} aria-label="Previous">‹</button>
        <div className="pd-row" ref={ref}>
          {items.map((p) => (
            <ItemCard key={p.id} p={p} />
          ))}
        </div>
        <button type="button" className="pd-arrow r" onClick={() => go(1)} aria-label="Next">›</button>
      </div>
    </section>
  );
}

/* ---------- thumbnail (hides itself if its photo is missing) ---------- */
function Thumb({ src, on, onPick }) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  return (
    <button type="button" className={on ? "pd-thumb on" : "pd-thumb"} onClick={onPick}>
      <img src={src} alt="" onError={() => setMissing(true)} />
    </button>
  );
}

/* ---------- dropdown section ---------- */
function Acc({ title, open, onToggle, children }) {
  return (
    <div className="pd-acc">
      <button type="button" className="pd-acc-head" onClick={onToggle} aria-expanded={open}>
        {title}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="pd-acc-body">{children}</div>}
    </div>
  );
}

function ProductPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [tried, setTried] = useState(false);
  const [added, setAdded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [active, setActive] = useState(0);
  const [openAcc, setOpenAcc] = useState("details");

  const product =
    state && state.product && String(state.product.id) === id
      ? state.product
      : PRODUCTS.find((p) => String(p.id) === id);

  const [recent] = useState(() => getRecent().filter((x) => String(x.id) !== id));

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) pushRecent(product);
  }, []); // eslint-disable-line

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pd">
          <p className="pd-none">Product not found.</p>
          <Link to="/shop" className="pd-back">Back to shop</Link>
        </div>
      </>
    );
  }

  const isShoe = ["shoes", "sneakers"].includes(product.category);
  const sizes = product.sizes
    ? product.sizes
    : NO_SIZE.includes(product.category)
    ? []
    : isShoe
    ? SHOES
    : CLOTHES;
  const catName = (CATS.find((c) => c.slug === product.category) || {}).name;
  const colorOpts = (product.colors || []).map(toColor);
  const pickColor = (n) => {
    setColor(n);
    setTried(false);
    setAdded(false);
  };

  // photos: product.images if the admin gives a list, else the main photo + a "-b" version
  const gallery =
    product.images ||
    [product.image, product.image && product.image.replace(/\.jpg$/, "-b.jpg")].filter(Boolean);
  const mainImg = gallery[active] || product.image;

  const details =
    product.details ||
    `${product.name}. A quality ${catName ? catName.toLowerCase() : "menswear"} piece with a clean finish and a comfortable, relaxed fit. A versatile pick for everyday Nigerian street style.`;

  // rows below
  const same = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
  const others = PRODUCTS.filter((p) => p.category !== product.category && p.id !== product.id);
  const related = [...same, ...others].slice(0, 4);
  const start = others.length ? Number(product.id) % others.length : 0;
  const also = [...others.slice(start), ...others.slice(0, start)].slice(0, 10);

  const onAdd = () => {
    if ((sizes.length && !size) || (colorOpts.length && !color)) {
      setTried(true);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size || null,
      color: color || null,
    });
    setAdded(true);
  };

  const pick = (s) => {
    setSize(s);
    setTried(false);
    setAdded(false);
  };

  const toggle = (k) => setOpenAcc((cur) => (cur === k ? "" : k));

  const msg = `Hi, I want to order: ${product.name}${color ? ` (${color})` : ""}${size ? ` (Size ${size})` : ""} - ₦${product.price.toLocaleString()}\n${window.location.href}`;
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

  return (
    <>
      <Navbar />
      <div className="pd">
        <nav className="pd-crumbs">
          <Link to="/shop">Shop</Link>
          {catName && (
            <>
              <span>›</span>
              <Link to={`/shop?category=${product.category}`}>{catName}</Link>
            </>
          )}
          <span>›</span>
          <b>{product.name}</b>
        </nav>

        <div className="pd-grid">
          <div className="pd-left">
            <div className="pd-photo">
              {product.soldOut && <span className="pd-sold">SOLD OUT</span>}
              {mainImg && !missing && (
                <img src={mainImg} alt={product.name} onError={() => setMissing(true)} />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="pd-thumbs">
                {gallery.map((g, i) => (
                  <Thumb
                    key={g}
                    src={g}
                    on={i === active}
                    onPick={() => {
                      setActive(i);
                      setMissing(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="pd-info">
            <h1>{product.name}</h1>
            <div className="pd-price">₦{product.price.toLocaleString()}</div>

            {colorOpts.length > 0 && (
              <div className="pd-colors">
                <div className="pd-sizes-head">
                  <span>
                    <b>Color</b> {color || "Select"}
                  </span>
                </div>
                <div className="pd-swatches">
                  {colorOpts.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      aria-label={c.name}
                      className={color === c.name ? "on" : ""}
                      style={{ background: c.hex }}
                      onClick={() => pickColor(c.name)}
                    />
                  ))}
                </div>
                {tried && !color && <p className="pd-warn">Please select a color.</p>}
              </div>
            )}

            {sizes.length > 0 && (
              <div className="pd-sizes">
                <div className="pd-sizes-head">
                  <span>
                    <b>{isShoe ? "Shoe Size" : "Clothing Size"}</b> {size || "Select"}
                  </span>
                  <button type="button" className="pd-guide" onClick={() => setOpenAcc("size")}>
                    <Icon>
                      <path d="M3 12l9-9h8v8l-9 9z" />
                      <circle cx="16" cy="8" r="1.2" />
                    </Icon>
                    Size guide
                  </button>
                </div>
                <div className="pd-size-row">
                  {sizes.map((s) => (
                    <button key={s} type="button" className={size === s ? "on" : ""} onClick={() => pick(s)}>
                      {s}
                    </button>
                  ))}
                </div>
                {tried && !size && <p className="pd-warn">Please select a size.</p>}
              </div>
            )}

            <div className="pd-actions">
              <button type="button" className="pd-add" onClick={onAdd} disabled={product.soldOut}>
                {product.soldOut ? "SOLD OUT" : "ADD TO CART"}
              </button>
              <a className="pd-wa" href={wa} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp
              </a>
            </div>

            {added && (
              <p className="pd-added">
                Added to cart ✓ <Link to="/cart">View cart</Link>
              </p>
            )}

            <ul className="pd-perks">
              <li>
                <Icon>
                  <path d="M1 6h13v10H1zM14 10h4l3 3v3h-7z" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </Icon>
                Delivered in 3–4 business days across Nigeria
              </li>
              <li>
                <Icon>
                  <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
                  <path d="M8.5 12l2.5 2.5 4.5-5" />
                </Icon>
                Secure checkout with Paystack
              </li>
              <li>
                <Icon>
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                </Icon>
                <span>
                  Returns &amp; exchanges — <Link to="/returns">see policy</Link>
                </span>
              </li>
            </ul>

            <div className="pd-accs">
              <Acc title="DETAILS" open={openAcc === "details"} onToggle={() => toggle("details")}>
                <p>{details}</p>
              </Acc>

              <Acc title="SIZE GUIDE" open={openAcc === "size"} onToggle={() => toggle("size")}>
                {isShoe ? (
                  <table className="pd-table">
                    <thead>
                      <tr><th>EU</th><th>UK</th><th>US</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>40</td><td>6</td><td>7</td></tr>
                      <tr><td>41</td><td>7</td><td>8</td></tr>
                      <tr><td>42</td><td>8</td><td>9</td></tr>
                      <tr><td>43</td><td>9</td><td>10</td></tr>
                      <tr><td>44</td><td>10</td><td>11</td></tr>
                      <tr><td>45</td><td>11</td><td>12</td></tr>
                    </tbody>
                  </table>
                ) : (
                  <table className="pd-table">
                    <thead>
                      <tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>S</td><td>36–38</td><td>26</td></tr>
                      <tr><td>M</td><td>38–40</td><td>27</td></tr>
                      <tr><td>L</td><td>40–42</td><td>28</td></tr>
                      <tr><td>XL</td><td>42–44</td><td>29</td></tr>
                      <tr><td>XXL</td><td>44–46</td><td>30</td></tr>
                    </tbody>
                  </table>
                )}
              </Acc>

              <Acc title="DELIVERY" open={openAcc === "delivery"} onToggle={() => toggle("delivery")}>
                <p>
                  We deliver to every state in Nigeria. Lagos orders arrive in 1–2 business days and other states in
                  3–4 business days. Pay securely online with Paystack, or order on WhatsApp.
                </p>
              </Acc>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pd-sec">
            <span className="pd-eyebrow">YOU MIGHT ALSO LIKE</span>
            <h2>RELATED PRODUCTS</h2>
            <div className="pd-rel">
              {related.map((p) => (
                <ItemCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}

        <ScrollRow title="CUSTOMERS ALSO VIEWED" items={also} />
        <ScrollRow title="RECENTLY VIEWED" items={recent} />
      </div>
    </>
  );
}

// key={id} makes the page start fresh when you open another product
export default function Product() {
  const { id } = useParams();
  return <ProductPage key={id} />;
}