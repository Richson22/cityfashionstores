import { Link, useLocation } from "react-router-dom";

export default function Soon() {
  const { pathname } = useLocation();
  const name = pathname.split("/").filter(Boolean).pop() || "";
  const title = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div className="ad-soon">
      <h2>{title}</h2>
      <p>This page is coming soon. We are building the admin one page at a time.</p>
      <Link to="/admin" className="ad-btn">← Back to overview</Link>
    </div>
  );
}