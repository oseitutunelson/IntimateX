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
    
    /**
     * @dev mappings for community engagements
     */
   // mapping (address => uint256) private balanceOf;
    mapping (address => uint256) public lastRewarded;  // Track the last reward time for each user
    mapping (address => mapping(string => uint256)) public nftViews; //track how many views on a content
    mapping (address => mapping(string => uint256)) public lastRewardedViews; //track the last time reward was given

    event Approve(address indexed from, address indexed to, uint256 indexed amount);
    event Rewarded(address indexed user, uint256 indexed amount);
    event ViewsIncremented(address indexed creator, string imgHash, uint256 totalViews);

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
    
    //normal reward function for sending tokens to creators and fans
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
    
    //check if user is eligible to receive rewards
    function checkRewardEligibility(address _user) public view returns (bool) {
        return block.timestamp >= lastRewarded[_user] + rewardInterval;
    }

    //reward for incrementing views
    function incrementViews(address creator, string memory imgHash) external {
    nftViews[creator][imgHash] += 1;

    emit ViewsIncremented(creator, imgHash, nftViews[creator][imgHash]);

    if (nftViews[creator][imgHash] - lastRewardedViews[creator][imgHash] >= 100) {
        reward(rewardAmount,creator);
        lastRewardedViews[creator][imgHash] = nftViews[creator][imgHash];
    }
}

    /**
     * 
     * Getter Functions
     */
    function getViews(address creator,string memory imgHash) public view returns (uint256){
        return nftViews[creator][imgHash];
    }

    function getbalanceOf(address account) public view returns (uint256) {
    return balanceOf(account);
}

}
