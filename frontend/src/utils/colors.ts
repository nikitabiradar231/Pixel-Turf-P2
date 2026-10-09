/**
 * Converts a 24-bit integer color (e.g. 0xFF5733) to a hex string ("#FF5733").
 */
export function uint24ToHex(color: number): string {
  const hex = (color & 0xffffff).toString(16).padStart(6, "0").toUpperCase();
  return `#${hex}`;
}

/**
 * Converts a hex string (e.g. "#FF5733" or "FF5733") to a 24-bit integer (e.g. 0xFF5733).
 */
export function hexToUint24(hex: string): number {
  const cleanHex = hex.replace("#", "").trim();
  const parsed = parseInt(cleanHex, 16);
  return isNaN(parsed) ? 0 : parsed & 0xffffff;
}

/**
 * Curated retro and vibrant palette for Pixel Turf
 */
export const PRESET_PALETTE = [
  "#000000", // Black
  "#1D2B53", // Dark Blue
  "#7E2553", // Dark Purple
  "#008751", // Dark Green
  "#AB5236", // Brown
  "#5F574F", // Dark Gray
  "#C2C3C7", // Light Gray
  "#FFF1E8", // White
  "#FF004D", // Red
  "#FFA300", // Orange
  "#FFEC27", // Yellow
  "#00E436", // Green
  "#29ADFF", // Cyan
  "#83769C", // Indigo
  "#FF77A8", // Pink
  "#FFCCAA", // Peach
  "#6B5B95", // Amethyst
  "#FEB236", // Marigold
  "#D64161", // Coral
  "#8B0000", // Crimson
  "#00FFFF", // Bright Aqua
  "#39FF14", // Neon Lime
  "#FF1493", // Deep Pink
  "#7928CA"  // Deep Violet
];
