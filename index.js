const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');  

const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

const targetChannelId = config.channel_id;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/createRole', upload.single('roleImage'), async (req, res) => {
  try {
    const { discordName, roleName, roleColor } = req.body;

    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.status(404).json({ error: '서버를 찾을 수 없습니다.' });
    }

    const targetChannel = guild.channels.cache.get(targetChannelId);
    if (targetChannel) {
      const embed = new EmbedBuilder()
        .setTitle('커스텀 역할 제작 신청이 도착했습니다!')
        .setColor(roleColor)
        .addFields(
          { name: '신청자명', value: discordName },
          { name: '역할 이름', value: roleName },
          { name: '역할 색상', value: roleColor }
        )
        .setTimestamp();

      if (req.file) {
        embed.setImage(`attachment://roleImage.png`);
      }

      targetChannel.send({ content: "<@&1061172968258019328>", embeds: [embed], files: req.file ? [{ attachment: req.file.buffer, name: 'roleImage.png' }] : [] });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '내부 서버 오류' });
  }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token);  

app.listen(config.port, () => {  
  console.log(`Server is running at http://localhost:${config.port}`);
});
