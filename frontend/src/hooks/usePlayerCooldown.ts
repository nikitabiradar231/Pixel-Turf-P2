import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CANVAS_CONTRACT_ADDRESS, PIXEL_TURF_ABI } from "../config/contract";

export function usePlayerCooldown() {
  const { address, isConnected } = useAccount();
  const [currentTime, setCurrentTime] = useState<number>(Math.floor(Date.now() / 1000));

  // Read the next allowed placement timestamp directly from the deployed contract
  const { data: nextAllowedBigInt, refetch, isLoading } = useReadContract({
    address: CANVAS_CONTRACT_ADDRESS,
    abi: PIXEL_TURF_ABI,
    functionName: "getNextPlacementTime",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(isConnected && address && CANVAS_CONTRACT_ADDRESS && CANVAS_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"),
      refetchInterval: 5000
    }
  });

  // Read immutable contract cooldown duration
  const { data: cooldownDurationBigInt } = useReadContract({
    address: CANVAS_CONTRACT_ADDRESS,
    abi: PIXEL_TURF_ABI,
    functionName: "COOLDOWN",
    query: {
      enabled: Boolean(CANVAS_CONTRACT_ADDRESS && CANVAS_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000")
    }
  });

  // Keep local clock ticking every second for smooth UI countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nextAllowedTime = nextAllowedBigInt ? Number(nextAllowedBigInt) : 0;
  const cooldownDuration = cooldownDurationBigInt ? Number(cooldownDurationBigInt) : 60;
  const remainingSeconds = Math.max(0, nextAllowedTime - currentTime);
  const canPaint = isConnected && remainingSeconds === 0;

  return {
    nextAllowedTime,
    cooldownDuration,
    remainingSeconds,
    canPaint,
    isLoadingCooldown: isLoading,
    refetchCooldown: refetch
  };
}
