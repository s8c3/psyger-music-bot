require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const player = createAudioPlayer();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!")) return;
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args[0].toLowerCase();

  if (command === "!play") {
    if (!message.member.voice.channel)
      return message.reply("Pehle VC me aa 😑");

    const url = args[1];
    if (!url || !ytdl.validateURL(url))
      return message.reply("Proper YouTube link de bhai 😑");

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const stream = ytdl(url, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);

    player.play(resource);
    connection.subscribe(player);

    message.reply("🎵 Gaana chalu ho gaya");
  }

  if (command === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return;
    connection.destroy();
    message.reply("VC se nikal gaya 👋");
  }
});

client.login(process.env.TOKEN);
