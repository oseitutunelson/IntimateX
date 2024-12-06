//SPDX-License-Identifier: MIT

 
pragma solidity ^0.8.18;

//import contract ABI from github
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConvertor{
    //function to get pricefeed
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256){
        //Address 0x694AA1769357215DE4FAC081bf1f309aDC325306
        //get latest price feed
        (,int256 price,,,) = priceFeed.latestRoundData();

        return uint256(price * 1e18);
    }

    //convert eth amount to usd
    function getConversionRate(uint256 ethAmount,AggregatorV3Interface priceFeed) internal view returns (uint256){
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }

    //function to getversion
    function getVersion() internal view returns(uint256){
        return AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306).version();
    }
} 