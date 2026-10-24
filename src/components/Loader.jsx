import { useEffect, useState } from "react";
import { getSettings } from "../Admin/settingsStore.js";
import "../Css/loader.css";

const MIN = 1100; // shortest time the loading screen stays, in milliseconds

export default function Loader() {
  const [phase, setPhase] = useState("show"); // show -> hide -> gone
  const [logoMissing, setLogoMissing] = useState(false);
  const [nameMissing, setNameMissing] = useState(false);

  // wait until the page has loaded (and the minimum time has passed)
  useEffect(() => {
    const start = performance.now();
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN - (performance.now() - start));
      setTimeout(() => setPhase("hide"), wait);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    const safety = setTimeout(finish, 4000); // never stay longer than 4 seconds
    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (phase !== "hide") return;
    const t = setTimeout(() => setPhase("gone"), 500);
    return () => clearTimeout(t);
  }, [phase]);

  // no scrolling behind the loading screen
  useEffect(() => {
    document.body.style.overflow = phase === "show" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className={phase === "hide" ? "loader out" : "loader"} aria-hidden="true">
      {!logoMissing && (
        <img className="l-logo" src="/logo.png" alt="" onError={() => setLogoMissing(true)} />
      )}
      {!nameMissing ? (
        <img className="l-name" src="/name.png" alt="" onError={() => setNameMissing(true)} />
      ) : (
        <span className="l-text">{getSettings().storeName}</span>
      )}
      <div className="l-bar">
        <i />
      </div>
    </div>
  );
}