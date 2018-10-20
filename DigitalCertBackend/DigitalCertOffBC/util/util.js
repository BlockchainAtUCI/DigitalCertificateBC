const SHA3 = require('sha3');

var generateSHA3Hash = (obj) => {
  let d = SHA3.SHA3Hash(256);
  d.update(JSON.stringify(obj), 'utf-8');
  return "0x"+d.digest('hex');
}

var generateETHtimestamp = (year, month, date) => {
  let dateObj = new Date(year, month, date).getTime(); 
  return dateObj / 1000;
}

var cloneJSONObject = (jsonObject) => {
  return JSON.parse(JSON.stringify(jsonObject));
}

module.exports = {
  generateSHA3Hash,
  generateETHtimestamp,
  cloneJSONObject
}