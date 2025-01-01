import {React,useEffect,useState} from 'react';
import './App.css';
import { MintNft } from './components/mintNft';
import { UserNfts } from './components/nftsPage';
import { EditProfile } from './components/editProfile';
import Navigation from './components/Navigation';
import { Link, useParams } from "react-router-dom";
import contractAbi from './contracts/NFT.sol/Nft.json';
import { ethers } from 'ethers';
import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";


export default function App(){
  const {walletAddress} = useParams(); 
  const { address, isConnected } = useAppKitAccount()
  const [creatorEarnings,setCreatorEarnings] = useState(0)
 
  const contractAddress = "0xb25C625657B05BD4d5230765d59811AEFf103D87";


  useEffect(() => {
    const getCreatorEarnings = async() =>{
    try {
      if(!window.ethereum)
      {
        console.log('No wallet detected');
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress,contractAbi.abi,signer);

      const earnings = await contract.getCreatorEarnings(address);
      return earnings;
      setCreatorEarnings(earnings);
      console.log(earnings);
    } catch (error) {
      console.log('Could not fetch earnings',error);
    }
  }
  getCreatorEarnings();
  })
  

  return(
    <div className='App'>
    
        <Navigation/>
      <div className='profile'>
        <EditProfile/>
      </div>
      <div className='mint_nft'>
    <Link to='/createcontent'> <button className='content_button'>create content</button></Link> 
    <div className='earnings'>
            <h2>Earnings</h2>
            <p>{creatorEarnings} ETH</p>
            </div> 
      </div>
      <div className='nftsPage'>
        <UserNfts/>
      </div>
      
      
    </div>
  )
}