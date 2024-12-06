// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {PriceConvertor} from './PriceConvertor.sol';

contract Subscription {
    using PriceConvertor for uint256;

    mapping(address => mapping(address => uint256)) public subscriptions;
    mapping(address => uint256) public subscriptionRates;

    AggregatorV3Interface private s_priceFeed;


    constructor(address priceFeed) {
      s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function setSubscriptionRate(uint256 rate) external {
        subscriptionRates[msg.sender] = rate;
    }

    function subscribe(address creator) external payable {
        uint256 rate = subscriptionRates[creator];
        require(rate >= 0, "No subscription rate set");
        require(msg.value.getConversionRate(s_priceFeed) == rate, "Incorrect payment");

        uint256 currentExpiry = subscriptions[msg.sender][creator];
        uint256 newExpiry = block.timestamp > currentExpiry ? block.timestamp : currentExpiry;
        subscriptions[msg.sender][creator] = newExpiry + 30 days;

        payable(creator).transfer(msg.value);
    }

    function isSubscribed(address user, address creator) external view returns (bool) {
        return subscriptions[user][creator] > block.timestamp;
    }
}
