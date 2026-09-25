let rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
rawApiUrl = rawApiUrl.replace(/\/$/, "");
if (rawApiUrl.endsWith("/api")) {
  rawApiUrl = rawApiUrl.slice(0, -4);
}
const API_URL = rawApiUrl;

export default API_URL;
