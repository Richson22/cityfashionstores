import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../Css/categories.css";
import { useCatalog } from "../data/catalog.js";

// DEMO DATA for the client preview.
// Photos go in public/categories/ (same folder as the home page tiles).
// Later this list will come from the admin / backend (name, slug, image, count).
const demoCategories = [
  { name: "Armless", slug: "armless", image: "/categories/armless.jpg", count: 22 },
  { name: "Bags", slug: "bags", image: "/categories/bags.jpg", count: 37 },
  { name: "Belts", slug: "belts", image: "/categories/belts.jpg", count: 65 },
  { name: "Boxers", slug: "boxers", image: "/categories/boxers.jpg", count: 41 },
  { name: "Caps", slug: "caps", image: "/categories/caps.jpg", count: 47 },
  { name: "Glasses", slug: "eyeglasses", image: "/categories/glasses.jpg", count: 10 },
  { name: "Hoodies", slug: "hoodies", image: "/categories/hoodies.jpg", count: 30 },
  { name: "Jackets", slug: "jackets", image: "/categories/jackets.jpg", count: 87 },
  { name: "Jeans", slug: "jeans", image: "/categories/jeans.jpg", count: 120 },
  { name: "Jerseys", slug: "jerseys", image: "/categories/jerseys.jpg", count: 58 },
  { name: "Joggers", slug: "joggers", image: "/categories/joggers.jpg", count: 34 },
  { name: "Polos", slug: "polos", image: "/categories/polos.jpg", count: 52 },
  { name: "Shirts", slug: "shirts", image: "/categories/shirts.jpg", count: 96 },
  { name: "Shoes", slug: "shoes", image: "/categories/shoes.jpg", count: 64 },
  { name: "Sneakers", slug: "sneakers", image: "/categories/sneakers.jpg", count: 73 },
  { name: "T-shirts", slug: "tees", image: "/categories/tees.jpg", count: 173 },
  { name: "Trousers", slug: "trousers", image: "/categories/trousers.jpg", count: 45 },
];

function Tile({ cat }) {
  const [missing, setMissing] = useState(false);
  return (
    <Link to={`/shop?category=${cat.slug}`} className="ct-tile">
      {cat.image && !missing && (
        <img src={cat.image} alt={cat.name} loading="lazy" onError={() => setMissing(true)} />
      )}
      <div className="ct-shade" />
      <div className="ct-info">
        <b>{cat.name}</b>
        <span>{cat.count} items</span>
      </div>
    </Link>
  );
}

export default function Categories() {
  const { categories } = useCatalog();
  return (
    <>
      <Navbar />
      <div className="ct-page">
        <h1>Shop by Category</h1>
        <p>Explore our collection by browsing through all available categories</p>

        <div className="ct-grid">
          {categories.map((c) => (
            <Tile key={c.slug} cat={c} />
          ))}
        </div>
      </div>
    </>
  );
}