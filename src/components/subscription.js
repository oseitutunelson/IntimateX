import {React} from "react";
import { ethers } from "ethers";
import contractAbi from "../contracts/Subscription.sol/Subscription.json";
import Navigation from "./Navigation";
import '../styles/subscribe.css';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";


const contractAddress = "0x759C52837dD5EF03C32a0A733f593DcC74dfab6c";



export const Subscription = () =>{
    const { address, isConnected } = useAppKitAccount()
    const subscribe = async () =>{
        
        try{
            const status = document.getElementById("status");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);
    
         // Fetch required ETH amount for subscription
        const ethRequired = await contract.getRequiredEthForSubscription();
    
        // Call the subscribe function with the required ETH amount
        const subscription = await contract.subscribe({
          value: ethRequired.toString(),
        });
          // Check if already subscribed
          const isSubscribed = await contract.getSubscriber(address);
          if (isSubscribed) {
              status.textContent = "You are already subscribed!";
              return;
      }
            status.textContent = "Transaction submitted. Waiting for confirmation...";
            await subscription.wait()
            status.textContent = "Subscription successful!";
            console.log("Subscription successful");
    
        }catch(error){
            console.log('Error subscribing',error);
            document.getElementById("status").textContent = `Error: ${error.message}`;
        }
    }
    
    const getSubscriber = async (user) =>{
        try{
           const provider = new ethers.BrowserProvider(window.ethereum);
           const contract = new ethers.Contract(contractAddress,contractAbi.abi,provider);
    
           const subscribers = await contract.getSubscriber(user);
           console.log("Subscriber get Successful");
        }catch(error){
            console.log('Error getting subscriber',error);
        }
    }
    return(
        <div className="subscribe">
          <Navigation/>
          <div className="subscribe_form">
            <h1>Welcome To The Creator Program</h1>
            <p>Your content. Your rules. Join now and start earning directly from your fans.</p>
            <ul>
                <li>Subscribe with one click (subscription fee goes directly to fund the project and pay gas fees to maintain project)</li>
                <li>Upload your content and tokenize it as NFTs.</li>
                <li>Set pricing and royalty preferences.</li>
                <li>Earn revenue directly from fans and collectors.</li>
            </ul>
            <button onClick={subscribe}>Subscribe</button>
            <p id="status"></p>
          </div>
        </div>
    )
}