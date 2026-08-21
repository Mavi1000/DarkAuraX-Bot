const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  jidNormalizedUser
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const { sleep, isOwner, isGroup, getGroupAdmins, runtime } = require('./lib/functions');

// Global
global.botStart = Date.now();
global.commands = new Map();

// Load all commands
const loadCommands = () => {
  const categories = ['general', 'download', 'group', 'owner', 'fun', 'ai'];
  let count = 0;

  for (const cat of categories) {
    const dir = path.join(__dirname, 'commands', cat);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const cmd = require(path.join(dir, file));
        if (cmd.name) {
          global.commands.set(cmd.name, cmd);
          if (cmd.aliases && Array.isArray(cmd.aliases)) {
            cmd.aliases.forEach(alias => global.commands.set(alias, cmd));
          }
          count++;
        }
      } catch (e) {
        console.log(chalk.red(`Failed to load ${file}:`), e.message);
      }
    }
  }
  console.log(chalk.green(`✅ Loaded ${count} commands`));
};

async function startBot() {
  console.log(chalk.magentaBright(`\n╔══════════════════════════════════════╗`));
  console.log(chalk.magentaBright(`║         DarkAuraX Bot v1.0           ║`));
  console.log(chalk.magentaBright(`║     Multi-Device WhatsApp Bot        ║`));
  console.log(chalk.magentaBright(`╚══════════════════════════════════════╝\n`));

  loadCommands();

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
    browser: Browsers.macOS('Desktop'),
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: true,
    getMessage: async () => undefined
  });

  // Pairing code if no session
  if (!sock.authState.creds.registered) {
    const phoneNumber = config.OWNER_NUMBER;
    if (!phoneNumber || phoneNumber.includes('xxxx')) {
      console.log(chalk.red('❌ Please set OWNER_NUMBER in .env or config.js first!'));
      process.exit(1);
    }

    console.log(chalk.yellow('⏳ Generating pairing code...'));
    await sleep(2000);
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(chalk.greenBright(`\n🔑 Pairing Code: ${code}`));
    console.log(chalk.cyan('Go to WhatsApp → Linked Devices → Link a Device → Enter the code above\n'));
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('QR Code received (optional):'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log(chalk.greenBright('✅ DarkAuraX Bot Connected Successfully!'));
      console.log(chalk.cyan(`🤖 Bot Name : ${config.BOT_NAME}`));
      console.log(chalk.cyan(`👑 Owner    : ${config.OWNER_NUMBER}`));
      console.log(chalk.cyan(`⚙️  Prefix  : ${config.PREFIX}\n`));
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('Connection closed. Reconnecting:', shouldReconnect));
      if (shouldReconnect) {
        await sleep(3000);
        startBot();
      } else {
        console.log(chalk.red('Logged out. Delete session folder and restart.'));
      }
    }
  });

  // Message handler
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    try {
      const from = m.key.remoteJid;
      const isGroupChat = isGroup(from);
      const sender = m.key.participant || m.key.remoteJid;
      const body = m.message.conversation ||
                   m.message.extendedTextMessage?.text ||
                   m.message.imageMessage?.caption ||
                   m.message.videoMessage?.caption || '';

      const prefix = config.PREFIX;
      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
      const args = body.trim().split(' ').slice(1);
      const text = args.join(' ');

      // Auto read
      if (config.AUTO_READ) {
        await sock.readMessages([m.key]);
      }

      // Command execution
      if (isCmd) {
        const cmd = global.commands.get(command);
        if (cmd) {
          // Owner only check
          if (cmd.owner && !isOwner(sender)) {
            return sock.sendMessage(from, { text: '❌ This command is only for the Owner.' }, { quoted: m });
          }

          // Group only
          if (cmd.group && !isGroupChat) {
            return sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: m });
          }

          await cmd.execute({ sock, m, from, sender, args, text, isGroup: isGroupChat, isOwner: isOwner(sender), config });
        }
      }
    } catch (err) {
      console.error('Message handler error:', err);
    }
  });

  // Anti-call
  if (config.ANTI_CALL) {
    sock.ev.on('call', async (calls) => {
      for (const call of calls) {
        if (call.status === 'offer') {
          await sock.rejectCall(call.id, call.from);
          if (config.ANTI_CALL_ACTION === 'block') {
            await sock.updateBlockStatus(call.from, 'block');
          }
          await sock.sendMessage(call.from, { text: config.ANTI_CALL_MSG });
        }
      }
    });
  }

  // Auto status view
  if (config.AUTO_STATUS_VIEW) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (msg.key && msg.key.remoteJid === 'status@broadcast') {
        try {
          await sock.readMessages([msg.key]);
          if (config.AUTO_STATUS_REACT) {
            // Optional react
          }
        } catch {}
      }
    });
  }

  return sock;
}

startBot().catch(err => {
  console.error('Failed to start bot:', err);
  process.exit(1);
});
