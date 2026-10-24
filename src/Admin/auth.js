const KEY = "admin-token";

// TEMPORARY demo login that runs in the browser.
// When the backend is ready, replace login() with a request to it
// (for example POST /api/admin/login) and save the token it returns.
const DEMO = { email: "admin@cityfashion.com", password: "admin123" };

export async function login(email, password) {
  await new Promise((r) => setTimeout(r, 500)); // pretend we are waiting for a server
  if (email.trim().toLowerCase() === DEMO.email && password === DEMO.password) {
    try {
      localStorage.setItem(KEY, "demo-token");
    } catch {}
    return { ok: true };
  }
  return { ok: false, error: "Wrong email or password" };
}

export function logout() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function getToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}