// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./XYZToken.sol";

contract Vesting is Ownable, XYZToken {
    using SafeMath for uint256;

    mapping(address => uint256) public shares;
    address[] beneficiaries;
    uint256 beneficiaryCount;
    uint256 releaseTime;
    uint256 public endTime;
    uint256 releaseCount;

    XYZToken public token;

    uint256 releases;
    uint256 releaseAmount;
    uint256 tokensPerBeneficiaryPerMinute;

    //uint256 public timeDiff;

    constructor() {
        // dispersed tokens per minute in total
        // 365 days * 24 hours * 60 minutes
        releases = 525600;
        releaseAmount = 100000000 / releases;
        tokensPerBeneficiaryPerMinute = releaseAmount / 10;

        releaseTime = block.timestamp;
        endTime = releaseTime + 365 days;
    }

    function addBeneficiaries(address _beneficiary) public onlyOwner {
        require(
            _beneficiary != address(0),
            "The address can't be a zero address"
        );
        require(
            beneficiaryCount < 10 && shares[_beneficiary] == 0,
            "There are already 10 beneficiaries."
        );
        // 10% share for each
        shares[_beneficiary] = 10;
        beneficiaries.push(_beneficiary);
        beneficiaryCount.add(1);
    }

    function calcTimeDifference() public view returns (uint256) {
        uint256 timeDifference = block.timestamp.sub(releaseTime);

        return timeDifference.div(60);
    }

    function vest() public {
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            release(beneficiaries[i]);
        }
    }

    function release(address _beneficiary) public payable virtual {
        // in case the year is already over and the tokens haven't been transferred in time
        uint256 timeDifference = block.timestamp.sub(releaseTime);
        require(timeDifference >= 60);

        transfer(payable(_beneficiary), tokensPerBeneficiaryPerMinute);
        releaseCount++;
    }
}
