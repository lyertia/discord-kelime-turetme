const LIMITOR = 50;
const Discord = require("discord.js");
const client = new Discord.Client({ intents: 32767 });
const axios = require("axios");
const config = require("./config.json");
const mongooose = require("mongoose");

// const UserModel = require("./database/Schemas/dataManagerUSER.js");

const GuildModel = require("./database/Schemas/dataManagerGUILD.js");


mongooose.connect(config.database);
client.login(config.token);

function incorrectMessage(message, content) {
  message.reply({ content }).then(msg => {
    setTimeout(() => msg.delete().catch(_ => _), 2500);
  }).catch(_ => _)

  setTimeout(() => message.delete().catch(_ => _), 500);

}

client.on("ready", () => {
  console.log("By lyertia.");
  client.user.setActivity({ name: "!kanal", type: "LISTENING" });
});

client.on("messageCreate", async message => {
  try {
    if (message.author.bot) return;
    const content = message.content.toLocaleLowerCase("tr")
    if (content.startsWith("!kanal")) {
      if (!message.member.permissions.has("ADMINISTRATOR")) return;

      const channel = message.mentions.channels.first();
      if (!channel) return message.reply("Kanalı etiketlemelisin!");

      const result = await GuildModel.findOne({ guildID: message.guildId })
      if (result) {
        result.channelID = channel.id;
        result.lastChar = "a";
        result.lastWords = ["araba"]
        result.lastUserID = client.user.id;
        await result.save();

      } else
        await GuildModel.create({
          guildID: message.guildId,
          channelID: channel.id,
          lastUserID: client.user.id,
          lastChar: "a",
          lastWords: ["araba"]
        })


      await message.reply("Kanal ayarlandı.");
      await channel.send("**OYUN BAŞLADI!**\nİlk kelime benden :)\n```araba```");
    } else {
      const result = await GuildModel.findOne({ guildID: message.guild.id, channelID: message.channel.id });
      if (!result) return;
      if (message.author.id === result.lastUserID)
        return incorrectMessage(message, "Aynı kişi üst üste mesaj atamaz");

      if (content[0] !== result.lastChar)
        return incorrectMessage(message, `Kelime **${result.lastChar}** ile başlamalı`);

      if (result.lastWords.includes(content))
        return incorrectMessage(message, `Son **${LIMITOR}** kelimeyi tekrar yazamazsın.`);

      const response = await axios.get(`https://sozluk.gov.tr/gts?ara=${encodeURI(content)}`)
 
      if (response.data.error)
        return incorrectMessage(message, "Kelime TDK sözlüğünde bulunmuyor.");

      if (result.lastWords.length >= LIMITOR) result.lastWords.shift();

      result.lastWords.push(content);
      result.lastUserID = message.author.id;
      result.lastChar = message.content.slice(-1);
      await result.save();
      await message.react("🍪");

    }
  } catch (e) { console.error(e) }

});

