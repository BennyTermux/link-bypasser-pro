document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bypassForm');
  const input = document.getElementById('linkInput');
  const btn = document.getElementById('bypassBtn');
  const result = document.getElementById('result');
  const status = document.getElementById('status');

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const url = input.value.trim();
    if (!url) return showStatus('Enter valid link', 'error');

    showStatus('Processing bypass sequence...', 'processing');
    result.innerHTML = '';

    try {
      const res = await fetch('/api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (data.success) {
        showStatus('Destination unlocked', 'success');
        result.innerHTML = `
          <strong>Final URL:</strong><br>
          <a href="${data.destination}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);">
            ${data.destination}
          </a><br><br>
          <button class="btn" onclick="navigator.clipboard.writeText('${data.destination}').then(()=>alert('Copied'))">
            Copy Destination
          </button>
        `;
      } else {
        showStatus(data.error || 'Bypass chain failed', 'error');
      }
    } catch (err) {
      showStatus('Connection or server issue', 'error');
    }
  });

  function showStatus(msg, cls) {
    status.textContent = msg;
    status.className = cls;
  }
});
