const config = require('../../config');

module.exports = {
  name: 'owner',
  aliases: ['creator', 'dev'],
  description: 'Show owner contact',
  execute: async ({ sock, m, from }) => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${config.OWNER_NAME}
ORG:DarkAuraX;
TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}
END:VCARD`;

    await sock.sendMessage(from, {
      contacts: {
        displayName: config.OWNER_NAME,
        contacts: [{ vcard }]
      }
    }, { quoted: m });
  }
};
