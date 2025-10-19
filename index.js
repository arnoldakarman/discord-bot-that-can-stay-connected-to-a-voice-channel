const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const TOKEN = 'MTQyOTEyNTQzMjkwMDU4MzU3NA.G6QW9P.7MSLulR68JqBuUqSf_6r7X6GA8F7a3u0Um46fI'; // Replace with your bot's token
const GUILD_ID = '1374400905990111325';
const VOICE_CHANNEL_ID = '1390448047267385445';
const TEXT_CHANNEL_ID = '1384530234161889301';

let connection;
let player;

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  await connectToVoice();
});

async function connectToVoice() {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    const voiceChannel = guild.channels.cache.get(VOICE_CHANNEL_ID);
    if (!voiceChannel || voiceChannel.type !== 2) return console.log("❌ Invalid voice channel!");

    // Join the voice channel
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
    });
    console.log('🎧 Joined voice channel!');

    // Create the audio player
    player = createAudioPlayer();

    // Use a silent audio file to stay connected
    const resource = createAudioResource(path.join(__dirname, 'silence.mp3'));
    player.play(resource);
    connection.subscribe(player);

    // Loop the silent sound forever
    player.on(AudioPlayerStatus.Idle, () => {
      player.play(resource);
    });

    // Send a status embed
    const textChannel = guild.channels.cache.get(TEXT_CHANNEL_ID);
    if (textChannel) {
      const embed = new EmbedBuilder()
        .setTitle('Bot Status')
        .setDescription('✅ I am now connected to the voice channel 24/7!')
        .setColor(0x00ff00)
        .setTimestamp();
      await textChannel.send({ embeds: [embed] });
    }

    // Auto-reconnect if disconnected
    connection.on('stateChange', (oldState, newState) => {
      if (newState.status === 'disconnected') {
        console.log('⚠️ Disconnected from voice, reconnecting...');
        setTimeout(connectToVoice, 5000);
      }
    });

  } catch (error) {
    console.error('❌ Error connecting to voice:', error);
    setTimeout(connectToVoice, 5000);
  }
}

client.login(TOKEN);
