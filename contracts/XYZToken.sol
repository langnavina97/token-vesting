// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XYZToken is ERC20 {
    // decimal is already set to 18 by default
    // generated with "https://docs.openzeppelin.com/contracts/4.x/wizard"
    constructor() ERC20("XYZToken", "XYZ") {
        _mint(msg.sender, 100000000 * 10**decimals());
    }
}
