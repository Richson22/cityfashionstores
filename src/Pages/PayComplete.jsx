import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { api } from "../data/api.js";
import { clearCart } from "../data/cart.js";

export default function PayComplete() {
  const { no } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState("checking"); // checking | failed | error

  useEffect(() => {
    let alive = true;
    api(`/paystack/verify/${no}`)
      .then((d) => {
        if (!alive) return;
        if (["Paid", "Shipped", "Delivered"].includes(d.status)) {
          clearCart();
          navigate(`/order-success/${no}`, { replace: true });
        } else {
          setState("failed");
        }
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [no, navigate]);

  return (
    <>
      <Navbar />
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "40px 20px", textAlign: "center" }}>
        {state === "checking" && <h2>Confirming your payment…</h2>}
        {state === "failed" && (
          <div>
            <h2>Payment not completed</h2>
            <p>We did not receive a payment for order #{no}. Your cart is still saved, so you can try again.</p>
            <Link to="/cart">Back to cart</Link>
          </div>
        )}
        {state === "error" && (
          <div>
            <h2>We could not check your payment</h2>
            <p>If money left your account, please contact us with order #{no}. Do not pay again.</p>
            <Link to="/track">Track this order</Link>
          </div>
        )}
      </div>
    </>
  );
}