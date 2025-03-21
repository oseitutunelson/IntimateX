import { React , useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import '../styles/profile.css';
import Navigation from "./Navigation";
import { fetchUserProfileHash } from "./updateProfile";
import { fetchHashFromBlockchain } from "./updateHashOnBlockchain";
import { Link } from "react-router-dom";
import truncateEthAddress from "truncate-eth-address";
import { FaEthereum } from "react-icons/fa";
import contractAbi from "../contracts/NFT.sol/Nft.json";
import { ethers } from "ethers";
import pLimit from 'p-limit';
import { FaEye } from "react-icons/fa";

const contractAddress = "0xEA4d0dd4f6B5a8cDdD98e1a871c25Af025F69690";


export default function Profile(){
   const {walletAddress} = useParams();
   const [nftArray , setNftArray] = useState([]);
   const [profileArray , setProfileArray] = useState([])

   const fetchProfile = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedProfileHash = await fetchUserProfileHash(walletAddress);
        const userIpfsHash = savedProfileHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`,{withCredentials: false});
        setProfileArray(response.data);

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};

const fetchUserContentFromIPFS = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedNftHash = await fetchHashFromBlockchain(walletAddress)
        const userIpfsHash = savedNftHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`,{withCredentials: false});
        setNftArray(response.data); // Assuming the response data is the array of NFTs

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};

  // check nft access
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
        const globalFeedHash = await fetchHashFromBlockchain(walletAddress);
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
                  const viewResponse = await axios.get(`http://localhost:5000/api/videos/${nft.ImgHash}`);
                  return { ...nft, views: viewResponse.data.views ,hasAccess}; // Add views to NFT object
                } catch (viewError) {
                  console.error(`Error fetching views for ${nft.ImgHash}:`, viewError);
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
  



   useEffect(() => {
    if (walletAddress) {
        fetchUserContentFromIPFS();
        fetchProfile();
    }
}, [walletAddress]);

   return(
    <div>
        <Navigation/>
       <div className='profile'>
          
         <div className='profile_details'>
          {profileArray.length === 0 ? (
           <>
           <div className='cover_photo'>
            <h3>mateX</h3>  
          </div>
            <div className='profile_photo'>
            <img src='' alt=''/>
         </div>
         <div className='profile_info'>
           <h3>Username</h3>
           <p>Description</p>
         </div>
           </>
          ) : (
            profileArray.map((profile,index) => (
              <>
              <div className='cover_photo'>
              <img src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${profile.cover_image}`} alt=''/>
          </div>
               <div className='profile_photo'>
            <img src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${profile.profile_image}`} alt=''/>
         </div>
         <div className='profile_info'>
           <h3>{profile.username}</h3>
           <p>{profile.description}</p>
         </div>
         <div className="user_actions">
            <button className="tip">Tip Creator</button>
         </div>
              </>
            ))
          )}
         
         </div>
        </div>
        <div className='content'>
            <h3 className="content_title">Posts</h3>
            <div className="nft-container">
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
                      onMouseOver={(event) => event.target.play()}
                      onMouseOut={(event) => event.target.pause()}
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
   )
}