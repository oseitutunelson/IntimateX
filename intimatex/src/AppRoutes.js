import { Routes, Route } from "react-router-dom";
import  NftFeed  from "./components/Feed";
import { MintNft } from "./components/mintNft";
import App from "./App";

function AppRoutes() {
    return (
      <div className="App">
        <Routes>
          <Route path="/" element={ <NftFeed/> } />
          <Route path="creator" element={ <App/> } />
        </Routes>
      </div>
    )
  }
  
  export default AppRoutes