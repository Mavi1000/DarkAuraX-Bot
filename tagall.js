module.exports = {
  name: 'tagall',
  aliases: ['everyone', 'all'],
  description: 'Tag all members in group',
  group: true,
  execute: async ({ sock, m, from, text, isOwner }) => {
    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants;

      // Only admins or owner can use
      const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      const sender = m.key.participant || m.key.remoteJid;
      const isAdmin = participants.find(p => p.id === sender)?.admin;

      if (!isAdmin && !isOwner) {
        return sock.sendMessage(from, { text: '❌ Only group admins can use this command.' }, { quoted: m });
      }

      let mentions = [];
      let teks = text ? `📢 *Announcement*\n\n${text}\n\n` : `📢 *Tag All Members*\n\n`;

      for (const mem of participants) {
        teks += `• @${mem.id.split('@')[0]}\n`;
        mentions.push(mem.id);
      }

      await sock.sendMessage(from, {
        text: teks,
        mentions
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(from, { text: '❌ Failed to tag members.' }, { quoted: m });
    }
  }
};
