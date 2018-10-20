const Web3 = require("web3");
const fs = require('fs');
const ABI_PATH = '/Users/Jake/Desktop/Jake_Programming/Project/DigitalCertBackend/DigitalCertOnBC/build/contracts/DigitalCertMinter.JSON';
const {generateSHA3Hash} = require('../util/util');

const ContractAbi = JSON.parse(fs.readFileSync(ABI_PATH));
const ContractAddress = '0x6d5c2c6ef613f53fece1910cb18396fe75a4fd89'
const GAS = 798445

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

//need to change
var contractAccount = '0x2cBB633CEF3089c635b5ef89F2D2EEBAa0c9EF28';
//need to change
web3.eth.defaultAccount = contractAccount;

var dcContract = new web3.eth.Contract(ContractAbi.abi,
  ContractAddress,
  {gas: GAS});
//var dcInstance = dcContract.at(ContractAddress);

var create = async (certificateTemplate, userAddress) => {
  return await dcContract.methods.create(
    certificateTemplate.name,
    certificateTemplate.typeDef,
    certificateTemplate.uri,
    certificateTemplate.symbol, 
    certificateTemplate.nfi
  ).send({
    from:userAddress,
    gas:GAS
  });

};

var issueCert = async (certificateObject, recipient, expiredate, issuedate, certificateTemplateTypeDef, issuer) => {
  // get user data. 
  let completeForm; 
  var returnedHash;
  let cert = generateSHA3Hash(certificateObject);

  try{
    let type = await dcContract.methods.getTypeDef(certificateTemplateTypeDef).call();
    console.log("Hello Issuer: ", issuer)
    recipient = web3.utils.toHex(recipient);
    returnedHash = await dcContract.methods.issueCert(recipient,type,cert,expiredate,issuedate)
    .send({
      from: issuer,
      gas:GAS
    }).on('transactionHash', function(hash){
      return hash;
    })
    
  }catch(err){
    console.log(err);
    return;
  }
  completeForm = certificateObject;
  completeForm.transactionid = returnedHash.transactionHash; 
  completeForm.issuedate = new Date(issuedate);
  completeForm.expiredate = new Date(expiredate*1000);
  return completeForm;
}

var verifyCert = async (cert) => {
  let certBack = await dcContract.methods.verifyCert(cert)
  .call({
    from: contractAccount,
    gas:GAS 
  });
  return certBack;
}

var createWalletAccount = async (compName) => {
  // need to check the compName is not empty
  let newAccount = await web3.eth.accounts.create(compName);
  return newAccount;
}

module.exports = {
    create,
    issueCert,
    verifyCert,
    createWalletAccount 
} 