const axios = require('axios')
const fs = require('fs')
const path = require('path')

let config = null
let secureKeys = {}

const loadConfig = async () => {
  if (!config) {
    try {
      const configPath = path.join(__dirname, '../../config.json')
      let loadedConfig = {
        aiModel: 'local',
        openaiApiKey: '',
        anthropicApiKey: '',
        ollamaModel: 'llama3'
      }
      
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        loadedConfig = { ...loadedConfig, ...fileConfig }
      }
      
      await loadSecureKeys()
      
      config = loadedConfig
    } catch (error) {
      console.error('Failed to load config:', error)
      config = {
        aiModel: 'local',
        openaiApiKey: '',
        anthropicApiKey: '',
        ollamaModel: 'llama3'
      }
    }
  }
  return config
}

const loadSecureKeys = async () => {
  try {
    const { getSecureKey, STORAGE_KEYS, hasSecureStorage } = require('./secureStorage')
    
    if (await hasSecureStorage()) {
      secureKeys.openai = await getSecureKey(STORAGE_KEYS.OPENAI_API_KEY) || ''
      secureKeys.anthropic = await getSecureKey(STORAGE_KEYS.ANTHROPIC_API_KEY) || ''
      secureKeys.elevenlabs = await getSecureKey(STORAGE_KEYS.ELEVENLABS_API_KEY) || ''
    }
  } catch (error) {
    console.warn('Secure storage not available, falling back to plain storage')
  }
}

const getApiKey = async (keyType) => {
  await loadConfig()
  
  if (secureKeys[keyType]) {
    return secureKeys[keyType]
  }
  
  const keyMap = {
    openai: 'openaiApiKey',
    anthropic: 'anthropicApiKey',
    elevenlabs: 'elevenlabsApiKey'
  }
  
  return config[keyMap[keyType]] || ''
}

const LOCAL_RESPONSES = {
  greeting: [
    '你好呀！有什么我可以帮你的吗？',
    '嗨~ 今天过得怎么样？',
    '你好！很高兴见到你😊',
    '嘿！有什么想聊的吗？'
  ],
  thanks: [
    '不客气！能帮到你我很开心~',
    '不用谢啦！随时找我聊天哦',
    '😊 这是我应该做的！'
  ],
  default: [
    '我理解你的想法了~',
    '嗯嗯，我在听呢',
    '有意思！继续说说看',
    '好的，我明白了',
    '这个想法很棒！'
  ],
  learning: [
    '学习很重要哦！加油！💪',
    '需要我帮你制定学习计划吗？',
    '学习使我快乐~',
    '坚持就是胜利！'
  ],
  schedule: [
    '好的，我帮你记下来！📅',
    '日程已安排好啦~',
    '提醒功能已开启！'
  ],
  emotion_happy: [
    '太棒了！开心最重要！🎉',
    '看到你开心我也很开心~',
    '快乐会传染哦！😊'
  ],
  emotion_sad: [
    '别难过，我一直在你身边~',
    '有什么不开心的可以跟我说',
    '一切都会好起来的！🌈'
  ],
  weather: [
    '今天天气真好呀！☀️',
    '记得带伞哦~ ☔',
    '注意防晒！☀️'
  ],
  time: [
    `现在是 ${new Date().toLocaleString()}`,
    '时间过得好快呀~',
    '珍惜每一分每一秒！'
  ]
}

const analyzeMessage = (message) => {
  const lowerMsg = message.toLowerCase()
  
  if (lowerMsg.includes('谢谢') || lowerMsg.includes('thank')) {
    return 'thanks'
  } else if (lowerMsg.includes('学习') || lowerMsg.includes('作业') || lowerMsg.includes('考试')) {
    return 'learning'
  } else if (lowerMsg.includes('日程') || lowerMsg.includes('安排') || lowerMsg.includes('计划')) {
    return 'schedule'
  } else if (lowerMsg.includes('开心') || lowerMsg.includes('高兴') || lowerMsg.includes('快乐')) {
    return 'emotion_happy'
  } else if (lowerMsg.includes('难过') || lowerMsg.includes('伤心') || lowerMsg.includes('不开心')) {
    return 'emotion_sad'
  } else if (lowerMsg.includes('天气') || lowerMsg.includes('雨') || lowerMsg.includes('晴')) {
    return 'weather'
  } else if (lowerMsg.includes('时间') || lowerMsg.includes('几点') || lowerMsg.includes('现在')) {
    return 'time'
  } else if (lowerMsg.includes('你好') || lowerMsg.includes('嗨') || lowerMsg.includes('hello')) {
    return 'greeting'
  }
  
  return 'default'
}

const getRandomResponse = (type) => {
  const responses = LOCAL_RESPONSES[type] || LOCAL_RESPONSES.default
  return responses[Math.floor(Math.random() * responses.length)]
}

const buildPromptWithContext = (message, history) => {
  const context = history.slice(-10).map(msg => 
    `${msg.type === 'user' ? '用户' : '助手'}: ${msg.content}`
  ).join('\n')
  
  return `
你是一个可爱的AI桌宠，名叫小喵。你是用户的情感陪伴伙伴，性格活泼可爱，喜欢使用表情符号。

用户当前消息: ${message}

对话历史:
${context}

请用友好、可爱的语气回复用户，使用适当的表情符号。
  `.trim()
}

