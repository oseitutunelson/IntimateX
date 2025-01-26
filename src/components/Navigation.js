import { React, useState, useEffect } from 'react'; 
import { Link } from "react-router-dom";
import "../App.css";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { ethers, Contract} from 'ethers'
import { createAppKit } from '@reown/appkit/react'
import rewardAbi from '../contracts/RewardToken.sol/RewardToken.json'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet,base, scroll, polygonAmoy, polygon,sepolia } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import Avatar from 'react-avatar';
import contractAbi from '../contracts/Subscription.sol/Subscription.json';
import truncateEthAddress from 'truncate-eth-address';

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
    const { address, isConnected } = useAppKitAccount()
    const [rewardedToday , setRewardedToday ] = useState(false);
    const [rewardBalance, setRewardBalance] = useState(0);
    const [isCreator,setCreator] = useState(false);
    console.log(address);

    const contractAddress = '0x4Ea4cdC718b8A4ef44a932d5b1AbD49f7CEb72BF';
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
          const creator = await getCreator(address);
          setCreator(creator)
          console.log(creator);
      } catch (error) {
          console.error("Error fetching reward balance:", error);
      }
  };

  const getCreator = async() =>{
     try{
      if (!isConnected) {
        console.log("No wallet connected");
        return; // Stop execution if no wallet is connected
    }
       const provider = new ethers.providers.Web3Provider(window.ethereum);
       const signer = await provider.getSigner();
       const contractAddress = "0x759C52837dD5EF03C32a0A733f593DcC74dfab6c"
       const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);

       const tx = await contract.getSubscriber(address);
       return tx;
       //setCreator(tx);
       console.log('is a creator',tx);
     }catch(error){
      console.log('Not a creator',error);
     }
  }


 useEffect(() =>{
  if(isConnected){  
    getCreator()
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
        <w3m-network-button/>
        <w3m-button/>
        <p>{rewardBalance} MTX</p>
        
        </div>
        </div>
      </div>
    </WagmiProvider>
  )
}


