// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Guestbook{

    //maping
    mapping (address=> string) public guestBook;
    

    function post() public payable {
        require(msg.value == 0.0001 ether, "You must pay 0.0001 ether to post.");

    }   
}