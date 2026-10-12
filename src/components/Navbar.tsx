import React from 'react';

interface NavbarProps {
  activeScreen: string;
  onSelectScreen: (screenId: string) => void;
  onReplayWarp?: () => void;
  onLaunchObservation?: () => void;
  currentTimeStr: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onSelectScreen,
  onReplayWarp,
  onLaunchObservation,
  currentTimeStr
}) => {
  const navItems = [
    { id: 'daily-sightings-feed', label: 'Daily Sightings Feed' },
    { id: 'cosmic-codex', label: 'Cosmic Codex' },
    { id: '3d-planet-inspector', label: '3D Planet Inspector' },
    { id: 'iss-live-tracker', label: 'ISS Live Tracker' },
    { id: 'cupola-cam', label: 'Cupola Simulator' },
    { id: 'orbital-community', label: 'Orbital Community' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Telemetry Strip */}
      <div className="w-full bg-[#0b0e17]/85 backdrop-blur-md px-4 sm:px-6 border-b border-[#272a34]/40">
        <div className="h-8 w-full flex items-center justify-between font-mono-telemetry text-[11px]">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee] animate-ping" />
              <span className="text-[#bacac7] uppercase tracking-wider hidden xs:inline">
                SOLAR STORM INDEX:
              </span>
              <span className="text-[#62f9ee] font-medium">KP 2.33 (QUIET)</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
              <span className="text-[#bacac7] uppercase tracking-wider">DSN LINK:</span>
              <span className="text-[#62f9ee]">ONLINE (GOLDSTONE / DSS-14)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#bacac7] uppercase tracking-wider">UTC:</span>
            <span className="text-white font-mono-telemetry font-bold tabular-nums">
              {currentTimeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Main Glass Navigation Bar */}
      <div className="w-full bg-[#1c1f29]/75 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.5)] px-4 sm:px-6 border-b border-[#3c4948]/30">
        <div className="h-20 w-full flex items-center justify-between gap-4">
          {/* Logo & Version */}
          <div
            onClick={() => onSelectScreen('daily-sightings-feed')}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
          >
            <img
              alt="CosmoPulse Emblem"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1U6lEDXW7f3euLLmbdUtzwMsDKijSkJTVHL40u0SSR-jGbxyE-exsfhBSECN7kCFobn_msv3yJJx30w5RM6BIgc_cGXRoXF3w98nlaEJzBbb8_ScgJ1CoEYT3vyq08QHiOGfM4bwGT7n_JAhF42NA1f46Y2YpnY_ZHnClu98Ee9LgbDfTfZGop9JguTvovT_8Sl4Tbw-y5EHwiaCJLCLvKuKc1-e0L3ZZ_2AC681GGbUNC4K0KYRA1cWqUh"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-space text-xl font-bold tracking-tight text-white group-hover:text-[#62f9ee] transition-colors">
                CosmoPulse
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#691a9f] text-[#d69eff] font-mono-telemetry text-[10px] tracking-widest uppercase font-semibold">
                PULSAR v2.4
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectScreen(item.id)}
                  className={`px-3.5 py-2 rounded-lg font-space text-[14px] transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#62f9ee] text-[#00716b] font-semibold shadow-[0_0_12px_rgba(98,249,238,0.4)]'
                      : 'text-[#bacac7] hover:bg-[#272a34] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {onReplayWarp && (
              <button
                onClick={onReplayWarp}
                title="Re-engage hyperspace warp jump animation sequence"
                className="px-3 sm:px-4 py-2 rounded-xl bg-[#272a34] hover:bg-[#363943] text-white font-space text-sm font-semibold transition-all border border-[#3c4948]/40 flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_15px_rgba(98,249,238,0.25)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px] text-[#62f9ee]">
                  rocket
                </span>
                <span className="hidden sm:inline">Replay Warp</span>
              </button>
            )}

            <button
              onClick={onLaunchObservation}
              className="relative group overflow-hidden px-3.5 sm:px-5 py-2 rounded-xl bg-[#62f9ee] text-[#00716b] font-space text-sm font-bold tracking-wide transition-all shadow-[0_0_16px_rgba(98,249,238,0.35)] hover:shadow-[0_0_24px_rgba(98,249,238,0.6)] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                rocket_launch
              </span>
              <span className="hidden xs:inline">Launch Observation</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[#003734] text-[18px]">
                person
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Screen Navigation Strip */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar border-t border-[#272a34]/30">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`px-3 py-1 rounded-md font-space text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#62f9ee] text-[#00716b] font-semibold'
                    : 'text-[#bacac7] bg-[#10131c]/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
