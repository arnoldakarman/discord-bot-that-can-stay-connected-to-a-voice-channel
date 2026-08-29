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

const TOKEN = 'bot_token'; // Replace with your bot's token
const GUILD_ID = 'your_server_id';
const VOICE_CHANNEL_ID = 'voice_were_the_bot_connect';
const TEXT_CHANNEL_ID = 'text_channel';

let connection;
let player;

client.once('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await connectToVoice();
});

async function connectToVoice() {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    const voiceChannel = guild.channels.cache.get(VOICE_CHANNEL_ID);
    if (!voiceChannel || voiceChannel.type !== 2) return console.log("[❌] Invalid voice channel!");

    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
    });
    console.log('🎧 Joined voice channel!');

    player = createAudioPlayer();

    const resource = createAudioResource(path.join(__dirname, 'silence.mp3'));
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      player.play(resource);
    });

    const textChannel = guild.channels.cache.get(TEXT_CHANNEL_ID);
    if (textChannel) {
      const embed = new EmbedBuilder()
        .setTitle('Bot Status')
        .setDescription('[✅] I am now connected to the voice channel 24/7!')
        .setColor(0x00ff00)
        .setTimestamp();
      await textChannel.send({ embeds: [embed] });
    }

    connection.on('stateChange', (oldState, newState) => {
      if (newState.status === 'disconnected') {
        console.log('[⚠️] Disconnected from voice, reconnecting...');
        setTimeout(connectToVoice, 5000);
      }
    });

  } catch (error) {
    console.error('[❌] Error connecting to voice:', error);
    setTimeout(connectToVoice, 5000);
  }
}

client.login(TOKEN);
