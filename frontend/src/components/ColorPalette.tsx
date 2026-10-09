import React, { useState } from "react";
import { PRESET_PALETTE } from "../utils/colors";
import { Palette, Pipette } from "lucide-react";

interface ColorPaletteProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onSelectColor
}) => {
  const [customHex, setCustomHex] = useState<string>(selectedColor);

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    if (!val.startsWith("#")) {
      val = `#${val}`;
    }
    setCustomHex(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onSelectColor(val);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Color Palette</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{selectedColor}</span>
          <div
            className="w-5 h-5 rounded-md border border-slate-600 shadow-sm"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </div>

      {/* Preset Swatches */}
      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 mb-3.5">
        {PRESET_PALETTE.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => {
                onSelectColor(color);
                setCustomHex(color);
              }}
              title={color}
              className={`w-7 h-7 rounded-md transition-all duration-150 transform hover:scale-110 active:scale-95 ${
                isSelected
                  ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105 shadow-md shadow-cyan-500/20"
                  : "border border-slate-700/60 hover:border-slate-400"
              }`}
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <div className="relative flex items-center">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => {
              onSelectColor(e.target.value.toUpperCase());
              setCustomHex(e.target.value.toUpperCase());
            }}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
          />
          <Pipette className="w-3.5 h-3.5 text-slate-400 absolute pointer-events-none left-2" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={customHex}
            onChange={handleCustomHexChange}
            placeholder="#FFFFFF"
            maxLength={7}
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};
