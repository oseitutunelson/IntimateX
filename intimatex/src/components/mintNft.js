import { React, useState, useEffect } from 'react';
import nftArtifact from '../contracts/NFT.sol/Nft.json';
import axios from 'axios';
import { ethers } from 'ethers';
import '../styles/mint.css';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { BiArrowBack } from "react-icons/bi";
import {Link} from 'react-router-dom';
import Navigation from './Navigation';
import { fetchGlobalNftHash, updateHashOnBlockchain } from './updateHashOnBlockchain';
import { fetchHashFromBlockchain } from './updateHashOnBlockchain';
import { ContentSettings } from './contentSettings';

export const MintNft = () => {
  const [fileImg, setFileImg] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tokenId, setTokenId] = useState(Date.now());
  const [userNftArrayHash, setUserNftArrayHash] = useState(localStorage.getItem('userNftHash')); // Get user's NFT array hash from localStorage
  const [userAddress, setUserAddress] = useState(null); // User's Ethereum address
  const [globalFeedHash, setGlobalFeedHash] = useState(null); // Global NFT feed IPFS hash
  const { address, isConnected } = useAppKitAccount()
  const [contentId,setContentId] = useState("")
  const [price , setPrice] = useState(0);
  const [isOneTimePurchase, setIsOneTimePurchase] = useState(false);
  const { walletProvider } = useAppKitProvider('eip155')


  const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;
   
  //shuffle array
  const shuffleArray = (array) => {
    let currentIndex = array.length;

  // While there remain elements to shuffle...
    while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  }
   // Fetch the global NFT feed from IPFS
   const fetchGlobalFeedFromIPFS = async () => {
    const globalFeedHash = await fetchGlobalNftHash();
    if (!globalFeedHash) return []; // If no IPFS hash yet, return empty array

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${globalFeedHash}`,{crossdomain : true});
      return response.data; // Return global NFT array
    } catch (error) {
      console.error("Error fetching global feed:", error);
      return [];
    }
  };
  // Fetch the user's existing NFT array from IPFS
  const fetchUserNftArrayFromIPFS = async () => {
    const userNftArrayHash = await fetchHashFromBlockchain(address);
    if (!userNftArrayHash) return []; // If no hash is stored, return empty array

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userNftArrayHash}`);
      return response.data; // Return user's NFT array
    } catch (error) {
      console.error("Error fetching user NFT array:", error);
      return [];
    }
  };
  
   // Update global NFT feed on IPFS
   const updateGlobalFeedOnIPFS = async (newNftData) => {
    try {
      // Fetch the global feed
      const globalNftFeed = await fetchGlobalFeedFromIPFS();

      // Add the new NFT data to the feed
      globalNftFeed.push(newNftData);
      shuffleArray(globalNftFeed);

      // Upload the updated feed to IPFS
      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: globalNftFeed,
        headers: {
          'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
        },
      });
 // Return the new IPFS hash for the updated feed
 const newGlobalFeedHash = res.data.IpfsHash;
 await updateHashOnBlockchain(newGlobalFeedHash);
 setGlobalFeedHash(newGlobalFeedHash); // Update state with the new hash

 // Optionally store in localStorage for persistence between refreshes
 localStorage.setItem('globalFeedHash', newGlobalFeedHash);
 return newGlobalFeedHash;
} catch (error) {
 console.error("Error updating global feed:", error);
}
};


  // Update user's NFT array on IPFS
  /*  */
  const updateUserNftArrayOnIPFS = async (newNftData) => {
    try {
      // Fetch the global feed
      const userNftArray = await fetchUserNftArrayFromIPFS();

      // Add the new NFT data to the feed
      userNftArray.push(newNftData);

      // Upload the updated feed to IPFS
      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: userNftArray,
        headers: {
          'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
        },
      });
 // Return the new IPFS hash for the updated feed
 const newUserNftHash = res.data.IpfsHash;
 // Update state with the new hash
 await updateHashOnBlockchain(newUserNftHash); 
 setUserNftArrayHash(newUserNftHash);
 // Optionally store in localStorage for persistence between refreshes
 localStorage.setItem('userNftHash', newUserNftHash);
 return newUserNftHash;
} catch (error) {
 console.error("Error updating user nft feed:", error);
}
};

