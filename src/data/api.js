const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getToken = () => localStorage.getItem("admin-token");

export async function api(path, { method = "GET", body, auth = false, form } = {}) {
  const headers = {};
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && auth) {
    localStorage.removeItem("admin-token");
    window.location.href = "/admin/login";
  }
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const { url } = await api("/admin/upload", { method: "POST", auth: true, form });
  return url;
}