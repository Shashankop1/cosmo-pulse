import React, { useState } from 'react';

export const PersistentHUDDock: React.FC = () => {
  const [audioActive, setAudioActive] = useState(true);

  return (
    <>
      {/* Floating HUD Dock */}
      <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[calc(100%-2rem)] pointer-events-auto">
        <div className="bg-[#1c1f29]/75 backdrop-blur-2xl rounded-full px-5 sm:px-6 py-2 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#3c4948]/30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAudioActive(!audioActive)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#272a34] hover:bg-[#32343f] text-[#bacac7] hover:text-white transition-colors font-mono-telemetry text-xs cursor-pointer border border-[#3c4948]/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#62f9ee]">
                {audioActive ? 'volume_up' : 'volume_off'}
              </span>
              <span className="uppercase">WARP AUDIO [{audioActive ? 'ON' : 'MUTED'}]</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 font-mono-telemetry text-xs text-[#bacac7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
              <span>HUD TELEMETRY SYNCED</span>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono-telemetry text-xs tabular-nums text-[#3cdcd1]">
            <span className="text-[#bacac7] font-mono-telemetry text-[10px] hidden xs:inline">
              TARGET POS:
            </span>
            <span>RA 05h 35m 17s</span>
            <span>/</span>
            <span>DEC -05° 23′ 28″</span>
          </div>
        </div>
      </aside>

      {/* Footer */}
      <footer className="w-full bg-[#0b0e17] py-8 border-t border-[#272a34] mt-auto">
        <div className="w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#bacac7] font-sans text-xs">
          <div>
            © 2026 CosmoPulse Deep Space Observatory Network. All observational telemetry recorded in real time.
          </div>
          <div className="flex items-center gap-6 font-mono-telemetry text-xs">
            <button
              onClick={() => alert('Telemetry Protocol: Realtime CCSDS space packet protocol with Reed-Solomon LDPC correction.')}
              className="hover:text-white transition-colors uppercase cursor-pointer"
            >
              Telemetry Protocol
            </button>
            <button
              onClick={() => alert('Ephemeris Engine: Numerical integration using NASA JPL DE440 ephemeris epoch J2000.')}
              className="hover:text-white transition-colors uppercase cursor-pointer"
            >
              Ephemeris Engine
            </button>
            <button
              onClick={() => alert('Orbital Node Status: 9 of 11 ground relay stations operational. DSN Goldstone locked.')}
              className="hover:text-white transition-colors uppercase cursor-pointer"
            >
              Orbital Node Status
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
