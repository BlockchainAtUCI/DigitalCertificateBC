var mongoose = require("mongoose");

var WalletSchema = new mongoose.Schema({
  address: {
      type:String,
      required: true
  },
  privateKey: {
      type:String,
      required: true
  },
  _ownedBy: {
      type:String,
      required: true
  }
});

WalletSchema.statics.findByEmail = (email) => {
    var Wallet = this;

    return Wallet.findOne({'_ownedBy':email}).then((wallet) => {
        console.log(wallet);
        return new Promise((resolve, reject) => {
            if(!wallet) {
                reject();
            }
            resolve(wallet);
        })
    })
}

var Wallet = mongoose.model('Wallet', WalletSchema);
module.exports = {Wallet};