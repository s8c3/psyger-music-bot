require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection
} = require("@discordjs/voice");
const play = require("play-dl");
const ffmpeg = require("ffmpeg-static");
const { spawn } = require("child_process");

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

  if (command === "join") {
    if (!message.member.voice.channel) return message.reply("VC join kar 😑");

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    connection.subscribe(player);
    message.reply("VC join ho gaya 😎");
  }

  if (command === "play") {
    if (!message.member.voice.channel) return message.reply("VC me aa pehle 😑");

    const query = args.join(" ");
    if (!query) return message.reply("Song name likh 😒");

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator
    });

    connection.subscribe(player);

    const results = await play.search(query, { limit: 1 });
    if (!results.length) return message.reply("Song nahi mila 😢");

    const stream = await play.stream(results[0].url);

    const ffmpegProcess = spawn(ffmpeg, [
      "-i", "pipe:0",
      "-f", "s16le",
      "-ar", "48000",
      "-ac", "2",
      "pipe:1"
    ]);

    stream.stream.pipe(ffmpegProcess.stdin);

    const resource = createAudioResource(ffmpegProcess.stdout);
    player.play(resource);

    message.reply(`🎵 Playing: ${results[0].title}`);
  }

  if (command === "leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return;
    connection.destroy();
    message.reply("VC leave 👋");
  }

  if (command === "pause") player.pause();
  if (command === "resume") player.unpause();
  if (command === "skip") player.stop();
});

client.login(process.env.TOKEN);
