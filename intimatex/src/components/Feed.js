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


const contractAddress = "0x495699E54c02762aAf6B5e6D400C348D6d2e07C9";
const subscribeAddress = "0x759C52837dD5EF03C32a0A733f593DcC74dfab6c";

const NftFeed = () => {
  const [nftFeed, setNftFeed] = useState([]);
  const globalFeedHash = localStorage.getItem("globalFeedHash");
  const [nft, setNft] = useState("");
  const [views, setViews] = useState("");
  const { address, isConnected } = useAppKitAccount()
  const [isCreator,setCreator] = useState(false);

  // Fetch global NFT feed from IPFS
  const fetchNftFeed = async () => {
    const globalFeedHash = await fetchGlobalNftHash();
    if (!globalFeedHash) return;

    try {
      const response = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${globalFeedHash}`,
        { crossdomain: true, withCredentials: false }
      );
      setNftFeed(response.data); // Set the global feed data
    } catch (error) {
      console.error("Error fetching NFT feed:", error);
    }
  };

  // useEffect(() => {
  //   fetchNftFeed();
  // }, [globalFeedHash]);
 

  // check nft access
  const checkAccess = async (nft) => {
    const { tokenId } = nft;

    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return false;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(contractAddress, contractAbi.abi, signer);
  
    const updatedNftFeed = await Promise.all(
      nftFeed.map(async (nft) => {
        const hasAccess = await nftContract.checkAccess(nft.tokenId, signer.getAddress());
        return { ...nft, hasAccess };
      })
    );
  
    setNftFeed(updatedNftFeed); // Update feed with access status
  };
  
  
  
  //purchase nft access
  const purchaseAccess = async (nft) => {
    const { tokenId, price } = nft;

    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(
      contractAddress,
      contractAbi.abi,
      signer
    );

    try {
      const tx = await nftContract.purchaseNFT(tokenId, {
        value: ethers.utils.parseEther(price.toString()),
      });
      await tx.wait();
      alert("Purchase successful! You now have access to this content.");

     

      // Check access after purchase
      const hasAccess = await checkAccess(nft);
      if (hasAccess) {
        // Update state to reflect access
        setNftFeed((prevFeed) =>
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

  //get subscriber ** creator
  const getSubscriptionStatus = async() =>{
    try{
      if(!window.ethereum){
        console.log("No wallet connected");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(subscribeAddress,subscribeContract.abi,signer);

      const creatorStatus = await contract.getSubscriber(address);
      console.log(creatorStatus);
      setCreator(creatorStatus);
      return creatorStatus;
    }catch(error){
      console.log('User is not a creator',error);
    }
    
  }

  useEffect(() =>{
    getSubscriptionStatus();
  })

  useEffect(() => {
    const loadFeedAndCheckAccess = async () => {
      try {
        // Step 1: Fetch the NFT feed
        const globalFeedHash = await fetchGlobalNftHash();
        if (!globalFeedHash) return;
  
        const response = await axios.get(
          `https://gateway.pinata.cloud/ipfs/${globalFeedHash}`
        );
        const fetchedFeed = response.data;
  
        // Step 2: Check access for each NFT
        if (window.ethereum) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
  
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const nftContract = new ethers.Contract(
            contractAddress,
            contractAbi.abi,
            signer
          );
  
          const updatedFeed = await Promise.all(
            fetchedFeed.map(async (nft) => {
              const hasAccess = await nftContract.checkAccess(
                nft.tokenId,
                await signer.getAddress()
              );
              return { ...nft, hasAccess }; // Add access status to the NFT object
            })
          );
  
          // Update the state with the updated feed
          setNftFeed(updatedFeed);
        } else {
          alert("MetaMask is not installed!");
          setNftFeed(fetchedFeed); // Set the feed without access checks
        }
      } catch (error) {
        console.error("Error loading feed or checking access:", error);
      }
    };
  
    loadFeedAndCheckAccess(); // Call the function inside useEffect
  }, []); // Empty dependency array ensures it runs once on component mount
  

  return (
    <div className="nft-feed">
      <Navigation />
      <div className="feed_container">
        <div className="subscriber">
          <h2>Feed</h2>
          {
            isCreator === true ? (
              <Link to={`/creator/${address}`}><button>Creator Dashboard</button></Link>
            ) : (
               <Link to="/subscribe">
            <button>Become a creator</button>
          </Link>
            )
          }
         
        </div>

        <div className="nft-cards">
          {nftFeed.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            nftFeed.map((nft, index) => (
              <div key={index} className="nft-card">
                {nft.price === 0 || nft.hasAccess  ? (
                  <Link
                    to={`/nft/${nft.ImgHash}`}
                    state={{ nft }}
                    className="link_nft"
                  >
                    <video
                      className="video"
                      onMouseOver={(event) => event.target.play()}
                      onMouseOut={(event) => event.target.pause()}
                      onTimeUpdate={(event) => handleTimeUpdate(event, nft)}
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
                  </Link>
                ) : (
                  <div>
                   
                      <div className="link_nft l_nft">
                         <video
                        className="video"
                        onTimeUpdate={(event) => handleTimeUpdate(event, nft)}
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
  );
};

export default NftFeed;
