import React from "react";
import { ShieldCheck, Zap, Layers, RefreshCw } from "lucide-react";
import { CANVAS_CONTRACT_ADDRESS } from "../config/contract";

export const ArchitectureInfo: React.FC = () => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl">
      <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-400" />
        <span>Architecture & Security Guarantees</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Immutable & Wipe-Proof</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Only the cooldown-limited player placement function can modify tile state. No owner keys, admin overrides, or reset functions exist.
          </p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-1.5">
            <Zap className="w-4 h-4" />
            <span>O(1) Constant Gas Placement</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Placements pack coordinates into single-slot storage mappings, ensuring minimal and predictable gas costs irrespective of canvas size.
          </p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 font-semibold text-pink-400 mb-1.5">
            <RefreshCw className="w-4 h-4" />
            <span>Event-Driven Reconstruction</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Initial canvas reconstruction utilizes chunked <code className="text-pink-300">PixelPlaced</code> event logs followed by live log listeners without individual tile queries.
          </p>
        </div>
      </div>

      {CANVAS_CONTRACT_ADDRESS && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span>Ethereum Sepolia Contract:</span>
          <a
            href={`https://sepolia.etherscan.io/address/${CANVAS_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline break-all"
          >
            {CANVAS_CONTRACT_ADDRESS}
          </a>
        </div>
      )}
    </div>
  );
};
