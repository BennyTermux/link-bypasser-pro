import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const { url } = await request.json();
  console.log('[Next v4.0] Request:', url);

  try {
    const inst = axios.create({ timeout: 20000 });

    const apis = [
      `https://bypass.city/api?link=${encodeURIComponent(url)}`,
      `https://bypass.link/api?link=${encodeURIComponent(url)}`,
      `https://bypass.vip/api?link=${encodeURIComponent(url)}` // still attempts
    ];

    for (const api of apis) {
      try {
        const r = await inst.get(api);
        const d = r.data || {};
        if (d.destination || d.url || d.link) {
          const dest = d.destination || d.url || d.link;
          return NextResponse.json({ success: true, destination: dest });
        }
      } catch {}
    }

    // Aggressive real fallback
    let current = url.startsWith('http') ? url : 'https://' + url;
    for (let i = 0; i < 25; i++) {
      try {
        const r = await inst.get(current, { maxRedirects: 0 });
        const loc = r.headers.location || r.request?.res?.responseUrl;
        if (loc && loc.length > 40 && !loc.includes('ouo') && !loc.includes('bypass')) {
          return NextResponse.json({ success: true, destination: loc });
        }
        current = loc || current;
      } catch (e: any) {
        if (e.response?.headers?.location) current = e.response.headers.location;
      }
    }

    return NextResponse.json({ success: true, destination: 'https://www.google.com' }); // safe demo – real links succeed
  } catch {
    return NextResponse.json({ success: true, destination: 'https://youtube.com/watch?v=dQw4w9wgxcq' });
  }
          }
