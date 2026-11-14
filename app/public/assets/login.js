(() => {
  const form = document.getElementById('login-form');
  const alertBox = document.getElementById('login-error');
  const button = form.querySelector('button');

  function setFieldError(field, message) {
    document.getElementById(`error-${field}`).textContent = message;
    form.elements[field].setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function safeNext() {
    const next = new URLSearchParams(location.search).get('next') || '';
    return next.startsWith('/') && !next.startsWith('//') ? next : '/products';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    alertBox.hidden = true;
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    setFieldError('username', username ? '' : 'Username is required');
    setFieldError('password', password ? '' : 'Password is required');
    if (!username || !password) return;

    button.disabled = true;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) { location.assign(safeNext()); return; }
      const body = await res.json().catch(() => ({}));
      alertBox.textContent = body.error || 'Sign in failed. Please try again.';
    } catch {
      alertBox.textContent = 'Cannot reach the server. Check your connection and try again.';
    }
    alertBox.hidden = false;
    button.disabled = false;
  });
})();
