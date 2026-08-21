require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs-extra');
const moment = require('moment-timezone');

// ====================== CONFIG ======================
const config = {
  BOT_NAME: process.env.BOT_NAME || "DarkAuraX Bot",
  OWNER_NAME: process.env.OWNER_NAME || "DarkAuraX",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "234xxxxxxxxxx",
  PREFIX: process.env.PREFIX || ".",
  AUTO_STATUS_VIEW: process.env.AUTO_STATUS_VIEW !== "false",
  ANTI_CALL: process.env.ANTI_CALL !== "false",
  TIMEZONE: process.env.TIMEZONE || "Africa/Lagos"
};

global.botStart = Date.now();

// ====================== HELPERS ======================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const runtime = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};
const isOwner = (jid) => {
  const num = jid.replace(/[^0-9]/g, '');
  return num === config.OWNER_NUMBER;
};

// ====================== START BOT ======================
async function startBot() {
  console.log(chalk.magentaBright(`\n╔══════════════════════════════════════╗`));
  console.log(chalk.magentaBright(`║         DarkAuraX Bot v1.0           ║`));
  console.log(chalk.magentaBright(`║     Improved Pairing Code Version    ║`));
  console.log(chalk.magentaBright(`╚══════════════════════════════════════╝\n`));

  console.log(chalk.cyan(`Owner Number set to: ${config.OWNER_NUMBER}`));

  if (!config.OWNER_NUMBER || config.OWNER_NUMBER.includes('xxxx') || config.OWNER_NUMBER.length < 11) {
    console.log(chalk.red('\n❌ ERROR: OWNER_NUMBER is missing or invalid!'));
    console.log(chalk.yellow('Please set OWNER_NUMBER in Render Environment Variables.'));
    console.log(chalk.yellow('Example: 2348100058624\n'));
    process.exit(1);
  }

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: Browsers.ubuntu('Chrome'),
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    getMessage: async () => undefined
  });

  // ====================== PAIRING CODE ======================
  if (!sock.authState.creds.registered) {
    console.log(chalk.yellow('\n⏳ Waiting to generate Pairing Code...\n'));

    await sleep(3000);

    try {
      const code = await sock.requestPairingCode(config.OWNER_NUMBER);
      
      console.log(chalk.greenBright('══════════════════════════════════════'));
      console.log(chalk.greenBright('         PAIRING CODE GENERATED       '));
      console.log(chalk.greenBright('══════════════════════════════════════'));
      console.log(chalk.whiteBright(`\n           ${code}\n`));
      console.log(chalk.greenBright('══════════════════════════════════════'));
      console.log(chalk.cyan('\nHOW TO LINK:'));
      console.log(chalk.white('1. Open WhatsApp on your phone'));
      console.log(chalk.white('2. Go to Settings → Linked Devices'));
      console.log(chalk.white('3. Tap "Link a Device"'));
      console.log(chalk.white('4. Tap "Link with phone number instead"'));
      console.log(chalk.white(`5. Enter this code quickly: ${code}`));
      console.log(chalk.yellow('\n⚠️  Code expires in about 60-90 seconds. Be fast!\n'));
      
    } catch (err) {
      console.log(chalk.red('\n❌ Failed to generate pairing code:'));
      console.log(chalk.red(err.message));
      console.log(chalk.yellow('\nTrying again in 5 seconds...'));
      await sleep(5000);
      startBot();
      return;
    }
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(chalk.greenBright('\n✅ ========================================'));
      console.log(chalk.greenBright('   DarkAuraX Bot Connected Successfully!'));
      console.log(chalk.greenBright('========================================\n'));
      console.log(chalk.cyan(`🤖 Bot Name : ${config.BOT_NAME}`));
      console.log(chalk.cyan(`👑 Owner    : ${config.OWNER_NUMBER}`));
      console.log(chalk.cyan(`⚙️  Prefix  : ${config.PREFIX}\n`));
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(chalk.red(`\nConnection closed. Status: ${statusCode}`));
      console.log(chalk.yellow(`Reconnecting: ${shouldReconnect}`));
      
      if (shouldReconnect) {
        await sleep(4000);
        startBot();
      } else {
        console.log(chalk.red('Logged out. Please delete session and restart.'));
      }
    }
  });

  // ====================== MESSAGE HANDLER ======================
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    try {
      const from = m.key.remoteJid;
      const sender = m.key.participant || m.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const body = m.message.conversation ||
                   m.message.extendedTextMessage?.text ||
                   m.message.imageMessage?.caption ||
                   m.message.videoMessage?.caption || '';

      const prefix = config.PREFIX;
      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
      const args = body.trim().split(/ +/).slice(1);
      const text = args.join(' ');

      if (!isCmd) return;

      // MENU
      if (command === 'menu' || command === 'help') {
        const uptime = runtime(Math.floor((Date.now() - global.botStart) / 1000));
        const menu = `
╭───「 *${config.BOT_NAME}* 」
│ 👑 Owner: ${config.OWNER_NAME}
│ ⚙️ Prefix: ${config.PREFIX}
│ ⏱️ Uptime: ${uptime}
╰──────────────────

╭───「 *COMMANDS* 」
│ • ${prefix}menu
│ • ${prefix}ping
│ • ${prefix}runtime
│ • ${prefix}owner
│ • ${prefix}tagall  (Group)
│ • ${prefix}restart (Owner)
╰──────────────────

*DarkAuraX Bot*
`;
        await sock.sendMessage(from, { text: menu.trim() }, { quoted: m });
      }

      // PING
      else if (command === 'ping') {
        const start = Date.now();
        const msg = await sock.sendMessage(from, { text: '🏓 Pong...' }, { quoted: m });
        const latency = Date.now() - start;
        await sock.sendMessage(from, {
          text: `*DarkAuraX Bot*\n🏓 Pong!\n⏱️ Latency: *${latency}ms*`,
          edit: msg.key
        });
      }

      // RUNTIME
      else if (command === 'runtime' || command === 'uptime') {
        const time = runtime(Math.floor((Date.now() - global.botStart) / 1000));
        await sock.sendMessage(from, {
          text: `⏱️ *DarkAuraX Bot Runtime*\n\nBot has been running for:\n*${time}*`
        }, { quoted: m });
      }

      // OWNER
      else if (command === 'owner') {
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

      // TAGALL
      else if (command === 'tagall' || command === 'all') {
        if (!isGroup) {
          return sock.sendMessage(from, { text: '❌ This command only works in groups.' }, { quoted: m });
        }
        try {
          const metadata = await sock.groupMetadata(from);
          const participants = metadata.participants;
          let teks = text ? `📢 *Announcement*\n\n${text}\n\n` : `📢 *Tag All Members*\n\n`;
          let mentions = [];
          for (const mem of participants) {
            teks += `• @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
          }
          await sock.sendMessage(from, { text: teks, mentions }, { quoted: m });
        } catch (e) {
          await sock.sendMessage(from, { text: '❌ Failed to tag members.' }, { quoted: m });
        }
      }

      // RESTART
      else if (command === 'restart') {
        if (!isOwner(sender)) {
          return sock.sendMessage(from, { text: '❌ Owner only command.' }, { quoted: m });
        }
        await sock.sendMessage(from, { text: '🔄 Restarting DarkAuraX Bot...' }, { quoted: m });
        process.exit(0);
      }

    } catch (err) {
      console.error('Message error:', err);
    }
  });

  // Anti Call
  if (config.ANTI_CALL) {
    sock.ev.on('call', async (calls) => {
      for (const call of calls) {
        if (call.status === 'offer') {
          try {
            await sock.rejectCall(call.id, call.from);
            await sock.sendMessage(call.from, { text: 'Calls are not allowed. Please send a message instead.' });
          } catch {}
        }
      }
    });
  }

  // Auto Status View
  if (config.AUTO_STATUS_VIEW) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (msg.key && msg.key.remoteJid === 'status@broadcast') {
        try {
          await sock.readMessages([msg.key]);
        } catch {}
      }
    });
  }
}

startBot().catch(err => {
  console.error('Failed to start bot:', err);
  process.exit(1);
});
