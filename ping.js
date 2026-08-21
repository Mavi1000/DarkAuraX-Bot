module.exports = {
  name: 'ping',
  aliases: ['p'],
  description: 'Check bot response speed',
  execute: async ({ sock, m, from }) => {
    const start = Date.now();
    const msg = await sock.sendMessage(from, { text: '🏓 Pong...' }, { quoted: m });
    const latency = Date.now() - start;
    
    await sock.sendMessage(from, {
      text: `*DarkAuraX Bot*\n🏓 Pong!\n⏱️ Latency: *${latency}ms*`,
      edit: msg.key
    });
  }
};
