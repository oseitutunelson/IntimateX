//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

/**
 * @title  Nft  Contract
 * @author Owusu Nelson Osei Tutu
 * @notice A nft contract with additional features 
 */

import {ERC721URIStorage,ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Nft is ERC721URIStorage,Ownable{
    
     //nft data structure
    struct NFT{
        uint256 tokenId;
        address creator;
        string tokenURI;
        uint256 price;
        bool isOneTimeSale;
        mapping(address => bool) hasAccess; // Track who has access
    }

    NFT[] public nftFeed; // Store all NFTs in a global feed

    mapping(uint256 => NFT) public nfts;

   constructor(string memory name, string memory symbol,address initialOwner) ERC721(name,symbol) Ownable(initialOwner){
   }

   /**
    *   Functions
    */

   //mint function
   function mint(address _to,uint256 tokenId,string calldata _uri,uint256 price, bool isOneTimeSale) external{
     _mint(_to,tokenId);
     _setTokenURI(tokenId,_uri);

        NFT storage newNFT = nfts[tokenId];

        newNFT.tokenId = tokenId;
        newNFT.creator = msg.sender;
        newNFT.tokenURI = _uri;
        newNFT.price = price;
        newNFT.isOneTimeSale = isOneTimeSale;
   }

   function purchaseNFT(uint256 tokenId) public payable {
        NFT storage nft = nfts[tokenId];
        require(msg.value >= nft.price, "Insufficient funds");
        require(!nft.hasAccess[msg.sender], "Already purchased");
        nft.hasAccess[msg.sender] = true; // Grant access to the buyer
        // Transfer funds to the creator
        payable(nft.creator).transfer(msg.value);
    }

    function checkAccess(uint256 tokenId, address user) public view returns (bool) {
        return nfts[tokenId].hasAccess[user];
    }


     /** Getter Functions */
     // Get the entire feed

    //get Price of nft
    
}