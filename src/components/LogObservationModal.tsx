import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface LogObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (newPost: {
    title: string;
    rig: string;
    coords: string;
    bortle: string;
    description: string;
  }) => void;
}

const BORTLE_CLASSES = [
  'Class 1: Excellent Dark Sky',
  'Class 2: Truly Dark Site',
  'Class 3: Rural Sky',
  'Class 4: Rural/Suburban Transition',
  'Class 5: Suburban Sky',
  'Class 6: Bright Suburban Sky',
  'Class 7: Suburban/Urban Transition',
  'Class 8: City Sky',
  'Class 9: Inner-City Sky'
];

export const LogObservationModal: React.FC<LogObservationModalProps> = ({
  isOpen,
  onClose,
  onAddPost
}) => {
  const [title, setTitle] = useState('');
  const [rig, setRig] = useState('Takahashi FSQ-106ED + ZWO ASI6200MM Pro');
  const [coords, setCoords] = useState('RA 05h 40m / DEC -02° 27′');
  const [bortleIndex, setBortleIndex] = useState(1);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onAddPost({
        title: title || 'Narrowband Celestial Feature Observation',
        rig,
        coords,
        bortle: BORTLE_CLASSES[bortleIndex],
        description: description || 'High-signal deep space optical stack calibrated in H-Alpha and OIII narrow bandpass.'
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#62f9ee', '#e1b6ff', '#ffd166', '#ffffff']
      });

      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0e17]/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#1c1f29]/95 backdrop-blur-3xl p-6 sm:p-8 shadow-2xl border border-[#3c4948]/50 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3c4948]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#62f9ee] text-[#00716b] flex items-center justify-center shadow-[0_0_15px_rgba(98,249,238,0.4)]">
              <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
            </div>
            <div>
              <h3 className="font-space text-xl text-white font-bold">Log Celestial Observation</h3>
              <span className="font-mono-telemetry text-xs text-[#bacac7] uppercase tracking-wider">
                COMMUNITY TELEMETRY ARCHIVE INGEST
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#272a34] hover:bg-[#363943] text-[#bacac7] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="space-y-1">
            <label className="block font-mono-telemetry text-xs text-[#bacac7] uppercase">
              OBSERVATION TITLE *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Horsehead Nebula B33 in Narrowband H-Alpha"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0b0e17] text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#62f9ee] border border-[#272a34] placeholder:text-[#bacac7]/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-mono-telemetry text-xs text-[#bacac7] uppercase">
                OPTICAL RIG / TELESCOPE
              </label>
              <input
                type="text"
                value={rig}
                onChange={(e) => setRig(e.target.value)}
                placeholder="e.g., Takahashi FSQ-106ED + ASI6200MM"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b0e17] text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#62f9ee] border border-[#272a34] placeholder:text-[#bacac7]/40"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-mono-telemetry text-xs text-[#bacac7] uppercase">
                TARGET BODY / CELESTIAL COORDS
              </label>
              <input
                type="text"
                value={coords}
                onChange={(e) => setCoords(e.target.value)}
                placeholder="RA 05h 40m / DEC -02° 27′"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b0e17] text-[#62f9ee] font-mono-telemetry text-sm focus:outline-none focus:ring-1 focus:ring-[#62f9ee] border border-[#272a34] placeholder:text-[#bacac7]/40"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block font-mono-telemetry text-xs text-[#bacac7] uppercase">
              OBSERVATIONAL LOG & SENSOR NOTES
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Atmospheric seeing, integration hours, calibration steps..."
              className="w-full px-4 py-2 rounded-xl bg-[#0b0e17] text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#62f9ee] border border-[#272a34] placeholder:text-[#bacac7]/40 resize-none"
            />
          </div>

          {/* Bortle Class Slider */}
          <div className="p-4 rounded-xl bg-[#0b0e17] border border-[#272a34] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-telemetry text-xs text-[#bacac7] uppercase">
                SKY DARKNESS (BORTLE CLASS)
              </span>
              <span className="font-mono-telemetry text-xs text-[#62f9ee] font-bold">
                {BORTLE_CLASSES[bortleIndex]}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              value={bortleIndex}
              onChange={(e) => setBortleIndex(parseInt(e.target.value))}
              className="w-full accent-[#62f9ee] h-1.5 bg-[#272a34] rounded-lg cursor-pointer"
            />
          </div>

          {/* Dropzone mockup */}
          <div className="p-6 rounded-xl bg-[#0b0e17]/80 border-2 border-dashed border-[#3c4948]/60 hover:border-[#62f9ee] transition-colors flex flex-col items-center justify-center text-center cursor-pointer group">
            <span className="material-symbols-outlined text-[36px] text-[#bacac7] group-hover:text-[#62f9ee] transition-colors">
              cloud_upload
            </span>
            <p className="font-space text-sm text-white font-semibold mt-2">
              Drop Astrophotography FITS, RAW or TIFF Files Here
            </p>
            <span className="font-mono-telemetry text-[11px] text-[#bacac7] mt-1">
              Supports FITS (flexible image transport), XISF, TIFF, CR3, NEF (Max file size: 500MB)
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#3c4948]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#272a34] text-white hover:bg-[#363943] font-mono-telemetry text-xs tracking-wider uppercase transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#62f9ee] text-[#00716b] font-space text-sm font-bold tracking-wide shadow-[0_0_16px_rgba(98,249,238,0.35)] hover:shadow-[0_0_24px_rgba(98,249,238,0.6)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{isSubmitting ? 'Transmitting...' : 'Broadcast Observation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
