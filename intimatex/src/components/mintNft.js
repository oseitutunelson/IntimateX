import { React, useState, useEffect } from 'react';
import nftArtifact from '../contracts/NFT.sol/Nft.json';
import axios from 'axios';
import { ethers } from 'ethers';
import '../styles/mint.css';

export const MintNft = () => {
  const [fileImg, setFileImg] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tokenId, setTokenId] = useState(1);
  const [userNftArrayHash, setUserNftArrayHash] = useState(localStorage.getItem('savedNftHash')); // Get user's NFT array hash from localStorage
  const [userAddress, setUserAddress] = useState(null); // User's Ethereum address

  const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

  // Fetch the user's existing NFT array from IPFS
  const fetchUserNftArrayFromIPFS = async () => {
    if (!userNftArrayHash) return []; // If no hash is stored, return empty array

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userNftArrayHash}`);
      return response.data; // Return user's NFT array
    } catch (error) {
      console.error("Error fetching user NFT array:", error);
      return [];
    }
  };

  // Update user's NFT array on IPFS
  const updateUserNftArrayOnIPFS = async (newNftData) => {
    try {
      // Fetch the user's existing NFT array from IPFS
      const userNftArray = await fetchUserNftArrayFromIPFS();

      // Add the new NFT data to the array
      userNftArray.push(newNftData);

      // Upload updated array to IPFS
      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: userNftArray,
        headers: {
          'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
        },
      });

      // Return the new IPFS hash for the updated array
      const newUserNftArrayHash = res.data.IpfsHash;
      setUserNftArrayHash(newUserNftArrayHash); // Update state with the new hash
      localStorage.setItem('savedNftHash', newUserNftArrayHash); // Save the hash in localStorage

      return newUserNftArrayHash;
    } catch (error) {
      console.error("Error updating user NFT array:", error);
    }
  };

  // Send JSON metadata to IPFS
  const sendJSONtoIPFS = async (ImgHash) => {
    try {
      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: {
          "name": name,
          "description": desc,
          "tokenId": tokenId,
          "image": ImgHash
        },
        headers: {
          'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
        },
      });

      const tokenURI = `ipfs://${resJSON.data.IpfsHash}`;
      console.log("Token URI", tokenURI);

      // Mint the NFT
      await mintNft(tokenURI);

      // Update the user's NFT array on IPFS
      const newUserNftArrayHash = await updateUserNftArrayOnIPFS({ tokenId, ImgHash, name, desc });
      console.log("Updated NFT array hash:", newUserNftArrayHash);
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
  const mintNft = async (tokenURI) => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Replace with your contract address
      const nftContract = new ethers.Contract(contractAddress, nftArtifact.abi, signer);

      const tx = await nftContract.mint(address, tokenId, tokenURI);
      await tx.wait();
      handleTokenId() // Update token ID after minting

      alert(`NFT minted! Token ID: ${tokenId}`);
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

    initialize();
  }, []);

  return (
    <div className='mint'>
      <form onSubmit={sendFileToIPFS}>
        <label htmlFor='file-upload' className='file-upload'>Upload Content</label>
        <input type="file" id='file-upload' onChange={(e) => setFileImg(e.target.files[0])} required />
        <br />
        <input type="text" onChange={(e) => setName(e.target.value)} placeholder="name" required value={name} />
        <input type="text" onChange={(e) => setDesc(e.target.value)} placeholder="desc" required value={desc} />
        <br /><br />
        <button className="form_button" type="submit">Mint NFT</button>
      </form>
    </div>
  );
};
