//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

import {PriceConvertor} from "./PriceConvertor.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Content{
    //set the price of a content using content id
    //buy content
    //allow users to access content only when purchased
    IERC721 public nftContract;

    using PriceConvertor for uint256;

    //errors
    error Content__PriceMustNotBeZero();
    error Content__ContentAlreadyPurchased();
    error Content__TransactionFailed();
    error Content__ContentPurchaseError();
    error Content__ContentIdDoesNotExist();

    //events
    event ContentPriceSet(address indexed owner,uint256 indexed price);

    mapping(address => mapping(uint256 => uint256)) public addressToContentToPrice;
    mapping(address => bool) public contentPurchased;
    mapping(address => uint256) public addressToContent;
    

    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeed,address nftContractAddress){
        s_priceFeed = AggregatorV3Interface(priceFeed);
        nftContract = IERC721(nftContractAddress);
    }

    function setContentPrice(uint256 content_id,uint256 price) public{
        if(price <= 0){
            revert Content__PriceMustNotBeZero();
        }
        addressToContentToPrice[msg.sender][content_id] = price.getConversionRate(s_priceFeed);
        addressToContent[msg.sender] = content_id;
        emit ContentPriceSet(msg.sender,price);
    }

    function buyContent(address owner,uint256 content_id) public payable{
        //check if content id exist
        if(nftContract.ownerOf(content_id) != owner){
           revert Content__ContentIdDoesNotExist();
        }
        //check if the content is already purchased
        if(contentPurchased[msg.sender] == true){
            revert Content__ContentAlreadyPurchased();
        }
        if(msg.value.getConversionRate(s_priceFeed) == addressToContentToPrice[owner][content_id]){
            contentPurchased[msg.sender] = true;
            (bool success,) = owner.call{value : msg.value.getConversionRate(s_priceFeed)}("");
           if(!success){
            revert Content__TransactionFailed();
           } 
        }
        else revert Content__ContentPurchaseError();
    }

    function setNftContract(address _nftContractAddress) external {
         nftContract = IERC721(_nftContractAddress);
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