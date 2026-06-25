const express = require('express');
const router = express.Router();
const { getDb, runSql, queryAll, queryOne, saveDb } = require('../db/database');

// 记录用户访问
router.post('/track', (req, res) => {
  const { module, action, user_id = 'anonymous' } = req.body;
  
  if (!module || !action) {
    return res.json({ code: 1, msg: '缺少必要参数' });
  }
  
  try {
    runSql(
      'INSERT INTO user_stats (user_id, module, action, created_at) VALUES (?, ?, ?, datetime("now"))',
      [user_id, module, action]
    );
    saveDb();
    res.json({ code: 0, msg: '记录成功' });
  } catch (error) {
    console.error('记录访问统计失败:', error);
    res.json({ code: 1, msg: '记录失败' });
  }
});

// 获取模块访问统计
router.get('/modules', (req, res) => {
  try {
    const stats = queryAll(`
      SELECT 
        module,
        COUNT(*) as visit_count,
        COUNT(DISTINCT user_id) as unique_users,
        MAX(created_at) as last_visit
      FROM user_stats
      GROUP BY module
      ORDER BY visit_count DESC
    `);
    
    res.json({ code: 0, data: stats });
  } catch (error) {
    console.error('获取模块统计失败:', error);
    res.json({ code: 1, msg: '获取统计失败', data: [] });
  }
});

// 获取总体统计
router.get('/summary', (req, res) => {
  try {
    const totalVisits = queryOne('SELECT COUNT(*) as count FROM user_stats');
    const uniqueUsers = queryOne('SELECT COUNT(DISTINCT user_id) as count FROM user_stats');
    const todayVisits = queryOne('SELECT COUNT(*) as count FROM user_stats WHERE date(created_at) = date("now")');
    
    const moduleStats = queryAll(`
      SELECT module, COUNT(*) as count
      FROM user_stats
      GROUP BY module
      ORDER BY count DESC
      LIMIT 5
    `);
    
    res.json({
      code: 0,
      data: {
        total_visits: totalVisits?.count || 0,
        unique_users: uniqueUsers?.count || 0,
        today_visits: todayVisits?.count || 0,
        top_modules: moduleStats
      }
    });
  } catch (error) {
    console.error('获取总体统计失败:', error);
    res.json({ code: 1, msg: '获取统计失败', data: {} });
  }
});

// 获取用户行为分析
router.get('/behavior', (req, res) => {
  try {
    const actions = queryAll(`
      SELECT 
        action,
        COUNT(*) as count,
        module
      FROM user_stats
      GROUP BY action, module
      ORDER BY count DESC
      LIMIT 20
    `);
    
    res.json({ code: 0, data: actions });
  } catch (error) {
    console.error('获取行为分析失败:', error);
    res.json({ code: 1, msg: '获取分析失败', data: [] });
  }
});

module.exports = router;
