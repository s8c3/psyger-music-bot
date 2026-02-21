require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

let connection;
let player = createAudioPlayer();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;

  const args = message.content.split(" ");
  const command = args[0];

  if (command === "!join") {
    if (!message.member.voice.channel) {
      return message.reply("VC me ja pehle 😑");
    }

    connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);
    message.reply("VC join kar liya 😎");
  }

  if (command === "!play") {
    const url = args[1];
    if (!url) return message.reply("Song URL de bhai");

    const stream = ytdl(url, { filter: "audioonly" });
    const resource = createAudioResource(stream);
    player.play(resource);

    message.reply("Song chalu 🎵");
  }

  if (command === "!stop") {
    player.stop();
    message.reply("Band kar diya 🛑");
  }

  if (command === "!leave") {
    if (connection) connection.destroy();
    message.reply("VC se nikal gaya 👋");
  }
});

client.login(process.env.TOKEN);
