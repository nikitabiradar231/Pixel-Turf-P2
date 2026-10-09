import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { BASE_SEPOLIA_CHAIN_ID, CANVAS_CONTRACT_ADDRESS } from "../config/contract";
import { CooldownBadge } from "./CooldownBadge";
import { Wallet, LogOut, AlertTriangle, ExternalLink, Sparkles, ChevronDown } from "lucide-react";

interface NavbarProps {
  remainingSeconds: number;
  cooldownDuration: number;
}

export const Navbar: React.FC<NavbarProps> = ({ remainingSeconds, cooldownDuration }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showConnectModal, setShowConnectModal] = useState(false);

  const isWrongNetwork = isConnected && chainId !== BASE_SEPOLIA_CHAIN_ID;

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="w-full bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Network Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090b10] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                PIXEL<span className="text-cyan-400">TURF</span>
              </h1>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                Base Sepolia (84532)
              </span>
            </div>
          </div>
        </div>

        {/* Cooldown Status & Wallet Actions */}
        <div className="flex items-center gap-3">
          <CooldownBadge
            remainingSeconds={remainingSeconds}
            cooldownDuration={cooldownDuration}
            isConnected={isConnected}
          />

          {isWrongNetwork ? (
            <button
              onClick={() => switchChain({ chainId: baseSepolia.id })}
              className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Switch to Base Sepolia</span>
            </button>
          ) : isConnected && address ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-1 shadow-sm">
              <div className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {shortenAddress(address)}
              </div>
              <button
                onClick={() => disconnect()}
                title="Disconnect"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowConnectModal(!showConnectModal)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all duration-150 active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showConnectModal && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Select Wallet
                  </div>
                  {connectors.map((connector) => (
                    <button
                      key={connector.uid}
                      onClick={() => {
                        connect({ connector });
                        setShowConnectModal(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{connector.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {CANVAS_CONTRACT_ADDRESS && CANVAS_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000" && (
            <a
              href={`https://sepolia.basescan.org/address/${CANVAS_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              title="View on BaseScan"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors hidden md:flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
