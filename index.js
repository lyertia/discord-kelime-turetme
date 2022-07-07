const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });
const axios = require("axios");
const config = require("./config.json");

const mongooose = require("mongoose");
const UserModel = require("./database/Schemas/dataManagerUSER.js");
const GuildModel = require("./database/Schemas/dataManagerGUILD.js");

mongooose.connect(config.database);
client.login(config.token);

function incorrectMessage(message, error) {
  message.reply({ content: error }).then((msg) => {
    setTimeout(() => msg.delete(), 2500);
  });
  setTimeout(() => message.delete(), 500);
  //hatalı mesaj atıldıgına yapılacak işlem, özelleştirebilirsiniz.
}

client.on("ready", () => {
  console.log("By lyertia.");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!kanal")) return;
  if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR))
    return;

  const channel = message.mentions.channels.first();
  if (!channel) return message.reply("Kanalı etiketlemelisin!");

  GuildModel.findOne({ guildID: message.guild.id }, function (err, result) {
    if (result) {
      result.gameChannel = channel.id;
      result.lastMessage = "araba";
      result.lastUser = client.user.id;
      result.save(function (err) {
        if (err) throw err;
        message.reply("Kanal ayarlandı.");
        channel.send("**OYUN BAŞLADI!**\nİlk kelime benden :)\n\n araba");
      });
    } else {
      const Model = new GuildModel({
        guildID: message.guild.id,
        gameChannel: channel.id,
        lastUser: client.user.id,
        lastMessage: "araba",
      });
      Model.save(function (err) {
        if (err) throw err;
        message.reply("Kanal ayarlandı.");
      });
      channel.send("**OYUN BAŞLADI!**\nİlk kelime benden :)\n\n araba");
    }
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  GuildModel.findOne({ guildID: message.guild.id }, function (err, result) {
    if (err) throw err;
    if (!result) return;
    if (message.channel.id != result.gameChannel) return;
    if (message.author.id == result.lastUser)
      return incorrectMessage(
        message,
        (error = "Aynı kişi üst üste mesaj atamaz")
      );
    if (!message.content.startsWith(result.lastMessage.slice(-1)))
      return incorrectMessage(
        message,
        (error =
          "Kelime **" + result.lastMessage.slice(-1) + "** ile başlamalı")
      );
    if (message.content == result.lastMessage)
      return incorrectMessage(
        message,
        (error = "Aynı kelimeyi tekrar yazamazsın.")
      );

    let link = encodeURI("https://sozluk.gov.tr/gts?ara=" + message.content);
    axios.get(link).then((response) => {
      if (JSON.stringify(response.data).includes("error")) {
        incorrectMessage(message, (error = "Kelime TDK sözlüğüne bulunmuyor."));
      } else {
        result.lastUser = message.author.id;
        result.lastMessage = message.content;
        result.save(function (err) {
          if (err) throw err;
          message.react("🍪");
        });
      }
    });
  });
});
