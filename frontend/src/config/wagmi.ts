import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";

const customRpcUrl = import.meta.env.VITE_BASE_SEPOLIA_RPC_URL;

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: "Pixel Turf" })
  ],
  transports: {
    [baseSepolia.id]: http(customRpcUrl || "https://sepolia.base.org", {
      batch: true,
      retryCount: 3,
      retryDelay: 1000
    })
  }
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
