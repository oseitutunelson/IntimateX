import {React} from "react";
import contractAbi from "../contracts/UserNftData.sol/UserNFTData.json";
import { ethers } from "ethers";

export const updateHashOnBlockchain = async (userNftHash) => {
   try{
    if(!window.ethereum){
        console.log("No Ethereum wallet found");
    }

   // Request account access
       await window.ethereum.request({ method: "eth_requestAccounts" });
      
   // Set up the provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0x3B850C42cf1309a1f7E7d6FD4d6a23f2aBf2b679";
      const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);

      const tx = contract.updateUserNftHash(userNftHash);
      //await tx.wait();
      console.log("nft hash saved");
   }catch(error){
      console.log("Nft hash saved failed",error);
   }
}

export const fetchHashFromBlockchain = async (userAddress) =>{
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x3B850C42cf1309a1f7E7d6FD4d6a23f2aBf2b679"; 
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);
    
        const userHash = await contract.getUserNftHash(userAddress);
        console.log("Fetched user hash:", userHash);
        return userHash;
      } catch (error) {
        console.error("Error fetching user hash:", error);
      }
}

export const fetchGlobalNftHash = async () =>{
  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return null;
}

       const provider = new ethers.providers.Web3Provider(window.ethereum);
       const contractAddress = "0x3B850C42cf1309a1f7E7d6FD4d6a23f2aBf2b679"; 
       const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);

    try {
       const globalFeedHash = await contract.getAllNfts();
       return globalFeedHash;
} catch (error) {
    console.error("Error fetching global feed hash from blockchain:", error);
    return null;
}
}