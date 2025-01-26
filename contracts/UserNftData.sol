// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract UserNFTData {

    //global nfts hash
    string private s_globalNftHash;

    // Mapping to store user-specific NFT hashes
    mapping(address => string) private userNftHashes;

    // Event to emit when a new hash is set
    event NftHashUpdated(address indexed user, string newHash);

    // Function to update the NFT hash for a user
    function updateUserNftHash(string memory newHash) public {
        userNftHashes[msg.sender] = newHash;
        s_globalNftHash = newHash;
        emit NftHashUpdated(msg.sender, newHash);
    }

    // Function to retrieve the NFT hash for a user
    function getUserNftHash(address user) public view returns (string memory) {
        return userNftHashes[user];
    }

    //function to get all nfts 
    function getAllNfts() public view returns (string memory) {
        return s_globalNftHash;
    }
}
