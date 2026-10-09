import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { CanvasGrid } from "./components/CanvasGrid";
import { ColorPalette } from "./components/ColorPalette";
import { PlacementControls } from "./components/PlacementControls";
import { RecentPlacements } from "./components/RecentPlacements";
import { ArchitectureInfo } from "./components/ArchitectureInfo";
import { useCanvasEvents } from "./hooks/useCanvasEvents";
import { usePlayerCooldown } from "./hooks/usePlayerCooldown";
import type { SelectedPixel } from "./types/canvas";
import { PRESET_PALETTE } from "./utils/colors";

export function App() {
  const [selectedPixel, setSelectedPixel] = useState<SelectedPixel | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_PALETTE[8]); // default vibrant red

  const {
    canvasData,
    recentPlacements,
    isReconstructing,
    totalEventsCount
  } = useCanvasEvents();

  const {
    remainingSeconds,
    cooldownDuration,
    canPaint,
    refetchCooldown
  } = usePlayerCooldown();

  const handleSuccessPlacement = () => {
    refetchCooldown();
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        remainingSeconds={remainingSeconds}
        cooldownDuration={cooldownDuration}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Canvas & Sidebar Grid */}
        <div className="main-grid">
          {/* Left: Interactive HTML Canvas */}
          <section className="flex flex-col gap-3 min-w-0">
            <div className="w-full h-[580px]">
              <CanvasGrid
                canvasData={canvasData}
                selectedPixel={selectedPixel}
                onSelectPixel={setSelectedPixel}
                isReconstructing={isReconstructing}
              />
            </div>
          </section>

          {/* Right: Controls & Activity Side Panel */}
          <aside className="flex flex-col gap-4">
            {/* Placement Dispatcher */}
            <PlacementControls
              selectedPixel={selectedPixel}
              selectedColor={selectedColor}
              canPaint={canPaint}
              remainingSeconds={remainingSeconds}
              onSuccessPlacement={handleSuccessPlacement}
            />

            {/* Color Palette */}
            <ColorPalette
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />

            {/* Live Blockchain Activity Feed */}
            <RecentPlacements
              events={recentPlacements}
              totalEventsCount={totalEventsCount}
            />
          </aside>
        </div>

        {/* Challenge Architecture & Security Highlights */}
        <ArchitectureInfo />
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-slate-800/60 py-4 px-6 text-center text-xs font-mono text-slate-500">
        Pixel Turf · Road to Devcon VIII Challenge · Base Sepolia (Chain ID 84532)
      </footer>
    </div>
  );
}

export default App;
