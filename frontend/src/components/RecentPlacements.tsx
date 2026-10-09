import React from "react";
import type { PixelPlacementEvent } from "../types/canvas";
import { uint24ToHex } from "../utils/colors";
import { Activity, ExternalLink, User } from "lucide-react";

interface RecentPlacementsProps {
  events: PixelPlacementEvent[];
  totalEventsCount: number;
}

export const RecentPlacements: React.FC<RecentPlacementsProps> = ({
  events,
  totalEventsCount
}) => {
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col h-full max-h-[380px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-slate-200">Live Blockchain Activity</span>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
          {totalEventsCount} placed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No on-chain pixel placements recorded yet. Be the first to paint!
          </div>
        ) : (
          events.map((ev, index) => {
            const hexColor = uint24ToHex(ev.color);
            return (
              <div
                key={`${ev.transactionHash}-${ev.index.toString()}-${index}`}
                className="bg-slate-950/60 hover:bg-slate-800/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-4 h-4 rounded-md border border-slate-600 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: hexColor }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-mono text-slate-300 truncate">
                      <User className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <a
                        href={`https://sepolia.basescan.org/address/${ev.player}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-cyan-400 hover:underline truncate"
                      >
                        {shortenAddress(ev.player)}
                      </a>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ({ev.x.toString()}, {ev.y.toString()}) · {hexColor}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`https://sepolia.basescan.org/tx/${ev.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    title="View Transaction"
                    className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
