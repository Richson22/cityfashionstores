import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "../Css/about.css";

const OFFER = [
  "Men's clothing and fashionable outfits",
  "Shirts, trousers, and other everyday essentials",
  "Shoes and footwear",
  "Bags, belts, caps, and fashion accessories",
  "Other carefully selected fashion products",
];

const COMMIT = [
  ["Quality Products", "Selected with attention to appearance, functionality, and value."],
  ["Convenience", "An online shopping experience that allows customers to browse products and place orders from wherever they are."],
  ["Transparency", "Clear product descriptions, prices, and delivery information."],
  ["Customer Service", "Assistance with product enquiries, orders, and eligible returns or exchanges."],
  ["Continuous Improvement", "We continually seek ways to improve our products, services, and shopping experience."],
];

export default function About() {
  return (
    <>
      <Navbar />
      <div className="ab">
        <header className="ab-hero">
          <span className="ab-eyebrow">ABOUT US</span>
          <h1>CITY FASHION STORES</h1>
          <p className="ab-tag">Your Style. Your Confidence. Your Identity.</p>
        </header>

        <section className="ab-sec">
          <h2>Welcome to City Fashion Stores</h2>
          <p>
            At City Fashion Stores, we believe that fashion is more than what you wear. It is an expression of your
            personality, confidence, and individuality.
          </p>
          <p>
            We are a fashion retail business committed to providing customers with stylish, quality-conscious, and
            affordable fashion products that help them look good and feel confident on every occasion.
          </p>
          <p>
            From everyday outfits to smart and sophisticated looks, our goal is to make shopping for fashion
            convenient, enjoyable, and accessible.
          </p>
        </section>

        <section className="ab-sec">
          <h2>Who We Are</h2>
          <p>
            City Fashion Stores is a fashion business based at 106 Old Enugu Road, Mile 50, Abakaliki, Ebonyi State,
            Nigeria. Over the years, we have worked to serve customers looking for fashionable clothing and
            accessories. We are extending that experience online so that customers can explore our products and place
            orders conveniently, whether they live in Abakaliki or elsewhere in Nigeria.
          </p>
          <p>
            Our online store is designed to make discovering and purchasing fashion products easier, with product
            information and customer support to help you make informed shopping decisions.
          </p>
        </section>

        <section className="ab-sec">
          <h2>What We Offer</h2>
          <p>At City Fashion Stores, our product selection may include:</p>
          <ul className="ab-list">
            {OFFER.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <p className="ab-note">Product availability, colours, sizes, and styles may vary.</p>
        </section>

        <section className="ab-sec">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make fashionable, confidence-inspiring clothing and accessories accessible to our
            customers through reliable service, convenient shopping, and a commitment to customer satisfaction.
          </p>
        </section>

        <section className="ab-sec">
          <h2>Our Commitment</h2>
          <p>At City Fashion Stores, we aim to provide:</p>
          <div className="ab-cards">
            {COMMIT.map(([t, d]) => (
              <div className="ab-card" key={t}>
                <b>{t}</b>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ab-sec ab-end">
          <h2>Shop With Confidence</h2>
          <p>
            Whether you are shopping for yourself, preparing for an occasion, or choosing a gift for someone special,
            City Fashion Stores is here to help you find a style that suits you.
          </p>
          <p>Thank you for choosing City Fashion Stores. We appreciate your trust and look forward to serving you.</p>
          <p className="ab-sign">City Fashion Stores — Your Style, Our Passion.</p>
          <p className="ab-visit">
            <b>Visit us:</b> 106 Old Enugu Road, Mile 50, Abakaliki, Ebonyi State, Nigeria.
          </p>
          <div className="ab-actions">
            <Link to="/shop" className="ab-btn">SHOP NOW</Link>
            <Link to="/track" className="ab-btn ghost">TRACK AN ORDER</Link>
          </div>
        </section>
      </div>
    </>
  );
}