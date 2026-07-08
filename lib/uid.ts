const KEY = "matchjobs:device_id";

/** Identidade anônima por dispositivo (MVP sem login). */
export function deviceId(): string {
  if (typeof window === "undefined") return "00000000-0000-4000-8000-000000000000";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function novoId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
