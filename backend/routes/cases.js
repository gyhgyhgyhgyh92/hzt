const express = require('express');
const router = express.Router();
const { queryAll, queryOne, runSql } = require('../db/database');

router.get('/', (req, res) => {
  const { keyword, category, field } = req.query;
  let sql = 'SELECT * FROM cases WHERE 1=1';
  const params = [];
  if (keyword) { sql += ' AND (title LIKE ? OR background LIKE ? OR ai_tech LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (field) { sql += ' AND field = ?'; params.push(field); }
  sql += ' ORDER BY created_at DESC';
  res.json({ code: 0, data: queryAll(sql, params) });
});

router.get('/categories', (req, res) => {
  const cats = queryAll('SELECT DISTINCT category FROM cases');
  const fields = queryAll('SELECT DISTINCT field FROM cases');
  res.json({ code: 0, data: { categories: cats.map(c => c.category), fields: fields.map(f => f.field) } });
});

router.get('/:id', (req, res) => {
  const row = queryOne('SELECT * FROM cases WHERE id = ?', [req.params.id]);
  row ? res.json({ code: 0, data: row }) : res.json({ code: 404, msg: '案例不存在' });
});

router.post('/', (req, res) => {
  const { title, category, field, ai_tech, background, feature_analysis, ai_tech_analysis, business_model, pros_cons, improvement } = req.body;
  const id = runSql('INSERT INTO cases (title, category, field, ai_tech, background, feature_analysis, ai_tech_analysis, business_model, pros_cons, improvement) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [title, category, field, ai_tech, background, feature_analysis, ai_tech_analysis, business_model, pros_cons, improvement]);
  res.json({ code: 0, data: { id } });
});

router.put('/:id', (req, res) => {
  const { title, category, field, ai_tech, background, feature_analysis, ai_tech_analysis, business_model, pros_cons, improvement } = req.body;
  runSql('UPDATE cases SET title=?, category=?, field=?, ai_tech=?, background=?, feature_analysis=?, ai_tech_analysis=?, business_model=?, pros_cons=?, improvement=? WHERE id=?',
    [title, category, field, ai_tech, background, feature_analysis, ai_tech_analysis, business_model, pros_cons, improvement, req.params.id]);
  res.json({ code: 0, msg: '更新成功' });
});

router.delete('/:id', (req, res) => {
  runSql('DELETE FROM cases WHERE id = ?', [req.params.id]);
  res.json({ code: 0, msg: '删除成功' });
});

router.post('/:id/favorite', (req, res) => {
  runSql('INSERT INTO favorites (type, item_id) VALUES (?, ?)', ['case', req.params.id]);
  res.json({ code: 0, msg: '收藏成功' });
});

router.post('/:id/note', (req, res) => {
  const { content } = req.body;
  runSql('INSERT INTO notes (type, item_id, content) VALUES (?, ?, ?)', ['case', req.params.id, content]);
  res.json({ code: 0, msg: '笔记保存成功' });
});

router.get('/:id/notes', (req, res) => {
  const notes = queryAll('SELECT * FROM notes WHERE type = ? AND item_id = ? ORDER BY created_at DESC', ['case', req.params.id]);
  res.json({ code: 0, data: notes });
});

module.exports = router;
