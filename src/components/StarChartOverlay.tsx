import React, { useState } from 'react';
import {
  DEEP_SPACE_CONSTELLATIONS,
  DEEP_SPACE_DISTANCE_MARKERS,
  Constellation,
  DistanceBeacon
} from '../data/spaceData';

interface StarChartOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onFocusMarker?: (marker: DistanceBeacon) => void;
}

export const StarChartOverlay: React.FC<StarChartOverlayProps> = ({
  isVisible,
  onClose,
  onFocusMarker
}) => {
  const [selectedHemisphere, setSelectedHemisphere] = useState<'ALL' | 'NORTH' | 'SOUTH' | 'EQUATORIAL'>('ALL');
  const [activeConstellation, setActiveConstellation] = useState<Constellation | null>(DEEP_SPACE_CONSTELLATIONS[0]);
  const [activeTab, setActiveTab] = useState<'constellations' | 'distance_ladder'>('constellations');
  const [highlightedMarker, setHighlightedMarker] = useState<DistanceBeacon | null>(null);

  if (!isVisible) return null;

  const filteredConstellations = DEEP_SPACE_CONSTELLATIONS.filter(
    (c) => selectedHemisphere === 'ALL' || c.hemisphere === selectedHemisphere
  );

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between overflow-hidden p-4 sm:p-6">
      {/* Top Banner & Control Dock */}
      <div className="pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0b0e17]/85 backdrop-blur-2xl p-4 rounded-2xl border border-[#3c4948]/50 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#691a9f]/50 border border-[#e1b6ff]/40 flex items-center justify-center text-[#e1b6ff] shadow-[0_0_15px_rgba(225,182,255,0.3)]">
            <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-space text-lg text-white font-bold tracking-tight">
                Deep Space Star Chart
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#272a34] text-[#62f9ee] font-mono-telemetry text-[10px] font-bold uppercase tracking-wider">
                COSMIC LADDER OVERLAY
              </span>
            </div>
            <p className="font-mono-telemetry text-xs text-[#bacac7]">
              Constellation asterisms, stellar parallax baselines & light-year distance beacons
            </p>
          </div>
        </div>

        {/* Tab Switcher & Dismiss */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-[#181b25] p-1 rounded-xl border border-[#272a34]">
            <button
              onClick={() => setActiveTab('constellations')}
              className={`px-3 py-1 rounded-lg font-mono-telemetry text-xs transition cursor-pointer ${
                activeTab === 'constellations'
                  ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-sm'
                  : 'text-[#bacac7] hover:text-white'
              }`}
            >
              Constellations
            </button>
            <button
              onClick={() => setActiveTab('distance_ladder')}
              className={`px-3 py-1 rounded-lg font-mono-telemetry text-xs transition cursor-pointer ${
                activeTab === 'distance_ladder'
                  ? 'bg-[#62f9ee] text-[#00716b] font-bold shadow-sm'
                  : 'text-[#bacac7] hover:text-white'
              }`}
            >
              Light-Year Distance Ladder
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#272a34] hover:bg-[#363943] text-[#bacac7] hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close Star Chart Overlay"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Floating Center / Left Data Panel */}
      <div className="my-auto pointer-events-auto max-w-sm sm:max-w-md bg-[#1c1f29]/90 backdrop-blur-2xl rounded-2xl p-5 border border-[#3c4948]/50 shadow-[0_16px_48px_rgba(0,0,0,0.7)] flex flex-col gap-3">
        {activeTab === 'constellations' && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-[#272a34]">
              <div className="flex items-center gap-1.5 font-mono-telemetry text-xs text-[#bacac7]">
                <span>HEMISPHERE:</span>
                {(['ALL', 'NORTH', 'SOUTH', 'EQUATORIAL'] as const).map((hemi) => (
                  <button
                    key={hemi}
                    onClick={() => setSelectedHemisphere(hemi)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase cursor-pointer transition ${
                      selectedHemisphere === hemi
                        ? 'bg-[#62f9ee] text-[#00716b] font-bold'
                        : 'bg-[#272a34] hover:text-white'
                    }`}
                  >
                    {hemi === 'EQUATORIAL' ? 'EQUAT' : hemi}
                  </button>
                ))}
              </div>
            </div>

            {/* Constellation selector pill buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {filteredConstellations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveConstellation(c)}
                  className={`px-3 py-1 rounded-xl font-mono-telemetry text-xs whitespace-nowrap transition cursor-pointer border ${
                    activeConstellation?.id === c.id
                      ? 'bg-[#e1b6ff] text-[#4c007b] font-bold border-[#e1b6ff] shadow-[0_0_12px_rgba(225,182,255,0.4)]'
                      : 'bg-[#181b25] text-[#bacac7] hover:text-white border-[#272a34]'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Active Constellation Dossier */}
            {activeConstellation && (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-space text-lg text-white font-bold">
                      {activeConstellation.name}
                    </h3>
                    <div className="font-mono-telemetry text-xs text-[#62f9ee]">
                      Alpha Star Distance: ~{activeConstellation.alphaStarDistLy} light-years
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#272a34] text-[#ffba27] font-mono-telemetry text-[10px] font-bold">
                    {activeConstellation.distanceRangeLy}
                  </span>
                </div>

                <p className="font-sans text-xs text-[#bacac7] leading-relaxed">
                  {activeConstellation.description}
                </p>

                {/* Stars Breakdown Table */}
                <div className="bg-[#0b0e17] p-2.5 rounded-xl border border-[#272a34]">
                  <span className="block font-mono-telemetry text-[10px] text-[#bacac7] uppercase mb-1">
                    Key Constellation Members & Distances
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {activeConstellation.stars.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between font-mono-telemetry text-xs p-1 rounded hover:bg-[#272a34]/50"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#62f9ee]" />
                          <span className="text-white">{s.name}</span>
                          <span className="text-[#bacac7] text-[10px]">({s.specType})</span>
                        </div>
                        <span className="text-[#e1b6ff] font-semibold">{s.distLy.toLocaleString()} ly</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'distance_ladder' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#272a34]">
              <span className="font-mono-telemetry text-xs text-white font-bold">
                Cosmic Distance Ladder Beacons
              </span>
              <span className="font-mono-telemetry text-[10px] text-[#62f9ee]">
                SOLAR SYSTEM TO CORE
              </span>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {DEEP_SPACE_DISTANCE_MARKERS.map((marker, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setHighlightedMarker(marker);
                    if (onFocusMarker) onFocusMarker(marker);
                  }}
                  className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-between border ${
                    highlightedMarker?.name === marker.name
                      ? 'bg-[#272a34] border-[#62f9ee]'
                      : 'bg-[#181b25] hover:bg-[#272a34]/60 border-[#272a34]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-space text-xs text-white font-bold">
                      {marker.name}
                    </span>
                    <span className="font-mono-telemetry text-[10px] text-[#bacac7]">
                      {marker.type} • Mag {marker.apparentMag}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-telemetry text-xs text-[#62f9ee] font-bold">
                      {marker.distLy}
                    </div>
                    <div className="font-mono-telemetry text-[9px] text-[#bacac7]">
                      {marker.distParsecs}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Legend */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-[#0b0e17]/85 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-[#3c4948]/50 shadow-xl font-mono-telemetry text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#62f9ee]">
            <span className="w-2 h-2 rounded-full bg-[#62f9ee] animate-pulse" />
            <span>SPECTRAL STAR BEACONS</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#e1b6ff]">
            <span className="w-3 h-0.5 bg-[#e1b6ff]" />
            <span>CONSTELLATION VECTOR TIES</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[#ffba27]">
            <span className="material-symbols-outlined text-[14px]">straighten</span>
            <span>PARALLAX DISTANCE LABELS [LIGHT-YEARS]</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#bacac7]">
          <span>PARALLAX CALIBRATION:</span>
          <span className="text-white font-bold">GAIA DR3 / HIPPARCOS EPOCH</span>
        </div>
      </div>
    </div>
  );
};
