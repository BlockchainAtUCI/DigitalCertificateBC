const {create,issueCert,verifyCert,createWalletAccount} = require("./service/dc-web3-connector");
const _ = require('lodash');
const CERTTEMP = require('./template/certificate.json');
const {generateETHtimestamp, cloneJSONObject, generateSHA3Hash} = require('./util/util');
const {User} = require("./models/user");
const {Wallet} = require("./models/wallet");
const {Certification} = require("./models/certification");
const {CertTemplate} = require("./models/cert-template");
const {mongoose} = require("./db/mongoose");
var express = require("express");
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.post('/users', (req,res) => {
  var user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({email:user.email}).then( async (result) => {
    if(!result){
      try{
        let userBack = await user.save(); 
        let wallet = await createWalletAccount(userBack.name);
        wallet._ownedBy = userBack.email;
        await new Wallet(wallet).save().then((result) => {
          res.send({
            user,
            wallet:result
          })
        })
      }catch(err){
        res.status(404).send(err);
      }
    }
    else{
      res.send({
        message: "User already signedup"
      });
    }
    
  });
});

app.post('/users/login', (req,res) => {

  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {

    Wallet.findOne({'_ownedBy':user.email}).then((wallet)=> {
      if(!wallet){
        res.status(404).send();
      }
      res.send({
        username:user.name,
        email:user.email,
        wallet:wallet.address,
        privateKey: wallet.privateKey
      });
    });

  }).catch((e) => {
    res.status(400).send(e);
  });
});

app.post("/create", (req,res)=> {
  var body = _.pick(req.body, ['wallet', 'template'])

  let certTemp = new CertTemplate({
    name: body.template.name, 
    typeDef: body.template.typeDef,
    uri : body.template.uri,
    decimal: body.template.decimal,
    symbol: body.template.symbol,
    nfi: body.template.nfi 
  })
});

app.post("/issue-cert", (req,res) => {

});

app.post('verify-cert', (req,res) => {

})

app.listen(8456, () => {
  console.log(`Started up at port 8456`);
});

module.exports = {app};