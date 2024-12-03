import { React , useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import '../styles/profile.css';
import Navigation from "./Navigation";

export default function Profile(){
   const {walletAddress} = useParams();
   const [nftArray , setNftArray] = useState([]);
   const [profileArray , setProfileArray] = useState([])

   const fetchProfile = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedProfileHash = localStorage.getItem('profileDetails');
        const userIpfsHash = savedProfileHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`,{withCredentials: false});
        const userProfileDetails = [];
        userProfileDetails.push(response.data);
        setProfileArray(userProfileDetails);
        console.log(userProfileDetails) // Assuming the response data is the array of NFTs

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};

const fetchUserContentFromIPFS = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedNftHash = localStorage.getItem('userNftHash');
        const userIpfsHash = savedNftHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`,{withCredentials: false});
        setNftArray(response.data); // Assuming the response data is the array of NFTs

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};



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
          <div className='cover_photo'>
            <h3>mateX</h3>  
          </div>
         <div className='profile_details'>
          {profileArray.length === 0 ? (
           <>
            <div className='profile_photo'>
            <img src='' alt=''/>
         </div>
         <div className='profile_info'>
           <h3>Username</h3>
           <p>description bbweub bfjbeufbuwef fbweugew bfuewu</p>
         </div>
           </>
          ) : (
            profileArray.map((profile,index) => (
              <>
               <div className='profile_photo'>
            <img src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${profile.profile_image}`} alt=''/>
         </div>
         <div className='profile_info'>
           <h3>{profile.username}</h3>
           <p>{profile.description}</p>
         </div>
              </>
            ))
          )}
         
         </div>
        </div>
        <div className='content'>
            <h3>Posts</h3>
            <div className="nft-container">
                {nftArray.length === 0 ? (
                    <p>No Content uploaded.</p>
                ) : (
                    nftArray.map((nft, index) => (
                        <div key={index} className="nft-item">
                            <video width='500px' height='400px' >
                    <source src={`https://emerald-fancy-gerbil-824.mypinata.cloud/ipfs/${nft.ImgHash}`} type="video/mp4" />
                </video>
                            <h3>{nft.name}</h3>
                            <p>{nft.desc}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
   )
}