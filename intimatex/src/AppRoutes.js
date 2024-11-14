import { Routes, Route } from "react-router-dom";
import  NftFeed  from "./components/Feed";
import { MintNft } from "./components/mintNft";
import Profile from "./components/profile";
import App from "./App";

function AppRoutes() {
    return (
      <div className="App">
        <Routes>
          <Route path="/" element={ <NftFeed/> } />
          <Route path="/creator/:walletAddress" element={ <App/> } />
          <Route path="/profile/:walletAddress" element={<Profile/>} />
          <Route path='/createcontent' element={<MintNft/>}/>
        </Routes>
      </div>
    )
  }
  
  export default AppRoutes