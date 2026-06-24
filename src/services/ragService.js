const fs = require('fs')
const path = require('path')

let knowledgeBase = []
let indexed = false

const CHUNK_SIZE = 500
const CHUNK_OVERLAP = 50
const MAX_RESULTS = 5

const loadKnowledgeBase = async () => {
  try {
    const kbPath = path.join(__dirname, '../../data/knowledge_base.json')
    if (fs.existsSync(kbPath)) {
      const data = JSON.parse(fs.readFileSync(kbPath, 'utf-8'))
      knowledgeBase = data.documents || []
      indexed = knowledgeBase.length > 0
    }
  } catch (error) {
    console.error('Failed to load knowledge base:', error)
    knowledgeBase = []
  }
  return knowledgeBase
}

const saveKnowledgeBase = async () => {
  try {
    const dataDir = path.join(__dirname, '../../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    const kbPath = path.join(dataDir, 'knowledge_base.json')
    fs.writeFileSync(kbPath, JSON.stringify({
      documents: knowledgeBase,
      lastUpdated: new Date().toISOString()
    }, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save knowledge base:', error)
    return false
  }
}

const simpleTokenize = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
}

const computeTF = (tokens) => {
  const tf = {}
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1
  })
  return tf
}

const computeSimilarity = (text1, text2) => {
  const tokens1 = simpleTokenize(text1)
  const tokens2 = simpleTokenize(text2)
  
  const tf1 = computeTF(tokens1)
  const tf2 = computeTF(tokens2)
  
  const allTokens = new Set([...tokens1, ...tokens2])
  
  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0
  
  allTokens.forEach(token => {
    const v1 = tf1[token] || 0
    const v2 = tf2[token] || 0
    dotProduct += v1 * v2
    norm1 += v1 * v1
    norm2 += v2 * v2
  })
  
  if (norm1 === 0 || norm2 === 0) return 0
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))
}

const splitDocument = (content, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  const chunks = []
  let start = 0
  
  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length)
    const chunk = content.slice(start, end)
    chunks.push({
      text: chunk,
      start,
      end
    })
    
    if (end >= content.length) break
    start = end - overlap
  }
  
  return chunks
}

const addDocument = async (title, content, source = 'manual', tags = []) => {
  const chunks = splitDocument(content)
  
  const doc = {
    id: Date.now().toString(),
    title,
    content,
    source,
    tags,
    chunks: chunks.map((chunk, idx) => ({
      id: `${Date.now()}-${idx}`,
      text: chunk.text,
      index: idx
    })),
    createdAt: new Date().toISOString()
  }
  
  knowledgeBase.push(doc)
  indexed = true
  await saveKnowledgeBase()
  
  return doc
}

const query = async (question, topK = MAX_RESULTS) => {
  if (!indexed || knowledgeBase.length === 0) {
    await loadKnowledgeBase()
  }
  
  const results = []
  
  knowledgeBase.forEach(doc => {
    doc.chunks.forEach(chunk => {
      const similarity = computeSimilarity(question, chunk.text)
      if (similarity > 0.1) {
        results.push({
          documentId: doc.id,
          documentTitle: doc.title,
          chunkId: chunk.id,
          text: chunk.text,
          similarity,
          source: doc.source,
          tags: doc.tags
        })
      }
    })
  })
  
  results.sort((a, b) => b.similarity - a.similarity)
  
  return {
    results: results.slice(0, topK),
    total: results.length
  }
}

const buildContextFromResults = (results, maxLength = 2000) => {
  let context = ''
  let usedTitles = new Set()
  
  for (const result of results) {
    if (context.length >= maxLength) break
    
    const title = result.documentTitle
    const text = result.text
    
    if (!usedTitles.has(title)) {
      context += `\n【${title}】\n`
      usedTitles.add(title)
    }
    context += `${text}\n`
  }
  
  return context.trim()
}

const generateRAGPrompt = (question, context) => {
  return `你是一个知识渊博的AI助手。请根据以下参考资料回答用户的问题。

参考资料：
${context}

用户问题：${question}

请根据参考资料中的信息回答问题。如果参考资料中没有相关信息，请基于你的知识回答，但请说明。回答要简洁明了。`
}

const searchDocuments = async (queryStr, limit = 10) => {
  if (!indexed || knowledgeBase.length === 0) {
    await loadKnowledgeBase()
  }
  
  const results = []
  
  knowledgeBase.forEach(doc => {
    const similarity = computeSimilarity(queryStr, doc.title + ' ' + doc.content)
    if (similarity > 0.05) {
      results.push({
        id: doc.id,
        title: doc.title,
        snippet: doc.content.slice(0, 200) + '...',
        similarity,
        source: doc.source,
        tags: doc.tags,
        createdAt: doc.createdAt
      })
    }
  })
  
  results.sort((a, b) => b.similarity - a.similarity)
  
  return results.slice(0, limit)
}

const deleteDocument = async (docId) => {
  const index = knowledgeBase.findIndex(d => d.id === docId)
  if (index > -1) {
    knowledgeBase.splice(index, 1)
    await saveKnowledgeBase()
    return true
  }
  return false
}

const getDocument = async (docId) => {
  return knowledgeBase.find(d => d.id === docId) || null
}

const listDocuments = async (page = 1, pageSize = 20) => {
  if (!indexed || knowledgeBase.length === 0) {
    await loadKnowledgeBase()
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    documents: knowledgeBase.slice(start, end).map(d => ({
      id: d.id,
      title: d.title,
      source: d.source,
      tags: d.tags,
      chunksCount: d.chunks?.length || 0,
      createdAt: d.createdAt
    })),
    total: knowledgeBase.length,
    page,
    pageSize
  }
}

const importMarkdown = async (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const title = path.basename(filePath, path.extname(filePath))
    
    return await addDocument(title, content, 'file', ['markdown'])
  } catch (error) {
    console.error('Failed to import markdown:', error)
    return null
  }
}

const clearKnowledgeBase = async () => {
  knowledgeBase = []
  indexed = false
  await saveKnowledgeBase()
  return true
}

const getStats = async () => {
  if (!indexed || knowledgeBase.length === 0) {
    await loadKnowledgeBase()
  }
  
  let totalChunks = 0
  let totalSize = 0
  const sources = {}
  const tags = {}
  
  knowledgeBase.forEach(doc => {
    totalChunks += doc.chunks?.length || 0
    totalSize += doc.content?.length || 0
    sources[doc.source] = (sources[doc.source] || 0) + 1
    doc.tags?.forEach(tag => {
      tags[tag] = (tags[tag] || 0) + 1
    })
  })
  
  return {
    totalDocuments: knowledgeBase.length,
    totalChunks,
    totalSize,
    sources,
    tags
  }
}

module.exports = {
  loadKnowledgeBase,
  addDocument,
  query,
  buildContextFromResults,
  generateRAGPrompt,
  searchDocuments,
  deleteDocument,
  getDocument,
  listDocuments,
  importMarkdown,
  clearKnowledgeBase,
  getStats,
  splitDocument,
  computeSimilarity
}
