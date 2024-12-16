import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import '../styles/feed.css';
import truncateEthAddress from 'truncate-eth-address';
import { Link } from 'react-router-dom';
import { fetchGlobalNftHash } from './updateHashOnBlockchain';

const NftFeed = () => {
  const [nftFeed, setNftFeed] = useState([]);
  const globalFeedHash = localStorage.getItem('globalFeedHash');
  const [nft,setNft] = useState("");
  // Fetch global NFT feed from IPFS
  const fetchNftFeed = async () => {
    const globalFeedHash = await fetchGlobalNftHash();
    if (!globalFeedHash) return;

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${globalFeedHash}`,{crossdomain:true,withCredentials: false});
      setNftFeed(response.data); // Set the global feed data
    } catch (error) {
      console.error("Error fetching NFT feed:", error);
    }
  };

  // useEffect(() => {
  //   fetchNftFeed();
  // }, [globalFeedHash]);
  useEffect(() => {
    const loadGlobalFeed = async () => {
        const globalFeedHash = await fetchGlobalNftHash();
        if (globalFeedHash) {
            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${globalFeedHash}`);
            setNftFeed(response.data); // Update state with fetched global feed
        }
    };

    loadGlobalFeed();
}, []);


  return (
    <div className="nft-feed">
        <Navigation/>
     <div className='feed_container'>
     <h2>Feed</h2>
     
     <div className="nft-cards">
      
      {nftFeed.length === 0 ? (
                    <p>No posts yet.</p>
                ) : (
                    nftFeed.map((nft, index) => (
                        <div key={index} className="nft-card">
                          <Link 
    to={`/nft/${nft.ImgHash}`} 
    state={{ nft }} 
    className="link_nft"
  >
                        <video  
            
            className='video'
            onMouseOver={event => event.target.play()}
            onMouseOut={event => event.target.pause()}
            >
        <source src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`} type="video/mp4"/>
    </video>
    <Link to={`/profile/${nft.creator}`} className='link_nft2'>  <h4>{truncateEthAddress(`${nft.creator}`)}</h4></Link>
                            <h3>{nft.name}</h3>
                            <p>{nft.desc}</p>
                            </Link>
                        </div>
                    ))
                )}
      </div>
      
     </div>
     
    </div>
  );
};

export default NftFeed;
