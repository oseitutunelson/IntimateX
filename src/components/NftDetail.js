import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/nftDetail.css';
import truncateEthAddress from 'truncate-eth-address';
import { Link } from 'react-router-dom';

const NftDetail = () => {
  const location = useLocation();
  const nft = location.state?.nft; // Access the NFT data passed via Link

  if (!nft) {
    return <p>No NFT data available</p>; // Handle cases where no data is passed
  }

  return (
    <div className="nft-detail">
      <div className="video-container">
        <video controls autoPlay className="nft-video">
          <source src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`} type="video/mp4" />
        </video>
      </div>
      <div className="nft-info">
        <h1>{nft.name}</h1>
        <p>{nft.desc}</p>
        <Link to={`/profile/${nft.creator}`} className="link_nft">
          <p>Creator: {truncateEthAddress(`${nft.creator}`)}</p>
        </Link>
      </div>
    </div>
  );
};

export default NftDetail;
