export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const WS_URL = import.meta.env.VITE_WS_URL;

if (!API_BASE_URL || !WS_URL) {
  console.warn("Missing environment variables");
}
