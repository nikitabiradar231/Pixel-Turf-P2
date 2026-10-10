import React, { useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CANVAS_CONTRACT_ADDRESS, PIXEL_TURF_ABI } from "../config/contract";
import type { SelectedPixel } from "../types/canvas";
import { hexToUint24 } from "../utils/colors";
import confetti from "canvas-confetti";
import { Paintbrush, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface PlacementControlsProps {
  selectedPixel: SelectedPixel | null;
  selectedColor: string;
  canPaint: boolean;
  remainingSeconds: number;
  onSuccessPlacement: () => void;
}

export const PlacementControls: React.FC<PlacementControlsProps> = ({
  selectedPixel,
  selectedColor,
  canPaint,
  remainingSeconds,
  onSuccessPlacement
}) => {
  const { isConnected } = useAccount();

  const {
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    writeContract,
    reset: resetWrite
  } = useWriteContract();

  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    error: txError
  } = useWaitForTransactionReceipt({
    hash: txHash
  });

  // Confetti and cooldown refetch upon confirmed transaction
  useEffect(() => {
    if (isTxSuccess) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 }
      });
      onSuccessPlacement();
    }
  }, [isTxSuccess, onSuccessPlacement]);

  const handlePlacePixel = () => {
    if (!selectedPixel || !canPaint || !CANVAS_CONTRACT_ADDRESS) return;

    const uintColor = hexToUint24(selectedColor);
    resetWrite();

    writeContract({
      address: CANVAS_CONTRACT_ADDRESS,
      abi: PIXEL_TURF_ABI,
      functionName: "placePixel",
      args: [BigInt(selectedPixel.x), BigInt(selectedPixel.y), uintColor]
    });
  };

  const isSubmitting = isWritePending || isTxConfirming;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col gap-3.5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-slate-200">Paint Tile</span>
        </div>
        {selectedPixel ? (
          <div className="text-xs font-mono bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 px-2.5 py-1 rounded-lg">
            X: {selectedPixel.x} | Y: {selectedPixel.y}
          </div>
        ) : (
          <span className="text-xs text-slate-500 font-mono">No tile selected</span>
        )}
      </div>

      {/* Tile Color Comparison */}
      {selectedPixel && (
        <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Current Color</div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border border-slate-700 shadow-sm"
                style={{ backgroundColor: selectedPixel.hexColor }}
              />
              <span className="font-mono text-slate-300">{selectedPixel.hexColor}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-cyan-400 mb-1">New Color</div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded border border-cyan-500 shadow-sm"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-mono text-cyan-300">{selectedColor}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        disabled={!selectedPixel || !canPaint || isSubmitting}
        onClick={handlePlacePixel}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
          !isConnected
            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            : !selectedPixel
            ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
            : !canPaint
            ? "bg-amber-950/40 text-amber-500 border border-amber-800/50 cursor-not-allowed"
            : isSubmitting
            ? "bg-blue-600/60 text-blue-200 cursor-wait"
            : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-[0.98]"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
            <span>{isWritePending ? "Confirm in Wallet..." : "Broadcasting to Sepolia..."}</span>
          </>
        ) : !isConnected ? (
          <span>Connect Wallet to Paint</span>
        ) : !selectedPixel ? (
          <span>Click Canvas to Select Tile</span>
        ) : remainingSeconds > 0 ? (
          <span>Cooldown Active ({remainingSeconds}s)</span>
        ) : (
          <>
            <Paintbrush className="w-4 h-4" />
            <span>Paint Pixel</span>
          </>
        )}
      </button>

      {/* Confirmation & Status Alerts */}
      {isTxSuccess && txHash && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold">Pixel painted on Ethereum Sepolia!</span>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:underline font-mono"
          >
            <span>View Tx</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {(writeError || txError) && (
        <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 p-2.5 rounded-xl text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="break-all font-mono text-[11px]">
            {writeError?.message?.slice(0, 100) || txError?.message?.slice(0, 100) || "Transaction failed"}
          </span>
        </div>
      )}
    </div>
  );
};
