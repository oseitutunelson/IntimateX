import contractAbi from "../contracts/ProfileData.sol/ProfileData.json";
import { Contract, ethers } from "ethers";

const contractAddress = "0xEEcb68933bf49416e7223864aD45E345e5368B62";

export const updateProfileHash = async(hash) => {
   try{  
    if(!window.ethereum){
        console.log("No metamask found");
    }
        const status = document.getElementById("status");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

        const tx = await contract.updateProfileHash(hash);
        status.textContent = 'Profile Edited';
        console.log("profile hash saved");
    }catch(error){
        console.log("Profile hash save failed",error);
    }
} 

export const fetchUserProfileHash = async (address) =>{
    try{
       if(!window.ethereum){
        console.log("No wallet found");
       }
       const provider = new ethers.BrowserProvider(window.ethereum);
       const contract = new ethers.Contract(contractAddress,contractAbi.abi,provider);

       const tx = await contract.fetchUserProfileHash(address);
       console.log("UserProfileHash:",tx);
       return tx;

    }catch(error){
        console.log("Failed to fetch user profile hash",error);
    }
}

export const getAllProfilesHash = async() =>{
    try{
        if(!window.ethereum){
            console.log("No wallet found");
           }
           const provider = new ethers.BrowserProvider(window.ethereum);
           const contract = new ethers.Contract(contractAddress,contractAbi.abi,provider);

           const tx = await contract.getAllProfilesHash();
           console.log("AllProfileHash:",tx);
           return tx;
    }catch(error){
        console.log("Get all Profiles Hash failed",error);
    }
}