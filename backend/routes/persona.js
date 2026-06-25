const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSql } = require('../db/database');

router.get('/', (req, res) => {
  const { keyword, tag } = req.query;
  let sql = 'SELECT * FROM personas WHERE 1=1';
  const params = [];
  if (keyword) { sql += ' AND (name LIKE ? OR pain_points LIKE ? OR goals LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`); }
  if (tag) { sql += ' AND tags LIKE ?'; params.push(`%${tag}%`); }
  sql += ' ORDER BY created_at DESC';
  res.json({ code: 0, data: queryAll(sql, params) });
});

router.get('/:id', (req, res) => {
  const row = queryOne('SELECT * FROM personas WHERE id = ?', [req.params.id]);
  row ? res.json({ code: 0, data: row }) : res.json({ code: 404, msg: '画像不存在' });
});

router.post('/', (req, res) => {
  const { name, basic_attrs, behavior_traits, pain_points, goals, scenarios, tags } = req.body;
  const id = runSql('INSERT INTO personas (name, basic_attrs, behavior_traits, pain_points, goals, scenarios, tags) VALUES (?,?,?,?,?,?,?)',
    [name, basic_attrs, behavior_traits, pain_points, goals, scenarios, tags]);
  res.json({ code: 0, data: { id } });
});

router.put('/:id', (req, res) => {
  const { name, basic_attrs, behavior_traits, pain_points, goals, scenarios, tags } = req.body;
  runSql('UPDATE personas SET name=?, basic_attrs=?, behavior_traits=?, pain_points=?, goals=?, scenarios=?, tags=? WHERE id=?',
    [name, basic_attrs, behavior_traits, pain_points, goals, scenarios, tags, req.params.id]);
  res.json({ code: 0, msg: '更新成功' });
});

router.delete('/:id', (req, res) => {
  runSql('DELETE FROM personas WHERE id = ?', [req.params.id]);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
