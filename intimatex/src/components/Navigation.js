import { React, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import truncateEthAddress from 'truncate-eth-address';
import rewardTokenAbi from '../contracts/RewardToken.sol/RewardToken.json';  // ABI for RewardToken contract
import { Link } from "react-router-dom";
import "../App.css";
import Avatar from 'react-avatar';


const rewardTokenAddress = "0x6a0680673BaEBB7a98b9c8792e4dc58333Fc0390";  
//relayer for executing rewards to users
const relayerPrivateKey = '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6';

export default function Navigation() {
    const [wallet, setWallet] = useState("");
    const [balance, setBalance] = useState(0);
    const [rewardedToday, setRewardedToday] = useState(false);
    const [rewardBalance , setRewardBalance] = useState(0);

    useEffect(() => {
        if (wallet) {
            checkRewardEligibility();
            getRewardBalance();
        }
    }, [wallet]);

    // Connect wallet and reward user if eligible
    const connect = async () => {
        try {
            if (!window.ethereum) {
                alert("MetaMask is not installed!");
                return;
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            console.log(signer);

            setWallet(address);
            checkRewardEligibility();
            getRewardBalance();
        } catch (error) {
            console.error(error);
        }
    };

async function rewardUserThroughRelayer(userAddress) {
    try {
         // Check if userAddress is valid
         if (!userAddress || !ethers.utils.isAddress(userAddress)) {
            throw new Error("Invalid user address passed");
        }
        // Create a provider connected to Ethereum
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Create a new signer using the relayer's private key
        const relayerSigner = new ethers.Wallet(relayerPrivateKey, provider);
        console.log(relayerSigner)

        // Instantiate the contract using the relayer's signer
        const contract = new ethers.Contract(rewardTokenAddress, rewardTokenAbi.abi, relayerSigner);

        // Call the rewardUser function through the relayer account
        const tx = await contract.rewardUser(userAddress, {
            gasPrice:50000000000, gasLimit: 1000000 ,  // Set gas limit manually
        });
        
        await tx.wait(); // Wait for the transaction to be mined

        console.log(`Reward sent by relayer to user: ${userAddress}`);
    } catch (error) {
        console.error("Error rewarding user through relayer:", error);
    }
}


    // Check if the user is eligible for rewards
    const checkRewardEligibility = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            if (!signer) {
                console.log("No wallet connected");
                return; // If wallet is not connected, stop execution
            }
            const contract = new ethers.Contract(rewardTokenAddress, rewardTokenAbi.abi, signer);
    
            // Check if the user is eligible for rewards
            const eligible = await contract.checkRewardEligibility(address);
            console.log("Eligibility check:", eligible);
         
    
            if (eligible) {
                rewardUserThroughRelayer(address); // Reward user if eligible
            } else {
                setRewardedToday(true); // Indicate that the user has already been rewarded
            }
        } catch (error) {
            console.error("Error checking reward eligibility:", error);
        }
    };
    

    // Reward user with 10 tokens if eligible
    

    // Get reward token balance
    const getRewardBalance = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            if (!signer) {
                console.log("No wallet connected");
                return; // Stop execution if no wallet is connected
            }
            const contract = new ethers.Contract(rewardTokenAddress, rewardTokenAbi.abi, signer);
            
            // Call balanceOf to get the user's reward balance
            const balance = await contract.getbalanceOf(address);
            const formattedBalance = ethers.utils.formatUnits(balance, 18); // Assuming token has 18 decimals
            console.log("User's reward balance:", formattedBalance);
            setRewardBalance(formattedBalance);
        } catch (error) {
            console.error("Error fetching reward balance:", error);
        }
    };
    

    return (
        <div className='App'>
            <div className='navigation'>
              <Link to='/' className='app_link'> <h3>intimateX</h3></Link> 
                {wallet ? (
                    <div className='navigation_wallet'>
                <Link to='creator'><Avatar name='Mate X' round size='35px' className='avatar' color='#333'/></Link>
                        <p>Wallet: {truncateEthAddress(wallet)}</p>
                        <span>Reward Balance: {rewardBalance} MTX</span>
                        <br/>
                        {rewardedToday ? <span>You've been rewarded today!</span> : null}
                    </div>
                ) : (
                    <button onClick={connect}>Connect Wallet</button>
                )}
            </div>
        </div>
    );
}
