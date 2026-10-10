# Pixel Turf P2 — Submission Evidence & Verification Checklist

**Project:** Pixel Turf (Road to Devcon VIII Challenge Part 2)
**Target Network:** Ethereum Sepolia (`Chain ID: 11155111`)
**Deployed Contract:** [`0x3d0b2722cf83266B8346D82c6b83B159a192717d`](https://sepolia.etherscan.io/address/0x3d0b2722cf83266b8346d82c6b83b159a192717d)
**Deployment Block:** `11882404`
**GitHub Repository:** [https://github.com/nikitabiradar231/Pixel-Turf-P2](https://github.com/nikitabiradar231/Pixel-Turf-P2)

---

## 📋 Challenge Evidence Checklist

| # | Evidence Requirement | Verification Method | Status | Details / Artifact |
|---|:---|:---|:---:|:---|
| **1** | **Active Canvas Interface** | Browser Dev Server | **VERIFIED** | Running at `http://localhost:5173/`, HTML5 Canvas renders 64x64 tiles with zoom & pan. |
| **2** | **Ethereum Sepolia Target** | RPC & Contract Check | **VERIFIED** | Configured for Chain ID `11155111` via `https://ethereum-sepolia-rpc.publicnode.com`. |
| **3** | **Deployed Contract Address** | On-Chain Query | **VERIFIED** | Contract `PixelTurf` verified active on Sepolia at `0x3d0b2722cf83266B8346D82c6b83B159a192717d`. |
| **4** | **No Admin / Immutable State** | Bytecode & ABI Audit | **VERIFIED** | Zero `onlyOwner`, `pause`, `clearCanvas`, or reset functions. Single write path via `placePixel`. |
| **5** | **Bounds & Packing Logic** | Foundry Unit Tests | **VERIFIED** | Strict revert on `x >= 64 \|\| y >= 64`, coordinates mapped to `y * 64 + x`. |
| **6** | **24-bit RGB Color Encoding** | Vitest & Sol Tests | **VERIFIED** | Hex to `uint24` conversion verified (`#000000` -> `0x000000`, `#FFFFFF` -> `0xFFFFFF`). |
| **7** | **60-Second Cooldown** | Smart Contract & Tests | **VERIFIED** | Enforced per `msg.sender` on-chain, exposed via `getNextPlacementTime` and live UI timer. |
| **8** | **Event Reconstruction** | Frontend Log Fetcher | **VERIFIED** | Chunked queries (10,000 blocks) from block `11882404` reconstruct full canvas state without tile loops. |
| **9** | **Real-Time Live Sync** | WebSocket & Polling | **VERIFIED** | `watchContractEvent` + 4-second cursor polling fallback updates local buffer dynamically. |
| **10** | **Wallet Connection** | Wagmi / Viem | **VERIFIED** | Supports MetaMask, Coinbase Wallet, Injected with automatic network mismatch detection. |
| **11** | **Foundry Test Suite** | `forge test -vvv` | **VERIFIED** | 11/11 tests passed in 21.86ms. |
| **12** | **Frontend Test & Build** | `vitest` & `vite build` | **VERIFIED** | 6/6 unit tests passed, production bundle compiled cleanly in 52.9s. |
| **13** | **Secret Safety** | `.gitignore` Review | **VERIFIED** | `.env` and `frontend/.env` confirmed untracked and ignored. |
| **14** | **Live In-Browser Placement** | User Browser Wallet | **PENDING** | Requires user confirmation popup in connected browser wallet (instructions below). |

---

## 🧪 Manual Verification Step for Live Placement

To complete the optional live in-browser placement proof:

1. Open `http://localhost:5173/` in your browser.
2. Click **Connect Wallet** and select your Ethereum Sepolia wallet.
3. Select any coordinate on the 64x64 grid (e.g. `X: 32, Y: 32`).
4. Pick a color (e.g. Neon Lime `#39FF14`).
5. Click **Paint Pixel** and approve the transaction in MetaMask.
6. Record the resulting transaction hash from the confirmation toast:
   - **Transaction Hash:** `0x...` *(Fill after manual placement)*
   - **Block Number:** `...`
   - **Etherscan Link:** `https://sepolia.etherscan.io/tx/<txHash>`
