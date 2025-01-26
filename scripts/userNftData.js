const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const Contract = await ethers.getContractFactory("UserNFTData");


  // Deploy the contract with the constructor parameters
  const contract = await Contract.deploy();

  // Wait for the contract to be deployed
  await contract.deployed();

  console.log("Contract deployed to:", await contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
