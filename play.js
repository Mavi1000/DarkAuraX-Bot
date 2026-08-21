// Placeholder for YouTube play / search
// You can expand this with yt-search + ytdl or better libraries later

module.exports = {
  name: 'play',
  aliases: ['song', 'music'],
  description: 'Search and download YouTube audio',
  execute: async ({ sock, m, from, text, config }) => {
    if (!text) {
      return sock.sendMessage(from, {
        text: `❌ Usage: *${config.PREFIX}play* <song name>`
      }, { quoted: m });
    }

    await sock.sendMessage(from, {
      text: `🔍 Searching for *${text}*...\n\nThis is a placeholder. Full YouTube downloader can be added next.`
    }, { quoted: m });
  }
};
