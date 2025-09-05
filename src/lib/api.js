export function getApiUrl() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return "http://localhost:5000";
  let url = raw.trim();
  // If value is just a port like ":5000", use the current host
  if (typeof window !== 'undefined' && /^:\d+$/.test(url)) {
    url = `${window.location.protocol}//${window.location.hostname}${url}`;
  }
  // If value is only digits like "5000", assume localhost
  if (/^\d+$/.test(url)) url = `localhost:${url}`;
  // If missing protocol, assume http
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  // remove trailing slash
  return url.replace(/\/$/, "");
}

export async function fetchJson(input, init) {
  const res = await fetch(input, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}
