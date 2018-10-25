const Web3 = require("web3");
const fs = require('fs');
const ABI_PATH = '/Users/Jake/Desktop/Jake_Programming/Project/DigitalCertBackend/DigitalCertOnBC/build/contracts/DigitalCertMinter.JSON';
const {generateSHA3Hash} = require('../util/util');

const ContractAbi = JSON.parse(fs.readFileSync(ABI_PATH));
const ContractAddress = '0x3cc0c7376873fb2eeada275816e0cfb6b3998740';
const GAS = 798445

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

//need to change
var contractAccount = '0xba18f4e9ca40e79c0c42e6accb103a7986193335';
//need to change
web3.eth.defaultAccount = contractAccount;

var dcContract = new web3.eth.Contract(ContractAbi.abi,
  ContractAddress,
  {gas: GAS});

var create = async (certificateTemplate, userAddress) => {
  certificateTemplate.typeDef = web3.utils.fromAscii(certificateTemplate.name);
  return await dcContract.methods.create(
    certificateTemplate.name,
    certificateTemplate.typeDef,
    certificateTemplate.uri,
    certificateTemplate.symbol, 
    true
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
    recipient = web3.utils.toHex(recipient);
    returnedHash = await dcContract.methods.issueCert(
      recipient,
      type,
      cert,
      toETHtimestamp(expiredate.year, expiredate.month, expiredate.date),
      toETHtimestamp(issuedate.year, issuedate.month, issuedate.date)
    )
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
  completeForm.issuedate = issuedate;
  completeForm.expiredate = expiredate;
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
  //let newAccount = await web3.eth.accounts.create(compName);
  let accounts = await web3.eth.getAccounts();
  //console.log(accounts);

  let newAccount = {
    address: accounts[Math.floor(Math.random()*accounts.length)],
    privateKey: "This is not a private key"
  }

  return newAccount;
}

module.exports = {
    create,
    issueCert,
    verifyCert,
    createWalletAccount 
} 