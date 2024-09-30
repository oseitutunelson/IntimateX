// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Reward Token contract
 * @author Owusu Nelson Osei Tutu
 * @notice This contract contains the code for the reward token used to reward users 
 */

contract RewardToken{
   string public name = 'IntimateX';
   string public symbol = 'IMX';
   uint8 public decimals = 18;
   uint256 public totalSupply = 1000000000000000000000000;
   address public owner;

   event Transfer(address indexed from,address indexed to,uint256 indexed amount);
   event Approve(address indexed from,address indexed to,uint256 indexed amount);

   //keep track of user balances
   mapping (address => uint256) public balanceOf;
   mapping (address => mapping (address => uint256)) public allowance;

   constructor() {
     balanceOf[msg.sender] = totalSupply;
   }

   function transfer(address _to,uint256 _amount) public returns (bool sucess){
    require(balanceOf[_to] >= _amount);
    require(_amount > 0,"Amount cannot be zero or less");
    balanceOf[msg.sender] -= _amount;
    balanceOf[_to] += _amount;
    emit Transfer(msg.sender, _to, _amount);
    return true;
   }

   function transferFrom(address _from,address _to,uint256 _amount) public returns (bool success){
    require(balanceOf[_from] >= _amount);
    require(_amount > 0);
    balanceOf[_from] -= _amount;
    balanceOf[_to] += _amount;
    emit Transfer(_from, _to, _amount);
    return true;
   }

   function approve(address _spender,uint256 _amount) public returns (bool sucess){
    allowance[msg.sender][_spender] = _amount;
    emit Approve(msg.sender, _spender, _amount);
    return true;
   }


}