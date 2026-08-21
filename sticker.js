const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const config = require('../../config');

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker', 'take'],
  description: 'Convert image/video to sticker',
  execute: async ({ sock, m, from }) => {
    try {
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const messageType = quoted ? Object.keys(quoted)[0] : Object.keys(m.message)[0];

      if (!['imageMessage', 'videoMessage'].includes(messageType) && !quoted) {
        return sock.sendMessage(from, {
          text: '❌ Reply to an image or short video with *' + config.PREFIX + 'sticker*'
        }, { quoted: m });
      }

      const mediaMessage = quoted ? quoted[messageType] : m.message[messageType];
      const stream = await downloadContentFromMessage(mediaMessage, messageType.replace('Message', ''));
      
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const tempFile = path.join(__dirname, '../../media', `temp_${Date.now()}`);
      const isVideo = messageType === 'videoMessage';
      const inputPath = tempFile + (isVideo ? '.mp4' : '.jpg');
      const outputPath = tempFile + '.webp';

      await fs.writeFile(inputPath, buffer);

      // Convert using ffmpeg
      if (isVideo) {
        await execAsync(`ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -loop 0 -ss 0 -t 8 -c:v libwebp -preset default -an -vsync 0 "${outputPath}"`);
      } else {
        await execAsync(`ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -c:v libwebp -preset default "${outputPath}"`);
      }

      await sock.sendMessage(from, {
        sticker: { url: outputPath }
      }, { quoted: m });

      // Cleanup
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});

    } catch (err) {
      console.error('Sticker error:', err);
      await sock.sendMessage(from, {
        text: '❌ Failed to create sticker. Make sure the media is valid and not too large.'
      }, { quoted: m });
    }
  }
};
