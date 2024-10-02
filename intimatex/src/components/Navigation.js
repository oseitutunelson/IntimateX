import { React, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import truncateEthAddress from 'truncate-eth-address';
import rewardTokenAbi from '../contracts/RewardToken.sol/RewardToken.json';  // ABI for RewardToken contract
import { Link } from "react-router-dom";
import "../App.css";

const rewardTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";  

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

    // Check if the user is eligible for rewards
    const checkRewardEligibility = async () => {
        try {
            if (!wallet) {
                console.log("No wallet connected");
                return; // If wallet is not connected, stop execution
            }
    
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(rewardTokenAddress, rewardTokenAbi.abi, signer);
    
            // Check if the user is eligible for rewards
            const eligible = await contract.checkRewardEligibility(wallet);
            console.log("Eligibility check:", eligible);
    
            if (eligible) {
                rewardUser(); // Reward user if eligible
            } else {
                setRewardedToday(true); // Indicate that the user has already been rewarded
            }
        } catch (error) {
            console.error("Error checking reward eligibility:", error);
        }
    };
    

    // Reward user with 10 tokens if eligible
    const rewardUser = async () => {
        try {

          if (!window.ethereum) {
            alert("MetaMask is not installed!");
            return;
          }
    
          await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer =  provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(rewardTokenAddress, rewardTokenAbi.abi, signer);


            const tx = await contract.rewardUser(address);
            await tx.wait();
            setRewardedToday(true);
            getRewardBalance(); // Update reward balance after reward
        } catch (error) {
            console.error('Error rewarding user:', error);
        }
    };

    // Get reward token balance
    const getRewardBalance = async () => {
        try {
            if (!wallet) {
                console.log("No wallet connected");
                return; // Stop execution if no wallet is connected
            }
    
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(rewardTokenAddress, rewardTokenAbi.abi, signer);
            
            // Call balanceOf to get the user's reward balance
            const balance = await contract.getbalanceOf(wallet);
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
              <Link href='/' className='app_link'> <h3>intimateX</h3></Link> 
                {wallet ? (
                    <div className='navigation_wallet'>
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
