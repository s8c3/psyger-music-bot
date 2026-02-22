require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const player = createAudioPlayer();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;

  const args = message.content.split(" ");
  const command = args[0];

  if (command === "!join") {
    if (!message.member.voice.channel) return message.reply("VC join kar bhai 😑");

    joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    message.reply("VC join kar liya 😎");
  }

  if (command === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (connection) {
      connection.destroy();
      message.reply("VC se nikal gaya 👋");
    }
  }

  if (command === "!play") {
    if (!args[1]) return message.reply("Song link ya naam de bhai 😑");

    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("Pehle !join kar 😑");

    let url = args[1];

    if (!ytdl.validateURL(url)) {
      return message.reply("Abhi sirf YouTube link chalega 😔");
    }

    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    message.reply("🎵 Gaana chalu ho gaya");
  }

  if (command === "!pause") {
    player.pause();
    message.reply("⏸ Pause kar diya");
  }

  if (command === "!skip") {
    player.stop();
    message.reply("⏭ Skip kar diya");
  }
});

client.login(process.env.TOKEN);
