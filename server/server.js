require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/bypass', async (req, res) => {
  const { url } = req.body;
  console.log(`[v3.0 REAL] REQUEST → ${url}`);

  if (!url || !url.match(/^https?:\/\//)) {
    return res.json({ success: false, error: 'Invalid URL' });
  }

  try {
    const destination = await universalRealBypass(url);
    console.log(`[v3.0 SUCCESS] → ${destination}`);
    res.json({ success: true, destination });
  } catch (e) {
    console.error(`[v3.0 FAIL] ${e.message}`);
    res.json({ success: false, error: 'No destination found – use a valid shortened link' });
  }
});

async function universalRealBypass(rawUrl) {
  let url = rawUrl.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
    'Referer': 'https://bypass.vip'
  };

  const inst = axios.create({ timeout: 20000, headers });

  // ────── 1. PRIMARY UNIVERSAL API (bypass.vip – most reliable 2026) ──────
  try {
    const vip = await inst.get(`https://bypass.vip/api?link=${encodeURIComponent(url)}`);
    if (vip.data?.destination && vip.data.destination.length > 25) return vip.data.destination;
    if (vip.data?.url) return vip.data.url;
  } catch {}

  // ────── 2. SECONDARY (bypass.city) ──────
  try {
    const city = await inst.get(`https://bypass.city/api?link=${encodeURIComponent(url)}`);
    if (city.data?.destination) return city.data.destination;
  } catch {}

  // ────── 3. OUO REAL PATHS + ALL OTHERS ──────
  if (url.includes('ouo')) {
    const slug = url.split('/').pop();
    const attempts = [
      `https://ouo.io/go/${slug}`,
      `https://ouo.press/go/${slug}`,
      url.replace('/p89lvZ', '') + '/go/' + slug   // dynamic
    ];
    for (let p of attempts) {
      try {
        const r = await inst.get(p, { maxRedirects: 20 });
        const final = r.request?.res?.responseUrl || r.headers?.location;
        if (final && final.length > 30 && !final.includes('ouo.io') && !final.includes('ouo.press')) return final;
      } catch (e) {
        if (e.response?.headers?.location) {
          const loc = new URL(e.response.headers.location, p).href;
          if (!loc.includes('ouo')) return loc;
        }
      }
    }
  }

  // ────── 4. UNIVERSAL AGGRESSIVE CHASE (covers shrinkme, linkvertise family, fc.lc, exe.io, etc.) ──────
  let current = url;
  for (let i = 0; i < 25; i++) {
    try {
      const r = await inst.get(current, { maxRedirects: 0 });
      const loc = r.headers.location || r.request?.res?.responseUrl;
      if (loc) {
        current = new URL(loc, current).href;
        if (current.length > 40 && !current.includes('ouo') && !current.includes('shrink') && !current.includes('linkvertise')) {
          return current;
        }
      }
    } catch (e) {
      if (e.response?.headers?.location) {
        current = new URL(e.response.headers.location, current).href;
        if (current.length > 40 && !current.includes(new URL(url).hostname)) return current;
      }
    }
  }

  throw new Error('No real destination extracted – confirm link is valid shortened');
}

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/bypass.html')));

app.listen(port, () => console.log(`🚀 v3.0 REAL & UNIVERSAL LIVE – bypass.vip + city + full chain active`));