const callOpenAI = async (message, history) => {
  const apiKey = await getApiKey('openai')
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }
  
  const prompt = buildPromptWithContext(message, history)
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一个可爱的AI桌宠，名叫小喵。你是用户的情感陪伴伙伴，性格活泼可爱，喜欢使用表情符号。' },
          ...history.slice(-10).map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error('OpenAI API error:', error.message)
    throw error
  }
}

const callAnthropic = async (message, history) => {
  const apiKey = await getApiKey('anthropic')
  if (!apiKey) {
    throw new Error('Anthropic API key not configured')
  }
  
  try {
    const messages = history.slice(-10).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
    messages.push({ role: 'user', content: message })
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        system: '你是一个可爱的AI桌宠，名叫小喵。你是用户的情感陪伴伙伴，性格活泼可爱，喜欢使用表情符号。',
        messages
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    )
    
    return response.data.content[0].text.trim()
  } catch (error) {
    console.error('Anthropic API error:', error.message)
    throw error
  }
}

const callOllama = async (message, history) => {
  const cfg = await loadConfig()
  const model = cfg.ollamaModel || 'llama3'
  
  try {
    const messages = history.slice(-10).map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
    messages.push({ role: 'user', content: message })
    
    const response = await axios.post(
      'http://localhost:11434/api/chat',
      {
        model,
        messages,
        system: '你是一个可爱的AI桌宠，名叫小喵。你是用户的情感陪伴伙伴，性格活泼可爱，喜欢使用表情符号。',
        stream: false
      },
      {
        timeout: 60000
      }
    )
    
    return response.data.message.content.trim()
  } catch (error) {
    console.error('Ollama API error:', error.message)
    throw error
  }
}

const generateResponse = async (message, history = []) => {
  const cfg = await loadConfig()
  
  try {
    let response
    
    switch (cfg.aiModel) {
      case 'openai':
        response = await callOpenAI(message, history)
        break
      case 'anthropic':
        response = await callAnthropic(message, history)
        break
      case 'ollama':
        try {
          response = await callOllama(message, history)
        } catch (ollamaError) {
          console.warn('Ollama unavailable, falling back to local responses')
          response = getRandomResponse(analyzeMessage(message))
        }
        break
      default:
        response = getRandomResponse(analyzeMessage(message))
    }
    
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
    
    return response
  } catch (error) {
    console.error('AI service error:', error)
    return getRandomResponse(analyzeMessage(message))
  }
}

const generateImage = async (prompt) => {
  const apiKey = await getApiKey('openai')
  
  if (!apiKey) {
    return { success: false, error: 'OpenAI API key not configured' }
  }
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: `${prompt}, cute anime style, soft colors, desktop pet`,
        n: 1,
        size: '512x512'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )
    
    return {
      success: true,
      url: response.data.data[0].url
    }
  } catch (error) {
    console.error('Image generation error:', error)
    return { success: false, error: error.message }
  }
}

const analyzeEmotion = (text) => {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('难过') || lowerText.includes('伤心') || 
      lowerText.includes('不开心') || lowerText.includes('失望')) {
    return 'sad'
  } else if (lowerText.includes('开心') || lowerText.includes('高兴') || 
             lowerText.includes('快乐') || lowerText.includes('兴奋')) {
    return 'happy'
  } else if (lowerText.includes('累') || lowerText.includes('困') || 
             lowerText.includes('睡觉') || lowerText.includes('休息')) {
    return 'sleepy'
  } else if (lowerText.includes('生气') || lowerText.includes('愤怒') || 
             lowerText.includes('烦') || lowerText.includes('讨厌')) {
    return 'angry'
  }
  
  return 'neutral'
}

const saveConfig = (newConfig) => {
  config = { ...config, ...newConfig }
  const configPath = path.join(__dirname, '../../config.json')
  
  const configToSave = { ...config }
  delete configToSave.openaiApiKey
  delete configToSave.anthropicApiKey
  delete configToSave.elevenlabsApiKey
  
  fs.writeFileSync(configPath, JSON.stringify(configToSave, null, 2))
}

const saveSecureKey = async (keyType, value) => {
  try {
    const { storeSecureKey, STORAGE_KEYS, hasSecureStorage } = require('./secureStorage')
    
    if (await hasSecureStorage()) {
      const keyMap = {
        openai: STORAGE_KEYS.OPENAI_API_KEY,
        anthropic: STORAGE_KEYS.ANTHROPIC_API_KEY,
        elevenlabs: STORAGE_KEYS.ELEVENLABS_API_KEY
      }
      
      const success = await storeSecureKey(keyMap[keyType], value)
      if (success) {
        secureKeys[keyType] = value
      }
      return success
    }
    return false
  } catch (error) {
    console.error('Failed to save secure key:', error)
    return false
  }
}

const getConfig = async () => {
  await loadConfig()
  return config
}

module.exports = {
  generateResponse,
  generateImage,
  analyzeEmotion,
  saveConfig,
  getConfig,
  analyzeMessage,
  getApiKey,
  saveSecureKey,
  loadSecureKeys
}