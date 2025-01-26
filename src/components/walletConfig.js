import { React, useState, useEffect } from 'react'; 
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";

import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet,base, scroll, polygonAmoy, polygon,sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '2adfca29ecc73c623bd3ed49c7b66ec7'

// 2. Create a metadata object - optional
const metadata = {
  name: 'intimateX',
  description: 'AppKit Example',// origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [mainnet, arbitrum,sepolia,polygon,polygonAmoy,base,scroll]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export default wagmiAdapter;
