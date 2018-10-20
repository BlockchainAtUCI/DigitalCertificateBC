const mongoose = require("mongoose");
var validator = require('validator');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  name: {
    type : String,
    trim : true, 
    required: true 
  },
  email : {
    type: String, 
    trim: true, 
    required: true,
    validate: {
      validator: (value) => {
        return validator.isEmail(value);
      },
      message: "The email address is not valid format"
    }
  },
  password: {
    type:String,
    trim: true, 
    required:true
  }
});

UserSchema.pre('save', function (next) {
  var user = this; 

  if (user.isModified('password')){
      bcrypt.genSalt(10, (err,salt) => {
          bcrypt.hash(user.password, salt, (err,hash)=> {
              user.password = hash;
              next();
          });
      });
      
  }else{
      next();
  }
});

UserSchema.statics.findByCredentials = function (email, password){
  var User = this; 

  return User.findOne({email}).then((user) => {
    if (!user){
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res)=> {
        if(res){
            resolve(user);
        }else{
            reject();
        }
    });
    });
  });
}

var User = mongoose.model('User', UserSchema);
module.exports = {User}