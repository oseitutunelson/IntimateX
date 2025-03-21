import { ethers } from "ethers";
import contractAbi from "../contracts/VideoViews.sol/VideoViews.json";
import axios from "axios";

const contractAddress = "0xbb815464Ec54dC240610c48612dF536630473786";

const {REACT_APP_PINATA_API_KEY,REACT_APP_PINATA_API_SECRET} = process.env;

export const storeHashOnBlockchain = async (videoId, updatedHash) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);
      const tx = await contract.updateViewData(videoId, updatedHash); // Custom method in your contract
      await tx.wait();
  
      console.log(`Stored updated hash on blockchain: ${updatedHash}`);
    } catch (error) {
      console.error("Error storing hash on blockchain:", error);
    }
  };

export const handleTimeUpdate = (event,nft) => {
    const video = event.target;
    const currentTime = video.currentTime;
    const duration = video.duration;
  
    // Check if the user has watched at least 30 seconds
    if (currentTime >= 30 && !video.hasCountedView) {
      video.hasCountedView = true; // Prevent multiple views for the same session
      incrementViewCount(nft);
    }
  };

export const incrementViewCount = async (nft) => {
    const videoId = nft.ImgHash; // Use the video hash as the unique identifier
    const currentViews = await fetchViewData(videoId); // Fetch existing view data from IPFS
  
    const updatedViews = currentViews + 1;
  
    // Upload updated view count to IPFS
    const updatedHash = await uploadViewDataToIPFS(videoId, updatedViews);
  
    // Store the new IPFS hash on the blockchain
    await storeHashOnBlockchain(videoId, updatedHash);
  
    console.log(`Updated views for ${videoId}: ${updatedViews}`);
  };
   
export const fetchViewData = async (videoId) => {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${videoId}`);
      return response.data.views || 0; // Default to 0 if no views found
    } catch (error) {
      console.error("Error fetching view data:", error);
      return 0;
    }
  };


export const uploadViewDataToIPFS = async (videoId, updatedViews) => {
    const viewData = {
      videoId,
      views: updatedViews,
    };
  
    try {
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: viewData,
        headers: {
          'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
        },
      });
  
      return response.data.IpfsHash; // Return the new IPFS hash
    } catch (error) {
      console.error("Error uploading view data to IPFS:", error);
      throw error;
    }
  };
    