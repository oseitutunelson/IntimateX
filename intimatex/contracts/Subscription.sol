//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

import {PriceConvertor} from "./PriceConvertor.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


contract Subscription {
    using PriceConvertor for uint256;
    //errors
    error Subscription__NotSubscribed();
    error Subscription__MustPayCorrectAmount();
    error Subscription__AmountMustNotBeLessOrEqualToZero();

    struct Subscriber{
        address subscriber;
        bool subscribed;
    }

    //events
    event Subscribed(address indexed user,uint256 indexed price);

    // Mapping of user addresses to their subscription status
    mapping(address => Subscriber) public subscriptions;

    uint256 public constant SUBSCRIPTION_PRICE = 5e18;
    address private owner;
    address [] public subscribers;
    AggregatorV3Interface private s_priceFeed;


    constructor(address priceFeed){
    s_priceFeed = AggregatorV3Interface(priceFeed);
    owner = msg.sender;
   }

    function subscribe() public payable{
        if(msg.value <= 0){
            revert Subscription__AmountMustNotBeLessOrEqualToZero();
        }
        require(msg.value.getConversionRate(s_priceFeed) >= SUBSCRIPTION_PRICE,"Insufficient Amount");
        require(subscriptions[msg.sender].subscribed == false,"Already Subscribed");

        (bool success,) = payable(owner).call{value : msg.value}("");
        require(success,"transaction failed");
        subscriptions[msg.sender] = Subscriber({
            subscriber : msg.sender,
            subscribed : true
    });
    subscribers.push(msg.sender);
    }

    //getter functions
    function getSubscriber(address user) public view returns (bool){
        return subscriptions[user].subscribed;
    }
    // Get the current ETH price in USD from Chainlink Price Feed
    function getEthPrice() public view returns (uint256) {
    (, int256 price,,,) = s_priceFeed.latestRoundData();
    return uint256(price * 1e10); // Convert to 18 decimal places
}

// Calculate the required ETH amount for the subscription price
   function getRequiredEthForSubscription() public view returns (uint256) {
    uint256 ethPrice = getEthPrice();
    return (SUBSCRIPTION_PRICE * 1e18) / ethPrice; // Convert USD to ETH amount
}

}