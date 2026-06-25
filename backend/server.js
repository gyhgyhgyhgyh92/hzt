const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API路由
app.use('/api/cases', require('./routes/cases'));
app.use('/api/prd', require('./routes/prd'));
app.use('/api/persona', require('./routes/persona'));
app.use('/api/prototype', require('./routes/prototype'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/backup', require('./routes/backup'));

// SPA fallback
app.get('*', (req, res) => {
  const distPath = path.join(__dirname, '../frontend/dist/index.html');
  if (require('fs').existsSync(distPath)) {
    res.sendFile(distPath);
  } else {
    res.json({ msg: '校园AI助手后端服务运行中，前端尚未构建。请先执行 cd frontend && npm run build' });
  }
});

async function start() {
  await getDb();
  console.log('数据库初始化完成');
  app.listen(PORT, () => {
    console.log(`校园AI助手后端服务已启动: http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
