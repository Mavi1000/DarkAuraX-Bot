const config = require('../../config');
const { runtime } = require('../../lib/functions');

module.exports = {
  name: 'menu',
  aliases: ['help', 'list'],
  description: 'Show bot menu',
  execute: async ({ sock, m, from, config }) => {
    const uptime = runtime(Math.floor((Date.now() - global.botStart) / 1000));
    
    const menu = `
╭───「 *${config.BOT_NAME}* 」
│ 👑 Owner: ${config.OWNER_NAME}
│ ⚙️ Prefix: ${config.PREFIX}
│ ⏱️ Uptime: ${uptime}
│ 📅 Mode: Public
╰──────────────────

╭───「 *GENERAL* 」
│ • ${config.PREFIX}menu
│ • ${config.PREFIX}ping
│ • ${config.PREFIX}runtime
│ • ${config.PREFIX}owner
╰──────────────────

╭───「 *DOWNLOAD* 」
│ • ${config.PREFIX}play <query>
│ • ${config.PREFIX}ytmp3 <url>
│ • ${config.PREFIX}ytmp4 <url>
│ • ${config.PREFIX}tiktok <url>
│ • ${config.PREFIX}ig <url>
╰──────────────────

╭───「 *GROUP* 」
│ • ${config.PREFIX}tagall
│ • ${config.PREFIX}hidetag
│ • ${config.PREFIX}promote
│ • ${config.PREFIX}demote
│ • ${config.PREFIX}kick
│ • ${config.PREFIX}antilink
╰──────────────────

╭───「 *OWNER* 」
│ • ${config.PREFIX}broadcast
│ • ${config.PREFIX}join
│ • ${config.PREFIX}leave
│ • ${config.PREFIX}restart
╰──────────────────

╭───「 *FUN & AI* 」
│ • ${config.PREFIX}sticker
│ • ${config.PREFIX}ai <text>
│ • ${config.PREFIX}quote
╰──────────────────

*DarkAuraX Bot* • Powered by Baileys
`;

    await sock.sendMessage(from, { text: menu.trim() }, { quoted: m });
  }
};
