import {React,useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import axios  from 'axios';
import '../styles/profile.css';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { fetchUserProfileHash , updateProfileHash } from './updateProfile';

export default function EditPage() {
    const [editForm , setEditForm] = useState(false);
    const [userProfileDetails,setUserProfileDetails] = useState(null);
    const {walletAddress} = useParams();
    const [username,setUsername] = useState('');
    const [description,setDescription] = useState('');
    const [profileImg, setProfileImg] = useState(null);
    const [coverImg, setCoverImg] = useState(null);
    const { address, isConnected } = useAppKitAccount()


    const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

    //fetch the users profile details
    const fetchUserProfileDetails = async () => {
      const userProfileDetails = await fetchUserProfileHash(address);
        if (!userProfileDetails) return []; // If no hash is stored, return empty array
  
        try {
          const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${userProfileDetails}`);
          return response.data; // Return user's NFT array
        } catch (error) {
          console.error("Error fetching user NFT array:", error);
          return [];
        }
      }
  
      //update user profile details
      const updateUserProfileArrayOnIPFS = async (newNftData) => {
        try {
          // Fetch the user's existing NFT array from IPFS
          const userProfile = await fetchUserProfileDetails();
    
          // Add the new NFT data to the array
          userProfile.push(newNftData);
    
          // Upload updated array to IPFS
          const res = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
            data: userProfile,
            headers: {
              'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
              'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
            },
          });
    
          // Return the new IPFS hash for the updated array
          const newUserProfileHash = res.data.IpfsHash;
          setUserProfileDetails(newUserProfileHash);
           // Update state with the new hash
           await updateProfileHash(newUserProfileHash);
          localStorage.setItem('savedProfileDetails', newUserProfileHash); // Save the hash in localStorage
    
          return newUserProfileHash;
        } catch (error) {
          console.error("Error updating user NFT array:", error);
        }
      };
  

     // Send JSON metadata to IPFS
     const sendJSONtoIPFS = async (profileHash, coverHash) => {
      try {
        const resJSON = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
          data: {
            "username": username,
            "description": description,
            "profile_image": profileHash,
            "cover_image": coverHash
          },
          headers: {
            'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
            'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
          },
        });
    
        const tokenURI = `${resJSON.data.IpfsHash}`;
        console.log("Token URI", tokenURI);
        localStorage.setItem('profileDetails', tokenURI);
    
        // Update the user's profile array on IPFS
        const newUserProfileHash = await updateUserProfileArrayOnIPFS({
          username,
          profile_image: profileHash,
          cover_image: coverHash,
          description
        });
        console.log("Updated profile array hash:", newUserProfileHash);
      } catch (error) {
        console.log("Error sending JSON to IPFS:", error);
      }
    };
    

  // Send file to IPFS
  const sendFileToIPFS = async (e) => {
    e.preventDefault();
  
    if (profileImg && coverImg) {
      try {
        const formDataProfile = new FormData();
        const formDataCover = new FormData();
  
        // Append profile photo
        formDataProfile.append("file", profileImg);
        const resProfile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formDataProfile,
          headers: {
            'pinata_api_key': `34285d0c475ef08f741a`,
            'pinata_secret_api_key': `a4cb2ed7de89a61ab079c78b29058dbdb63a675f9480823cc099ae5c813903b6`,
            "Content-Type": "multipart/form-data"
          },
        });
  
        // Append cover photo
        formDataCover.append("file", coverImg);
        const resCover = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formDataCover,
          headers: {
            'pinata_api_key': `34285d0c475ef08f741a`,
            'pinata_secret_api_key': `a4cb2ed7de89a61ab079c78b29058dbdb63a675f9480823cc099ae5c813903b6`,
            "Content-Type": "multipart/form-data"
          },
        });
  
        const profileImgHash = resProfile.data.IpfsHash;
        const coverImgHash = resCover.data.IpfsHash;
  
        console.log("Profile Image Hash:", profileImgHash);
        console.log("Cover Image Hash:", coverImgHash);
  
        // Send JSON metadata with both hashes to IPFS
        await sendJSONtoIPFS(profileImgHash, coverImgHash);
      } catch (error) {
        console.log("Error uploading files to IPFS:", error);
      }
    } else {
      console.error("Both profile photo and cover photo are required.");
    }
  };
  
  useEffect(() => {
    if (walletAddress) {
        console.log(walletAddress);
    }
}, [walletAddress]);


    const handleFormEdit = () =>{
        setEditForm(!editForm);
    }
    return (
       <div className='editPage'>
        <Navigation/>
        <div className='edit'>
        <Link to={`/creator/${address}`}><BiArrowBack className='mint_arrow'/></Link>
            <h3>Edit Profile</h3>
            <form className='edit_form' onSubmit={sendFileToIPFS}>
              <label htmlFor='profile_photo' className='file-upload'>upload profile photo</label>
              <input type='file' id='profile_photo' onChange={(e) => setProfileImg(e.target.files[0])} name='profile_photo'/>
              <label htmlFor='cover_photo' className='file-upload'>Upload Cover Photo</label>
              <input type='file' id='cover_photo' onChange={(e) => setCoverImg(e.target.files[0])} name='cover_photo'/>
              <label htmlFor='username' className='info'>Username</label>
              <input type='text' id='username' name='username' onChange={(e) => setUsername(e.target.value)} placeholder='username' required value={username}/>
              <label htmlFor='description' className='info'>Description</label>
              <textarea id='description' name='description' onChange={(e) => setDescription(e.target.value)} placeholder='description' value={description}></textarea>
              <button type='submit' onClick={handleFormEdit} className='form_button'>Save Changes</button>
        
            </form>
          </div>
       </div>
    )
}