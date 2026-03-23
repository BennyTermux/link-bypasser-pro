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
  if (!url || !url.match(/^https?:\/\//)) {
    return res.status(400).json({ error: 'Valid HTTP/HTTPS URL required' });
  }

  try {
    const destination = await advancedBypass(url);
    res.json({ success: true, destination });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Bypass execution failed' });
  }
});

async function advancedBypass(input) {
  let current = input.trim();
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const instance = axios.create({
    headers: { 'User-Agent': ua, 'Referer': 'https://www.google.com/' },
    maxRedirects: 0,
    validateStatus: s => s >= 200 && s < 400
  });

  const domain = new URL(current).hostname.toLowerCase();

  // ─────────────────────────────────────────────
  // High-priority families (most common 2026)
  // ─────────────────────────────────────────────
  if (domain.includes('ouo') || domain.includes('ouo.press')) return await ouoFamily(current, instance);
  if (domain.includes('shrinkme') || domain.includes('shrinkearn')) return await shrinkFamily(current, instance);
  if (domain.includes('linkvertise') || domain.includes('work.ink') || domain.includes('lootlinks') || domain.includes('loot-link') || domain.includes('rekonise') || domain.includes('mboost') || domain.includes('paster.so')) {
    return await linkvertiseFamily(current, instance);
  }

  // ─────────────────────────────────────────────
  // Secondary high-value shorteners (\~40+ more)
  // ─────────────────────────────────────────────
  const knownPatterns = [
    'fc.lc', 'exe.io', 'shorte.st', 'ad-maven', 'linksfly', 'linksfly.link', 'link1s.com', 'link1s.net',
    'droplink.co', 'gplinks.co', 'urlshortx.com', 'shortzon.com', 'link4m.com', 'linkjust.com',
    'cutpaid.com', 'link1s.net', 'adshort.co', 'linksfly.me', 'linkfly.me', 'paylinkshort.com',
    'short.cash', 'cashurl.in', 'megalinks.pro', 'shortzu.com', 'link4m.link', 'linkjust.in',
    'linksfly.link', 'shrinkforearn.com', 'shrinkforearn.in', 'link-earn.com', 'shrinkearn.com',
    'link-earn.net', 'shortlinks.net', 'adshort.io', 'short.ad', 'urlcash.net', 'adf.ly',
    'j.gs', 'q.gs', 'u.bb', 'short.cm', 'tiny.cc', 'bit.ly' // legacy chase only
  ];

  if (knownPatterns.some(d => domain.includes(d))) {
    return await genericAggressiveChase(current, instance, 15);
  }

  // Ultimate fallback: chase + JS/meta extraction
  return await genericAggressiveChase(current, instance, 12);
}

async function ouoFamily(url, axiosInst) {
  let res = await axiosInst.get(url);
  let html = res.data;
  let $ = cheerio.load(html);

  let final = res.request?.res?.responseUrl || url;
  if (final.includes('?s=')) return final;

  const slug = url.split('/').pop();
  const goUrl = url.replace(/\/[^/]+$/, '/go/') + slug;
  res = await axiosInst.get(goUrl);
  if (res.headers.location) return res.headers.location;

  throw new Error('OUO pattern mismatch – update required');
}

async function shrinkFamily(url, axiosInst) {
  const res = await axiosInst.get(url);
  const $ = cheerio.load(res.data);

  let scriptText = '';
  $('script').each((i, el) => {
    const txt = $(el).html();
    if (txt?.includes('.href') || txt?.includes('location.href')) scriptText += txt;
  });

  let m = scriptText.match(/\.href\s*=\s*["']([^"']+)["']/i) || scriptText.match(/location\.href\s*=\s*["']([^"']+)["']/i);
  if (m) return m[1];

  const code = url.match(/\/([a-z0-9]{6,12})$/i)?.[1];
  if (code) {
    const tryD = url.replace(/\/[^/]+$/, '/d/') + code;
    const r = await axiosInst.head(tryD);
    if (r.headers.location) return r.headers.location;
  }

  throw new Error('Shrink family extraction failed');
}

async function linkvertiseFamily(url, axiosInst) {
  try {
    const apiTry = await axiosInst.get(`https://bypass.vip/api?link=${encodeURIComponent(url)}`, { timeout: 9000 });
    if (apiTry.data?.destination) return apiTry.data.destination;
  } catch {}

  try {
    const cityTry = await axiosInst.get(`https://bypass.city/api?link=${encodeURIComponent(url)}`);
    if (cityTry.data?.destination) return cityTry.data.destination;
  } catch {}

  return await genericAggressiveChase(url, axiosInst, 10);
}

async function genericAggressiveChase(start, axiosInst, maxSteps = 12) {
  let curr = start;
  for (let i = 0; i < maxSteps; i++) {
    try {
      const res = await axiosInst.get(curr);
      curr = res.request?.res?.responseUrl || curr;

      const $ = cheerio.load(res.data);
      const meta = $('meta[http-equiv="refresh"]').attr('content');
      if (meta) {
        const m = meta.match(/url=(.+)/i);
        if (m) return new URL(m[1], curr).href;
      }

      const jsLoc = res.data.match(/window\.location\s*=\s*["']([^"']+)["']/i);
      if (jsLoc) return new URL(jsLoc[1], curr).href;
    } catch (e) {
      if (e.response?.headers?.location) {
        curr = new URL(e.response.headers.location, curr).href;
        if (!curr.includes(new URL(start).hostname)) return curr;
      } else {
        break;
      }
    }
  }
  throw new Error('Redirect chain exhausted or blocked');
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`Link Bypasser Pro operational → http://localhost:${port}`);
});
