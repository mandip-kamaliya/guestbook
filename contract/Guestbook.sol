// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Guestbook{

    //struct
    struct signature{
        address owner;
        string message;
        uint256 timestamp;     
    }
    

    function post() public payable {
        require(msg.value == 0.0001 ether, "You must pay 0.0001 ether to post.");

    }   
}