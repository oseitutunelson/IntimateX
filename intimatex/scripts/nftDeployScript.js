const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const Nft = await ethers.getContractFactory("Nft");
  

  // Define the parameters to pass to the constructor
  const name = "MateX";
  const symbol = "MTX";
  const initialOwner = deployer.address;

  // Deploy the contract with the constructor parameters
  console.log("Deploying NFT contract...");
  const nft = await Nft.deploy(name, symbol, initialOwner);

  // Wait for the contract to be deployed
  await nft.deployed();

  console.log("Nft deployed to:", await nft.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
