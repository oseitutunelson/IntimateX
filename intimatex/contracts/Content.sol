//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

contract Content{
    //set the price of a content using content id
    //buy content
    //allow users to access content only when purchased
    //errors
    error Content__PriceMustNotBeZero();
    error Content__ContentAlreadyPurchased();
    error Content__TransactionFailed();
    error Content__ContentPurchaseError();

    //events
    event ContentPriceSet(address indexed owner,uint256 indexed price);

    mapping(address => mapping(uint256 => uint256)) public addressToContentToPrice;
    mapping(address => bool) public contentPurchased;
    mapping(address => uint256) public addressToContent;
    

    function setContentPrice(uint256 content_id,uint256 price) public{
        if(price <= 0){
            revert Content__PriceMustNotBeZero();
        }
        addressToContentToPrice[msg.sender][content_id] = price;
        addressToContent[msg.sender] = content_id;
        emit ContentPriceSet(msg.sender,price);
    }

    function buyContent(address owner,uint256 content_id) public payable{
        //check if the content is already purchased
        if(contentPurchased[msg.sender] == true){
            revert Content__ContentAlreadyPurchased();
        }
        if(msg.value == addressToContentToPrice[owner][content_id]){
            contentPurchased[msg.sender] = true;
            (bool success,) = owner.call{value : msg.value}("");
           if(!success){
            revert Content__TransactionFailed();
           } 
        }
        else revert Content__ContentPurchaseError();
    }

    //getter functions
    function getContentPrice(address owner,uint256 content_id) public view returns(uint256){
        return addressToContentToPrice[owner][content_id];
    }

    function getContentAccess(address user) public view returns (bool){
        return contentPurchased[user];
    }

    function getContentId(address user) public view returns (uint256){
        return addressToContent[user];
    }
}