import { React, useState, useEffect } from 'react';
import nftArtifact from '../contracts/NFT.sol/Nft.json';
import nftArtifact2 from '../contracts/NFTAnvil.sol/Nft.json';
import axios from 'axios';
import { ethers } from 'ethers';
import '../styles/mint.css';

export const MintNft = () => {
  const [fileImg, setFileImg] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tokenId, setTokenId] = useState(1);
  const [userNftArrayHash, setUserNftArrayHash] = useState(null); // Get user's NFT array hash from localStorage
  const [userAddress, setUserAddress] = useState(null); // User's Ethereum address
  const [globalFeedHash, setGlobalFeedHash] = useState(null); // Global NFT feed IPFS hash

  const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

   // Fetch the global NFT feed from IPFS
   const fetchGlobalFeedFromIPFS = async () => {
    if (!globalFeedHash) return []; // If no IPFS hash yet, return empty array

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${globalFeedHash}`);
      return response.data; // Return global NFT array
    } catch (error) {
      console.error("Error fetching global feed:", error);
      return [];
    }
  };
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
  
   // Update global NFT feed on IPFS
   const updateGlobalFeedOnIPFS = async (newNftData) => {
    try {
      // Fetch the global feed
      const globalNftFeed = await fetchGlobalFeedFromIPFS();

      // Add the new NFT data to the feed
      globalNftFeed.push(newNftData);

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
 setGlobalFeedHash(newGlobalFeedHash); // Update state with the new hash

 // Optionally store in localStorage for persistence between refreshes
 localStorage.setItem('globalFeedHash', newGlobalFeedHash);
 return newGlobalFeedHash;
} catch (error) {
 console.error("Error updating global feed:", error);
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
          "image": ImgHash,
          "animation_url" : ImgHash
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

      // Update the global NFT feed on IPFS
      const newGlobalFeedHash = await updateGlobalFeedOnIPFS({
        tokenId,
        ImgHash,
        name,
        desc,
        creator: await getUserAddress(),
      });

      console.log("Updated global feed hash:", newGlobalFeedHash);

      // Update the user's NFT array on IPFS
      const newUserNftArrayHash = await updateUserNftArrayOnIPFS({ 
        tokenId, 
        ImgHash,
        name,
        desc 
      });


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
  
      //const contractAddressPolygon = '0xF920Eb7231841C902b983C9589693831A6ff5afE';
      //const contractAddressAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

      const mintNft = async (tokenURI) => {
        try {
          if (!window.ethereum) {
            alert("MetaMask is not installed!");
            return;
          }
    
          await window.ethereum.request({ method: 'eth_requestAccounts' });
    
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const contractAddress = '0x0be5e56e09FC888b60eF2108f74026Fe65e08a6e';
          const contractAddressAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
          const nftContract = new ethers.Contract(contractAddressAnvil, nftArtifact2.abi, signer);
    
          const tx = await nftContract.mint(address, tokenId, tokenURI,{
            gasPrice : 100000000 , gasLimit : 300000000 
          });
          await tx.wait();
          setTokenId(tokenId + 1); // Update token ID after minting
    
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

    const storedHash = localStorage.getItem('globalFeedHash');
    if (storedHash) {
      setGlobalFeedHash(storedHash); // Load from localStorage if available
    }

    initialize();
  }, []);

  return (
    <div className='mint'>
      <form onSubmit={sendFileToIPFS}>
        <label htmlFor='file-upload' className='file-upload'>Upload Content</label>
        <input type="file" id='file-upload' onChange={(e) => setFileImg(e.target.files[0])} required />
        <br />
        <input type="text" onChange={(e) => setName(e.target.value)} placeholder="name" required value={name} />
        <input type="text" onChange={(e) => setDesc(e.target.value)} placeholder="description" required value={desc} />
        <br /><br />
        <button className="form_button" type="submit">upload</button>
      </form>
    </div>
  );
};
