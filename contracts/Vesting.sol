// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./XYZToken.sol";

contract Vesting is Ownable, XYZToken {
    using SafeMath for uint256;

    address[] public beneficiaries;
    // mapping to check whether the beneficary already exists (cheaper than to loop through the array)
    mapping(address => bool) isBeneficiary;

    uint256 startTime;
    uint256 endTime;
    uint256 lastRelease;

    XYZToken public token;

    uint256 releases;
    uint256 releaseAmount;
    uint256 tokensPerBeneficiaryPerMinute;

    constructor() {
        // dispersed tokens per minute in total
        // 365 days * 24 hours * 60 minutes
        releases = 525600;
        releaseAmount = totalSupply() / releases;
        tokensPerBeneficiaryPerMinute = releaseAmount / 10;

        startTime = block.timestamp;
        endTime = startTime + 365 days;
        lastRelease = startTime;
    }

    function addBeneficiaries(address _beneficiary) public onlyOwner {
        require(
            _beneficiary != address(0),
            "The address can't be a zero address"
        );
        require(
            beneficiaries.length < 10,
            "There are already 10 beneficiaries."
        );
        require(!isBeneficiary[_beneficiary]);
        // 10% share for each
        beneficiaries.push(_beneficiary);
        isBeneficiary[_beneficiary] = true;
    }

    function tokenVesting() public {
        uint256 timeDifference;
        uint256 minutesSinceLastRelease;
        uint256 amount;

        require(lastRelease < endTime);
        // in case the year is already over and the tokens haven't been transferred in time
        if (block.timestamp > endTime) {
            timeDifference = endTime.sub(lastRelease);
        } else {
            timeDifference = block.timestamp.sub(lastRelease);
        }
        require(
            timeDifference >= 60,
            "The last release was less than one minute ago."
        );

        minutesSinceLastRelease = timeDifference.div(60);
        amount = minutesSinceLastRelease.mul(tokensPerBeneficiaryPerMinute);

        require(block.timestamp <= endTime || lastRelease < endTime);

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            release(beneficiaries[i], amount);
        }
    }

    function release(address _beneficiary, uint256 amount)
        public
        payable
        virtual
    {
        transfer(payable(_beneficiary), amount);
        lastRelease = block.timestamp;
    }
}
