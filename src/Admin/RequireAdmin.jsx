import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "./auth.js";

// wraps every admin page: not signed in -> go to the login page
export default function RequireAdmin({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return children;
}