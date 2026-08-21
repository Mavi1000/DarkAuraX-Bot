require('dotenv').config();

module.exports = {
  // Bot Identity
  BOT_NAME: process.env.BOT_NAME || "DarkAuraX Bot",
  OWNER_NAME: process.env.OWNER_NAME || "DarkAuraX",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "234xxxxxxxxxx", // Replace with your number (no +)
  PREFIX: process.env.PREFIX || ".",
  
  // Session
  SESSION: process.env.SESSION || "",

  // Features Toggle (like BWM XMD)
  AUTO_STATUS_VIEW: process.env.AUTO_STATUS_VIEW === "true" || true,
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT === "true" || false,
  AUTO_READ: process.env.AUTO_READ === "true" || false,
  ANTI_CALL: process.env.ANTI_CALL === "true" || true,
  ANTI_CALL_ACTION: process.env.ANTI_CALL_ACTION || "reject", // reject | block
  ANTI_DELETE: process.env.ANTI_DELETE === "true" || true,
  ANTI_LINK: process.env.ANTI_LINK || "delete", // off | warn | delete | remove
  WELCOME: process.env.WELCOME === "true" || true,

  // Messages
  ANTI_CALL_MSG: process.env.ANTI_CALL_MSG || "Calls are not allowed. Please message instead.",
  
  // API Keys (optional)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  
  // Timezone
  TIMEZONE: process.env.TIMEZONE || "Africa/Lagos",

  // Pack info for stickers
  STICKER_PACK: process.env.STICKER_PACK || "DarkAuraX",
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || "DarkAuraX Bot"
};
