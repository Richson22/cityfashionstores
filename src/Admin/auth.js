import { api } from "../data/api.js";

export async function login(email, password) {
  try {
    const { token } = await api("/admin/login", { method: "POST", body: { email, password } });
    localStorage.setItem("admin-token", token);
    return { ok: true };
  } catch (e) {
    const msg = e.message === "Failed to fetch" ? "Cannot reach the server. Is the backend running?" : e.message;
    return { ok: false, error: msg };
  }
}

export const logout = () => localStorage.removeItem("admin-token");
export const getToken = () => localStorage.getItem("admin-token");
export const isLoggedIn = () => !!getToken();