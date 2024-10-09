// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Reward Token contract
 * @author Owusu Nelson Osei Tutu
 * @notice This contract contains the code for the reward token used to reward users 
 */


contract RewardToken {
    string public name = 'MateX';
    string public symbol = 'MTX';
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000000000000000000000;
    address public owner;

    uint256 public rewardAmount = 10 * 10**18;  // 10 tokens with 18 decimals
    uint256 public rewardInterval = 1 days;     // 1 day interval for reward

    mapping (address => uint256) private balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;
    mapping (address => uint256) public lastRewarded;  // Track the last reward time for each user

    event Transfer(address indexed from, address indexed to, uint256 indexed amount);
    event Approve(address indexed from, address indexed to, uint256 indexed amount);
    event Rewarded(address indexed user, uint256 indexed amount);

    constructor() {
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    function transfer(address _to, uint256 _amount) public returns (bool success) {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount cannot be zero or less");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        require(_amount > 0, "Amount cannot be zero or less");
        require(allowance[_from][msg.sender] >= _amount, "Allowance exceeded");
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) public returns (bool success) {
        allowance[msg.sender][_spender] = _amount;
        emit Approve(msg.sender, _spender, _amount);
        return true;
    }

    // Reward user with tokens, ensuring it's only once per day
    function rewardUser(address _user) public returns (bool success) {
        //require(msg.sender == owner, "Only owner can reward");
        require(balanceOf[owner] >= rewardAmount, "Insufficient reward balance for the owner");
        require(block.timestamp >= lastRewarded[_user] + rewardInterval, "Reward already claimed today");

        balanceOf[_user] += rewardAmount;
        balanceOf[owner] -= rewardAmount;
        lastRewarded[_user] = block.timestamp;

        emit Rewarded(_user, rewardAmount);
        emit Transfer(owner, _user, rewardAmount);
        return true;
    }

    function checkRewardEligibility(address _user) public view returns (bool) {
        return block.timestamp >= lastRewarded[_user] + rewardInterval;
    }

    function getbalanceOf(address account) public view returns (uint256) {
    return balanceOf[account];
}

}
