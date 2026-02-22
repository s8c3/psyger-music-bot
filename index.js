require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection,
} = require("@discordjs/voice");
const play = require("play-dl");

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

  // JOIN
  if (command === "!join") {
    if (!message.member.voice.channel)
      return message.reply("Pehle VC me aa 😑");

    joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    return message.reply("VC join kar liya 😎");
  }

  // LEAVE
  if (command === "!leave") {
    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return message.reply("VC me nahi hu 😑");

    connection.destroy();
    return message.reply("VC se nikal gaya 👋");
  }

  // PLAY
  if (command === "!play") {
    if (!message.member.voice.channel)
      return message.reply("Pehle VC me aa 😑");

    const query = args.slice(1).join(" ");
    if (!query) return message.reply("Song name likh bhai 😑");

    const channel = message.member.voice.channel;

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    try {
      let stream;

      if (play.yt_validate(query) === "video") {
        stream = await play.stream(query);
      } else {
        const results = await play.search(query, { limit: 1 });
        stream = await play.stream(results[0].url);
      }

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      player.play(resource);
      connection.subscribe(player);

      message.reply("🎵 Gaana chalu ho gaya");

    } catch (err) {
      console.log(err);
      message.reply("❌ Song play nahi ho raha");
    }
  }

  // PAUSE
  if (command === "!pause") {
    player.pause();
    return message.reply("⏸️ Pause kar diya");
  }

  // RESUME
  if (command === "!resume") {
    player.unpause();
    return message.reply("▶️ Resume kar diya");
  }

  // SKIP
  if (command === "!skip") {
    player.stop();
    return message.reply("⏭️ Skip kar diya");
  }
});

player.on(AudioPlayerStatus.Idle, () => {
  console.log("Song finished");
});

client.login(process.env.TOKEN);
