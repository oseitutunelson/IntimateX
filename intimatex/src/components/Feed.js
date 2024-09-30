import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import '../styles/feed.css';


const NftFeed = () => {
  const [nftFeed, setNftFeed] = useState([]);
  const globalFeedHash = localStorage.getItem('globalFeedHash');
  // Fetch global NFT feed from IPFS
  const fetchNftFeed = async () => {
    
    if (!globalFeedHash) return;

    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${globalFeedHash}`);
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
      <h2>Feed</h2>
     <div className='feed_container'>
     <div className="nft-cards">
      {nftFeed.length === 0 ? (
                    <p>No NFTs found.</p>
                ) : (
                    nftFeed.map((nft, index) => (
                        <div key={index} className="nft-card">
                            <img src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`} alt={nft.name} className='nft-image'/>
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
