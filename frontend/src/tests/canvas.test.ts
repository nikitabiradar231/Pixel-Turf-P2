import { describe, it, expect } from "vitest";
import { uint24ToHex, hexToUint24, PRESET_PALETTE } from "../utils/colors";
import { CANVAS_WIDTH, CANVAS_HEIGHT, TOTAL_PIXELS, SEPOLIA_CHAIN_ID } from "../config/contract";

describe("Pixel Turf Logic & Config Verification", () => {
  it("should have correct Ethereum Sepolia chain configuration", () => {
    expect(SEPOLIA_CHAIN_ID).toBe(11155111);
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

  it("should test boundary coordinates (0,0) and (63,63) and out-of-bounds index detection", () => {
    // Top-left boundary
    const index0 = 0 * CANVAS_WIDTH + 0;
    expect(index0).toBe(0);
    expect(index0 % CANVAS_WIDTH).toBe(0);
    expect(Math.floor(index0 / CANVAS_WIDTH)).toBe(0);

    // Bottom-right boundary
    const indexMax = 63 * CANVAS_WIDTH + 63;
    expect(indexMax).toBe(4095);
    expect(indexMax % CANVAS_WIDTH).toBe(63);
    expect(Math.floor(indexMax / CANVAS_WIDTH)).toBe(63);
    expect(indexMax).toBe(TOTAL_PIXELS - 1);

    // Out-of-bounds checks
    const isOutOfBounds = (x: number, y: number) => x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT || x < 0 || y < 0;
    expect(isOutOfBounds(0, 0)).toBe(false);
    expect(isOutOfBounds(63, 63)).toBe(false);
    expect(isOutOfBounds(64, 0)).toBe(true);
    expect(isOutOfBounds(0, 64)).toBe(true);
    expect(isOutOfBounds(100, 200)).toBe(true);
  });

  it("should handle boundary RGB values (0x000000, 0xFFFFFF) and invalid inputs gracefully", () => {
    expect(uint24ToHex(0x000000)).toBe("#000000");
    expect(uint24ToHex(0xFFFFFF)).toBe("#FFFFFF");
    expect(hexToUint24("#000000")).toBe(0x000000);
    expect(hexToUint24("#FFFFFF")).toBe(0xFFFFFF);

    // Invalid or malformed hex inputs fallback to 0
    expect(hexToUint24("invalid")).toBe(0);
    expect(hexToUint24("")).toBe(0);
  });
});
