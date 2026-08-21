# 🌑 DarkAuraX Bot

**Powerful Multi-Device WhatsApp Bot**  
Inspired by the style and structure of BWM XMD.

---

## ✨ Features

- ✅ Multi-Device Support (Baileys)
- ✅ Pairing Code Login
- ✅ Auto Status View
- ✅ Anti-Call
- ✅ Anti-Delete (skeleton ready)
- ✅ Group Management (TagAll, Promote, etc.)
- ✅ Sticker Maker
- ✅ Modular Command System
- ✅ Easy to expand (Downloaders, AI, Games...)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure
Copy `.env.example` to `.env` and edit:
```bash
cp .env.example .env
```

Set your number:
```
OWNER_NUMBER=234xxxxxxxxxx
```

### 3. Run the Bot
```bash
npm start
```

You will receive a **Pairing Code**.  
Go to WhatsApp → Linked Devices → Link a Device → Enter the code.

---

## 📁 Project Structure

```
DarkAuraX-Bot/
├── index.js              # Main entry
├── config.js             # Configuration
├── commands/
│   ├── general/          # menu, ping, runtime
│   ├── group/            # tagall, antilink...
│   ├── owner/            # owner tools
│   ├── download/         # yt, tiktok...
│   ├── fun/              # sticker, games
│   └── ai/               # AI chat
├── lib/                  # Helper functions
├── session/              # Auth files
└── media/                # Temporary files
```

---

## 🛠️ Adding New Commands

Create a new file in the appropriate folder:

```js
module.exports = {
  name: 'commandname',
  aliases: ['alias1'],
  description: 'What it does',
  owner: false,      // true = owner only
  group: false,      // true = groups only
  execute: async ({ sock, m, from, args, text, isOwner, config }) => {
    // Your code here
    await sock.sendMessage(from, { text: 'Hello!' }, { quoted: m });
  }
};
```

---

## ☁️ Deployment

Works on:
- Render
- Koyeb
- Railway
- Heroku
- VPS / Panel
- Replit

Just set the environment variables and run `npm start`.

---

## ⚠️ Disclaimer

This bot uses unofficial WhatsApp Web API (Baileys).  
Using bots can result in account bans. Use a secondary number.  
For educational purposes only.

---

**DarkAuraX Bot** • Built with ❤️
