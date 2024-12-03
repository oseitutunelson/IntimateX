import {React,useState,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import axios  from 'axios';
import '../styles/profile.css';
import Navigation from './Navigation';
import { Link } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";


export default function EditPage() {
    const [editForm , setEditForm] = useState(false);
    const [userProfileDetails,setUserProfileDetails] = useState(null);
    const {walletAddress} = useParams();
    const [username,setUsername] = useState('');
    const [description,setDescription] = useState('');
    const [profileImg, setProfileImg] = useState(null);
    const { address, isConnected } = useAppKitAccount()


    const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_API_SECRET } = process.env;

    //fetch the users profile details
    const fetchUserProfileDetails = async () => {
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
          setUserProfileDetails(newUserProfileHash); // Update state with the new hash
          localStorage.setItem('savedProfileDetails', newUserProfileHash); // Save the hash in localStorage
    
          return newUserProfileHash;
        } catch (error) {
          console.error("Error updating user NFT array:", error);
        }
      };
  

     // Send JSON metadata to IPFS
  const sendJSONtoIPFS = async (ProfileHash) => {
    try {
      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: {
          "username": username,
          "description": description,
          "profile_image": ProfileHash
        },
        headers: {
          'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
          'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
        },
      });

      const tokenURI = `${resJSON.data.IpfsHash}`;
      console.log("Token URI", tokenURI);
      localStorage.setItem('profileDetails',tokenURI);


      // Update the user's profile array on IPFS
      const newUserProfileHash = await updateUserProfileArrayOnIPFS({ username, ProfileHash, description });
      console.log("Updated profile array hash:", newUserProfileHash);
    } catch (error) {
      console.log("Error sending JSON to IPFS:", error);
    }
  };

  // Send file to IPFS
  const sendFileToIPFS = async (e) => {
    e.preventDefault();

    if (profileImg) {
      try {
        const formData = new FormData();
        formData.append("file",profileImg);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': `34285d0c475ef08f741a`,
            'pinata_secret_api_key': `a4cb2ed7de89a61ab079c78b29058dbdb63a675f9480823cc099ae5c813903b6`,
            "Content-Type": "multipart/form-data"
          },
        });

        const ImgHash = resFile.data.IpfsHash;
        console.log("Image Hash:", ImgHash);

        // Send JSON metadata to IPFS
        await sendJSONtoIPFS(ImgHash);
      } catch (error) {
        console.log("Error uploading file to IPFS:", error);
      }
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