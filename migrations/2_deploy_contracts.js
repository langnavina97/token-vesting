var Vesting = artifacts.require("./Vesting.sol");

module.exports = function (deployer) {
  deployer.deploy(Vesting);
};
