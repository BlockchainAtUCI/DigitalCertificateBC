var DigitalCertMinter = artifacts.require("./DigitalCertMinter.sol");
const SHA3 = require('sha3');
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


contract('DigitalCertMinterTest', async function(accounts) {  
    var FinancialAssociateCertTemplate; 
    var FinancialProfessionalCertTemplate;
    var digital_cert_minter;

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
        
    });
    it("Minter test", async function (){
    
        digital_cert_minter = await DigitalCertMinter.deployed();
        let type1 = await digital_cert_minter.create.sendTransaction(
            FinancialAssociateCertTemplate.name,
            FinancialAssociateCertTemplate.typeDef,
            FinancialAssociateCertTemplate.uri,
            FinancialAssociateCertTemplate.decimal, 
            FinancialAssociateCertTemplate.symbol, 
            FinancialAssociateCertTemplate.nfi,
            {from:accounts[1]});
            
        /*
        let type2 = await digital_cert_minter.create.sendTransaction(
            FinancialProfessionalCertTemplate.name,
            FinancialProfessionalCertTemplate.typeDef,
            FinancialProfessionalCertTemplate.uri,
            FinancialProfessionalCertTemplate.decimal, 
            FinancialProfessionalCertTemplate.symbol, 
            FinancialProfessionalCertTemplate.nfi,
            {from:accounts[1]});*/

        console.log(type1);

        assert.isTrue(true);
    });


    it("IssueCertBatch Test", async function () {
        let d = SHA3.SHA3Hash(256);
        var Users = ["jake", "mike", "Sid", "Apurva", "Django", "Hunter"];

        var IssueDates = [new Date().getTime(),new Date().getTime(),
            new Date().getTime(),new Date().getTime(),
            new Date().getTime(),new Date().getTime()];

        var ExpiredDates = [new Date(2018, 12, 23).getTime()/1000,new Date(2018, 12, 23).getTime()/1000,
            new Date(2018, 12, 23).getTime()/1000,new Date(2018, 12, 23).getTime()/1000,
            new Date(2018, 12, 23).getTime()/1000,new Date(2018, 12, 23).getTime()/1000];
        var Mails = [
            "jake@gmail.com",
            "mike@gmail.com",
            "Sid@gmail.com",
            "Apurva@gmail.com",
            "Django@gmail.com",
            "Hunter@gmail.com"
        ];
        var Types = [
            await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef),
            await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef),
            await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef),
            await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef),
            await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef),
            await digital_cert_minter.getTypeDef.call(FinancialAssociateCertTemplate.typeDef)];
        var Certs = [] 
        console.log(Users.length);
        for (var i = 0; i < Users.length; i++){
            CertTemplate = new Object({
                name:'',
                title:'',
                address:''
            });
            CertTemplate.name = Users[i];
            CertTemplate.title = FinancialAssociateCertTemplate.name;
            CertTemplate.address = Mails[i];

            d.update(JSON.stringify(CertTemplate), 'utf-8');
            let cert = d.digest('hex');
            Certs.push(cert);
        };
        console.log(Certs);


            let result = await digital_cert_minter.issueCertBatch.sendTransaction(
                Mails,
                Types,
                Certs,
                ExpiredDates,
                IssueDates,
                {from:accounts[1]}
            )
            console.log("Result: " + result);
  
    });
    
});