export interface PixelPlacementEvent {
  player: `0x${string}`;
  index: bigint;
  x: bigint;
  y: bigint;
  color: number;
  timestamp: bigint;
  transactionHash: string;
  blockNumber: bigint;
}

export interface SelectedPixel {
  x: number;
  y: number;
  index: number;
  color: number; // uint24 hex number e.g. 0xFF5733
  hexColor: string; // "#FF5733"
}

export interface CanvasDimensions {
  width: number;
  height: number;
  totalPixels: number;
}
