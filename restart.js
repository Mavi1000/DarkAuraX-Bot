module.exports = {
  name: 'restart',
  aliases: ['reboot'],
  description: 'Restart the bot',
  owner: true,
  execute: async ({ sock, m, from }) => {
    await sock.sendMessage(from, { text: '🔄 Restarting DarkAuraX Bot...' }, { quoted: m });
    process.exit(0); // Process manager (PM2 / Render) will restart it
  }
};
