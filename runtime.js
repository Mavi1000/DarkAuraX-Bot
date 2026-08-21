const { runtime } = require('../../lib/functions');

module.exports = {
  name: 'runtime',
  aliases: ['uptime'],
  description: 'Show bot uptime',
  execute: async ({ sock, m, from }) => {
    const time = runtime(Math.floor((Date.now() - global.botStart) / 1000));
    await sock.sendMessage(from, {
      text: `⏱️ *DarkAuraX Bot Runtime*\n\nBot has been running for:\n*${time}*`
    }, { quoted: m });
  }
};
