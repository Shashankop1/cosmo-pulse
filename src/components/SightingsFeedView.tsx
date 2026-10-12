import React, { useState } from 'react';
import { SightingsPost } from '../data/spaceData';

interface SightingsFeedViewProps {
  sightings: SightingsPost[];
  onOpenLogModal: () => void;
  onNavigateToScreen: (screenId: string) => void;
}

export const SightingsFeedView: React.FC<SightingsFeedViewProps> = ({
  sightings,
  onOpenLogModal,
  onNavigateToScreen
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('TRENDING');
  const [apodBoosts, setApodBoosts] = useState(4820);
  const [boostedMap, setBoostedMap] = useState<Record<string, boolean>>({});
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  const filterTabs = [
    { id: 'ALL', label: `ALL SIGHTINGS (${sightings.length})` },
    { id: 'DEEP SKY NEBULAE', label: 'DEEP SKY NEBULAE' },
    { id: 'EXOPLANET TRANSITS', label: 'EXOPLANET TRANSITS' },
    { id: 'PLANETARY HI-RES', label: 'PLANETARY HI-RES' },
    { id: 'SATELLITE & ISS PASSES', label: 'SATELLITE & ISS PASSES' },
    { id: 'METEOR SHOWERS', label: 'METEOR SHOWERS' }
  ];

  const filteredPosts = sightings.filter((post) => {
    if (activeFilter === 'ALL') return true;
    return post.categoryTag.toLowerCase().includes(activeFilter.toLowerCase()) ||
           post.category.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleBoost = (id: string) => {
    setBoostedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBookmark = (id: string) => {
    setBookmarkedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col w-full pb-20">
      {/* ========================================================= */}
      {/* APOD SPOTLIGHT HERO SECTION */}
      {/* ========================================================= */}
      <section className="relative w-full overflow-hidden px-4 sm:px-6 pt-2 pb-6">
        {/* Nebular Ambient Glows */}
        <div className="absolute inset-0 -z-10 bg-[#0b0e17]">
          <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-[#691a9f]/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 -right-20 w-[500px] h-[500px] bg-[#3cdcd1]/10 rounded-full blur-[130px] pointer-events-none" />
          {/* Constellation Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            <defs>
              <pattern id="celestial-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="0.75" fill="#62f9ee" />
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#62f9ee" strokeDasharray="2 6" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#celestial-grid)" />
          </svg>
        </div>

        {/* Hero Spotlight Glass Container */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#1c1f29]/40 backdrop-blur-2xl border border-[#3c4948]/40 shadow-2xl">
          {/* Reticle Ambient Markers */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 font-mono-telemetry text-[11px] text-[#62f9ee] tracking-widest pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#62f9ee] animate-ping" />
            <span>OPTICAL RETICLE: LOCK // NGC 3372</span>
          </div>
          <div className="absolute top-4 right-4 z-20 font-mono-telemetry text-[11px] text-[#bacac7] hidden sm:flex items-center gap-2 pointer-events-none">
            <span className="material-symbols-outlined text-[15px] text-[#3cdcd1]">sensors</span>
            <span>SPECTRAL BAND: HYDROGEN-ALPHA (656.3nm)</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Hero Image Canvas */}
            <div className="lg:col-span-7 relative min-h-[320px] lg:min-h-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBMz7O9FQHNa16isBtspLvsdTZuZrpILuw6ykWBWdolVJq8TIJaHIbcnIflmFfFWxCraFgVmwqTjMbjVvLRa_bGeGKZU_59NvmGqTyaFtRnKrHnk6je9x-y9GaXIKEqU5UrspR9-f2OiqcTCzhOkTV0Y_1T_bX20qKwOJtjoIY1JFbIjWyP9NPCTUqOBHuCSI-KwtqKc_jryxqcr2OmLT5-izARk2uK0nQ5L_cSO1tCtjJXDrs7T-5XOw')"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1f29] via-[#1c1f29]/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#1c1f29]/50 lg:to-[#1c1f29]" />
              {/* Image Telemetry Floating Badge */}
              <div className="absolute bottom-4 left-4 z-10 p-3 rounded-xl bg-[#0b0e17]/85 backdrop-blur-md border border-[#3c4948]/30 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-mono-telemetry text-[10px] text-[#bacac7]">SENSOR INTEGRATION</span>
                  <span className="font-mono-telemetry text-xs text-[#62f9ee] font-bold">18.4 HRS STACKED</span>
                </div>
                <div className="h-6 w-px bg-[#363943]" />
                <div className="flex flex-col">
                  <span className="font-mono-telemetry text-[10px] text-[#bacac7]">APPARENT MAG</span>
                  <span className="font-mono-telemetry text-xs text-white font-bold">+1.00 B</span>
                </div>
              </div>
            </div>

            {/* Hero Metadata & Actions */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#1c1f29]/80 backdrop-blur-xl">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#691a9f] text-[#d69eff] font-mono-telemetry text-[10px] font-semibold tracking-wider uppercase">
                    ASTRONOMY PICTURE OF THE DAY
                  </span>
                  <span className="font-mono-telemetry text-[11px] text-[#bacac7] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
                    <span>FEAT. ARCHIVE #4819</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h1 className="font-space text-2xl sm:text-3xl text-white tracking-tight font-bold">
                    The Carina Nebula Pillars of Creation
                  </h1>
                  <p className="font-sans text-sm text-[#bacac7] line-clamp-3 leading-relaxed">
                    Spectacular stellar nursery ionized by the luminous blue hypergiant Eta Carinae, carving massive gaseous pillars through interstellar stellar wind shocks.
                  </p>
                </div>

                {/* Rig Specs Matrix */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#181b25] border border-[#272a34]">
                  <div className="flex flex-col">
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7]">ASTROPHOTOGRAPHER</span>
                    <span className="font-sans text-xs text-white font-medium flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-[#62f9ee]">verified</span>
                      AstroVanguard_99
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7]">OPTICAL APERTURE</span>
                    <span className="font-mono-telemetry text-xs text-white mt-0.5">Celestron EdgeHD 11</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7]">IMAGING CAMERA</span>
                    <span className="font-mono-telemetry text-xs text-white mt-0.5">ZWO ASI2600MC Pro</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7]">CELESTIAL POS</span>
                    <span className="font-mono-telemetry text-xs text-[#62f9ee] mt-0.5">RA 10h 45m / DEC -59°52′</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigateToScreen('3d-planet-inspector')}
                  className="px-5 py-2.5 rounded-xl bg-[#62f9ee] text-[#00716b] font-space text-sm font-bold tracking-wide shadow-[0_0_16px_rgba(98,249,238,0.35)] hover:shadow-[0_0_24px_rgba(98,249,238,0.6)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                  <span>Inspect in 3D Sky Map</span>
                </button>

                <button
                  onClick={() => setApodBoosts((prev) => prev + 1)}
                  className="px-4 py-2.5 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white transition-all flex items-center gap-2 cursor-pointer border border-[#3c4948]/30"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#e1b6ff]">rocket_launch</span>
                  <span className="font-mono-telemetry text-xs font-semibold">{apodBoosts} Boosts</span>
                </button>

                <button
                  title="Export High-Res FITS Data"
                  onClick={() => alert('Downloading calibrated Carina Nebula FITS archive (18.4h integration)...')}
                  className="p-2.5 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-[#bacac7] hover:text-white transition-colors cursor-pointer border border-[#3c4948]/30"
                >
                  <span className="material-symbols-outlined text-[20px]">file_download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FILTER PILLS & ACTION TRIGGER BAR */}
      {/* ========================================================= */}
      <section className="sticky top-28 z-30 w-full px-4 sm:px-6 py-2.5 bg-[#0b0e17]/85 backdrop-blur-xl border-y border-[#272a34]/40 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-1.5 rounded-full font-mono-telemetry text-[11px] tracking-wider shrink-0 transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-[0_0_12px_rgba(98,249,238,0.35)]'
                    : 'bg-[#272a34] text-[#bacac7] hover:text-white hover:bg-[#32343f]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Menu & Log Observation CTA */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-[16px] text-[#bacac7] absolute left-3 pointer-events-none">
                swap_vert
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none pl-8 pr-8 py-1.5 rounded-xl bg-[#272a34] text-white font-mono-telemetry text-xs tracking-wide cursor-pointer focus:outline-none border border-[#3c4948]/40 hover:bg-[#32343f]"
              >
                <option value="TRENDING">TRENDING IN ORBIT</option>
                <option value="LATEST">LATEST SIGNALS (UTC)</option>
                <option value="HIGHEST">HIGHEST BOOSTER RATING</option>
                <option value="DEEPEST">DEEPEST EXPOSURE</option>
              </select>
              <span className="material-symbols-outlined text-[14px] text-[#bacac7] absolute right-2 pointer-events-none">
                expand_more
              </span>
            </div>

            <button
              onClick={onOpenLogModal}
              className="px-4 py-1.5 rounded-xl bg-[#691a9f] hover:bg-[#7b23b8] text-white transition-all font-mono-telemetry text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-md hover:shadow-[0_0_15px_rgba(225,182,255,0.4)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
              <span>LOG OBSERVATION</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MAIN TWO-COLUMN OBSERVATION FEED + TELEMETRY SIDEBAR */}
      {/* ========================================================= */}
      <main className="w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Community Observation Feed (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {filteredPosts.map((post) => {
              const isBoosted = boostedMap[post.id];
              const isBookmarked = bookmarkedMap[post.id];
              const boostCount = post.boosts + (isBoosted ? 1 : 0);

              return (
                <article
                  key={post.id}
                  className="group relative rounded-2xl bg-[#1c1f29]/60 backdrop-blur-xl border border-[#3c4948]/30 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div className="p-6 flex flex-col gap-4">
                    {/* Author Telemetry Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#363943] shrink-0 border border-[#3c4948]">
                          <img
                            src={post.avatarUrl}
                            alt={post.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-space text-base text-white font-bold">
                              {post.author}
                            </span>
                            {post.verified && (
                              <span
                                className="material-symbols-outlined text-[#3cdcd1] text-[16px]"
                                title="Verified Observatory Fellow"
                              >
                                verified
                              </span>
                            )}
                          </div>
                          <span className="font-mono-telemetry text-[10px] text-[#bacac7]">
                            {post.authorTitle}
                          </span>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-[#272a34] text-[#62f9ee] font-mono-telemetry text-[10px] uppercase font-semibold">
                        {post.category}
                      </span>
                    </div>

                    {/* Post Title & Description */}
                    <div>
                      <h2 className="font-space text-xl text-white font-bold tracking-tight group-hover:text-[#62f9ee] transition-colors">
                        {post.title}
                      </h2>
                      <p className="font-sans text-sm text-[#bacac7] mt-1 leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    {/* Coordinates Micro-HUD */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-telemetry text-xs text-[#bacac7] bg-[#0b0e17]/60 p-2.5 rounded-lg border border-[#272a34]">
                      {post.coordinates.map((coord, idx) => (
                        <React.Fragment key={idx}>
                          <span className={idx === 0 ? 'text-[#62f9ee]' : ''}>
                            {coord}
                          </span>
                          {idx < post.coordinates.length - 1 && (
                            <span className="opacity-30">•</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Astrophotography Image Canvas */}
                    <div className="relative w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden bg-[#0b0e17]">
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${post.imageUrl}')` }}
                      />

                      {/* Reticle Targeter Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                        <svg className="stroke-[#62f9ee]" width="100" height="100" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="50" fill="none" strokeDasharray="4 4" strokeWidth="0.75" />
                          <circle cx="60" cy="60" r="20" fill="none" strokeWidth="1" />
                          <line x1="60" y1="0" x2="60" y2="20" strokeWidth="1" />
                          <line x1="60" y1="100" x2="60" y2="120" strokeWidth="1" />
                          <line x1="0" y1="60" x2="20" y2="60" strokeWidth="1" />
                          <line x1="100" y1="60" x2="120" y2="60" strokeWidth="1" />
                        </svg>
                      </div>

                      {post.skyTagged && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#0b0e17]/85 backdrop-blur-md font-mono-telemetry text-[10px] text-[#62f9ee] flex items-center gap-1 border border-[#62f9ee]/30">
                          <span className="material-symbols-outlined text-[13px]">share_location</span>
                          <span>3D SKY MAP TAGGED</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBoost(post.id)}
                          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                            isBoosted
                              ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-[0_0_15px_rgba(98,249,238,0.5)]'
                              : 'bg-[#272a34] text-white hover:bg-[#32343f]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px] text-[#e1b6ff]">
                            rocket_launch
                          </span>
                          <span className="font-mono-telemetry text-xs font-bold">
                            {boostCount}
                          </span>
                          <span className="font-mono-telemetry text-[10px] uppercase text-[#bacac7]">
                            Boosts
                          </span>
                        </button>

                        <button
                          onClick={() => alert(`Observational discussions for ${post.title}: ${post.comments} radio comments logged.`)}
                          className="px-4 py-2 rounded-xl bg-[#181b25] text-[#bacac7] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer border border-[#272a34]"
                        >
                          <span className="material-symbols-outlined text-[18px]">mode_comment</span>
                          <span className="font-mono-telemetry text-xs">{post.comments}</span>
                        </button>

                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer border border-[#272a34] ${
                            isBookmarked
                              ? 'bg-[#691a9f] text-white'
                              : 'bg-[#181b25] text-[#bacac7] hover:text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isBookmarked ? 'bookmark_added' : 'bookmark'}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigateToScreen('3d-planet-inspector')}
                          className="px-3.5 py-2 rounded-xl bg-[#272a34] text-white hover:text-[#62f9ee] font-mono-telemetry text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3c4948]/30"
                        >
                          <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                          <span>3D Projection</span>
                        </button>

                        <button
                          onClick={() => alert(`Calibrated raw telemetry export for ${post.title} downloaded.`)}
                          className="px-3.5 py-2 rounded-xl bg-[#181b25] text-[#bacac7] hover:text-[#62f9ee] font-mono-telemetry text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer border border-[#272a34]"
                        >
                          <span className="material-symbols-outlined text-[16px]">dataset</span>
                          <span>FITS Data</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right Telemetry Column (4 Cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Live ISS Real-Time Miniature Tracker Card */}
            <div className="relative rounded-2xl bg-[#1c1f29]/70 backdrop-blur-xl p-6 border border-[#3c4948]/30 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#3c4948]/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#62f9ee] animate-ping" />
                  <h3 className="font-space text-lg text-white font-bold">ISS Real-Time Orbit</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#62f9ee] text-[#00716b] font-mono-telemetry text-[10px] font-bold tracking-widest uppercase">
                  LIVE TLE
                </span>
              </div>

              {/* Miniature Orbit Canvas Projection */}
              <div className="relative w-full h-44 my-4 rounded-xl bg-[#0b0e17] border border-[#272a34] overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full opacity-70" viewBox="0 0 320 180">
                  <defs>
                    <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3cdcd1" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#62f9ee" stopOpacity="1" />
                      <stop offset="100%" stopColor="#e1b6ff" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="160" cy="90" rx="140" ry="70" fill="none" stroke="#32343f" strokeDasharray="3 3" strokeWidth="1" />
                  <ellipse cx="160" cy="90" rx="90" ry="70" fill="none" stroke="#32343f" strokeDasharray="3 3" strokeWidth="1" />
                  <line x1="20" y1="90" x2="300" y2="90" stroke="#32343f" strokeDasharray="2 4" strokeWidth="1" />
                  <line x1="160" y1="20" x2="160" y2="160" stroke="#32343f" strokeDasharray="2 4" strokeWidth="1" />
                  <path d="M 30 140 Q 160 10 290 120" fill="none" stroke="url(#orbit-grad)" strokeWidth="2.5" />
                  <circle cx="185" cy="58" r="6" fill="#62f9ee" className="animate-pulse" />
                  <circle cx="185" cy="58" r="14" fill="none" stroke="#62f9ee" opacity="0.4" strokeWidth="1" />
                  <text x="195" y="54" fill="#ffffff" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">
                    ISS (ZARYA)
                  </text>
                </svg>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#1c1f29]/90 backdrop-blur-md font-mono-telemetry text-[10px] text-[#62f9ee]">
                  ALT: 418.6 KM
                </div>
              </div>

              {/* Telemetry Readouts */}
              <div className="space-y-1.5 font-mono-telemetry text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#181b25]">
                  <span className="text-[#bacac7] text-[11px]">LATITUDE / LONGITUDE</span>
                  <span className="text-[#62f9ee] font-bold">48.204° N / 16.373° E</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#181b25]">
                  <span className="text-[#bacac7] text-[11px]">GROUND VELOCITY</span>
                  <span className="text-white">27,612 km/h (7.67 km/s)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#181b25]">
                  <span className="text-[#bacac7] text-[11px]">NEXT VISIBLE PASS</span>
                  <span className="text-[#e1b6ff] font-bold">Munich in 14m 22s</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#181b25]">
                  <span className="text-[#bacac7] text-[11px]">SOLAR ARRAY ILLUM</span>
                  <span className="text-white">100% (SUNLIT)</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateToScreen('iss-live-tracker')}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#272a34] hover:bg-[#32343f] text-white font-mono-telemetry text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#3c4948]/30"
              >
                <span className="material-symbols-outlined text-[16px] text-[#3cdcd1]">videocam</span>
                <span>Open Full-Screen ISS Flight Deck</span>
              </button>
            </div>

            {/* Active Celestial Events Calendar Card */}
            <div className="relative rounded-2xl bg-[#1c1f29]/70 backdrop-blur-xl p-6 border border-[#3c4948]/30 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#3c4948]/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#ffba27]">event_upcoming</span>
                  <h3 className="font-space text-lg text-white font-bold">Orbital Almanac</h3>
                </div>
                <span className="font-mono-telemetry text-xs text-[#bacac7]">OCT 2026</span>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                <div className="p-3 rounded-xl bg-[#181b25] hover:bg-[#272a34] transition-colors flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#32343f] flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase">OCT</span>
                    <span className="font-space text-lg text-white font-bold leading-none">12</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans text-xs text-white font-semibold truncate">
                        Perseid Meteor Peak
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-[#62f9ee] text-[#00716b] font-mono-telemetry text-[9px] font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <span className="font-mono-telemetry text-[11px] text-[#bacac7] mt-0.5">
                      Zenithal Hourly Rate: ~100 meteors/hr. Window 01:00-04:30 UTC.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181b25] hover:bg-[#272a34] transition-colors flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#32343f] flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase">OCT</span>
                    <span className="font-space text-lg text-white font-bold leading-none">18</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-xs text-white font-semibold truncate">
                      Jupiter at Opposition
                    </span>
                    <span className="font-mono-telemetry text-[11px] text-[#bacac7] mt-0.5">
                      Closest approach to Earth (3.98 AU). Great Red Spot visible all night.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181b25] hover:bg-[#272a34] transition-colors flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#32343f] flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7] uppercase">OCT</span>
                    <span className="font-space text-lg text-white font-bold leading-none">28</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-xs text-white font-semibold truncate">
                      Lunar Eclipse (Partial)
                    </span>
                    <span className="font-mono-telemetry text-[11px] text-[#bacac7] mt-0.5">
                      Umbral magnitude 0.122. Visible across Europe, Africa, Asia.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert('Calendar synced! All astronomical events added to your local device schedule.')}
                className="mt-4 w-full py-2 rounded-xl bg-[#181b25] hover:bg-[#272a34] text-[#bacac7] hover:text-white font-mono-telemetry text-xs tracking-wider uppercase transition-colors text-center cursor-pointer border border-[#272a34]"
              >
                + Sync All Events with ICS Calendar
              </button>
            </div>

            {/* Global Observatory Network Nodes Status */}
            <div className="rounded-2xl bg-[#1c1f29]/70 backdrop-blur-xl p-6 border border-[#3c4948]/30 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#3c4948]/30">
                <h3 className="font-space text-lg text-white font-bold">Node Aperture Status</h3>
                <span className="font-mono-telemetry text-xs text-[#62f9ee]">9 / 11 ONLINE</span>
              </div>
              <div className="mt-4 space-y-2.5 font-mono-telemetry text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#62f9ee]" />
                    <span className="text-white">MAUNA KEA (KECK I & II)</span>
                  </div>
                  <span className="text-[#bacac7]">SEEING: 0.42″</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#62f9ee]" />
                    <span className="text-white">PARANAL (VLT ARRAY)</span>
                  </div>
                  <span className="text-[#bacac7]">SEEING: 0.55″</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ffba27]" />
                    <span className="text-white">LA PALMA (ROQUE DE LOS MUCHACHOS)</span>
                  </div>
                  <span className="text-[#ffba27]">WIND: 42 KT</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#62f9ee]" />
                    <span className="text-white">ALMA (ATACAMA ARRAY)</span>
                  </div>
                  <span className="text-[#bacac7]">PWV: 0.38mm</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
