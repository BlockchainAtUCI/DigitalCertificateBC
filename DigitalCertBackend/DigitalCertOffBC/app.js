const {create,issueCert,verifyCert,createWalletAccount} = require("./service/dc-web3-connector");
const _ = require('lodash');
const {toETHtimestamp, cloneJSONObject, generateSHA3Hash} = require('./util/util');
const {User} = require("./models/user");
const {Wallet} = require("./models/wallet");
const {Certification} = require("./models/certification");
const {CertTemplate} = require("./models/cert-template");
const {mongoose} = require("./db/mongoose");
var express = require("express");
const bodyParser = require('body-parser');
var cors = require('cors')

var app = express();
app.use(bodyParser.json());
app.use((request,response,next) => {
  response.setHeader('Content-Type', 'application/json');
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();    
});

var originsWhitelist = [
  'http://localhost:4200',      //this is my front-end url for development
];
var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials:true
}
//here is the magic
app.use(cors(corsOptions));


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
        let wallet = await createWalletAccount(userBack.email);
        wallet._ownedBy = userBack.email;
        new Wallet(wallet).save().then((result) => {
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
        privateKey: "PRIVATEKEY"
      });
    });
  }).catch((e) => {
    res.status(400).send(e);
  });
});


app.get("/alltemplate/:email", (req,res)=>{

  CertTemplate.find({"_ownedBy":req.params.email}).then((result) => {
    if(!result){
      res.status(400).send()
    }
    res.send(result);
  })
})

app.post("/create", (req,res)=> {
  var body = _.pick(req.body, ['email', 'template'])
  let certTemp = new CertTemplate({
    name: body.template.name, 
    typeDef: body.template.typeDef,
    _ownedBy: body.email
  }); // we dont have to save this because these are in the blockchain already. 

  certTemp.save().then((result) => {
    if(result) {
      res.send(result);
    }
    else{
      res.status(404).send();
    }
  });
});

app.post("/issue-cert", (req,res) => {
  //console.log(req.body);
  let completeForm = new Certification({
    name: req.body.name,
    title: req.body.title, 
    address: req.body.address,
    transactionId: req.body.transactionId,
    issueDate: req.body.issueDate,
    expiredDate: req.body.expiredDate,
    _issedBy: req.body._issedBy
  });

  completeForm.save().then((result) => {
    if(!result){
      res.status(404).send()
    }else{
      res.send(result);
    }
  });
});

app.get('/', (req, res) => {
  res.send("Hello world");
});
app.listen(8080, () => {
  console.log(`Started up at port 8080`);
});

module.exports = {app};