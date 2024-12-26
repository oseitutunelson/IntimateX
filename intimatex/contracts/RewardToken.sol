// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
/**
 * @title Reward Token contract
 * @author Owusu Nelson Osei Tutu
 * @notice This contract contains the code for the reward token used to reward users 
 */


contract RewardToken is ERC20{
    address public owner;

    uint256 public rewardAmount = 10 * 10**18;  // 10 tokens with 18 decimals
    uint256 public rewardInterval = 1 days;     // 1 day interval for reward

   // mapping (address => uint256) private balanceOf;
    mapping (address => uint256) public lastRewarded;  // Track the last reward time for each user

    event Approve(address indexed from, address indexed to, uint256 indexed amount);
    event Rewarded(address indexed user, uint256 indexed amount);

    constructor() ERC20("MateX","MTX"){
        _mint(msg.sender,1000000000000000000000000000000);
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

     // Function to allow the owner to mint more tokens if needed
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Reward user with tokens, ensuring it's only once per day
    function rewardUser(address _user) public returns (bool success) {
        require(msg.sender == owner, "Only owner can reward");
        require(balanceOf(owner) >= rewardAmount, "Insufficient reward balance for the owner");
        require(block.timestamp >= lastRewarded[_user] + rewardInterval, "Reward already claimed today");
        
        transfer(_user, rewardAmount);
        uint256 a = balanceOf(_user); 
        a += rewardAmount;
        uint256 b = balanceOf(owner); 
        b -= rewardAmount;
        lastRewarded[_user] = block.timestamp;

        emit Rewarded(_user, rewardAmount);
        emit Transfer(owner, _user, rewardAmount);
        return true;
    }

    function reward(uint256 amount,address user) public returns (bool success){
        require(amount > 0, "Reward amount must be greater than 0");
        require(msg.sender == owner, "Only owner can reward");
        require(balanceOf(owner) >= amount,"insufficient amount");
        
        transfer(user, amount);
        uint256 a = balanceOf(user); 
        a += amount;
        uint256 b = balanceOf(owner); 
        b -= amount;

        emit Rewarded(user, amount);
        emit Transfer(owner, user, amount);
        return true;

    }

    function checkRewardEligibility(address _user) public view returns (bool) {
        return block.timestamp >= lastRewarded[_user] + rewardInterval;
    }

    function getbalanceOf(address account) public view returns (uint256) {
    return balanceOf(account);
}

}
