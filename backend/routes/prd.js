const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSql } = require('../db/database');

router.get('/', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM prd_templates WHERE 1=1';
  const params = [];
  if (type) { sql += ' AND type = ?'; params.push(type); }
  sql += ' ORDER BY created_at DESC';
  res.json({ code: 0, data: queryAll(sql, params) });
});

router.get('/:id', (req, res) => {
  const row = queryOne('SELECT * FROM prd_templates WHERE id = ?', [req.params.id]);
  row ? res.json({ code: 0, data: row }) : res.json({ code: 404, msg: '模板不存在' });
});

router.post('/', (req, res) => {
  const { name, type, content, example, guide } = req.body;
  const id = runSql('INSERT INTO prd_templates (name, type, content, example, guide) VALUES (?,?,?,?,?)',
    [name, type, content, example, guide]);
  res.json({ code: 0, data: { id } });
});

router.put('/:id', (req, res) => {
  const { name, type, content, example, guide } = req.body;
  runSql('UPDATE prd_templates SET name=?, type=?, content=?, example=?, guide=? WHERE id=?',
    [name, type, content, example, guide, req.params.id]);
  res.json({ code: 0, msg: '更新成功' });
});

router.delete('/:id', (req, res) => {
  runSql('DELETE FROM prd_templates WHERE id = ?', [req.params.id]);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
