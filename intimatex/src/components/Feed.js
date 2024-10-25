import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import '../styles/feed.css';
import truncateEthAddress from 'truncate-eth-address';
import { Link } from 'react-router-dom';

const NftFeed = () => {
  const [nftFeed, setNftFeed] = useState([]);
  const globalFeedHash = localStorage.getItem('globalFeedHash');
  // Fetch global NFT feed from IPFS
  const fetchNftFeed = async () => {
    
    if (!globalFeedHash) return;

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${globalFeedHash}`,{crossdomain:true});
      setNftFeed(response.data); // Set the global feed data
    } catch (error) {
      console.error("Error fetching NFT feed:", error);
    }
  };

  useEffect(() => {
    fetchNftFeed();
  }, [globalFeedHash]);

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
                        <Link to={`/profile/${nft.creator}`} className='link_nft'>  <h4>{truncateEthAddress(`${nft.creator}`)}</h4></Link>
                        <video width="500px" 
           height="400px" 
           controls="controls">
        <source src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`} type="video/mp4"/>
    </video>
                            <h3>{nft.name}</h3>
                            <p>{nft.desc}</p>
                        </div>
                    ))
                )}
      </div>
     </div>
    </div>
  );
};

export default NftFeed;
