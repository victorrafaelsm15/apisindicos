const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@apisindicos.com';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'apis2026';
const SESSION_KEY = 'apis_admin_session';

export function login(email, password) {
  const ok = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
  if (ok) sessionStorage.setItem(SESSION_KEY, '1');
  return ok;
}
export function logout() { sessionStorage.removeItem(SESSION_KEY); }
export function isLoggedIn() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
