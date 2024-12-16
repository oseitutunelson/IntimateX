const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Get the contract factory
  const Nft = await ethers.getContractFactory("Nft");
  const Content = await ethers.getContractFactory("Content");

  // Define the parameters to pass to the constructor
  const name = "MyNft";
  const symbol = "NFT";
  const initialOwner = deployer.address;
  const priceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const contentContractAddress = "";

  console.log("Deploying Content contract...");
    const contentContract = await Content.deploy(priceFeedAddress, ethers.constants.AddressZero);
    await contentContract.deployed();

    console.log("Content Contract deployed to",await contentContract.address)

  // Deploy the contract with the constructor parameters
  console.log("Deploying NFT contract...");
  const nft = await Nft.deploy(name, symbol, initialOwner,contentContract.address,priceFeedAddress);

  // Wait for the contract to be deployed
  await nft.deployed();

  console.log("Nft deployed to:", await nft.address);

   // Update the Content contract with the NFT contract address
   const tx = await contentContract.setNftContract(nft.address);
   await tx.wait();
   console.log("NFT contract address updated in Content contract.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
