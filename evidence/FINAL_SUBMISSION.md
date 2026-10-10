# Pixel Turf: A Shared On-Chain Pixel Canvas 🎨

> **A collaborative 64×64 pixel canvas on Ethereum Sepolia governed by immutable smart contract rules, per-address cooldown rate limiting, and player-driven tile updates.**

---

## 🌟 One-Sentence Pitch
Pixel Turf is a shared 64×64 on-chain pixel canvas on Ethereum Sepolia where pixel placements are recorded directly on-chain using constant-time mapping operations, governed by an immutable contract with an on-chain 60-second cooldown per address and no administrative override functions.

---

## 💡 Problem & Solution

### The Problem
Collaborative Web3 canvases often encounter administrative centralization and uncontrolled mass updates:
1. **Administrative Overrides & Wipes:** Centralized admin keys, pause mechanisms, or reset functions allow contract owners to arbitrarily wipe canvas state.
2. **Unregulated Placement Bursts:** Without on-chain rate limiting, single accounts can flood the network with rapid sequential transactions to monopolize the board.
3. **Inefficient State Sync:** Iterating over thousands of individual tile storage queries causes excessive RPC overhead and slow initial load times.

### The Solution
Pixel Turf enforces decentralized canvas mechanics through immutable contract rules while keeping canvas tiles dynamic:
1. **No Admin Wipes or Backdoors:** The contract has no owner, no admin role, no pause mechanism, and no canvas-clearing function. Individual pixel values remain editable by any participant following contract rules.
2. **Per-Address Rate Limiting:** Every address is subject to a strict on-chain 60-second cooldown between placements (`lastPlacement[msg.sender]`), limiting placement frequency per account.
3. **Constant-Time Mapping Operations:** Placements update state via constant-time key-value mapping lookups (`pixels[index]` and `lastPlacement[msg.sender]`), maintaining predictable $\mathcal{O}(1)$ storage-access complexity.
4. **Log-Driven State Reconstruction:** Canvas state on initial load is reconstructed via chunked `PixelPlaced` event logs starting from deployment block `11882404`, avoiding point-query iteration loops.
5. **Real-Time Dynamic Sync:** Open client sessions subscribe to live `PixelPlaced` event logs via Wagmi/Viem watchers with an automated 4-second polling fallback.

---

## 🏛️ Technology Stack & Architecture

- **Smart Contracts:** Solidity `^0.8.20`, Foundry (Forge, Cast)
- **Frontend Framework:** React `18.3.1`, TypeScript `5.6.3`, Vite `5.4.10`
- **Web3 Integration:** Wagmi `2.12.25`, Viem `2.21.35`, TanStack Query `5.59.0`
- **Canvas Rendering:** HTML5 Canvas API with zoom, pan, coordinate inspection, and hex color picker
- **Hosting & Infrastructure:** Vercel Edge Network (HTTPS)
- **Network:** Ethereum Sepolia (`Chain ID: 11155111`)

---

## 🔗 Project & Verification Links

| Resource | Link / Identifier | Status |
| :--- | :--- | :---: |
| **GitHub Repository** | [https://github.com/nikitabiradar231/Pixel-Turf-P2](https://github.com/nikitabiradar231/Pixel-Turf-P2) | **VERIFIED** |
| **Published Commit** | [`2ea57ab391122d3a4bbcd0412fb3b40faafe59f9`](https://github.com/nikitabiradar231/Pixel-Turf-P2/commit/2ea57ab391122d3a4bbcd0412fb3b40faafe59f9) | **VERIFIED** |
| **GitHub Actions CI** | [Workflow Run #38060729568](https://github.com/nikitabiradar231/Pixel-Turf-P2/actions/runs/38060729568) | **PASS** |
| **Sepolia Contract** | [`0x3d0b2722cf83266B8346D82c6b83B159a192717d`](https://sepolia.etherscan.io/address/0x3d0b2722cf83266B8346D82c6b83B159a192717d) | **VERIFIED ON-CHAIN** |
| **Deployment Block** | `11882404` | **VERIFIED** |
| **Contract Deployment Tx** | [`0xfa4df104616ad8bbefb0cfebfe42a3a52c3feea692e92c6e61f26a19f44530fa`](https://sepolia.etherscan.io/tx/0xfa4df104616ad8bbefb0cfebfe42a3a52c3feea692e92c6e61f26a19f44530fa) | **VERIFIED ON-CHAIN** |
| **Public Live Demo URL** | [`https://pixel-turf-p2.vercel.app`](https://pixel-turf-p2.vercel.app) | **VERIFIED ONLINE** |
| **Live Pixel Placement Tx**| *(Pending manual in-browser placement)* | **PENDING** |

---

## 🧪 Verification & Test Suites

### 1. Smart Contract Test Suite (Foundry)
```bash
forge test -vvv
```
*Result: 11/11 tests pass covering coordinate bounds (`0 <= x,y < 64`), independent multi-player cooldowns, mapping updates, and canonical event emissions.*

### 2. Frontend Unit Tests (Vitest)
```bash
cd frontend
npm install
npm test
```
*Result: 6/6 tests pass covering 24-bit RGB/Hex conversion (`uint24`), boundary coordinates `(0,0)` and `(63,63)`, and packed index mapping.*

### 3. Local Development Server
```bash
cd frontend
npm run dev
```
*Local development server runs at `http://localhost:5173/`.*

### 4. Production Build Bundle
```bash
cd frontend
npm run build
```
*TypeScript check (`tsc`) and Vite production bundle compile cleanly with zero errors.*

---

## 🛡️ Security & Architecture Guarantees

- **Contract Rule Immutability:** The only entry point modifying canvas state is `placePixel(uint256 x, uint256 y, uint24 color)`. Individual pixel values can be overwritten by any caller complying with cooldown and bounds.
- **Strict Bounds Checking:** Reverts with custom error `OutOfBounds(x, y)` if `x >= 64` or `y >= 64`.
- **Cooldown Verification:** Reverts with `CooldownActive(player, lastPlacedAt, nextAllowedAt)` if `block.timestamp < lastPlacement[msg.sender] + 60`.
- **No Secret Leakage:** `.env` and `frontend/.env` are strictly excluded and ignored by `.gitignore`.

---

## ⚠️ Outstanding Items

1. **Live In-Browser User Transaction:** Contract methods, deployment, and live UI are verified; the live in-browser placement transaction hash remains pending manual wallet confirmation on Ethereum Sepolia.
