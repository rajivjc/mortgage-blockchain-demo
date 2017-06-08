var Mortgage = artifacts.require("./Mortgage.sol");

module.exports = function(deployer) {
  deployer.deploy(Mortgage);
};
