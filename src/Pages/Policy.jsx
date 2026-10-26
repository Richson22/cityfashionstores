import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useSettings } from "../data/settings.js";
import { POLICIES } from "../data/policies.js";
import "../Css/about.css";

export default function Policy({ kind }) {
  const page = POLICIES[kind];
  const st = useSettings();
  if (!page) return null;

  const wa = /^\d{10,15}$/.test(String(st.whatsapp || "")) ? st.whatsapp : "";

  return (
    <>
      <Navbar />
      <div className="ab">
        <header className="ab-hero">
          <span className="ab-eyebrow">{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p className="ab-tag">Last updated: {page.updated}</p>
        </header>

        {page.intro && (
          <section className="ab-sec">
            <p>{page.intro}</p>
          </section>
        )}

        {page.sections.map((s) => (
          <section className="ab-sec" key={s.h}>
            <h2>{s.h}</h2>
            {(s.p || []).map((t, i) => (
              <p key={i}>{t}</p>
            ))}
            {s.list && (
              <ul className="ab-list">
                {s.list.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="ab-sec ab-end">
          <h2>Contact us</h2>
          <p>
            City Fashion Stores, 106 Old Enugu Road, Mile 50, Abakaliki, Ebonyi State, Nigeria.
            {st.phone ? ` Phone: ${st.phone}.` : ""}
            {st.email ? ` Email: ${st.email}.` : ""}
          </p>
          <div className="ab-actions">
            {wa && (
              <a className="ab-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                WHATSAPP US
              </a>
            )}
            <Link to="/shipping" className="ab-btn ghost">SHIPPING</Link>
            <Link to="/returns" className="ab-btn ghost">RETURNS</Link>
            <Link to="/terms" className="ab-btn ghost">TERMS</Link>
            <Link to="/privacy" className="ab-btn ghost">PRIVACY</Link>
          </div>
        </section>
      </div>
    </>
  );
}