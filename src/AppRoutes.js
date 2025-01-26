import { Routes, Route } from "react-router-dom";
import  NftFeed  from "./components/Feed";
import { MintNft } from "./components/mintNft";
import Profile from "./components/profile";
import App from "./App";
import EditPage from "./components/editProfileProfile";
import NftDetail from "./components/NftDetail";
import { Subscription } from "./components/subscription";

function AppRoutes() {
    return (
      <div className="App">
        <Routes>
          <Route path="/" element={ <NftFeed/> } />
          <Route path="/creator/:walletAddress" element={ <App/> } />
          <Route path="/profile/:walletAddress" element={<Profile/>} />
          <Route path='/createcontent' element={<MintNft/>}/>
          <Route path='/editProfile/:walletAddress' element={<EditPage/>}/>
          <Route path="/nft/:id" element={<NftDetail/>}/>
          <Route path="/subscribe" element={<Subscription/>}/>
        </Routes>
      </div>
    )
  }
  
  export default AppRoutes