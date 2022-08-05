const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  guildID: String,
  channelID: String,
  lastUserID: String,
  lastChar: String,
  lastWords: [String]
});
module.exports = mongoose.model("guildData", schema);
