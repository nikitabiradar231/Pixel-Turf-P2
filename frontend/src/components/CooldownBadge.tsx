import React from "react";
import { Timer, CheckCircle2, ShieldAlert } from "lucide-react";

interface CooldownBadgeProps {
  remainingSeconds: number;
  cooldownDuration: number;
  isConnected: boolean;
}

export const CooldownBadge: React.FC<CooldownBadgeProps> = ({
  remainingSeconds,
  cooldownDuration,
  isConnected
}) => {
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700 text-slate-400 text-xs font-medium">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
        <span>Connect Wallet to Paint</span>
      </div>
    );
  }

  if (remainingSeconds === 0) {
    return (
      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm shadow-emerald-500/20 animate-pulse">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Ready to Paint</span>
      </div>
    );
  }

  const percentLeft = Math.min(100, Math.max(0, (remainingSeconds / (cooldownDuration || 60)) * 100));

  return (
    <div className="relative flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium overflow-hidden shadow-sm shadow-amber-500/10">
      {/* Background progress fill */}
      <div
        className="absolute inset-0 bg-amber-500/15 transition-all duration-1000 ease-linear pointer-events-none"
        style={{ width: `${percentLeft}%` }}
      />
      <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
      <span className="relative z-10 font-bold">
        Cooldown: {remainingSeconds}s
      </span>
    </div>
  );
};
