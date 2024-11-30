import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import '../styles/mint.css';

export const UserNfts = () => {
    const [userAddress, setUserAddress] = useState(null);
    const [nftArray, setNftArray] = useState([]);
    const savedNftHash = localStorage.getItem('userNftHash');

    const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

    

    // Function to fetch the user's NFT metadata array from IPFS
    const fetchUserNftsFromIPFS = async () => {
        if(!savedNftHash) return;
        try {

            const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${savedNftHash}`,{crossdomain : true,headers: { 'Content-Type': 'application/x-www-form-urlencoded' }});
            setNftArray(response.data); // Assuming the response data is the array of NFTs

        } catch (error) {
            console.log("Error fetching user's NFTs from IPFS:", error);
        }
    };

    // Call the function to load the user's NFTs when the component is mounted
    useEffect(() => {
    fetchUserNftsFromIPFS();
        
    }, [savedNftHash]);

    return (
        <div className='content'>
            <h3>Posts</h3>
            <div className="nft-container">
                {nftArray.length === 0 ? (
                    <p>No Content uploaded.</p>
                ) : (
                    nftArray.map((nft, index) => (
                        <div key={index} className="nft-item">
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
    );
};
