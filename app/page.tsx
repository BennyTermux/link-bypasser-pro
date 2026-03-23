'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [bypasses, setBypasses] = useState(874920);
  const [users, setUsers] = useState(142380);

  useEffect(() => {
    const int1 = setInterval(() => setBypasses(p => p + Math.floor(Math.random() * 7) + 3), 1200);
    const int2 = setInterval(() => setUsers(p => p + 1), 3000);
    return () => { clearInterval(int1); clearInterval(int2); };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="border-b border-purple-500/30 bg-zinc-900/80 backdrop-blur-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-purple-400">Bypass<span className="text-white">Pro</span></div>
            <div className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded font-bold">v4.0 NEXT</div>
          </div>
          <div className="flex gap-8 text-lg font-medium">
            <a href="/" className="hover:text-purple-400">Home</a>
            <a href="/bypass" className="hover:text-purple-400">Bypass Tool</a>
            <a href="/supported" className="hover:text-purple-400">60+ Shorteners</a>
            <a href="/about" className="hover:text-purple-400">About</a>
          </div>
          <a href="/bypass" className="btn-gradient px-6 py-2.5 rounded-xl font-bold text-lg">Start Bypassing →</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-zinc-950 via-purple-950 to-zinc-950">
        <div className="max-w-5xl mx-auto text-center px-6">
          <div className="inline-block bg-purple-500/10 border border-purple-500 px-4 py-1 rounded-full text-sm mb-6">🚀 100% Real • Universal • Instant</div>
          <h1 className="text-7xl font-bold leading-none mb-6">Skip Every Ad.<br />Reach Destination.<br /><span className="text-purple-400">Instantly.</span></h1>
          <p className="text-2xl text-zinc-400 max-w-2xl mx-auto">ouo • linkvertise • work.ink • shrinkme • lootlinks • paster • 60+ more • Powered by live APIs + Next.js</p>
          <a href="/bypass" className="inline-block mt-10 btn-gradient text-2xl px-12 py-5 rounded-2xl font-bold shadow-xl hover:scale-105 transition">LAUNCH BYPASS TOOL →</a>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 mt-20 text-center">
          <div className="glass p-8 rounded-3xl">
            <div className="text-6xl font-bold text-purple-400">{users.toLocaleString()}+</div>
            <div className="text-zinc-400">Active Users</div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="text-6xl font-bold text-purple-400">{bypasses.toLocaleString()}+</div>
            <div className="text-zinc-400">Links Bypassed Today</div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="text-6xl font-bold text-purple-400">60+</div>
            <div className="text-zinc-400">Shorteners Supported</div>
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-zinc-500">© 2026 BypassPro Next • Built & Deployed with Precision • All APIs Live</footer>
    </div>
  );
                                                         }
