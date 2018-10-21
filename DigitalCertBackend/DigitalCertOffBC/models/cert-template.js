var mongoose = require("mongoose");

var CertTemplateSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
  }, 
  typeDef: {
    type:String, 
    required: true
  },
  _ownedBy: {
    type: String, 
    required:true
  }
});


var CertTemplate = mongoose.model("CertTemplate", CertTemplateSchema);
module.exports = {CertTemplate};

