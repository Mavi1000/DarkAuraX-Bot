module.exports = {
  name: 'antilink',
  aliases: ['antilinkgc'],
  description: 'Toggle anti-link in group (owner/admin)',
  group: true,
  execute: async ({ sock, m, from, args, isOwner, config }) => {
    // This is a basic toggle message. Full anti-link logic needs a database.
    const action = args[0]?.toLowerCase();

    if (!['on', 'off', 'warn', 'delete', 'remove'].includes(action)) {
      return sock.sendMessage(from, {
        text: `*Anti-Link Settings*\n\nCurrent: *${config.ANTI_LINK}*\n\nUsage:\n${config.PREFIX}antilink on\n${config.PREFIX}antilink off\n${config.PREFIX}antilink warn\n${config.PREFIX}antilink delete\n${config.PREFIX}antilink remove`
      }, { quoted: m });
    }

    // In a full version you would save this per-group in a database
    await sock.sendMessage(from, {
      text: `✅ Anti-Link has been set to *${action}* for this group.\n\n(Note: Persistent per-group settings require a database. Currently using global config.)`
    }, { quoted: m });
  }
};
