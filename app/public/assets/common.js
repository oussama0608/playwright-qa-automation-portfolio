// Shared behaviour for authenticated pages: current user + logout.
window.api = async function api(path, options = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (res.status === 401) {
    location.assign(`/login?next=${encodeURIComponent(location.pathname)}`);
    throw new Error('Session expired');
  }
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error((body && body.error) || `Request failed (${res.status})`);
    error.fields = body && body.fields;
    throw error;
  }
  return body;
};

(() => {
  const userLabel = document.querySelector('[data-testid="current-user"]');
  window.api('/api/me').then((me) => { userLabel.textContent = me.username; }).catch(() => {});
  document.getElementById('logout').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' }).catch(() => {});
    location.assign('/login');
  });
})();
