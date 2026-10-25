import Navbar from "./Navbar.jsx";
import "../Css/info.css";

// shared layout for the store's information pages
export default function InfoPage({ title, intro, children }) {
  return (
    <>
      <Navbar />
      <div className="inf">
        <div className="inf-wrap">
          <h1>{title}</h1>
          {intro && <p className="inf-intro">{intro}</p>}
          {children}
        </div>
      </div>
    </>
  );
}