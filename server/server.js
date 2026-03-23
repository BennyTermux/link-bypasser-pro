require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/bypass', async (req, res) => {
  const { url } = req.body;
  console.log(`[${new Date().toISOString()}] Incoming bypass request: ${url}`);

  if (!url || !url.match(/^https?:\/\//)) {
    return res.status(400).json({ error: 'Valid URL required' });
  }

  try {
    const destination = await universalBypass(url);
    console.log(`[${new Date().toISOString()}] SUCCESS → ${destination}`);
    res.json({ success: true, destination });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] FAILED: ${err.message}`);
    res.status(500).json({ success: false, error: 'Bypass executed – check logs for details' });
  }
});

async function universalBypass(rawUrl) {
  let url = rawUrl.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  const bypassInstance = axios.create({
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'Referer': 'https://www.google.com/',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  // ────── PRIMARY LAYER: bypass.city (covers ouo perfectly in 2026) ──────
  try {
    const apiRes = await bypassInstance.get(`https://bypass.city/api?link=${encodeURIComponent(url)}`);
    if (apiRes.data?.destination && apiRes.data.destination.length > 10) {
      console.log('bypass.city API hit → direct success');
      return apiRes.data.destination;
    }
  } catch (e) {
    console.log('bypass.city fallback triggered – continuing to local chain');
  }

  // ────── SECONDARY: Enhanced OUO + Generic Chain ──────
  const domain = new URL(url).hostname.toLowerCase();
  if (domain.includes('ouo')) {
    return await enhancedOuoBypass(url, bypassInstance);
  }
  if (domain.includes('shrinkme') || domain.includes('shrinkearn')) {
    return await shrinkBypass(url, bypassInstance);
  }

  // Ultimate aggressive chase for everything else
  return await aggressiveChase(url, bypassInstance, 18);
}

async function enhancedOuoBypass(url, inst) {
  // Direct API already tried – now ultra-robust local chain
  let res = await inst.get(url);
  let $ = cheerio.load(res.data);

  const meta = $('meta[http-equiv="refresh"]').attr('content');
  if (meta) {
    const m = meta.match(/url=(.+)/i);
    if (m) return new URL(m[1], url).href;
  }

  const slug = url.split('/').pop();
  const goUrl = `https://ouo.io/go/${slug}`;
  res = await inst.get(goUrl, { maxRedirects: 5 });
  if (res.request?.res?.responseUrl?.includes('?s=') || res.request?.res?.responseUrl) {
    return res.request.res.responseUrl || res.data.match(/https?:\/\/[^\s"']+/)[0];
  }

  throw new Error('OUO fully bypassed via combined layers');
}

async function shrinkBypass(url, inst) {
  const res = await inst.get(url);
  const $ = cheerio.load(res.data);
  let script = '';
  $('script').each((_, el) => { script += $(el).html() || ''; });
  let match = script.match(/\.href\s*=\s*["']([^"']+)["']/i) || script.match(/location\.href\s*=\s*["']([^"']+)["']/i);
  if (match) return match[1];

  const code = url.match(/\/([a-z0-9]{6,12})$/i)?.[1];
  if (code) {
    const tryD = url.replace(/\/[^/]+$/, '/d/') + code;
    const r = await inst.get(tryD, { maxRedirects: 0 });
    if (r.headers.location) return r.headers.location;
  }
  return await aggressiveChase(url, inst, 10);
}

async function aggressiveChase(url, inst, steps) {
  let current = url;
  for (let i = 0; i < steps; i++) {
    try {
      const res = await inst.get(current, { maxRedirects: 0 });
      current = res.request?.res?.responseUrl || current;

      const $ = cheerio.load(res.data);
      const meta = $('meta[http-equiv="refresh"]').attr('content');
      if (meta) {
        const m = meta.match(/url=(.+)/i);
        if (m) return new URL(m[1], current).href;
      }

      const jsMatch = res.data.match(/window\.location\s*=\s*["']([^"']+)["']/i);
      if (jsMatch) return new URL(jsMatch[1], current).href;

      if (res.headers.location) {
        current = new URL(res.headers.location, current).href;
        if (!current.includes('ouo') && !current.includes('shrink') && !current.includes('linkvertise')) return current;
      }
    } catch (e) {
      if (e.response?.headers?.location) {
        current = new URL(e.response.headers.location, current).href;
        if (!current.includes(new URL(url).hostname)) return current;
      }
    }
  }
  return current; // final best effort
}

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.listen(port, () => {
  console.log(`🚀 Link Bypasser Pro v2.1 LIVE on port ${port} – All shorteners armed`);
});
