import { React, useState, useEffect } from 'react'; 
import { Link } from "react-router-dom";
import "../App.css";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { ethers, Contract, formatUnits } from 'ethers'
import { createAppKit } from '@reown/appkit/react'
import rewardAbi from '../contracts/RewardToken.sol/RewardToken.json'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet,base, scroll, polygonAmoy, polygon,sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import Avatar from 'react-avatar';

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


export default function Navigation() {
    const [isNetworkSwitchHighlighted, setIsNetworkSwitchHighlighted] =
    useState(false);
    const [isConnectHighlighted, setIsConnectHighlighted] = useState(false);

    const closeAll = () => {
    setIsNetworkSwitchHighlighted(false);
    setIsConnectHighlighted(false);
  };
    
    const { address, isConnected } = useAppKitAccount()
    const { walletProvider } = useAppKitProvider()
    const [rewardedToday , setRewardedToday ] = useState(false);
    const [rewardBalance, setRewardBalance] = useState(0);
    console.log(address);

    const contractAddress = '0x0FCD8713FD2ba714e96ABF0fe93C89712c6c255f';
    const relayerPrivateKey = '0x681f8d7f47808db4623ecd36e8a14f947c1aa278cd217e61b3faff50c50e2215'
  //reward user for daily logins
    const handleReward = async (userAddress) =>{
      if(!isConnected) throw Error('User disconnected');
      try{
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const relayer = new ethers.Wallet(relayerPrivateKey,ethersProvider);
        const rewardContract = new Contract(contractAddress,rewardAbi.abi,relayer);
        const gasPrice = ethers.utils.parseUnits('65','gwei').toString();
        console.log(gasPrice)
        const tx = await rewardContract.rewardUser(userAddress,{
          gasPrice : gasPrice
        });
        await tx.wait();
        console.log('Reward granted');
      }catch(error){
        console.log('Reward not granted',error);
      }
  }

  const checkRewardEligibility = async () => {
    try {
        if(!isConnected){
            console.log('Wallet not connected');
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const relayer = new ethers.Wallet(relayerPrivateKey,provider);
        const contract = new ethers.Contract(contractAddress, rewardAbi.abi, relayer);

        // Check if the user is eligible for rewards
        const eligible = await contract.checkRewardEligibility(address);
        console.log("Eligibility check:", eligible);

        if (eligible) {
            // Instead of user rewarding themselves, the relayer will reward them
            handleReward(address);
        } else {
            setRewardedToday(true); // Indicate that the user has already been rewarded
        }
    } catch (error) {
        console.error("Error checking reward eligibility:", error);
    }
};
    //get reward balance
    const getRewardBalance = async () => {
      try {
          if (!isConnected) {
              console.log("No wallet connected");
              return; // Stop execution if no wallet is connected
          }

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, rewardAbi.abi, signer);
          
          // Call balanceOf to get the user's reward balance
          const balance = await contract.balanceOf(address);
          const formattedBalance = ethers.utils.formatEther(balance,18); // Assuming token has 18 decimals
          console.log("User's reward balance:", formattedBalance);
          setRewardBalance(formattedBalance);
      } catch (error) {
          console.error("Error fetching reward balance:", error);
      }
  };


 useEffect(() =>{
  if(isConnected){
    checkRewardEligibility();
    getRewardBalance();
  }
   
 },[])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <div className='App'>
        <div className='navigation'>
        <Link to='/' className='app_link'><h3>intimateX</h3></Link>
        <div className='nav_buttons'>
        {isConnected ? <Link to={`/creator/${address}`}><Avatar name='Mate X' color='#333' size='45px' round className='avatar'/></Link> : ''}
        <w3m-network-button/>
        <w3m-button/>
        <p>{rewardBalance} MTX</p>
        
        </div>
        </div>
      </div>
    </WagmiProvider>
  )
}


