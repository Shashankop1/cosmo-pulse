import React, { useState } from 'react';
import { CELESTIAL_DATA } from '../data/spaceData';

export const CosmicCodexView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  const categories = ['ALL', 'PLANETS', 'DEEP SKY', 'TELESCOPES', 'PROPULSION'];

  const articles = [
    {
      id: 'art-1',
      tag: 'DEEP SKY',
      title: 'Gravitational Lensing & General Relativity in SMACS 0723',
      description: 'How foreground galaxy clusters act as massive cosmic telescopes bending space-time to reveal light from galaxies born only 600 million years after the Big Bang.',
      author: 'Dr. Elena Rostova',
      readTime: '6 min read',
      badge: 'PEER-REVIEWED',
      icon: 'blur_on'
    },
    {
      id: 'art-2',
      tag: 'PLANETS',
      title: 'Cryovolcanism on Enceladus & the Sub-Surface Hydrothermal Ocean',
      description: 'Analysis of Cassini spectrometer readings confirming molecular hydrogen (H2) and organic macromolecule vents shooting hundreds of kilometers into Saturnian orbit.',
      author: 'CassiniHeritage Group',
      readTime: '8 min read',
      badge: 'ARCHIVE CLASS A',
      icon: 'water_drop'
    },
    {
      id: 'art-3',
      tag: 'PROPULSION',
      title: 'Relativistic Ion Engines & Magnetohydrodynamic Plasma Thrusters',
      description: 'Engineering the next-generation Hall-effect engines using krypton gas ionization to sustain long-duration constant acceleration toward the Oort Cloud.',
      author: 'AstroKip // Propulsion Lab',
      readTime: '5 min read',
      badge: 'TECH SPEC',
      icon: 'rocket'
    },
    {
      id: 'art-4',
      tag: 'TELESCOPES',
      title: 'Interferometric Synthesis: The Keck, VLT, and ALMA Submillimeter Baseline',
      description: 'Combining optical phase baselines across continents to achieve 0.001 arcsecond spatial resolution for exoplanet direct imaging.',
      author: 'Palomar Research Collective',
      readTime: '10 min read',
      badge: 'OPTICS MANUAL',
      icon: 'radio'
    }
  ];

  const filteredArticles = articles.filter((a) => {
    const matchesTag = selectedTag === 'ALL' || a.tag === selectedTag;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#272a34]">
        <div>
          <div className="flex items-center gap-2 font-mono-telemetry text-xs text-[#62f9ee] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
            <span>EXOPLANETARY & ASTROPHYSICAL COMPENDIUM</span>
          </div>
          <h1 className="font-space text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">
            Cosmic Codex Archive
          </h1>
          <p className="font-sans text-sm text-[#bacac7] mt-1 max-w-2xl">
            A living repository of astrophysical papers, planetary cartography, and high-energy observational records compiled by the CosmoPulse deep space network.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined text-[18px] text-[#bacac7] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search celestial catalog..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1c1f29] border border-[#3c4948]/40 text-white font-sans text-xs focus:outline-none focus:ring-1 focus:ring-[#62f9ee] placeholder:text-[#bacac7]/40"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedTag(cat)}
            className={`px-4 py-1.5 rounded-full font-mono-telemetry text-xs tracking-wider transition cursor-pointer ${
              selectedTag === cat
                ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-[0_0_12px_rgba(98,249,238,0.3)]'
                : 'bg-[#1c1f29] text-[#bacac7] hover:text-white hover:bg-[#272a34] border border-[#272a34]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {filteredArticles.map((art) => (
          <article
            key={art.id}
            className="p-6 rounded-2xl bg-[#1c1f29]/70 backdrop-blur-xl border border-[#3c4948]/30 hover:border-[#62f9ee]/50 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-[#272a34] text-[#62f9ee] font-mono-telemetry text-[10px] font-bold uppercase">
                  {art.tag}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#691a9f]/40 text-[#d69eff] font-mono-telemetry text-[10px]">
                  {art.badge}
                </span>
              </div>

              <h3 className="font-space text-xl text-white font-bold group-hover:text-[#62f9ee] transition-colors">
                {art.title}
              </h3>

              <p className="font-sans text-sm text-[#bacac7] leading-relaxed">
                {art.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#272a34] font-mono-telemetry text-xs text-[#bacac7]">
              <span>{art.author}</span>
              <span className="text-[#e1b6ff]">{art.readTime}</span>
            </div>
          </article>
        ))}
      </div>

      {/* Quick Planetary Database Reference Matrix */}
      <div className="mt-12 p-6 rounded-2xl bg-[#1c1f29]/50 border border-[#3c4948]/30 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-space text-lg text-white font-bold">Planetary Ephemeris Reference Table</h3>
          <span className="font-mono-telemetry text-xs text-[#62f9ee]">8 MAJOR BODIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-telemetry text-xs">
            <thead>
              <tr className="border-b border-[#272a34] text-[#bacac7] text-[10px] uppercase">
                <th className="py-2">Body</th>
                <th className="py-2">Semi-Major Axis</th>
                <th className="py-2">Radius</th>
                <th className="py-2">Gravity</th>
                <th className="py-2">Orbital Period</th>
                <th className="py-2">Mean Temp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272a34]/50">
              {Object.values(CELESTIAL_DATA).map((p) => (
                <tr key={p.id} className="hover:bg-[#272a34]/40 transition-colors">
                  <td className="py-2.5 font-space font-bold text-white flex items-center gap-1.5">
                    <span className="text-[#62f9ee]">{p.symbol}</span>
                    <span>{p.name.split(' ')[0]}</span>
                  </td>
                  <td className="py-2.5 text-[#bacac7]">{p.au}</td>
                  <td className="py-2.5 text-white">{p.radius}</td>
                  <td className="py-2.5 text-white">{p.gravity}</td>
                  <td className="py-2.5 text-[#bacac7]">{p.period.split(' ')[0]} d</td>
                  <td className="py-2.5 text-[#ffba27]">{p.temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
