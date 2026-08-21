const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');
const config = require('../config');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getTime = () => moment().tz(config.TIMEZONE).format('HH:mm:ss');
const getDate = () => moment().tz(config.TIMEZONE).format('DD/MM/YYYY');

const isOwner = (jid) => {
  const number = jid.replace(/[^0-9]/g, '');
  return number === config.OWNER_NUMBER || number === config.OWNER_NUMBER + '@s.whatsapp.net';
};

const isGroup = (jid) => jid.endsWith('@g.us');

const getGroupAdmins = async (sock, groupId) => {
  try {
    const metadata = await sock.groupMetadata(groupId);
    return metadata.participants
      .filter(p => p.admin !== null)
      .map(p => p.id);
  } catch {
    return [];
  }
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const runtime = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
};

module.exports = {
  sleep,
  getTime,
  getDate,
  isOwner,
  isGroup,
  getGroupAdmins,
  formatSize,
  runtime
};
