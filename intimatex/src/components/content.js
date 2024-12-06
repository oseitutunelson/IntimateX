import React from "react";
import contractAbi from "../contracts/Content.sol/Content.json";
import { ethers } from "ethers";

export const setContentPrice = async (contentId,contentPrice) =>{
    try{
        if(!window.ethereum){
            console.log("No metamask installed");
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
      
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x47b6e6180088402ab2e1186a32C5efC8221af4Ea";
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

        const tx = await contract.setContentPrice(contentId,ethers.formatEther(contentPrice));
        console.log("Content price set");
    }catch(error){
        console.log("Content price set failed",error);
    }
} 

export const buyContent = async (ownerAddress,contentId,price) => {
     try{
        if(!window.ethereum){
            console.log("No metamask installed");
        }
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = "0x47b6e6180088402ab2e1186a32C5efC8221af4Ea";
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

        const tx = await contract.buyContent(ownerAddress,contentId,{value : ethers.formatEther(price)});
        await tx.wait();
     }catch(error){
        console.log("Content buy failed",error);
     }
}

export const fetchContentPrice = async(owner,contentId) =>{
   try{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //const signer = await provider.getSigner();
    const contractAddress = "0x47b6e6180088402ab2e1186a32C5efC8221af4Ea";
    const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);

    const contentPrice = await contract.getContentPrice(owner,contentId);
    console.log("price fetched");
    return contentPrice;
   }catch(error){
     console.log("Price fetch failed",error);
   }
}

export const fetchContentAccess = async (owner) =>{
    try{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
    //const signer = await provider.getSigner();
        const contractAddress = "0x47b6e6180088402ab2e1186a32C5efC8221af4Ea";
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);
        const contentAccess = await contract.getContentAccess(owner);
        console.log("content access fetched");
        return contentAccess;
    }catch(error){
        console.log("Content access fetch failed",error);
    }
}

export const fetchContentId = async (owner) =>{
    try{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        //const signer = await provider.getSigner();
            const contractAddress = "0x47b6e6180088402ab2e1186a32C5efC8221af4Ea";
            const contract = new ethers.Contract(contractAddress, contractAbi.abi, provider);

            const contentId = await contract.getContentId(owner);
            console.log("content id fetched");
            return contentId;
    }catch(error){
        console.log("Content id fetch failed",error);
    }
}