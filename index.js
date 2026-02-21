require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require("@discordjs/voice");
const play = require("play-dl");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const prefix = "!";
const player = createAudioPlayer();

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // JOIN
  if (command === "join") {
    if (!message.member.voice.channel) return message.reply("VC join kar pehle 😒");

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);
    message.reply("VC join kar liya 😎");
  }

  // LEAVE
  if (command === "leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("Main VC me nahi hu 😑");

    connection.destroy();
    message.reply("VC leave kar diya 👋");
  }

  // PLAY
  if (command === "play") {
    if (!message.member.voice.channel) return message.reply("VC me aa pehle 😒");

    const query = args.join(" ");
    if (!query) return message.reply("Song name likh bhai 😑");

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);

    const search = await play.search(query, { limit: 1 });
    if (!search.length) return message.reply("Song nahi mila 😢");

    const stream = await play.stream(search[0].url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(resource);
    message.reply(`🎵 Playing: ${search[0].title}`);
  }

  // PAUSE
  if (command === "pause") {
    player.pause();
    message.reply("⏸ Paused");
  }

  // RESUME
  if (command === "resume") {
    player.unpause();
    message.reply("▶ Resumed");
  }

  // SKIP
  if (command === "skip") {
    player.stop();
    message.reply("⏭ Skipped");
  }
});

client.login(process.env.TOKEN);
