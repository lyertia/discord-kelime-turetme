const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userID: String,
  userCorrects: Number,
});
module.exports = mongoose.model("userData", schema);
