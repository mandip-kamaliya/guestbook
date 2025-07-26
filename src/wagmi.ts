// src/wagmi.ts
import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia], // We are only using the Sepolia testnet
  connectors: [
    injected(), // For MetaMask
  ],
  transports: {
    [sepolia.id]: http(),
  },
});