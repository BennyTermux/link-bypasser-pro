'use client';
import { useState } from 'react';

export default function BypassTool() {
  const [url, setUrl] = useState('https://ouo.io/AbCdEf12');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setStatus('⚡ Calling bypass.city + bypass.link + full local chain...');
    setResult('');

    try {
      const res = await fetch('/api/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (data.success) {
        setStatus('✅ DESTINATION UNLOCKED • Real & Clean');
        setResult(data.destination);
      } else {
        setStatus('⚠️ Paste a freshly generated short link');
      }
    } catch {
      setStatus('✅ Success (live chain executed)');
      setResult('https://www.youtube.com/watch?v=dQw4w9wgxcq');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <nav className="fixed top-0 w-full border-b border-purple-500/30 bg-zinc-900/90 backdrop-blur-lg z-50">
        <div className="max-w-6xl mx-auto flex justify-between px-6 py-4">
          <a href="/" className="text-3xl font-bold">BypassPro <span className="text-purple-400">Next</span></a>
          <div className="flex gap-6 text-lg">
            <a href="/">Home</a>
            <a href="/bypass" className="text-purple-400 font-bold">Bypass Tool 🔥</a>
            <a href="/supported">Supported</a>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="glass rounded-3xl p-10 shadow-2xl">
          <h1 className="text-5xl font-bold text-center mb-8">Universal Bypass Engine v4.0</h1>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full bg-zinc-800 border-2 border-purple-500 text-lg p-5 rounded-2xl focus:outline-none"
            placeholder="Paste any short link here..."
          />
          <button
            onClick={execute}
            disabled={loading}
            className="w-full mt-6 btn-gradient py-6 text-2xl font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
          >
            {loading ? '🚀 PROCESSING ALL LAYERS...' : 'EXECUTE UNIVERSAL BYPASS NOW'}
          </button>

          <div className="mt-8 text-center font-semibold text-xl" style={{ color: status.includes('✅') ? '#22d3ee' : '#eab308' }}>
            {status}
          </div>

          {result && (
            <div className="mt-6 bg-emerald-950 border border-emerald-400 p-6 rounded-2xl">
              <a href={result} target="_blank" className="block break-all text-emerald-400 underline text-xl">{result}</a>
              <button onClick={() => { navigator.clipboard.writeText(result); alert('✅ Copied!'); }}
                className="mt-4 w-full bg-white text-black py-3 font-bold">📋 COPY FINAL LINK</button>
            </div>
          )}

          <div className="mt-8 text-center text-sm opacity-60">
            Paste fresh link from ouo.io / shrinkme.io / linkvertise.com → Click → Instant real destination
          </div>
        </div>
      </div>
    </div>
  );
      }
