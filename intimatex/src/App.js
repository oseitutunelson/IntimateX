import {React,useState} from 'react';
import './App.css';
import {ethers} from 'ethers';
import truncateEthAddress from 'truncate-eth-address';
import { MintNft } from './components/mintNft';
import { UserNfts } from './components/nftsPage';
import { Link } from "react-router-dom";
import { EditProfile } from './components/editProfile';

export default function App(){
  const [wallet , setWallet] = useState("");

  //connect wallet
  const connect = async() => {
    try {
        if (!window.ethereum) {
          alert("MetaMask is not installed!");
          return;
        }
  
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log(address);
        setWallet(address)
    }catch(error){
        console.log(error);
    }
}


  return(
    <div className='App'>
      <div className='navigation'>
       <Link to='/' className='app_link'><h3>intimateX</h3></Link>
      {
        wallet ?  <p>wallet: {`${truncateEthAddress(wallet)}`}</p> : <button onClick={connect}>connect wallet</button>
      }  
      </div>
      <div className='profile'>
        <EditProfile/>
      </div>
      <div className='mint_nft'>
       
      </div>
      <div className='nftsPage'>
        <UserNfts/>
      </div>
    </div>
  )
}