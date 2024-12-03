import {React , useState, useEffect} from 'react';
import '../styles/profile.css';
import tech from '../images/technology.png';
import axios from 'axios';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';

export const EditProfile = () => {
    const [editForm , setEditForm] = useState(false);
    const [userProfileDetails,setUserProfileDetails] = useState(null);
    const [username,setUsername] = useState('');
    const [description,setDescription] = useState('');
    const [profileImg, setProfileImg] = useState(null);
    const [coverImg, setCoverImg] = useState(null);
    const [address,setUserAddress] = useState('');
    const [profileArray, setProfileArray] = useState([])

    const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

   
  // Get user's Ethereum address
  const getUserAddress = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return (await signer).getAddress();
  };

    useEffect(() => {
      const initialize = async () => {
        const address = await getUserAddress();
        setUserAddress(address);
      };
  
      const storedHash = localStorage.getItem('savedProfileDetails');
      if (storedHash) {
        setUserProfileDetails(storedHash); // Load from localStorage if available
      }
  
      initialize();
    }, []);  

    useEffect(() => {
      const fetchUserAddress = async () => {
          if (window.ethereum) {
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              const signer = provider.getSigner();
              const address = (await signer).getAddress();
              setUserAddress(address);
          }
      };

      fetchUserAddress();
  }, []);

  const fetchUserProfileFromIPFS = async () => {
    try {
        // `userIpfsHash` is the IPFS hash where the user's array is stored
        const savedProfileHash = localStorage.getItem('profileDetails');
        const userIpfsHash = savedProfileHash; // This should be dynamically retrieved per user

        const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userIpfsHash}`,{crossdomain : true});
        const userProfileDetails = [];
        userProfileDetails.push(response.data);
        setProfileArray(userProfileDetails);
        console.log(userProfileDetails) // Assuming the response data is the array of NFTs

    } catch (error) {
        console.log("Error fetching user's NFTs from IPFS:", error);
    }
};

useEffect(() => {
  if (address) {
      fetchUserProfileFromIPFS();
  }
}, [address]);

  
    return(
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
           <p>Description</p>
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
          <div className='profile_edit'>
           <Link to={`/editProfile/${address}`}> <button>Edit Profile</button></Link>
          </div>
          
        </div>
        
    )
}