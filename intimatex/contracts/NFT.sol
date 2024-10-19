//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

/**
 * @title  Nft  Contract
 * @author Owusu Nelson Osei Tutu
 * @notice A nft contract with additional features such as tokenURI
 */

import {ERC721URIStorage,ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Nft is ERC721URIStorage,Ownable{
    struct NftData {
        uint256 tokenId;
        string name;
        string description;
        string image;
        address creator;
    }

    NftData[] public nftFeed; // Store all NFTs in a global feed

   struct NFT{
     uint256 tokenId;
   }

    mapping(address => uint256) private _nftsMinted;
    mapping(address => uint256) private _nftsOwned;
    mapping (address => mapping (uint256 => NFT)) private tokenOfOwnerByIndexMapping;

   constructor(string memory name, string memory symbol,address initialOwner) ERC721(name,symbol) Ownable(initialOwner){}

   function mint(address _to,uint256 tokenId,string calldata _uri) external{
     _mint(_to,tokenId);
     _setTokenURI(tokenId,_uri);
      
      for(uint i = 0;i < balanceOf(msg.sender);i++){
            tokenOfOwnerByIndexMapping[_to][i] = NFT({
                tokenId : tokenId
            });
        }
      // Track NFTs minted
        _nftsMinted[_to] += 1;
        // Track NFTs owned
        _nftsOwned[_to] += 1;

         NftData memory newNft = NftData(tokenId, "Name", "Description", "ImageHash", msg.sender);
        nftFeed.push(newNft);
   }

    // Get the number of NFTs minted by an address
    function nftsMinted(address owner) external view returns (uint256) {
        return _nftsMinted[owner];
    }

    // Get the number of NFTs owned by an address
    function nftsOwned(address owner) external view returns (uint256) {
        return _nftsOwned[owner];
    }

    function tokenOfOwnerByIndex(address _owner,uint256 _index) public view returns (uint256){
        return tokenOfOwnerByIndexMapping[_owner][_index].tokenId;
    }

     // Get the entire feed
    function getNftFeed() public view returns (NftData[] memory) {
        return nftFeed;
    }
}