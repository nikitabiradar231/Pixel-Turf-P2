import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";

const customRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || import.meta.env.VITE_BASE_SEPOLIA_RPC_URL;

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: "Pixel Turf" })
  ],
  transports: {
    [sepolia.id]: http(customRpcUrl || "https://ethereum-sepolia-rpc.publicnode.com", {
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
