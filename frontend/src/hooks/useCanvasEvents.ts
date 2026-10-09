import { useState, useEffect, useRef, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import {
  CANVAS_CONTRACT_ADDRESS,
  CANVAS_DEPLOYMENT_BLOCK,
  TOTAL_PIXELS,
  CANVAS_WIDTH
} from "../config/contract";
import type { PixelPlacementEvent } from "../types/canvas";

const PIXEL_PLACED_EVENT_ABI = parseAbiItem(
  "event PixelPlaced(address indexed player, uint256 indexed index, uint256 x, uint256 y, uint24 color, uint256 timestamp)"
);

// Block chunk size for RPC log queries
const CHUNK_SIZE = 10000n;

export function useCanvasEvents() {
  const publicClient = usePublicClient();
  const [canvasData, setCanvasData] = useState<Uint32Array>(() => new Uint32Array(TOTAL_PIXELS));
  const [recentPlacements, setRecentPlacements] = useState<PixelPlacementEvent[]>([]);
  const [isReconstructing, setIsReconstructing] = useState<boolean>(true);
  const [reconstructionProgress, setReconstructionProgress] = useState<number>(0);
  const [lastBlockProcessed, setLastBlockProcessed] = useState<bigint>(CANVAS_DEPLOYMENT_BLOCK);
  const [totalEventsCount, setTotalEventsCount] = useState<number>(0);

  // Reference to hold canvas state for fast O(1) mutations
  const canvasBufferRef = useRef<Uint32Array>(new Uint32Array(TOTAL_PIXELS));
  const seenLogsRef = useRef<Set<string>>(new Set());

  // Function to apply an event to local buffer
  const applyPlacement = useCallback(
    (event: PixelPlacementEvent, updateState = true) => {
      const idx = Number(event.index);
      if (idx >= 0 && idx < TOTAL_PIXELS) {
        canvasBufferRef.current[idx] = event.color;
        if (updateState) {
          setCanvasData(new Uint32Array(canvasBufferRef.current));
          setRecentPlacements((prev) => [event, ...prev.slice(0, 49)]);
          setTotalEventsCount((prev) => prev + 1);
        }
      }
    },
    []
  );

  // Initial Reconstruction using Chunked Event Logs
  useEffect(() => {
    let isCancelled = false;

    async function loadAllHistoricalEvents() {
      if (!publicClient || !CANVAS_CONTRACT_ADDRESS || CANVAS_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
        setIsReconstructing(false);
        setReconstructionProgress(100);
        return;
      }

      setIsReconstructing(true);
      setReconstructionProgress(5);

      try {
        const currentBlock = await publicClient.getBlockNumber();
        const startBlock = CANVAS_DEPLOYMENT_BLOCK > currentBlock ? 0n : CANVAS_DEPLOYMENT_BLOCK;
        const totalBlocks = currentBlock >= startBlock ? currentBlock - startBlock : 1n;

        let fromBlock = startBlock;
        let processedEventsList: PixelPlacementEvent[] = [];

        while (fromBlock <= currentBlock && !isCancelled) {
          const toBlock = fromBlock + CHUNK_SIZE > currentBlock ? currentBlock : fromBlock + CHUNK_SIZE;

          try {
            const logs = await publicClient.getLogs({
              address: CANVAS_CONTRACT_ADDRESS,
              event: PIXEL_PLACED_EVENT_ABI,
              fromBlock,
              toBlock
            });

            for (const log of logs) {
              const logKey = `${log.transactionHash}-${log.logIndex}`;
              if (!seenLogsRef.current.has(logKey)) {
                seenLogsRef.current.add(logKey);
                const args = log.args;
                if (args && args.player && args.index !== undefined) {
                  const eventItem: PixelPlacementEvent = {
                    player: args.player,
                    index: args.index,
                    x: args.x ?? BigInt(Number(args.index) % CANVAS_WIDTH),
                    y: args.y ?? BigInt(Math.floor(Number(args.index) / CANVAS_WIDTH)),
                    color: Number(args.color ?? 0),
                    timestamp: args.timestamp ?? 0n,
                    transactionHash: log.transactionHash,
                    blockNumber: log.blockNumber ?? toBlock
                  };
                  applyPlacement(eventItem, false);
                  processedEventsList.push(eventItem);
                }
              }
            }
          } catch (err) {
            console.warn(`Chunk query failed from ${fromBlock} to ${toBlock}, retrying smaller chunk...`, err);
            // Fallback for strict RPC limits: retry with 1000 block chunk
            const subToBlock = fromBlock + 1000n > currentBlock ? currentBlock : fromBlock + 1000n;
            try {
              const subLogs = await publicClient.getLogs({
                address: CANVAS_CONTRACT_ADDRESS,
                event: PIXEL_PLACED_EVENT_ABI,
                fromBlock,
                toBlock: subToBlock
              });
              for (const log of subLogs) {
                const logKey = `${log.transactionHash}-${log.logIndex}`;
                if (!seenLogsRef.current.has(logKey)) {
                  seenLogsRef.current.add(logKey);
                  const args = log.args;
                  if (args && args.player && args.index !== undefined) {
                    const eventItem: PixelPlacementEvent = {
                      player: args.player,
                      index: args.index,
                      x: args.x ?? BigInt(Number(args.index) % CANVAS_WIDTH),
                      y: args.y ?? BigInt(Math.floor(Number(args.index) / CANVAS_WIDTH)),
                      color: Number(args.color ?? 0),
                      timestamp: args.timestamp ?? 0n,
                      transactionHash: log.transactionHash,
                      blockNumber: log.blockNumber ?? subToBlock
                    };
                    applyPlacement(eventItem, false);
                    processedEventsList.push(eventItem);
                  }
                }
              }
            } catch (retryErr) {
              console.error("Log fetch retry error:", retryErr);
            }
          }

          const progress = Math.min(
            99,
            Math.floor(Number((toBlock - startBlock) * 100n / (totalBlocks > 0n ? totalBlocks : 1n)))
          );
          if (!isCancelled) {
            setReconstructionProgress(progress);
            setLastBlockProcessed(toBlock);
          }

          fromBlock = toBlock + 1n;
        }

        if (!isCancelled) {
          // Sort reverse chronological for the recent feed
          processedEventsList.sort((a, b) => (b.blockNumber > a.blockNumber ? 1 : -1));
          setRecentPlacements(processedEventsList.slice(0, 50));
          setTotalEventsCount(processedEventsList.length);
          setCanvasData(new Uint32Array(canvasBufferRef.current));
          setReconstructionProgress(100);
          setIsReconstructing(false);
          setLastBlockProcessed(currentBlock);
        }
      } catch (error) {
        console.error("Initial canvas reconstruction failed:", error);
        if (!isCancelled) {
          setIsReconstructing(false);
          setReconstructionProgress(100);
        }
      }
    }

    loadAllHistoricalEvents();

    return () => {
      isCancelled = true;
    };
  }, [publicClient, applyPlacement]);

  // Live Canvas Synchronization: watchContractEvent + Periodic Fallback Poller
  useEffect(() => {
    if (!publicClient || !CANVAS_CONTRACT_ADDRESS || CANVAS_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return;
    }

    // 1. WebSocket / Event Watcher
    const unwatch = publicClient.watchContractEvent({
      address: CANVAS_CONTRACT_ADDRESS,
      event: PIXEL_PLACED_EVENT_ABI,
      onLogs: (logs) => {
        logs.forEach((log) => {
          const logKey = `${log.transactionHash}-${log.logIndex}`;
          if (!seenLogsRef.current.has(logKey)) {
            seenLogsRef.current.add(logKey);
            const args = log.args;
            if (args && args.player && args.index !== undefined) {
              const newEvent: PixelPlacementEvent = {
                player: args.player,
                index: args.index,
                x: args.x ?? BigInt(Number(args.index) % CANVAS_WIDTH),
                y: args.y ?? BigInt(Math.floor(Number(args.index) / CANVAS_WIDTH)),
                color: Number(args.color ?? 0),
                timestamp: args.timestamp ?? BigInt(Math.floor(Date.now() / 1000)),
                transactionHash: log.transactionHash,
                blockNumber: log.blockNumber ?? 0n
              };
              applyPlacement(newEvent, true);
            }
          }
        });
      }
    });

    // 2. Periodic polling interval (every 4 seconds) to guarantee sync across all RPC types
    const intervalId = setInterval(async () => {
      try {
        const latestBlock = await publicClient.getBlockNumber();
        if (latestBlock > lastBlockProcessed) {
          const fromBlock = lastBlockProcessed > 5n ? lastBlockProcessed - 5n : 0n; // overlap to catch any reorgs
          const newLogs = await publicClient.getLogs({
            address: CANVAS_CONTRACT_ADDRESS,
            event: PIXEL_PLACED_EVENT_ABI,
            fromBlock,
            toBlock: latestBlock
          });

          let anyNew = false;
          newLogs.forEach((log) => {
            const logKey = `${log.transactionHash}-${log.logIndex}`;
            if (!seenLogsRef.current.has(logKey)) {
              seenLogsRef.current.add(logKey);
              const args = log.args;
              if (args && args.player && args.index !== undefined) {
                const newEvent: PixelPlacementEvent = {
                  player: args.player,
                  index: args.index,
                  x: args.x ?? BigInt(Number(args.index) % CANVAS_WIDTH),
                  y: args.y ?? BigInt(Math.floor(Number(args.index) / CANVAS_WIDTH)),
                  color: Number(args.color ?? 0),
                  timestamp: args.timestamp ?? BigInt(Math.floor(Date.now() / 1000)),
                  transactionHash: log.transactionHash,
                  blockNumber: log.blockNumber ?? latestBlock
                };
                applyPlacement(newEvent, true);
                anyNew = true;
              }
            }
          });

          setLastBlockProcessed(latestBlock);
        }
      } catch (pollErr) {
        console.warn("Polling log check encountered temporary error:", pollErr);
      }
    }, 4000);

    return () => {
      unwatch();
      clearInterval(intervalId);
    };
  }, [publicClient, lastBlockProcessed, applyPlacement]);

  return {
    canvasData,
    recentPlacements,
    isReconstructing,
    reconstructionProgress,
    totalEventsCount,
    lastBlockProcessed
  };
}
