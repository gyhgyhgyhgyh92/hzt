const path = require('path')
const fs = require('fs')

const originalExistsSync = fs.existsSync
const originalReadFileSync = fs.readFileSync
const originalWriteFileSync = fs.writeFileSync
const originalMkdirSync = fs.mkdirSync

describe('RAG Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  describe('computeSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      const ragService = require('../src/services/ragService')
      const result = ragService.computeSimilarity('hello world', 'hello world')
      expect(result).toBe(1.0)
    })

    it('should return 0 for completely different strings', () => {
      const ragService = require('../src/services/ragService')
      const result = ragService.computeSimilarity('hello world', 'goodbye moon')
      expect(result).toBe(0)
    })

    it('should return value between 0 and 1 for partially similar strings', () => {
      const ragService = require('../src/services/ragService')
      const result = ragService.computeSimilarity('hello world', 'hello there')
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(1)
    })

    it('should handle empty strings', () => {
      const ragService = require('../src/services/ragService')
      expect(ragService.computeSimilarity('', '')).toBe(0)
      expect(ragService.computeSimilarity('hello', '')).toBe(0)
      expect(ragService.computeSimilarity('', 'world')).toBe(0)
    })

    it('should be case insensitive', () => {
      const ragService = require('../src/services/ragService')
      const result = ragService.computeSimilarity('Hello World', 'hello world')
      expect(result).toBe(1.0)
    })

    it('should handle Chinese text', () => {
      const ragService = require('../src/services/ragService')
      const result = ragService.computeSimilarity('你好世界', '你好世界')
      expect(result).toBe(1.0)
    })
  })

  describe('splitDocument', () => {
    it('should split document into chunks', () => {
      const ragService = require('../src/services/ragService')
      const content = 'a'.repeat(1000)
      const chunks = ragService.splitDocument(content, 500, 50)
      
      expect(chunks.length).toBe(3)
      expect(chunks[0].text.length).toBe(500)
      expect(chunks[1].text.length).toBe(500)
      expect(chunks[2].text.length).toBe(100)
    })

    it('should handle small documents', () => {
      const ragService = require('../src/services/ragService')
      const content = 'small content'
      const chunks = ragService.splitDocument(content, 500, 50)
      
      expect(chunks.length).toBe(1)
      expect(chunks[0].text).toBe(content)
    })

    it('should have overlap between chunks', () => {
      const ragService = require('../src/services/ragService')
      const content = 'hello world this is a test'
      const chunks = ragService.splitDocument(content, 10, 3)
      
      expect(chunks.length).toBeGreaterThan(1)
      const chunk1End = chunks[0].text.slice(-3)
      const chunk2Start = chunks[1].text.slice(0, 3)
      expect(chunk1End).toBe(chunk2Start)
    })
  })

  describe('addDocument', () => {
    it('should add document to knowledge base', async () => {
      fs.existsSync = jest.fn(() => false)
      fs.writeFileSync = jest.fn()
      fs.mkdirSync = jest.fn()
      
      const ragService = require('../src/services/ragService')
      const result = await ragService.addDocument('Test Title', 'Test content', 'test', ['tag1'])
      
      expect(result).toHaveProperty('id')
      expect(result.title).toBe('Test Title')
      expect(result.content).toBe('Test content')
      expect(result.source).toBe('test')
      expect(result.tags).toEqual(['tag1'])
      expect(fs.writeFileSync).toHaveBeenCalled()
      
      fs.existsSync = originalExistsSync
      fs.writeFileSync = originalWriteFileSync
      fs.mkdirSync = originalMkdirSync
    })
  })

  describe('query', () => {
    it('should return results sorted by similarity', async () => {
      const ragService = require('../src/services/ragService')
      
      await ragService.addDocument('JavaScript Guide', 'JavaScript is a programming language', 'manual', ['programming'])
      await ragService.addDocument('Python Guide', 'Python is another programming language', 'manual', ['programming'])
      
      const result = await ragService.query('JavaScript', 2)
      
      expect(result.results.length).toBeGreaterThan(0)
      expect(result.results[0].documentTitle).toBe('JavaScript Guide')
      expect(result.results[0].similarity).toBeGreaterThan(result.results[1]?.similarity || 0)
    })

    it('should return empty results when no matches', async () => {
      const ragService = require('../src/services/ragService')
      const result = await ragService.query('nonexistent query', 5)
      
      expect(result.results).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('buildContextFromResults', () => {
    it('should build context from results', () => {
      const ragService = require('../src/services/ragService')
      const results = [
        { documentTitle: 'Doc1', text: 'content1' },
        { documentTitle: 'Doc2', text: 'content2' },
        { documentTitle: 'Doc1', text: 'content3' }
      ]
      
      const context = ragService.buildContextFromResults(results, 100)
      
      expect(context).toContain('【Doc1】')
      expect(context).toContain('【Doc2】')
      expect(context).toContain('content1')
      expect(context).toContain('content2')
      expect(context).not.toMatch(/【Doc1】.*【Doc1】/)
    })

    it('should respect maxLength', () => {
      const ragService = require('../src/services/ragService')
      const results = [
        { documentTitle: 'Doc1', text: 'a'.repeat(200) },
        { documentTitle: 'Doc2', text: 'b'.repeat(200) }
      ]
      
      const context = ragService.buildContextFromResults(results, 250)
      
      expect(context.length).toBeLessThanOrEqual(250)
    })
  })

  describe('generateRAGPrompt', () => {
    it('should generate proper RAG prompt', () => {
      const ragService = require('../src/services/ragService')
      const context = '【Doc1】\ntest content'
      const question = 'What is test?'
      
      const prompt = ragService.generateRAGPrompt(question, context)
      
      expect(prompt).toContain('参考资料')
      expect(prompt).toContain(context)
      expect(prompt).toContain('用户问题')
      expect(prompt).toContain(question)
    })
  })

  describe('getStats', () => {
    it('should return statistics', async () => {
      const ragService = require('../src/services/ragService')
      
      const stats = await ragService.getStats()
      
      expect(stats).toHaveProperty('totalDocuments')
      expect(stats).toHaveProperty('totalChunks')
      expect(stats).toHaveProperty('totalSize')
      expect(stats).toHaveProperty('sources')
      expect(stats).toHaveProperty('tags')
    })
  })

  describe('clearKnowledgeBase', () => {
    it('should clear knowledge base', async () => {
      fs.writeFileSync = jest.fn()
      
      const ragService = require('../src/services/ragService')
      const result = await ragService.clearKnowledgeBase()
      
      expect(result).toBe(true)
      expect(fs.writeFileSync).toHaveBeenCalled()
      
      fs.writeFileSync = originalWriteFileSync
    })
  })
})