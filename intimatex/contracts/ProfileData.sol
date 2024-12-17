//SPDX-License-Identifier:MIT

pragma solidity ^0.8.19;

contract ProfileData {

    //events
    event UpdatedHash(address indexed user,string hash);
    
    //all user profile hash
    string public s_globalProfileHash;

    mapping(address => string) private userProfileHashes;

    function updateProfileHash(string memory newHash) public{
       userProfileHashes[msg.sender] = newHash;
       s_globalProfileHash = newHash;
       emit UpdatedHash(msg.sender,newHash);
    }

    function fetchUserProfileHash(address user) public view returns (string memory){
        return userProfileHashes[user];
    }

    function getAllProfiles() public view returns (string memory){
        return s_globalProfileHash;
    }
}