const axios = require('axios')
const fs = require('fs')
const path = require('path')

let config = null

const loadConfig = () => {
  if (!config) {
    try {
      const configPath = path.join(__dirname, '../../config.json')
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      } else {
        config = getDefaultConfig()
      }
    } catch (error) {
      config = getDefaultConfig()
    }
  }
  return config
}

const getDefaultConfig = () => ({
  vision: {
    enabled: true,
    provider: 'openai',
    openaiApiKey: '',
    ocrEnabled: true,
    imageDescriptionEnabled: true,
    maxImageSize: 4 * 1024 * 1024
  }
})

const ocrText = async (imageBuffer, options = {}) => {
  const cfg = loadConfig()
  
  if (!cfg.vision?.enabled || !cfg.vision?.ocrEnabled) {
    return { success: false, error: 'OCR not enabled' }
  }

  try {
    if (cfg.vision.provider === 'openai' && cfg.vision.openaiApiKey) {
      return await openaiOCR(imageBuffer, cfg.vision.openaiApiKey, options)
    } else {
      return { success: false, error: 'No OCR provider configured' }
    }
  } catch (error) {
    console.error('OCR error:', error)
    return { success: false, error: error.message }
  }
}

const openaiOCR = async (imageBuffer, apiKey, options = {}) => {
  try {
    const base64Image = imageBuffer.toString('base64')
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请仔细识别这张图片中的所有文字，包括标题、正文、表格等。按原文格式输出。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    return {
      success: true,
      text: response.data.choices[0].message.content,
      confidence: 0.85
    }
  } catch (error) {
    console.error('OpenAI OCR error:', error)
    return { success: false, error: error.message }
  }
}

const describeImage = async (imageBuffer, options = {}) => {
  const cfg = loadConfig()
  
  if (!cfg.vision?.enabled || !cfg.vision?.imageDescriptionEnabled) {
    return { success: false, error: 'Image description not enabled' }
  }

  try {
    if (cfg.vision.provider === 'openai' && cfg.vision.openaiApiKey) {
      return await openaiDescribe(imageBuffer, cfg.vision.openaiApiKey, options)
    } else {
      return { success: false, error: 'No vision provider configured' }
    }
  } catch (error) {
    console.error('Image description error:', error)
    return { success: false, error: error.message }
  }
}

const openaiDescribe = async (imageBuffer, apiKey, options = {}) => {
  const prompt = options.prompt || '请详细描述这张图片的内容，包括：主体、背景、颜色、氛围等。'
  
  try {
    const base64Image = imageBuffer.toString('base64')
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    return {
      success: true,
      description: response.data.choices[0].message.content,
      model: 'gpt-4-turbo'
    }
  } catch (error) {
    console.error('OpenAI describe error:', error)
    return { success: false, error: error.message }
  }
}

const analyzeImage = async (imageBuffer, analysisType = 'general') => {
  const prompts = {
    general: '请全面分析这张图片，描述你看到的内容。',
    objects: '请列出这张图片中的所有物体，并简要描述它们。',
    text: '请提取图片中的所有文字内容。',
    color: '请分析这张图片的主要色调和配色方案。',
    emotion: '请分析这张图片传达的情感和氛围。'
  }
  
  const prompt = prompts[analysisType] || prompts.general
  
  return await describeImage(imageBuffer, { prompt })
}

const extractCodeFromImage = async (imageBuffer) => {
  const cfg = loadConfig()
  
  if (!cfg.vision?.openaiApiKey) {
    return { success: false, error: 'API key not configured' }
  }

  try {
    const base64Image = imageBuffer.toString('base64')
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别并提取这张图片中的代码。只输出代码内容，用代码块包裹。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${cfg.vision.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    return {
      success: true,
      code: response.data.choices[0].message.content,
      language: 'auto-detected'
    }
  } catch (error) {
    console.error('Code extraction error:', error)
    return { success: false, error: error.message }
  }
}

const screenshotAnalyzer = async (imageBuffer) => {
  const cfg = loadConfig()
  
  if (!cfg.vision?.openaiApiKey) {
    return { success: false, error: 'API key not configured' }
  }

  try {
    const base64Image = imageBuffer.toString('base64')
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的屏幕截图分析助手。请分析用户提供的截图，识别界面元素、提取文字信息，并提供有价值的分析。'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请分析这张截图：\n1. 这是什么应用/界面？\n2. 提取所有重要文字信息\n3. 识别主要功能按钮和交互元素\n4. 给出你的分析和建议'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${cfg.vision.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )
    
    return {
      success: true,
      analysis: response.data.choices[0].message.content,
      model: 'gpt-4-turbo'
    }
  } catch (error) {
    console.error('Screenshot analysis error:', error)
    return { success: false, error: error.message }
  }
}

const generateImagePrompt = async (description, style = 'general') => {
  const stylePrompts = {
    general: '',
    anime: 'anime style, cute, colorful',
    realistic: 'photorealistic, high detail, 8k',
    painting: 'oil painting style, artistic, masterpiece',
    pixel: 'pixel art style, retro, 8bit'
  }
  
  return `${description}, ${stylePrompts[style] || stylePrompts.general}`
}

const saveVisionConfig = (newConfig) => {
  const cfg = loadConfig()
  config = {
    ...cfg,
    vision: {
      ...cfg.vision,
      ...newConfig
    }
  }
  
  const configPath = path.join(__dirname, '../../config.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  return config
}

const getVisionConfig = () => {
  return loadConfig().vision || getDefaultConfig().vision
}

const validateImage = (buffer) => {
  const maxSize = loadConfig().vision?.maxImageSize || 4 * 1024 * 1024
  
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: `Image too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB, max ${maxSize / 1024 / 1024}MB`
    }
  }
  
  return { valid: true, size: buffer.length }
}

module.exports = {
  ocrText,
  describeImage,
  analyzeImage,
  extractCodeFromImage,
  screenshotAnalyzer,
  generateImagePrompt,
  saveVisionConfig,
  getVisionConfig,
  validateImage
}
