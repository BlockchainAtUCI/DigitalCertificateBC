var mongoose = require("mongoose");

var CertificationSchema = new mongoose.Schema ({
  name: {
      type:String, 
      trim:true, 
      required: true
  },
  title: {
      type:String, 
      trim:true,
      required: true
  },
  address: {
      type:String,
      trim:true,
      required:true
  },
  transactionId:{
      type:String,
      trim:true,
      required:true
  },
  issueDate:{
      type:String,
      trim:true, 
      required: true 
  },
  expiredDate:{
      type:String, 
      trim:true, 
      required: true
  },
  _issedBy: {
      type: String,
      required: true
  }
});

var Certification = mongoose.model('Certification', CertificationSchema);

module.exports = {Certification}