export const CANVAS_WIDTH = 64;
export const CANVAS_HEIGHT = 64;
export const TOTAL_PIXELS = CANVAS_WIDTH * CANVAS_HEIGHT;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Fallback or environment-configured contract address on Base Sepolia
export const CANVAS_CONTRACT_ADDRESS = (
  (import.meta.env.VITE_CANVAS_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// Deployment block to start fetching logs from efficiently
export const CANVAS_DEPLOYMENT_BLOCK = BigInt(
  import.meta.env.VITE_CANVAS_DEPLOYMENT_BLOCK || "0"
);

export const PIXEL_TURF_ABI = [
  {
    type: "constructor",
    inputs: [{ name: "_cooldownDuration", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "WIDTH",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "HEIGHT",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "TOTAL_PIXELS",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "COOLDOWN",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "placePixel",
    inputs: [
      { name: "x", type: "uint256", internalType: "uint256" },
      { name: "y", type: "uint256", internalType: "uint256" },
      { name: "color", type: "uint24", internalType: "uint24" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getPixel",
    inputs: [
      { name: "x", type: "uint256", internalType: "uint256" },
      { name: "y", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "", type: "uint24", internalType: "uint24" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getNextPlacementTime",
    inputs: [{ name: "player", type: "address", internalType: "address" }],
    outputs: [{ name: "nextAllowedAt", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getRemainingCooldown",
    inputs: [{ name: "player", type: "address", internalType: "address" }],
    outputs: [{ name: "remainingSeconds", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getCanvasDimensions",
    inputs: [],
    outputs: [
      { name: "width", type: "uint256", internalType: "uint256" },
      { name: "height", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "pure"
  },
  {
    type: "function",
    name: "getPixelRange",
    inputs: [
      { name: "startIndex", type: "uint256", internalType: "uint256" },
      { name: "count", type: "uint256", internalType: "uint256" }
    ],
    outputs: [{ name: "batchColors", type: "uint24[]", internalType: "uint24[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "lastPlacement",
    inputs: [{ name: "", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "pixels",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint24", internalType: "uint24" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "PixelPlaced",
    inputs: [
      { name: "player", type: "address", indexed: true, internalType: "address" },
      { name: "index", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "x", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "y", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "color", type: "uint24", indexed: false, internalType: "uint24" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "error",
    name: "OutOfBounds",
    inputs: [
      { name: "x", type: "uint256", internalType: "uint256" },
      { name: "y", type: "uint256", internalType: "uint256" }
    ]
  },
  {
    type: "error",
    name: "CooldownActive",
    inputs: [
      { name: "player", type: "address", internalType: "address" },
      { name: "lastPlacedAt", type: "uint256", internalType: "uint256" },
      { name: "nextAllowedAt", type: "uint256", internalType: "uint256" }
    ]
  }
] as const;
