require("@nomicfoundation/hardhat-toolbox");
require('@nomiclabs/hardhat-ethers');
require('hardhat-deploy');
require('dotenv').config();

const {SEPOLIA_PRIVATE_KEY,ANVIL_PRIVATE_KEY,POLYGON_AMOY} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
        url: `https://eth-sepolia.g.alchemy.com/v2/WTBOkUzsPcn1JkfHsmYlHEHBu3u3AUu2`,
        accounts: [`0x${SEPOLIA_PRIVATE_KEY}`]
     },
  //  anvil:{
  //   url: "http://127.0.0.1:8545",
  //   accounts: [`0x${ANVIL_PRIVATE_KEY}`]
  //  },
  //  polygon :{
  //   url : "https://polygon-amoy.g.alchemy.com/v2/-RjLFHEFjCuQWlI2knoR4O8kmeybmE3M",
  //   accounts : [`0x${POLYGON_AMOY}`]
  //  }
}
};
