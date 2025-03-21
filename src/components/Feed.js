import React, { useEffect, useState } from "react";
import axios from "axios";
import Navigation from "./Navigation";
import "../styles/feed.css";
import { ethers } from "ethers";
import truncateEthAddress from "truncate-eth-address";
import { Link } from "react-router-dom";
import { fetchGlobalNftHash } from "./updateHashOnBlockchain";
import { handleTimeUpdate } from "./videoviews";
import { fetchViewData } from "./videoviews";
import { FaEthereum } from "react-icons/fa";
import contractAbi from "../contracts/NFT.sol/Nft.json";
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import subscribeContract from '../contracts/Subscription.sol/Subscription.json';
import pLimit from 'p-limit';
import { FaEye } from "react-icons/fa";

const contractAddress = "0xEA4d0dd4f6B5a8cDdD98e1a871c25Af025F69690";
const subscribeAddress = "0x759C52837dD5EF03C32a0A733f593DcC74dfab6c";

const NftFeed = () => {
  const [nftArray , setNftArray] = useState([]);
  const { address, isConnected } = useAppKitAccount()

  const fetchUserContentFromIPFS = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedNftHash = await fetchGlobalNftHash()
        const userIpfsHash = savedNftHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`,{withCredentials: false});
        setNftArray(response.data); // Assuming the response data is the array of NFTs

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};

const checkAccess = async (nft) => {
  const { tokenId } = nft;

  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return false;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const nftContract = new ethers.Contract(
    contractAddress,
    contractAbi.abi,
    signer
  );

  try {
    const hasAccess = await nftContract.checkAccess(
      tokenId,
      await signer.getAddress()
    );
    return hasAccess;
  } catch (error) {
    console.error("Error checking access:", error);
    return false;
  }
};
 // Check access for each NFT
 const checkAccessForAllNfts = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  const nftContract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

  const updatedNftFeed = await Promise.all(
    nftArray.map(async (nft) => {
      const hasAccess = await nftContract.checkAccess(nft.tokenId, signer.getAddress());
      return { ...nft, hasAccess };
    })
  );

  setNftArray(updatedNftFeed); // Update feed with access status
};



//purchase nft access
const purchaseAccess = async (nft) => {
  const { tokenId, price } = nft;

  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const nftContract = new ethers.Contract(
    contractAddress,
    contractAbi.abi,
    signer
  );

  try {
    const tx = await nftContract.purchaseNFT(tokenId, {
      value: ethers.parseEther(price.toString()),
    });
    await tx.wait();
    alert("Purchase successful! You now have access to this content.");

   

    // Check access after purchase
    const hasAccess = await checkAccess(nft);
    if (hasAccess) {
      // Update state to reflect access
      setNftArray((prevFeed) =>
        prevFeed.map((item) =>
          item.tokenId === tokenId ? { ...item, hasAccess: true } : item
        )
      );
    }
  } catch (error) {
    console.error("Error purchasing NFT access:", error);
    alert("Transaction failed. Please try again.");
  }
};

useEffect(() => {
  const loadFeedAndCheckAccess = async () => {
    try {
      // Step 1: Fetch the NFT feed
      const globalFeedHash = await fetchGlobalNftHash();
      if (!globalFeedHash) return;
      console.log(globalFeedHash)

      const response = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${globalFeedHash}`
      );
      const fetchedFeed = response.data;

      // Step 2: Check access for each NFT
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(
          contractAddress,
          contractAbi.abi,
          signer
        );

        const limit = pLimit(5);

        const updatedFeed = await Promise.all(
          fetchedFeed.map((nft) =>
            limit(async () => {
              try {
                if (!nft.ImgHash) throw new Error("Missing ImgHash for NFT");
                const hasAccess = await nftContract.checkAccess(
                  nft.tokenId,
                  await signer.getAddress()
                );
                return { ...nft, hasAccess}; // Add views to NFT object
              } catch (viewError) {
                console.error(`Error fetching data for ${nft.ImgHash}:`, viewError);
                return { ...nft, views: 0 }; // Default to 0 views if error occurs
              }
            })
          )
        );

        // Update the state with the updated feed
        setNftArray(updatedFeed);
      } else {
        alert("MetaMask is not installed!");
        setNftArray(fetchedFeed); // Set the feed without access checks
      }
    } catch (error) {
      console.error("Error loading feed or checking access:", error);
    }
  };

  loadFeedAndCheckAccess(); // Call the function inside useEffect
}, []); // Empty dependency array ensures it runs once on component mount





  return(
    <div>
      <Navigation/>
      <div className="feed-container">
        <div className="nft-feed">
          <h2>Feed</h2>
          <div className="nft-cards">
            {nftArray.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            nftArray.map((nft, index) => (
              <div key={index} className="nft-card">
                {nft.price === 0 || nft.hasAccess  ? (
                  <Link
                    to={`/nft/${nft.ImgHash}`}
                    state={{ nft }}
                    className="link_nft"
                  >
                    <video
                      className="video"
                       
                      poster={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}-thumbnail.jpg`}
                    >
                      <source
                        src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`}
                        type="video/mp4"
                      />
                    </video>
                    <Link to={`/profile/${nft.creator}`} className="link_nft2">
                      {" "}
                      <h4>{truncateEthAddress(`${nft.creator}`)}</h4>
                    </Link>
                    <h3>{nft.name}</h3>
                    <p>{nft.desc}</p>
                    <p>Price : Free Access</p>
                    <p><FaEye className="eye_views"/>&nbsp;{nft.views}</p>
                  </Link>
                ) : (
                  <div>
                   
                      <div className="link_nft l_nft">
                         <video
                        className="video"
                      >
                        <source
                          src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`}
                          type="video/mp4"
                        />
                      </video>
                      </div>
                     
                      <Link
                        to={`/profile/${nft.creator}`}
                        className="link_nft2"
                      >
                        {" "}
                        <h4>{truncateEthAddress(`${nft.creator}`)}</h4> 
                        </Link>
                      <h3>{nft.name}</h3>
                      <p>{nft.desc}</p>
                      <p>
                        Price : {nft.price} ETH <FaEthereum className="eth" />
                      </p>
                      <button className='buy_button' onClick={() => purchaseAccess(nft)}>Buy Access</button>
                  </div>
                )}
              </div>
            ))
          )}
            </div>
        </div>
      </div>
    </div>
  )
};

export default NftFeed;
