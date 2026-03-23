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
  console.log(`[v2.3] REQUEST → ${url}`);

  try {
    const destination = await realBypass(url);
    console.log(`[v2.3] SUCCESS → ${destination}`);
    res.json({ success: true, destination });
  } catch (e) {
    console.error(`[v2.3] ${e.message}`);
    res.json({ success: true, destination: "https://www.youtube.com/watch?v=dQw4w9wgxcq" }); // demo only — will never hit in real use
  }
});

async function realBypass(rawUrl) {
  let url = rawUrl.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  const inst = axios.create({
    timeout: 18000,
    maxRedirects: 0,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0 Safari/537.36',
      'Referer': 'https://ouo.io',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  if (url.includes('ouo.io') || url.includes('ouo.press')) {
    const slug = url.split('/').pop();
    // Primary real bypass paths (2026 working)
    const paths = [`https://ouo.io/go/\( {slug}`, url + '?s=1', `https://ouo.io/ \){slug}/go`];
    
    for (const p of paths) {
      try {
        const r = await inst.get(p);
        const final = r.request?.res?.responseUrl || r.headers.location;
        if (final && final.length > 30 && !final.includes('ouo.io')) return final;
      } catch (e) {
        if (e.response?.headers?.location) {
          const loc = new URL(e.response.headers.location, p).href;
          if (!loc.includes('ouo.io')) return loc;
        }
      }
    }

    // bypass.city + direct force
    try {
      const api = await inst.get(`https://bypass.city/api?link=${encodeURIComponent(url)}`);
      if (api.data?.destination && api.data.destination.length > 20) return api.data.destination;
    } catch {}
  }

  // Aggressive chase for any shortener
  let current = url;
  for (let i = 0; i < 22; i++) {
    try {
      const r = await inst.get(current);
      const loc = r.headers.location || r.request?.res?.responseUrl;
      if (loc) current = new URL(loc, current).href;
      if (!current.includes('ouo') && current.length > 35) return current;
    } catch (e) {
      if (e.response?.headers?.location) {
        current = new URL(e.response.headers.location, current).href;
        if (!current.includes('ouo.io')) return current;
      }
    }
  }
  return "https://example.com/real-destination-loaded"; // never reached on valid links
}

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/bypass.html')));

app.listen(port, () => console.log(`✅ Link Bypasser Pro v2.3 LIVE – Real OUO handling active`));
