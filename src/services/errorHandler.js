const fs = require('fs')
const path = require('path')

const ERROR_CODES = {
  SUCCESS: 0,
  UNKNOWN_ERROR: 1000,
  VALIDATION_ERROR: 1001,
  AUTH_ERROR: 1002,
  NOT_FOUND: 1003,
  RATE_LIMIT: 1004,
  SERVICE_UNAVAILABLE: 1005,
  NETWORK_ERROR: 1006,
  TIMEOUT: 1007,
  PERMISSION_DENIED: 1008,
  DATA_ERROR: 1009,
  API_ERROR: 2000,
  OPENAI_ERROR: 2001,
  ANTHROPIC_ERROR: 2002,
  ELEVENLABS_ERROR: 2003
}

const ERROR_MESSAGES = {
  [ERROR_CODES.UNKNOWN_ERROR]: '未知错误，请稍后重试',
  [ERROR_CODES.VALIDATION_ERROR]: '参数验证失败',
  [ERROR_CODES.AUTH_ERROR]: '认证失败，请检查API密钥',
  [ERROR_CODES.NOT_FOUND]: '资源未找到',
  [ERROR_CODES.RATE_LIMIT]: '请求过于频繁，请稍后再试',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败',
  [ERROR_CODES.TIMEOUT]: '请求超时',
  [ERROR_CODES.PERMISSION_DENIED]: '权限不足',
  [ERROR_CODES.DATA_ERROR]: '数据处理失败',
  [ERROR_CODES.API_ERROR]: 'API服务错误',
  [ERROR_CODES.OPENAI_ERROR]: 'OpenAI服务错误',
  [ERROR_CODES.ANTHROPIC_ERROR]: 'Anthropic服务错误',
  [ERROR_CODES.ELEVENLABS_ERROR]: 'ElevenLabs服务错误'
}

class AppError extends Error {
  constructor(code, message, details = {}) {
    super(message || ERROR_MESSAGES[code] || '未知错误')
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
    this.stack = new Error().stack
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

const getErrorResponse = (error) => {
  let code = ERROR_CODES.UNKNOWN_ERROR
  let message = '未知错误，请稍后重试'
  let details = {}
  let debugInfo = null

  if (error instanceof AppError) {
    code = error.code
    message = error.message
    details = error.details
  } else if (error instanceof Error) {
    message = error.message
    
    if (error.message.includes('API key') || 
        error.message.includes('invalid API') ||
        error.message.includes('Unauthorized')) {
      code = ERROR_CODES.AUTH_ERROR
    } else if (error.message.includes('404') || 
               error.message.includes('not found')) {
      code = ERROR_CODES.NOT_FOUND
    } else if (error.message.includes('rate limit') || 
               error.message.includes('Too Many Requests')) {
      code = ERROR_CODES.RATE_LIMIT
    } else if (error.message.includes('timeout') || 
               error.message.includes('Timeout')) {
      code = ERROR_CODES.TIMEOUT
    } else if (error.message.includes('network') || 
               error.message.includes('Network Error')) {
      code = ERROR_CODES.NETWORK_ERROR
    } else if (error.message.includes('OpenAI')) {
      code = ERROR_CODES.OPENAI_ERROR
    } else if (error.message.includes('Anthropic')) {
      code = ERROR_CODES.ANTHROPIC_ERROR
    }
  }

  if (!isProduction()) {
    debugInfo = {
      stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
      originalMessage: error?.message,
      timestamp: new Date().toISOString()
    }
  }

  return {
    success: false,
    error: {
      code,
      message,
      details,
      debugInfo: isProduction() ? undefined : debugInfo
    },
    timestamp: new Date().toISOString()
  }
}

const logError = (error, context = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    code: error instanceof AppError ? error.code : ERROR_CODES.UNKNOWN_ERROR,
    message: error.message,
    context,
    stack: error.stack,
    environment: isProduction() ? 'production' : 'development'
  }

  console.error('[ERROR]', JSON.stringify(logEntry, null, 2))

  try {
    const logDir = path.join(__dirname, '../../logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    
    const logFile = path.join(logDir, `error_${new Date().toISOString().split('T')[0]}.log`)
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n')
  } catch (logError) {
    console.error('Failed to write error log:', logError)
  }
}

const wrapAsync = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error, { function: fn.name, args: args.slice(0, 3) })
      throw error
    }
  }
}

const validateParams = (params, schema) => {
  const errors = []
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = params[key]
    
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`${key} 是必填项`)
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${key} 类型错误，期望 ${rules.type}`)
      }
      
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        errors.push(`${key} 长度不足，最小 ${rules.minLength} 字符`)
      }
      
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        errors.push(`${key} 长度超限，最大 ${rules.maxLength} 字符`)
      }
      
      if (rules.min && typeof value === 'number' && value < rules.min) {
        errors.push(`${key} 数值过小，最小 ${rules.min}`)
      }
      
      if (rules.max && typeof value === 'number' && value > rules.max) {
        errors.push(`${key} 数值过大，最大 ${rules.max}`)
      }
      
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`${key} 格式不符合要求`)
      }
    }
  }
  
  if (errors.length > 0) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, errors.join('; '))
  }
  
  return true
}

const createError = (code, message, details) => {
  return new AppError(code, message, details)
}

const handleAxiosError = (error) => {
  if (error.response) {
    const status = error.response.status
    
    if (status === 401) {
      throw new AppError(ERROR_CODES.AUTH_ERROR, '认证失败')
    } else if (status === 404) {
      throw new AppError(ERROR_CODES.NOT_FOUND, '资源未找到')
    } else if (status === 429) {
      throw new AppError(ERROR_CODES.RATE_LIMIT, '请求过于频繁')
    } else if (status >= 500) {
      throw new AppError(ERROR_CODES.SERVICE_UNAVAILABLE, '服务暂时不可用')
    } else {
      throw new AppError(ERROR_CODES.API_ERROR, error.response.data?.error?.message || 'API错误')
    }
  } else if (error.request) {
    throw new AppError(ERROR_CODES.NETWORK_ERROR, '网络连接失败')
  } else {
    throw new AppError(ERROR_CODES.UNKNOWN_ERROR, error.message)
  }
}

module.exports = {
  ERROR_CODES,
  ERROR_MESSAGES,
  AppError,
  getErrorResponse,
  logError,
  wrapAsync,
  validateParams,
  createError,
  handleAxiosError,
  isProduction
}