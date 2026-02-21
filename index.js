require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;

  const args = message.content.split(" ");
  const command = args[0];

  if (command === "!join") {
    if (!message.member.voice.channel)
      return message.reply("VC join kar pehle 😒");

    joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    message.reply("VC join kar liya 😎");
  }

  if (command === "!play") {
    if (!message.member.voice.channel)
      return message.reply("VC join kar pehle 😒");

    const url = args[1];
    if (!url) return message.reply("Link de bhai 😑");

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const stream = await play.stream(url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    message.reply("🎵 Baja diya bhai!");
  }
});

client.login(process.env.TOKEN);
