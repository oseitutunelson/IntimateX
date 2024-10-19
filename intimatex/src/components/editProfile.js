import {React , useState, useEffect} from 'react';
import '../styles/profile.css';
import tech from '../images/technology.png';
import axios from 'axios';
import { ethers } from 'ethers';

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

    //send profile details to ipfs
    // Send JSON metadata to IPFS
  const sendJSONtoIPFS = async (ProfileHash) => {
    try {
      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        data: {
          "username": username,
          "description": description,
          "profile_image": ProfileHash,
          "cover_url" : ''
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
        formData.append("file", profileImg);

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': `${REACT_APP_PINATA_API_KEY}`,
            'pinata_secret_api_key': `${REACT_APP_PINATA_API_SECRET}`,
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

  // Get user's Ethereum address
  const getUserAddress = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return await signer.getAddress();
  };


    const handleFormEdit = () => {
      setEditForm(!editForm);
    }
  
    useEffect(() => {
      const initialize = async () => {
        const address = await getUserAddress();
        setUserAddress(address);
  
        // Fetch user's NFT array from IPFS on page load
        if (address && userProfileDetails) {
          await fetchUserProfileDetails();
        }
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
              const address = await signer.getAddress();
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
          <div className='profile_edit'>
            <button onClick={handleFormEdit}>Edit Profile</button>
          </div>
          <div className={editForm ? 'edit' : 'profile_edit_edit'}>
            <h3>Edit Profile</h3>
            <form className='edit_form' onSubmit={sendFileToIPFS}>
              <h3 onClick={handleFormEdit}>X</h3>
              <label htmlFor='profile_photo' className='file-upload'>upload profile photo</label>
              <input type='file' id='profile_photo' onChange={(e) => setProfileImg(e.target.files[0])} name='profile_photo'/>
              <label htmlFor='username' className='info'>Username</label>
              <input type='text' id='username' name='username' onChange={(e) => setUsername(e.target.value)} placeholder='username' required value={username}/>
              <label htmlFor='description' className='info'>Description</label>
              <textarea id='description' name='description' onChange={(e) => setDescription(e.target.value)} placeholder='description' value={description}></textarea>
              <button type='submit' onClick={handleFormEdit}>Save Changes</button>
            </form>
          </div>
        </div>
        
    )
}