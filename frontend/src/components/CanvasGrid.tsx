import React, { useRef, useEffect, useState, useCallback } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../config/contract";
import type { SelectedPixel } from "../types/canvas";
import { uint24ToHex } from "../utils/colors";
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from "lucide-react";

interface CanvasGridProps {
  canvasData: Uint32Array;
  selectedPixel: SelectedPixel | null;
  onSelectPixel: (pixel: SelectedPixel) => void;
  isReconstructing: boolean;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  canvasData,
  selectedPixel,
  onSelectPixel,
  isReconstructing
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport transformation state (pan & zoom)
  const [zoom, setZoom] = useState<number>(10);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCoord, setHoveredCoord] = useState<{ x: number; y: number } | null>(null);

  // Auto-center canvas on initial mount or container resize
  const centerCanvas = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const initialZoom = Math.min(clientWidth / CANVAS_WIDTH, clientHeight / CANVAS_HEIGHT) * 0.85;
    const clampedZoom = Math.max(4, Math.min(18, initialZoom));
    const initialX = (clientWidth - CANVAS_WIDTH * clampedZoom) / 2;
    const initialY = (clientHeight - CANVAS_HEIGHT * clampedZoom) / 2;
    setZoom(clampedZoom);
    setPan({ x: initialX, y: initialY });
  }, []);

  useEffect(() => {
    centerCanvas();
  }, [centerCanvas]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 600;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Dark background fill
    ctx.fillStyle = "#0c0e14";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Disable image smoothing for crisp pixel aesthetics
    ctx.imageSmoothingEnabled = false;

    // Draw all 64x64 pixels
    for (let y = 0; y < CANVAS_HEIGHT; y++) {
      for (let x = 0; x < CANVAS_WIDTH; x++) {
        const idx = y * CANVAS_WIDTH + x;
        const color = canvasData[idx] || 0;
        ctx.fillStyle = uint24ToHex(color);
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw Grid Lines when zoomed in enough (zoom >= 6)
    if (zoom >= 6) {
      ctx.lineWidth = 1 / zoom;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      for (let x = 0; x <= CANVAS_WIDTH; x++) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y++) {
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
      }
      ctx.stroke();
    }

    // Outer Canvas Border
    ctx.lineWidth = 2 / zoom;
    ctx.strokeStyle = "#3b82f6";
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Hovered Pixel Highlight
    if (hoveredCoord && hoveredCoord.x >= 0 && hoveredCoord.x < CANVAS_WIDTH && hoveredCoord.y >= 0 && hoveredCoord.y < CANVAS_HEIGHT) {
      ctx.lineWidth = 1.5 / zoom;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(hoveredCoord.x, hoveredCoord.y, 1, 1);
      ctx.strokeRect(hoveredCoord.x, hoveredCoord.y, 1, 1);
    }

    // Draw Selected Pixel Marker
    if (selectedPixel && selectedPixel.x >= 0 && selectedPixel.x < CANVAS_WIDTH && selectedPixel.y >= 0 && selectedPixel.y < CANVAS_HEIGHT) {
      ctx.lineWidth = 2.5 / zoom;
      ctx.strokeStyle = "#00f0ff";
      ctx.strokeRect(selectedPixel.x, selectedPixel.y, 1, 1);

      // Pulsing corner accents for selected pixel
      const cornerSize = 0.25;
      ctx.fillStyle = "#ff007a";
      ctx.fillRect(selectedPixel.x - 0.05, selectedPixel.y - 0.05, cornerSize, cornerSize);
      ctx.fillRect(selectedPixel.x + 1 - cornerSize + 0.05, selectedPixel.y - 0.05, cornerSize, cornerSize);
      ctx.fillRect(selectedPixel.x - 0.05, selectedPixel.y + 1 - cornerSize + 0.05, cornerSize, cornerSize);
      ctx.fillRect(selectedPixel.x + 1 - cornerSize + 0.05, selectedPixel.y + 1 - cornerSize + 0.05, cornerSize, cornerSize);
    }

    ctx.restore();
  }, [canvasData, pan, zoom, hoveredCoord, selectedPixel]);

  // Coordinate Conversion Helper: Screen (clientX, clientY) -> Canvas Grid (x, y)
  const screenToCanvasCoords = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const canvasX = Math.floor((screenX - pan.x) / zoom);
    const canvasY = Math.floor((screenY - pan.y) / zoom);

    if (canvasX >= 0 && canvasX < CANVAS_WIDTH && canvasY >= 0 && canvasY < CANVAS_HEIGHT) {
      return { x: canvasX, y: canvasY };
    }
    return null;
  };

  // Mouse / Pointer Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    const coords = screenToCanvasCoords(e.clientX, e.clientY);
    setHoveredCoord(coords);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const movedDist = Math.hypot(e.clientX - dragStart.x - pan.x, e.clientY - dragStart.y - pan.y);
      setIsDragging(false);

      // If it was a click without significant drag (< 5px movement), select pixel
      if (movedDist < 5) {
        const coords = screenToCanvasCoords(e.clientX, e.clientY);
        if (coords) {
          const idx = coords.y * CANVAS_WIDTH + coords.x;
          const color = canvasData[idx] || 0;
          onSelectPixel({
            x: coords.x,
            y: coords.y,
            index: idx,
            color,
            hexColor: uint24ToHex(color)
          });
        }
      }
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredCoord(null);
  };

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newZoom = Math.min(45, Math.max(2, zoom * zoomFactor));

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[520px] bg-[#090b10] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />

      {/* Floating Canvas Controls Overlay */}
      <div className="absolute bottom-5 right-5 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg text-slate-300">
        <button
          onClick={() => setZoom((z) => Math.min(45, z * 1.25))}
          title="Zoom In"
          className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(2, z / 1.25))}
          title="Zoom Out"
          className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={centerCanvas}
          title="Reset View"
          className="p-2 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-slate-700 mx-1" />
        <span className="text-xs font-mono font-medium px-2 text-slate-400">
          {Math.round((zoom / 10) * 100)}%
        </span>
      </div>

      {/* Coordinate & Hover Indicator */}
      <div className="absolute top-5 left-5 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg text-xs font-mono">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Crosshair className="w-3.5 h-3.5" />
          <span>
            {hoveredCoord ? `(${hoveredCoord.x}, ${hoveredCoord.y})` : selectedPixel ? `(${selectedPixel.x}, ${selectedPixel.y})` : "Hover to target"}
          </span>
        </div>
        {hoveredCoord && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            <span
              className="w-3 h-3 rounded-sm border border-slate-600 inline-block shadow-inner"
              style={{
                backgroundColor: uint24ToHex(canvasData[hoveredCoord.y * CANVAS_WIDTH + hoveredCoord.x] || 0)
              }}
            />
            <span className="text-slate-400">
              {uint24ToHex(canvasData[hoveredCoord.y * CANVAS_WIDTH + hoveredCoord.x] || 0)}
            </span>
          </div>
        )}
      </div>

      {/* Reconstructing Status Overlay */}
      {isReconstructing && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-10">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-bold tracking-wide">Syncing Canvas From Ethereum Sepolia</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm text-center">
            Reconstructing pixel state from on-chain event logs...
          </p>
        </div>
      )}
    </div>
  );
};
