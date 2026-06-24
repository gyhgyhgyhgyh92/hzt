const fs = require('fs')
const path = require('path')

let registeredTools = {}
let agentConfig = {
  enabled: true,
  maxSteps: 10,
  autoExecute: false,
  confirmOnDangerous: true
}

const loadConfig = () => {
  try {
    const configPath = path.join(__dirname, '../../config.json')
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (config.agent) {
        agentConfig = { ...agentConfig, ...config.agent }
      }
    }
  } catch (error) {
    console.error('Failed to load agent config:', error)
  }
  return agentConfig
}

const DANGEROUS_TOOLS = ['file_delete', 'shell_exec', 'system_shutdown']

const builtInTools = {
  calculator: {
    name: 'calculator',
    description: '执行数学计算',
    parameters: {
      expression: { type: 'string', description: '数学表达式，如：2+2*3' }
    },
    category: 'utility',
    execute: async (params) => {
      try {
        const expression = params.expression || ''
        
        if (!/^[\d+\-*/().\s%^]+$/.test(expression)) {
          return { success: false, error: '表达式包含非法字符，只允许数字和+-*/().%^运算符' }
        }
        
        if (expression.length > 100) {
          return { success: false, error: '表达式过长，最大长度100字符' }
        }
        
        let parentheses = 0
        for (const char of expression) {
          if (char === '(') parentheses++
          if (char === ')') parentheses--
          if (parentheses < 0) {
            return { success: false, error: '括号不匹配' }
          }
        }
        if (parentheses !== 0) {
          return { success: false, error: '括号不匹配' }
        }
        
        const result = Function('"use strict"; return (' + expression + ')')()
        
        if (typeof result !== 'number' || !isFinite(result)) {
          return { success: false, error: '计算结果无效' }
        }
        
        return { success: true, result, expression: params.expression }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  },
  
  translator: {
    name: 'translator',
    description: '文本翻译',
    parameters: {
      text: { type: 'string', description: '要翻译的文本' },
      targetLang: { type: 'string', description: '目标语言', default: 'en' }
    },
    category: 'utility',
    execute: async (params) => {
      const translations = {
        'hello': '你好',
        'world': '世界',
        'goodbye': '再见',
        'thanks': '谢谢',
        '你好': 'hello',
        '世界': 'world',
        '再见': 'goodbye',
        '谢谢': 'thanks'
      }
      
      const text = params.text.toLowerCase()
      const translated = translations[text] || `[翻译结果] ${params.text}`
      
      return {
        success: true,
        original: params.text,
        translated,
        targetLang: params.targetLang
      }
    }
  },
  
  get_time: {
    name: 'get_time',
    description: '获取当前时间',
    parameters: {},
    category: 'utility',
    execute: async () => {
      const now = new Date()
      return {
        success: true,
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        timestamp: now.toISOString(),
        weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
      }
    }
  },
  
  get_weather: {
    name: 'get_weather',
    description: '获取天气信息（模拟数据）',
    parameters: {
      city: { type: 'string', description: '城市名称', default: '北京' }
    },
    category: 'information',
    execute: async (params) => {
      const weatherData = {
        '北京': { temp: 26, condition: '晴', humidity: 45 },
        '上海': { temp: 28, condition: '多云', humidity: 60 },
        '广州': { temp: 30, condition: '雷阵雨', humidity: 75 },
        '深圳': { temp: 29, condition: '多云', humidity: 70 }
      }
      
      const city = params.city || '北京'
      const weather = weatherData[city] || { temp: 25, condition: '未知', humidity: 50 }
      
      return {
        success: true,
        city,
        temperature: weather.temp,
        condition: weather.condition,
        humidity: weather.humidity,
        unit: '°C'
      }
    }
  },
  
  create_task: {
    name: 'create_task',
    description: '创建待办任务',
    parameters: {
      title: { type: 'string', description: '任务标题' },
      priority: { type: 'string', description: '优先级', default: 'medium' }
    },
    category: 'productivity',
    execute: async (params) => {
      return {
        success: true,
        task: {
          id: Date.now().toString(),
          title: params.title,
          priority: params.priority || 'medium',
          completed: false,
          createdAt: new Date().toISOString()
        },
        message: `任务"${params.title}"已创建`
      }
    }
  },
  
  set_reminder: {
    name: 'set_reminder',
    description: '设置提醒',
    parameters: {
      title: { type: 'string', description: '提醒内容' },
      time: { type: 'string', description: '提醒时间，如：14:30' }
    },
    category: 'productivity',
    execute: async (params) => {
      return {
        success: true,
        reminder: {
          id: Date.now().toString(),
          title: params.title,
          time: params.time,
          createdAt: new Date().toISOString()
        },
        message: `提醒"${params.title}"已设置，将于${params.time}提醒`
      }
    }
  },
  
  search_knowledge: {
    name: 'search_knowledge',
    description: '搜索知识库',
    parameters: {
      query: { type: 'string', description: '搜索关键词' },
      limit: { type: 'number', description: '返回结果数量', default: 5 }
    },
    category: 'knowledge',
    execute: async (params) => {
      try {
        const ragService = require('./ragService')
        const results = await ragService.query(params.query, params.limit || 5)
        return {
          success: true,
          query: params.query,
          results: results.results,
          total: results.total
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  },
  
  tell_joke: {
    name: 'tell_joke',
    description: '讲一个笑话',
    parameters: {
      type: { type: 'string', description: '笑话类型', default: 'general' }
    },
    category: 'entertainment',
    execute: async (params) => {
      const jokes = [
        '为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 = Dec 25！',
        '我问我爸："爸，我是不是你亲生的？" 我爸："你再不好好学习，就不是了。"',
        '程序员最讨厌的数字是什么？1024，因为它总让人想到加班。',
        '为什么鱼不会弹钢琴？因为它不会掉（调）鱼鳞（音）。',
        '我买了一双用鞋带做的鞋，后来发现是假鞋。'
      ]
      
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)]
      
      return {
        success: true,
        joke: randomJoke,
        type: params.type || 'general'
      }
    }
  },
  
  get_quote: {
    name: 'get_quote',
    description: '获取一句名言警句',
    parameters: {
      category: { type: 'string', description: '名言类别', default: 'inspiration' }
    },
    category: 'knowledge',
    execute: async (params) => {
      const quotes = [
        '生活不是等待风暴过去，而是学会在雨中跳舞。',
        '成功不是终点，失败也不是终结，唯有勇气才是永恒。',
        '你今天的努力，是幸运的伏笔。',
        '不要因为走得太远，而忘记为什么出发。',
        '每一个不曾起舞的日子，都是对生命的辜负。'
      ]
      
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      
      return {
        success: true,
        quote: randomQuote,
        category: params.category || 'inspiration'
      }
    }
  },
  
  list_tools: {
    name: 'list_tools',
    description: '列出所有可用工具',
    parameters: {
      category: { type: 'string', description: '工具类别筛选', default: 'all' }
    },
    category: 'system',
    execute: async (params) => {
      const allTools = Object.values(registeredTools)
      let filtered = allTools
      
      if (params.category && params.category !== 'all') {
        filtered = allTools.filter(t => t.category === params.category)
      }
      
      return {
        success: true,
        tools: filtered.map(t => ({
          name: t.name,
          description: t.description,
          category: t.category
        })),
        total: filtered.length
      }
    }
  }
}

const registerTool = (tool) => {
  if (!tool.name || !tool.execute) {
    throw new Error('Tool must have name and execute function')
  }
  
  registeredTools[tool.name] = {
    ...tool,
    registeredAt: new Date().toISOString()
  }
  
  return true
}

const unregisterTool = (toolName) => {
  if (registeredTools[toolName]) {
    delete registeredTools[toolName]
    return true
  }
  return false
}

const getTool = (toolName) => {
  return registeredTools[toolName] || null
}

const listTools = (category = 'all') => {
  const allTools = Object.values(registeredTools)
  if (category === 'all') {
    return allTools
  }
  return allTools.filter(t => t.category === category)
}

const executeTool = async (toolName, params = {}) => {
  const tool = registeredTools[toolName]
  
  if (!tool) {
    return {
      success: false,
      error: `Tool "${toolName}" not found`,
      availableTools: Object.keys(registeredTools)
    }
  }
  
  const isDangerous = DANGEROUS_TOOLS.includes(toolName)
  
  try {
    const result = await tool.execute(params)
    
    return {
      success: result.success !== false,
      tool: toolName,
      params,
      result,
      isDangerous,
      executedAt: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      tool: toolName,
      error: error.message,
      executedAt: new Date().toISOString()
    }
  }
}

const parseToolCall = (message) => {
  const patterns = [
    /调用工具[：:]\s*(\w+)\s*\((.*?)\)/i,
    /工具[：:]\s*(\w+)\s*\((.*?)\)/i,
    /\[(.*?)\]\s*\((.*?)\)/,
    /run\s+(\w+)\s*\((.*?)\)/i
  ]
  
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      const toolName = match[1]
      const paramsStr = match[2] || ''
      
      const params = {}
      if (paramsStr) {
        const paramPairs = paramsStr.split(/[,，]/)
        paramPairs.forEach(pair => {
          const [key, value] = pair.split(/[=:：]/).map(s => s.trim())
          if (key && value !== undefined) {
            params[key] = value.replace(/^["']|["']$/g, '')
          }
        })
      }
      
      return { toolName, params }
    }
  }
  
  return null
}

const agentProcess = async (userMessage, history = []) => {
  const config = loadConfig()
  
  const toolCall = parseToolCall(userMessage)
  
  if (toolCall) {
    const result = await executeTool(toolCall.toolName, toolCall.params)
    
    return {
      type: 'tool_result',
      toolCall,
      result,
      message: result.success 
        ? `工具执行成功：${JSON.stringify(result.result)}`
        : `工具执行失败：${result.error}`
    }
  }
  
  const aiService = require('./aiService')
  const response = await aiService.generateResponse(userMessage, history)
  
  const implicitToolCheck = detectImplicitToolCall(userMessage)
  if (implicitToolCheck && config.autoExecute) {
    const toolResult = await executeTool(implicitToolCheck.toolName, implicitToolCheck.params)
    return {
      type: 'auto_tool',
      response,
      toolResult,
      toolUsed: implicitToolCheck.toolName
    }
  }
  
  return {
    type: 'chat',
    response
  }
}

const detectImplicitToolCall = (message) => {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('几点') || lowerMessage.includes('时间') || lowerMessage.includes('现在')) {
    if (lowerMessage.match(/几点|什么时间|现在几点/)) {
      return { toolName: 'get_time', params: {} }
    }
  }
  
  if (lowerMessage.includes('笑话') || lowerMessage.includes('搞笑') || lowerMessage.includes('逗我')) {
    return { toolName: 'tell_joke', params: {} }
  }
  
  if (lowerMessage.includes('计算') || lowerMessage.match(/\d+\s*[+\-*/]\s*\d+/)) {
    const match = message.match(/(\d+\s*[+\-*/]\s*\d+)/)
    if (match) {
      return { toolName: 'calculator', params: { expression: match[1] } }
    }
  }
  
  if (lowerMessage.includes('天气')) {
    return { toolName: 'get_weather', params: { city: '北京' } }
  }
  
  if (lowerMessage.includes('名言') || lowerMessage.includes('警句') || lowerMessage.includes('鼓励')) {
    return { toolName: 'get_quote', params: {} }
  }
  
  return null
}

const initAgent = () => {
  loadConfig()
  
  Object.values(builtInTools).forEach(tool => {
    registerTool(tool)
  })
  
  return {
    toolsRegistered: Object.keys(registeredTools).length,
    config: agentConfig
  }
}

const getAgentConfig = () => {
  return loadConfig()
}

const saveAgentConfig = (newConfig) => {
  agentConfig = { ...agentConfig, ...newConfig }
  
  const configPath = path.join(__dirname, '../../config.json')
  let config = {}
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  }
  config.agent = agentConfig
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  
  return agentConfig
}

module.exports = {
  initAgent,
  registerTool,
  unregisterTool,
  getTool,
  listTools,
  executeTool,
  parseToolCall,
  agentProcess,
  getAgentConfig,
  saveAgentConfig,
  builtInTools
}
