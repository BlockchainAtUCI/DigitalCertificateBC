var DigitalCertMinter = artifacts.require("./DigitalCertMinter.sol");
const SHA3 = require('sha3');
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


contract('DigitalCertMinterTest', function(accounts) {  
    var FinancialAssociateCertTemplate; 
    var FinancialProfessionalCertTemplate;

    beforeEach(function () {
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

    })
    it("Minter test", async function (){
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
              
    });
});