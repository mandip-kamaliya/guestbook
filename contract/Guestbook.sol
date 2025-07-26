// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Guestbook{

    //constants
    uint256  public constant SIGN_FEE=0.0001 ether;

    //events
    event SIGNTUREPOSTED(address indexed owner,string  message,uint256 timestamp);

    //struct
    struct signature{
        address owner;
        string message;
        uint256 timestamp;     
    }
    signature[] public signatures;
    

    function Sign(string memory _message) public payable {
        require(msg.value == SIGN_FEE , "You must pay 0.0001 ether to post.");
        signatures.push(signature({
            owner:msg.sender,
            message:_message,
            timestamp:block.timestamp
        }));
        emit SIGNTUREPOSTED(msg.sender,_message,block.timestamp);

    }   
}