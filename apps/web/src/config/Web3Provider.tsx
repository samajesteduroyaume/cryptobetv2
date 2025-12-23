"use client";

import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, optimism, arbitrum } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
    getDefaultConfig({
        chains: [mainnet, optimism, arbitrum],
        transports: {
            [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com'),
            [optimism.id]: http('https://mainnet.optimism.io'),
            [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
        },
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
        appName: "CryptoBet",
        appDescription: "Paris Sportifs Décentralisés",
        appUrl: "https://cryptobet.app",
        appIcon: "https://cryptobet.app/logo.png",
    })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider mode="dark">
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
