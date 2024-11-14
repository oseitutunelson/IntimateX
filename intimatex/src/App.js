import {React,useState} from 'react';
import './App.css';
import { MintNft } from './components/mintNft';
import { UserNfts } from './components/nftsPage';
import { EditProfile } from './components/editProfile';
import Navigation from './components/Navigation';
import { Link, useParams } from "react-router-dom";


export default function App(){
  const {walletAddress} = useParams();  

  return(
    <div className='App'>
    
        <Navigation/>
      <div className='profile'>
        <EditProfile/>
      </div>
      <div className='mint_nft'>
    <Link to='/createcontent'> <button className='content_button'>create content</button></Link>  
      </div>
      <div className='nftsPage'>
        <UserNfts/>
      </div>
      
      
    </div>
  )
}