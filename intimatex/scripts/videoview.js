const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const Contract = await ethers.getContractFactory("VideoViews");

  // Define the parameters to pass to the constructor
  //const initialOwner = deployer.address;

  // Deploy the contract with the constructor parameters
  const contract = await Contract.deploy();

  // Wait for the contract to be deployed
  await contract.deployed();

  console.log("Token deployed to:", await contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
