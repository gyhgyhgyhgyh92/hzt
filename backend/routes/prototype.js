const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSql } = require('../db/database');

router.get('/', (req, res) => {
  const { keyword } = req.query;
  let sql = 'SELECT * FROM prototypes WHERE 1=1';
  const params = [];
  if (keyword) { sql += ' AND name LIKE ?'; params.push(`%${keyword}%`); }
  sql += ' ORDER BY created_at DESC';
  res.json({ code: 0, data: queryAll(sql, params) });
});

router.get('/:id', (req, res) => {
  const row = queryOne('SELECT * FROM prototypes WHERE id = ?', [req.params.id]);
  row ? res.json({ code: 0, data: row }) : res.json({ code: 404, msg: '原型不存在' });
});

router.post('/', (req, res) => {
  const { name, content, pages } = req.body;
  const id = runSql('INSERT INTO prototypes (name, content, pages) VALUES (?,?,?)',
    [name, content, JSON.stringify(pages || [])]);
  res.json({ code: 0, data: { id } });
});

router.put('/:id', (req, res) => {
  const { name, content, pages } = req.body;
  runSql('UPDATE prototypes SET name=?, content=?, pages=? WHERE id=?',
    [name, content, JSON.stringify(pages || []), req.params.id]);
  res.json({ code: 0, msg: '更新成功' });
});

router.delete('/:id', (req, res) => {
  runSql('DELETE FROM prototypes WHERE id = ?', [req.params.id]);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
