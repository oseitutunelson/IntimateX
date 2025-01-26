// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenSale {
    address public owner;
    IERC20 public token;
    uint256 public price; // Price per token in wei

    event TokensPurchased(address buyer, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor(IERC20 _token, uint256 _price) {
        owner = msg.sender;
        token = _token;
        price = _price;
    }

    function buyTokens(uint256 amount) public payable {
        require(msg.value == amount * price, "Incorrect payment amount");
        require(token.balanceOf(address(this)) >= amount, "Not enough tokens available");

        token.transfer(msg.sender, amount);
        emit TokensPurchased(msg.sender, amount);
    }

    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function withdrawUnsoldTokens() public onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(owner, balance);
    }
}
