import React, { useState } from 'react';
import confetti from 'canvas-confetti';

export const OrbitalCommunityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discussions' | 'observers' | 'challenges'>('discussions');

  const observers = [
    { name: 'Dr. Elena Rostova', affiliation: 'Palomar Research Fellow // JWST WG', posts: 42, boosts: '18.4k', badge: 'PRINCIPAL' },
    { name: 'AstroKip', affiliation: 'High-Altitude Balloon Sensor Platform 4', posts: 19, boosts: '12.1k', badge: 'OBSERVER' },
    { name: 'AuroraPulse_NO', affiliation: 'Arctic Geomagnetic Research', posts: 31, boosts: '24.9k', badge: 'FELLOW' },
    { name: 'CassiniHeritage Group', affiliation: 'Archival Restoration Lab', posts: 64, boosts: '32.0k', badge: 'ARCHIVIST' }
  ];

  const threads = [
    {
      title: 'NGC 3372 Ionization Front Shockwaves: Optimal narrow bandpass filters for suburban Bortle 5?',
      replies: 28,
      author: 'AstroVanguard_99',
      lastActive: '12m ago',
      category: 'OPTICS GEAR'
    },
    {
      title: 'Solar Cycle 25 Maximum: Auroral substorm prediction models for mid-latitudes this autumn',
      replies: 56,
      author: 'AuroraPulse_NO',
      lastActive: '34m ago',
      category: 'GEOMAGNETIC'
    },
    {
      title: 'Processing JWST NIRCam F090W FITS calibrated data using open astronomical libraries in Python',
      replies: 14,
      author: 'Dr. Elena Rostova',
      lastActive: '1h ago',
      category: 'DATA REDUCTION'
    }
  ];

  const handleJoinNetwork = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#62f9ee', '#e1b6ff', '#ffd166']
    });
    alert('Welcome to CosmoPulse Deep Space Observatory Network! Call-sign registered.');
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#272a34]">
        <div>
          <div className="flex items-center gap-2 font-mono-telemetry text-xs text-[#62f9ee] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
            <span>GLOBAL ASTROPHYSICAL COOPERATIVE</span>
          </div>
          <h1 className="font-space text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">
            Orbital Community
          </h1>
          <p className="font-sans text-sm text-[#bacac7] mt-1">
            Connect with certified observatories, planetary imaging scientists, and astrophotographers sharing ground-truth data in real time.
          </p>
        </div>

        <button
          onClick={handleJoinNetwork}
          className="px-6 py-2.5 rounded-xl bg-[#62f9ee] text-[#00716b] font-space text-sm font-bold shadow-[0_0_16px_rgba(98,249,238,0.35)] hover:shadow-[0_0_24px_rgba(98,249,238,0.6)] transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">cell_tower</span>
          <span>Register Ground Station</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 py-4">
        {(['discussions', 'observers', 'challenges'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full font-mono-telemetry text-xs tracking-wider uppercase transition cursor-pointer ${
              activeTab === tab
                ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-[0_0_12px_rgba(98,249,238,0.3)]'
                : 'bg-[#1c1f29] text-[#bacac7] hover:text-white hover:bg-[#272a34]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'discussions' && (
        <div className="flex flex-col gap-3 mt-2">
          {threads.map((t, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#1c1f29]/70 backdrop-blur-xl border border-[#3c4948]/30 hover:border-[#62f9ee]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-[#272a34] text-[#62f9ee] font-mono-telemetry text-[10px] font-bold uppercase">
                  {t.category}
                </span>
                <h3 className="font-space text-base text-white font-bold hover:text-[#62f9ee] transition-colors">
                  {t.title}
                </h3>
                <div className="font-mono-telemetry text-xs text-[#bacac7]">
                  Opened by <span className="text-white">{t.author}</span> • Active {t.lastActive}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-[#181b25] border border-[#272a34] font-mono-telemetry text-xs text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#3cdcd1]">forum</span>
                  <span>{t.replies} transmissions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'observers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {observers.map((obs, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#1c1f29]/70 backdrop-blur-xl border border-[#3c4948]/30 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-[#32343f] flex items-center justify-center font-space text-sm text-white font-bold">
                    {obs.name.charAt(0)}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#691a9f]/40 text-[#d69eff] font-mono-telemetry text-[10px] font-bold">
                    {obs.badge}
                  </span>
                </div>
                <h3 className="font-space text-base text-white font-bold">{obs.name}</h3>
                <p className="font-mono-telemetry text-[11px] text-[#bacac7]">{obs.affiliation}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#272a34] font-mono-telemetry text-xs">
                <span className="text-[#bacac7]">{obs.posts} posts</span>
                <span className="text-[#62f9ee] font-bold">{obs.boosts} boosts</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="p-8 rounded-2xl bg-[#1c1f29]/60 border border-[#3c4948]/30 text-center space-y-3">
          <span className="material-symbols-outlined text-[42px] text-[#ffba27]">emoji_events</span>
          <h3 className="font-space text-xl text-white font-bold">Monthly Deep Space Astrophotography Challenge</h3>
          <p className="font-sans text-sm text-[#bacac7] max-w-xl mx-auto">
            Current Target: Pillars of Creation (NGC 3372) Narrowband H-Alpha stacking. Top observations will be featured on the APOD spotlight hero deck next month.
          </p>
          <button
            onClick={() => alert('Challenge entry form downloaded!')}
            className="px-5 py-2 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white font-mono-telemetry text-xs uppercase cursor-pointer"
          >
            Submit Observation Entry
          </button>
        </div>
      )}
    </div>
  );
};
