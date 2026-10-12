import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WarpIntroOverlay } from './components/WarpIntroOverlay';
import { SightingsFeedView } from './components/SightingsFeedView';
import { PlanetInspectorView } from './components/PlanetInspectorView';
import { ISSLiveTrackerView } from './components/ISSLiveTrackerView';
import { CupolaSimulatorView } from './components/CupolaSimulatorView';
import { CosmicCodexView } from './components/CosmicCodexView';
import { OrbitalCommunityView } from './components/OrbitalCommunityView';
import { LogObservationModal } from './components/LogObservationModal';
import { PersistentHUDDock } from './components/PersistentHUDDock';
import { INITIAL_SIGHTINGS, SightingsPost } from './data/spaceData';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<string>('3d-planet-inspector');
  const [isWarpOpen, setIsWarpOpen] = useState<boolean>(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [sightings, setSightings] = useState<SightingsPost[]>(INITIAL_SIGHTINGS);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('18:42:09.12');

  // Real-time UTC Solar & Observatory clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      const ms = String(Math.floor(now.getUTCMilliseconds() / 10)).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}:${seconds}.${ms}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 50);
    return () => clearInterval(interval);
  }, []);

  const handleAddPost = (newPostData: {
    title: string;
    rig: string;
    coords: string;
    bortle: string;
    description: string;
  }) => {
    const newPost: SightingsPost = {
      id: `sighting-${Date.now()}`,
      author: 'You // Ground Station User',
      authorTitle: 'COMMUNITY OBSERVATORY CONTRIBUTOR',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCw9oCI8hJEwHvXEdpk2W3cmaUKMMAHJAwh1Q5KgvGMCmA8OyzniDKYppcQnkAGHFdF_RvmmI8t1wXnzXnAGtkJlKi8XkfL6ySc7qSPTvGorMq9SOJOVBFYA5WEIGWvE4r7d76coZKxSWvJEt6H1A9VXVjBSiwbjmCEk-dxiOHXwb3d6mybGRyy1DthfZMKqRhxPG5_yW9mFPuA-PJF6KbMj7TQwheQHKUVrfziy8toX1WHtFccffSsAw',
      verified: true,
      category: 'COMMUNITY LOGGED SIGHTING',
      categoryTag: 'DEEP SKY NEBULAE',
      title: newPostData.title,
      description: newPostData.description,
      coordinates: [newPostData.coords, newPostData.rig, newPostData.bortle],
      integration: 'CALIBRATED STACK',
      band: 'NARROWBAND H-ALPHA / OIII',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBMz7O9FQHNa16isBtspLvsdTZuZrpILuw6ykWBWdolVJq8TIJaHIbcnIflmFfFWxCraFgVmwqTjMbjVvLRa_bGeGKZU_59NvmGqTyaFtRnKrHnk6je9x-y9GaXIKEqU5UrspR9-f2OiqcTCzhOkTV0Y_1T_bX20qKwOJtjoIY1JFbIjWyP9NPCTUqOBHuCSI-KwtqKc_jryxqcr2OmLT5-izARk2uK0nQ5L_cSO1tCtjJXDrs7T-5XOw',
      boosts: 1,
      comments: 0,
      skyTagged: true
    };

    setSightings([newPost, ...sightings]);
    setActiveScreen('daily-sightings-feed');
  };

  const handleShareToFeed = (title: string) => {
    handleAddPost({
      title,
      rig: 'CosmoPulse 3D Planet Cartographic Telemetry Camera',
      coords: 'RA 05h 35m / DEC -05° 23′',
      bortle: 'Class 1: Space Observatory Vacuum',
      description: 'Synchronized telemetry snapshot and spectral absorption bands exported to community archives.'
    });
  };

  return (
    <div className="min-h-screen bg-[#10131c] text-[#e0e2ef] flex flex-col font-sans selection:bg-[#62f9ee] selection:text-[#00716b]">
      {/* Relativistic Warp Intro Overlay */}
      <WarpIntroOverlay
        isOpen={isWarpOpen}
        onComplete={() => setIsWarpOpen(false)}
        destinationName="SOLAR SYSTEM // TERRA-1"
      />

      {/* Top Persistent Telemetry & Glass Navbar */}
      <Navbar
        activeScreen={activeScreen}
        onSelectScreen={(screenId) => setActiveScreen(screenId)}
        onReplayWarp={() => setIsWarpOpen(true)}
        onLaunchObservation={() => setIsLogModalOpen(true)}
        currentTimeStr={currentTimeStr}
      />

      {/* Screen Views (Main Content) */}
      <main className="w-full pt-28 min-h-screen flex flex-col">
        {activeScreen === '3d-planet-inspector' && (
          <PlanetInspectorView
            onShareToFeed={handleShareToFeed}
            currentTimeStr={currentTimeStr}
          />
        )}

        {activeScreen === 'daily-sightings-feed' && (
          <SightingsFeedView
            sightings={sightings}
            onOpenLogModal={() => setIsLogModalOpen(true)}
            onNavigateToScreen={(screenId) => setActiveScreen(screenId)}
          />
        )}

        {activeScreen === 'iss-live-tracker' && (
          <ISSLiveTrackerView
            onNavigateToScreen={(screenId) => setActiveScreen(screenId)}
            currentTimeStr={currentTimeStr}
          />
        )}

        {activeScreen === 'cupola-cam' && (
          <CupolaSimulatorView
            onNavigateToScreen={(screenId) => setActiveScreen(screenId)}
            currentTimeStr={currentTimeStr}
          />
        )}

        {activeScreen === 'cosmic-codex' && <CosmicCodexView />}

        {activeScreen === 'orbital-community' && <OrbitalCommunityView />}
      </main>

      {/* Persistent Audio and Target Position Bottom Dock + Footer */}
      <PersistentHUDDock />

      {/* Log Observation Modal */}
      <LogObservationModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onAddPost={handleAddPost}
      />
    </div>
  );
}
