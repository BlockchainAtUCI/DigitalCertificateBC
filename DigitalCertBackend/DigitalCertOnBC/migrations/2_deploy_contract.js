var DigitalCertMinter = artifacts.require("./DigitalCertMinter.sol");

module.exports = function (deployer){
    deployer.deploy(DigitalCertMinter)
    .then( (DigitalCertMinter) => {
        console.log("DEPLOYED ADDERSS:" , DigitalCertMinter.address);
    });
}