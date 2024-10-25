import {React,useState} from 'react';
import './App.css';
import { MintNft } from './components/mintNft';
import { UserNfts } from './components/nftsPage';
import { EditProfile } from './components/editProfile';
import Navigation from './components/Navigation';
import { useParams } from "react-router-dom";


export default function App(){
  const {walletAddress} = useParams();  

  return(
    <div className='App'>
    
        <Navigation/>
      <div className='profile'>
        <EditProfile/>
      </div>
      <div className='mint_nft'>
       <MintNft/>
      </div>
      <div className='nftsPage'>
        <UserNfts/>
      </div>
      
      
    </div>
  )
}