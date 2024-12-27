import {React} from 'react'
import contractAbi from '../contracts/NFT.sol/Nft.json';
import { ethers } from 'ethers';

const contractAddress = '0x131AB0F6A747Fa32B7e7c149FBBAA73203Bdb1b6';

export const purchaseNftAccess = async(tokenId) =>{
    try{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);
        
        const purchase = await contract.purchaseNFT(tokenId);
        await purchase.wait();
        console.log('Access Granted');

    }catch(error){
        console.log('Error Purchasing content',error);
    }
}

export const checkContentAccess = async(tokenId,userAddress) =>{
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);

        const checkAccess = await contract.checkAccess(tokenId,userAddress);
        return checkAccess;
        console.log('Access check successful');
    } catch (error) {
        console.log('Access check failed',error);
    }
}