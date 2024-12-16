const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const Contract = await ethers.getContractFactory("Content");

  const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  // Deploy the contract with the constructor parameters
  const contract = await Contract.deploy(priceFeedAddress);

  // Wait for the contract to be deployed
  await contract.deployed();

  console.log("Contract deployed to:", await contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