//  Send JSON metadata to IPFS
  const sendJSONtoIPFS = async (ImgHash) => {
    try {
      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: {
          "name": name,
          "description": desc,
          "tokenId": tokenId,
          "image": ImgHash,
          "price" : price,
          "isOneTimePurchase" : isOneTimePurchase
        },
        headers: {
          'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
        },
      });

      const tokenURI = `ipfs://${resJSON.data.IpfsHash}`;
      console.log("Token URI", tokenURI);

      // Mint the NFT
      await mintNft(tokenURI,address);
      
      // Update the user's NFT array on IPFS
      const newUserNftArrayHash = await updateUserNftArrayOnIPFS({ 
        tokenId, 
        ImgHash,
        name,
        desc,
        price,
        isOneTimePurchase
      });


      console.log("Updated NFT array hash:", newUserNftArrayHash);

      // Update the global NFT feed on IPFS
      const newGlobalFeedHash = await updateGlobalFeedOnIPFS({
        tokenId,
        ImgHash,
        name,
        desc,
        creator: await getUserAddress(),
        price,
        isOneTimePurchase
      });

      console.log("Updated global feed hash:", newGlobalFeedHash);

      
      
    } catch (error) {
      console.log("Error sending JSON to IPFS:", error);
    }
  };

  // Send file to IPFS
  const sendFileToIPFS = async (e) => {
    e.preventDefault();

    if (fileImg) {
      try {
        const formData = new FormData();
        formData.append("file", fileImg);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
            'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
            "Content-Type": "multipart/form-data"
          },
        });

        const ImgHash = resFile.data.IpfsHash;
        console.log("Image Hash:", ImgHash);

        // Send JSON metadata to IPFS
        await sendJSONtoIPFS(ImgHash);
      } catch (error) {
        console.log("Error uploading file to IPFS:", error);
      }
    }
  };

  const handleTokenId = () => {
    setTokenId(tokenId + 1);
  }

  // Get user's Ethereum address
  const getUserAddress = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return await signer.getAddress();
  };

  // Mint NFT on the blockchain
  
      //const contractAddressPolygon = '0xF920Eb7231841C902b983C9589693831A6ff5afE';
      //const contractAddressAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

     // mint function
  const mintNft = async (tokenURI, address) => {
  
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const status = document.getElementById("status");

      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = await provider.getSigner();
      const contractAddress = '0xEA4d0dd4f6B5a8cDdD98e1a871c25Af025F69690'; 
      const nftContract = new ethers.Contract(contractAddress, nftArtifact.abi, signer);

      try {
      const priceInWei = ethers.utils.parseEther(price.toString());
      const tx = await nftContract.mint(address, tokenId, tokenURI,priceInWei,isOneTimePurchase);
      status.textContent = "Transaction submitted. Waiting for confirmation...";
      await tx.wait();
      status.textContent = "Transaction confirmed!";
      handleTokenId(); // Update token ID after minting

      //alert(`NFT minted! Token ID: ${tokenId}`);
      setContentId(tokenId);
      console.log(`NFT minted! Token ID: ${tokenId}`)
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };
 
  useEffect(() => {
    const initialize = async () => {
      const address = await getUserAddress();
      setUserAddress(address);

      // Fetch user's NFT array from IPFS on page load
      if (address && userNftArrayHash) {
        await fetchUserNftArrayFromIPFS();
      }
    };

    const storedHash = localStorage.getItem('globalFeedHash');
    if (storedHash) {
      setGlobalFeedHash(storedHash); // Load from localStorage if available
    }

    initialize();
  }, []);

  return (
    <div className='mint'>
    <Navigation/>
      <Link to={`/creator/${address}`}><BiArrowBack className='mint_arrow'/></Link>
      <form onSubmit={sendFileToIPFS}>
        <label htmlFor='file-upload' className='file-upload'>Upload Content</label>
        <input type="file" id='file-upload' onChange={(e) => setFileImg(e.target.files[0])} required />
        <br />
        <input type="text" onChange={(e) => setName(e.target.value)} placeholder="name" required value={name} />
        <input type="text" onChange={(e) => setDesc(e.target.value)} placeholder="description" required value={desc} /><br/>
        <label htmlFor='price' className='price'>Price (Leave Zero if you want content to be free -- earn on views, let your fans enjoy your porn)</label>
        <input type="number" step="any" onChange={(e) => setPrice(e.target.value)} placeholder="Price in ETH" required value={price} />
        <br /><br />
        <button className="form_button" type="submit">upload</button>
        <p id="status"></p>
      </form>
      
      <div>
        <ContentSettings/>
      </div>
    </div>
  );
};
