const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const schema = new Schema({
  guildID: String,
  gameChannel: String,
  lastUser: String,
  lastMessage: String,
});
module.exports = mongoose.model("guildData", schema);
