// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VideoViews {
    struct VideoData {
        string ipfsHash; // IPFS hash of view data
        uint256 views;   // Total views (optional, for redundancy)
    }

    mapping(string => VideoData) public videos; // Mapping from video ID to data

    // Function to update IPFS hash and views
    function updateViewData(string memory videoId, string memory newIpfsHash) public {
        videos[videoId].ipfsHash = newIpfsHash;
    }

    // Function to fetch video data
    function getVideoData(string memory videoId) public view returns (string memory, uint256) {
        VideoData memory video = videos[videoId];
        return (video.ipfsHash, video.views);
    }
}
