const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { saveDb } = require('../db/database');

const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

function doBackup() {
  saveDb();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(backupDir, `backup-${ts}.db`);
  fs.copyFileSync(path.join(__dirname, '..', 'db', 'campus.db'), file);
  return file;
}

// 每天凌晨2点自动备份
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 2 && now.getMinutes() === 0) {
    console.log('[定时备份]', doBackup());
  }
}, 60000);

router.post('/manual', (req, res) => {
  try {
    const file = doBackup();
    res.json({ code: 0, msg: '备份成功', data: { file: path.basename(file) } });
  } catch (e) {
    res.json({ code: 500, msg: '备份失败: ' + e.message });
  }
});

router.get('/list', (req, res) => {
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db')).sort().reverse();
  res.json({ code: 0, data: files });
});

module.exports = router;
