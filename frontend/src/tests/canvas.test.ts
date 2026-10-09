import { describe, it, expect } from "vitest";
import { uint24ToHex, hexToUint24, PRESET_PALETTE } from "../utils/colors";
import { CANVAS_WIDTH, CANVAS_HEIGHT, TOTAL_PIXELS, BASE_SEPOLIA_CHAIN_ID } from "../config/contract";

describe("Pixel Turf Logic & Config Verification", () => {
  it("should have correct Base Sepolia chain configuration", () => {
    expect(BASE_SEPOLIA_CHAIN_ID).toBe(84532);
    expect(CANVAS_WIDTH).toBe(64);
    expect(CANVAS_HEIGHT).toBe(64);
    expect(TOTAL_PIXELS).toBe(4096);
  });

  it("should correctly convert uint24 RGB colors to hex strings", () => {
    expect(uint24ToHex(0x000000)).toBe("#000000");
    expect(uint24ToHex(0xFFFFFF)).toBe("#FFFFFF");
    expect(uint24ToHex(0xFF5733)).toBe("#FF5733");
    expect(uint24ToHex(0x06B6D4)).toBe("#06B6D4");
  });

  it("should correctly convert hex strings to uint24 numbers", () => {
    expect(hexToUint24("#000000")).toBe(0x000000);
    expect(hexToUint24("#FFFFFF")).toBe(0xFFFFFF);
    expect(hexToUint24("#FF5733")).toBe(0xFF5733);
    expect(hexToUint24("06B6D4")).toBe(0x06B6D4);
  });

  it("should handle packed index coordinate mapping accurately", () => {
    const x = 15;
    const y = 25;
    const index = y * CANVAS_WIDTH + x;

    expect(index).toBe(25 * 64 + 15);
    expect(index % CANVAS_WIDTH).toBe(x);
    expect(Math.floor(index / CANVAS_WIDTH)).toBe(y);
    expect(index).toBeLessThan(TOTAL_PIXELS);
  });

  it("should have valid hex colors in the preset palette", () => {
    expect(PRESET_PALETTE.length).toBeGreaterThan(15);
    for (const color of PRESET_PALETTE) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
