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
    }


 // Store all NFTs in a global feed
    uint256 [] public nftFeed;
     // Track who has access
     // Store access control: tokenId => user => access status
    mapping(uint256 => mapping(address => bool)) public hasAccess; 
    mapping(uint256 => NFT) public nfts;
    mapping(address => uint256) public addressToEarnings;

   constructor(string memory name, string memory symbol,address initialOwner) ERC721(name,symbol) Ownable(initialOwner){
   }

   /**
    *   Functions
    */

   //mint function
   function mint(address _to,uint256 tokenId,string calldata _uri,uint256 price) external{
     _mint(_to,tokenId);
     _setTokenURI(tokenId,_uri);

        NFT storage newNFT = nfts[tokenId];

        newNFT.tokenId = tokenId;
        newNFT.creator = msg.sender;
        newNFT.tokenURI = _uri;
        newNFT.price = price;

         // Add to the global feed
        nftFeed.push(tokenId);
   }

   function purchaseNFT(uint256 tokenId) public payable {
        NFT storage nft = nfts[tokenId];
        require(msg.value >= nft.price, "Insufficient funds");
        require(!hasAccess[tokenId][msg.sender], "Already purchased");
        hasAccess[tokenId][msg.sender] = true; // Grant access to the buyer
        // Transfer funds to the creator
        payable(nft.creator).transfer(msg.value);
        addressToEarnings[nft.creator] += msg.value;
    }

    function checkAccess(uint256 tokenId, address user) public view returns (bool) {
        return hasAccess[tokenId][user];
    }

     /** Getter Functions */
     /**
     * @dev Get the entire feed of NFTs
     */
    function getNftFeed() public view returns (uint256[] memory) {
        return nftFeed;
    }

    function getCreatorEarnings(address creator) public view returns (uint256){
        return addressToEarnings[creator];
    }

    
    
}