const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const schema = new Schema({
  userID: String,
  userCorrects: Number,
});
module.exports = mongoose.model("userData", schema);
