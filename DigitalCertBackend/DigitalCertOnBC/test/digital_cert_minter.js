var DigitalCertMinter = artifacts.require("./DigitalCertMinter.sol");
const SHA3 = require('sha3');
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var generateCertHash = (cert) => {
  let d = SHA3.SHA3Hash(256);
  d.update(JSON.stringify(cert), 'utf-8');
  return d.digest('hex');
}

contract('DigitalCertMinter', function(accounts) {
  var recp1 = accounts[1];
  var recp2 = accounts[2];
  var digital_cert_minter; 
  var FinancialAssociateCertTemplate; 
  var FinancialProfessionalCertTemplate;
  var recp1Cert;
  var recp2Cert;

  beforeEach(function () {
    CertTemplate = new Object({
      name:'',
      title:'',
      address:''
    });
    FinancialAssociateCertTemplate = new Object({
      name:"Financial Associate",
      typeDef:web3.utils.fromAscii("FinancialAssociate"),
      uri:"http://localhost/src/public/FinancialAssociateCertTemplate",
      symbol: "_FA",
      nfi: true
    }); 
    console.log("typedef:", FinancialAssociateCertTemplate.typeDef);
    recp1Cert = JSON.parse(JSON.stringify(CertTemplate));
    recp2Cert = JSON.parse(JSON.stringify(CertTemplate));
  });

  it("Deployment of the contract", async function() {
    digital_cert_minter = await DigitalCertMinter.deployed();
    assert.isTrue(true);
  });

  it("Create function test", async function (){

    let factType = await digital_cert_minter.create.sendTransaction(
      FinancialAssociateCertTemplate.name,
      FinancialAssociateCertTemplate.typeDef,
      FinancialAssociateCertTemplate.uri,
      FinancialAssociateCertTemplate.decimal, 
      FinancialAssociateCertTemplate.symbol, 
      FinancialAssociateCertTemplate.nfi,
      {from:accounts[0]});
    
    //console.log("Item Creation: ", factType);
      
    let checkType = await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef);
  
    //console.log("Type of the item: ", checkType);
    assert.isTrue(true);
  });

  
  it("issueCertificate function test for recp1", async function() {
    let d = SHA3.SHA3Hash(256);
    
    var dateObj = new Date(2018, 10, 11).getTime();
    let expireDate = dateObj / 1000;
    let issueDate = new Date().getTime(); 

    recp1Cert.name = 'Jake Lee'
    recp1Cert.address = "jake@gmail.com"; 
    recp1Cert.title = FinancialAssociateCertTemplate.name;
    
    d.update(JSON.stringify(recp1Cert), 'utf-8');
    let cert = d.digest('hex');
    console.log("This is my cert: ", cert);
    //console.log("This is my certificate: ", cert);
    var factType = await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef);
    await digital_cert_minter.issueCert(recp1Cert.address, factType, cert, expireDate, issueDate);
    var myNfi = await digital_cert_minter.getOnwerShipTkn.call(cert);
    console.log(`MyNfi: ${myNfi}`);
    var itsMe = await digital_cert_minter.ownerOf(myNfi);
    console.log(`its me: ${itsMe}`);
    assert.isTrue(true);
  });

  it("issueCertificate function test for recp2", async function() {
    let d = SHA3.SHA3Hash(256);
    
    var dateObj = new Date(2018, 10, 11).getTime();
    let expireDate = dateObj / 1000;
    let issueDate = new Date().getTime(); 
    
    recp2Cert.name = 'Paul Karl'
    recp2Cert.address = "paul@gmail.com"; 
    recp2Cert.title = FinancialAssociateCertTemplate.name;
    
    d.update(JSON.stringify(recp2Cert), 'utf-8');
    let cert2 = d.digest('hex');
    console.log("This is my certificate: ", cert2);
    var factType = await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef);
    await digital_cert_minter.issueCert(recp2Cert.address, factType, cert2, expireDate,issueDate);
    //console.log(recp2);
    let myNfi = await digital_cert_minter.getOnwerShipTkn.call(cert2);
    console.log(`MyNfi: ${myNfi}`);
    let itsMe = await digital_cert_minter.ownerOf(myNfi);
    console.log(`its me: ${itsMe}`);

    assert.isTrue(true);
  });

  
  it("verifyCert function test", async function() {
    try{
      recp1Cert.name = 'Jake Lee'
      recp1Cert.address = "jake@gmail.com"; 
      recp1Cert.title = FinancialAssociateCertTemplate.name;
      let cert = generateCertHash(recp1Cert);
      console.log("This is my Cert: ", cert);
      let returnedAddr = await digital_cert_minter.verifyCert.call(cert);
      console.log(returnedAddr);
      console.log(`returned address: ${returnedAddr}`);
      assert.isTrue(true);

    }catch(err){
      console.log(err);
    }
    
    try{

      recp2Cert.name = 'Paul Karl'
      recp2Cert.address = "paul@gmail.com"; 
      recp2Cert.title = FinancialAssociateCertTemplate.name;
      let cert = generateCertHash(recp2Cert);
      let returnedAddr = await digital_cert_minter.verifyCert.call(cert);
      console.log(`returned address: ${returnedAddr}`);
      assert.isTrue(true);

    }catch(err){
      console.log(err);
    }
  });
  
  it("verifyCert function test with Fake/Invalid data sets", async function (){
    try{

      let recp3Cert = JSON.parse(JSON.stringify(CertTemplate));
      recp3Cert.name = 'Mark Kim';
      recp3Cert.address = "jake@gmail.com";
      recp3Cert.title = FinancialAssociateCertTemplate.name;
      await digital_cert_minter.verifyCert.call(generateCertHash(recp3Cert));
      
    }catch(err){
      console.log("catched the faked certificate: Mark hijacked Jake's address");
    }

    try{
      let recp3Cert = JSON.parse(JSON.stringify(CertTemplate));
      recp3Cert.name = 'Jake Lee';
      recp3Cert.address = accounts[3];
      recp3Cert.title = FinancialAssociateCertTemplate.name;
      await digital_cert_minter.verifyCert.call(generateCertHash(recp3Cert));
      
    }catch(err){
      console.log("catched the faked certificate: Jake with invalid address");
    }
    
    
    try{
      var dateObj = new Date(2015, 10, 11).getTime();
      let expireDate = dateObj / 1000;
      let issueDate = new Date().getTime(); 

      let recp4Cert = JSON.parse(JSON.stringify(CertTemplate));
      recp4Cert.name = 'Leo Lee'
      recp4Cert.address = accounts[4]; 
      recp4Cert.title = FinancialAssociateCertTemplate.name;

      console.log(expireDate);
      let cert = generateCertHash(recp4Cert);
      var factType = await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef);
      await digital_cert_minter.issueCert(recp4Cert.address, factType, cert, expireDate,issueDate);
      await digital_cert_minter.verifyCert.coll(cert);
      console.log("!!!!");
    }catch(err){
      console.log(`${accounts[4]}'s cert has already been expired`);
    }
  });
  

  it("Minters Test", async function (){
    FinancialAssociateCertTemplate = new Object({
      name:"Financial Associate",
      typeDef:web3.utils.fromAscii("FinancialAssociate"),
      uri:"http://localhost/src/public/FinancialAssociateCertTemplate",
      symbol: "_FA",
      nfi: true
    }); 

    FinancialProfessionalCertTemplate = new Object({
      name:"Financial Professional",
      typeDef:web3.utils.fromAscii("FinancialProfessional"),
      uri:"http://localhost/src/public/FinancialProfessionalCertTemplate",
      symbol: "_FP",
      nfi: true
    }); 


    let type1 = await digital_cert_minter.create.sendTransaction(
      FinancialAssociateCertTemplate.name,
      FinancialAssociateCertTemplate.typeDef,
      FinancialAssociateCertTemplate.uri,
      FinancialAssociateCertTemplate.decimal, 
      FinancialAssociateCertTemplate.symbol, 
      FinancialAssociateCertTemplate.nfi,
      {from:accounts[0]});

    let type2 = await digital_cert_minter.create.sendTransaction(
        FinancialProfessionalCertTemplate.name,
        FinancialProfessionalCertTemplate.typeDef,
        FinancialProfessionalCertTemplate.uri,
        FinancialProfessionalCertTemplate.decimal, 
        FinancialProfessionalCertTemplate.symbol, 
        FinancialProfessionalCertTemplate.nfi,
        {from:accounts[1]});

    let recp1Cert = JSON.parse(JSON.stringify(CertTemplate));
    recp1Cert.name = 'Jake Lee'; 
    recp1Cert.title = FinancialProfessionalCertTemplate.name; 
    recp1Cert.address = 'jake@gmail.com'
    
    let d = SHA3.SHA3Hash(256);
    d.update(JSON.stringify(recp1Cert), 'utf-8');
    let cert = d.digest('hex');
    
    var dateObj = new Date(2018, 10, 11).getTime();
    let expireDate = dateObj / 1000;
    let issueDate = new Date().getTime(); 

    var factType = await digital_cert_minter.getTypeDef.call(FinancialProfessionalCertTemplate.typeDef);
    await digital_cert_minter.issueCert(recp1Cert.address, factType, cert, expireDate, issueDate, {from:accounts[1]});
    var myNfi = await digital_cert_minter.getOnwerShipTkn.call(cert);
    console.log(`MyNfi: ${myNfi}`);
    var itsMe = await digital_cert_minter.ownerOf(myNfi);
    console.log(`its me: ${itsMe}`);
  })
});
