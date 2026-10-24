import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { isLoggedIn, login } from "./auth.js";
import "../Css/admin.css";
import { logout } from "./auth.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // use the saved light / dark choice
  useEffect(() => {
    let t = "dark";
    try {
      t = localStorage.getItem("theme") || "dark";
    } catch {}
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  if (isLoggedIn()) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      navigate((state && state.from && state.from.pathname) || "/admin", { replace: true });
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="al">
      <form className="al-card" onSubmit={submit} noValidate>
        <img className="al-logo" src="/logo.png" alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
        <h1>Admin sign in</h1>
        <p>Sign in to manage your store.</p>

        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <div className="al-pass">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
            <button type="button" onClick={() => setShow((v) => !v)}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {error && <p className="al-error" role="alert">{error}</p>}

        <button type="submit" className="al-submit" disabled={busy}>
          {busy ? "SIGNING IN…" : "SIGN IN"}
        </button>
        <Link to="/" className="al-back">← Back to store</Link>
      </form>
    </div>
  );
}