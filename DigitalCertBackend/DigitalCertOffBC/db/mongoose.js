var mongoose = require("mongoose");
var {MONGO} = require('../config/config');

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${MONGO.username}:${MONGO.password}@${MONGO.url}:${MONGO.port}/${MONGO.dbname}`);
module.exports = {mongoose};