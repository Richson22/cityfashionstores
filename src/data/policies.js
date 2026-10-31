import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useSettings } from "../data/settings.js";
import { POLICIES } from "../data/policies.js";
import "../Css/about.css";

// order of the tabs; "returns" opens its own page
const TABS = [
  { key: "shipping", label: "Shipping & Delivery", to: "/policy/shipping" },
  { key: "returns", label: "Returns & Exchange", to: "/returns" },
  { key: "terms", label: "Terms & Conditions", to: "/policy/terms" },
  { key: "privacy", label: "Privacy Policy", to: "/policy/privacy" },
];

export default function Policy({ kind }) {
  const params = useParams();
  const key = kind || params.kind;
  const page = POLICIES[key];
  const st = useSettings();

  if (!page) return <Navigate to="/policy/shipping" replace />;

  const wa = /^\d{10,15}$/.test(String(st.whatsapp || "")) ? st.whatsapp : "";

  return (
    <>
      <Navbar />
      <div className="ab">
        <nav className="ab-tabs" aria-label="Policies">
          {TABS.map((t) => (
            <Link key={t.key} to={t.to} className={t.key === key ? "ab-tab active" : "ab-tab"}>
              {t.label}
            </Link>
          ))}
        </nav>

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

        {wa && (
          <section className="ab-sec ab-end">
            <div className="ab-actions">
              <a className="ab-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                WHATSAPP US
              </a>
            </div>
          </section>
        )}
      </div>
    </>
  );
}