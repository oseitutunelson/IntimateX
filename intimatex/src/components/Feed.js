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
  const [nftFeed, setNftFeed] = useState([]);
  const globalFeedHash = localStorage.getItem("globalFeedHash");
  const [nft, setNft] = useState("");
  //const [views, setViews] = useState("");
  const { address, isConnected } = useAppKitAccount()
  const [isCreator,setCreator] = useState(false);
  const [views,setViews] = useState(0);
  const [nftViews, setNftViews] = useState({}); // State to track views for each NFT

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

  /**
   * @dev Pagination for page
   */
  const cardsPerPage = 20; // Number of cards per page
  const [currentPage, setCurrentPage] = useState(1); // State for current page

  // Calculate total pages
  const totalPages = Math.ceil(nftFeed.length / cardsPerPage);

  // Get the NFTs to display for the current page
  const paginatedFeed = nftFeed.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  // Event handlers for pagination
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };



  useEffect(() =>{
    getSubscriptionStatus();
  })

  //calculate video views
  const handleVideoClick = async (nft) => {
    const {ImgHash} = nft;
    // Increment View Count
    try {
      const response = await axios.post('http://localhost:5000/api/videos/view', { videoId: ImgHash });
      console.log('Views updated:', response.data.views);
         } catch (err) {
      console.error('Error updating views:', err);
    }
  };

  const fetchViews = async () => {
    try {
      // Step 1: Fetch global feed hash
      const globalFeedHash = await fetchGlobalNftHash();
      if (!globalFeedHash) {
        console.error("No global feed hash found");
        return;
      }
  
      console.log("Global Feed Hash:", globalFeedHash);
  
      // Step 2: Fetch NFT feed from IPFS
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${globalFeedHash}`);
      const fetchedFeed = response.data;
  
      // Step 3: Initialize p-limit with concurrency of 5
      const limit = pLimit(5);
  
      // Step 4: Fetch views for each NFT, limiting to 5 concurrent requests
      const updatedFeed = await Promise.all(
        fetchedFeed.map((nft) =>
          limit(async () => {
            try {
              if (!nft.ImgHash) throw new Error("Missing ImgHash for NFT");
              const viewResponse = await axios.get(`http://localhost:5000/api/videos/${nft.ImgHash}`);
              return { ...nft, views: viewResponse.data.views }; // Add views to NFT object
            } catch (viewError) {
              console.error(`Error fetching views for ${nft.ImgHash}:`, viewError);
              return { ...nft, views: 0 }; // Default to 0 views if error occurs
            }
          })
        )
      );
  
      // Step 5: Update state with the new feed
      setNftFeed(updatedFeed);
    } catch (error) {
      console.error("Error loading video views:", error);
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
  
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const nftContract = new ethers.Contract(
            contractAddress,
            contractAbi.abi,
            signer
          );

          
  
          // const updatedFeed = await Promise.all(
          //   fetchedFeed.map(async (nft) => {
          //     const hasAccess = await nftContract.checkAccess(
          //       nft.tokenId,
          //       await signer.getAddress()
          //     );
          //     return { ...nft, hasAccess }; // Add access status to the NFT object
          //   })
          // );
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
                  const viewResponse = await axios.get(`http://localhost:5000/api/videos/${nft.ImgHash}`);
                  return { ...nft, views: viewResponse.data.views ,hasAccess}; // Add views to NFT object
                } catch (viewError) {
                  console.error(`Error fetching views for ${nft.ImgHash}:`, viewError);
                  return { ...nft, views: 0 }; // Default to 0 views if error occurs
                }
              })
            )
          );

          // const updatedViews = await Promise.all(
          //   fetchedFeed.map(async (nft) =>{
          //     const response = await axios.get(`http://localhost:5000/api/videos/${nft.ImgHash}`);
          //     return response.data.views;
          //   })
          // )
          // setViews(updatedViews);
  
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

   
    loadFeedAndCheckAccess();
    //fetchViews(); // Call the function inside useEffect
  }, []); // Empty dependency array ensures it runs once on component mount
  
  // useEffect(() =>{
  //   const fetchViews = async () =>{
  //     try{
  //       const globalFeedHash = await fetchGlobalNftHash();
  //       if (!globalFeedHash) return;
  //       console.log(globalFeedHash)
  
  //       const response = await axios.get(
  //         `https://gateway.pinata.cloud/ipfs/${globalFeedHash}`
  //       );
  //       const fetchedFeed = response.data;

  //       const updatedViews = await Promise.all(
  //         fetchedFeed.map(async (nft) =>{
  //           const response = await axios.get(`http://localhost:5000/api/videos/${nft.ImgHash}`);
  //           return response.data.views;
  //         })
  //       )
  //       setViews(updatedViews);
  //     }catch(error){
  //       console.log('Error loading video views',error);
  //     }
  //   }

  //   fetchViews()
  // },[])
 

  return (
    <div className="nft-feed">
      <Navigation />
      <div className="feed_container" id="feedContainer">
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
                      onClick={() => handleVideoClick(nft)}
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
                    <p><FaEye className="eye_views"/>&nbsp;{nft.views}</p>
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
      {/* Pagination Controls */}
      <div className="pagination" id="pagination">
        <button
          id="prev"
          disabled={currentPage === 1}
          onClick={handlePrev}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-link ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageClick(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          id="next"
          disabled={currentPage === totalPages}
          onClick={handleNext}
        >
          Next
        </button>
        <p id="page-numbers">
          Page {currentPage} of {totalPages}
        </p>
      </div>
    </div>
  );
};

export default NftFeed;
