const { 
  ERROR_CODES, 
  ERROR_MESSAGES, 
  AppError, 
  getErrorResponse, 
  logError, 
  wrapAsync, 
  validateParams,
  handleAxiosError,
  isProduction
} = require('../src/services/errorHandler')

describe('Error Handler', () => {
  describe('ERROR_CODES', () => {
    it('should have correct error code values', () => {
      expect(ERROR_CODES.SUCCESS).toBe(0)
      expect(ERROR_CODES.UNKNOWN_ERROR).toBe(1000)
      expect(ERROR_CODES.VALIDATION_ERROR).toBe(1001)
      expect(ERROR_CODES.AUTH_ERROR).toBe(1002)
      expect(ERROR_CODES.NOT_FOUND).toBe(1003)
      expect(ERROR_CODES.RATE_LIMIT).toBe(1004)
      expect(ERROR_CODES.SERVICE_UNAVAILABLE).toBe(1005)
      expect(ERROR_CODES.NETWORK_ERROR).toBe(1006)
      expect(ERROR_CODES.TIMEOUT).toBe(1007)
      expect(ERROR_CODES.API_ERROR).toBe(2000)
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have messages for all error codes', () => {
      expect(ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]).toBe('未知错误，请稍后重试')
      expect(ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR]).toBe('参数验证失败')
      expect(ERROR_MESSAGES[ERROR_CODES.AUTH_ERROR]).toBe('认证失败，请检查API密钥')
      expect(ERROR_MESSAGES[ERROR_CODES.NOT_FOUND]).toBe('资源未找到')
      expect(ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT]).toBe('请求过于频繁，请稍后再试')
      expect(ERROR_MESSAGES[ERROR_CODES.SERVICE_UNAVAILABLE]).toBe('服务暂时不可用')
    })
  })

  describe('AppError', () => {
    it('should create error with code and message', () => {
      const error = new AppError(ERROR_CODES.AUTH_ERROR, 'Custom auth error')
      
      expect(error.code).toBe(ERROR_CODES.AUTH_ERROR)
      expect(error.message).toBe('Custom auth error')
      expect(error.name).toBe('AppError')
      expect(error.timestamp).toBeDefined()
      expect(error.details).toEqual({})
    })

    it('should use default message when not provided', () => {
      const error = new AppError(ERROR_CODES.VALIDATION_ERROR)
      
      expect(error.message).toBe(ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR])
    })

    it('should include details when provided', () => {
      const details = { field: 'email', reason: 'invalid format' }
      const error = new AppError(ERROR_CODES.VALIDATION_ERROR, 'Validation failed', details)
      
      expect(error.details).toEqual(details)
    })
  })

  describe('getErrorResponse', () => {
    it('should return structured response for AppError', () => {
      const error = new AppError(ERROR_CODES.AUTH_ERROR, 'Auth failed')
      const response = getErrorResponse(error)
      
      expect(response.success).toBe(false)
      expect(response.error.code).toBe(ERROR_CODES.AUTH_ERROR)
      expect(response.error.message).toBe('Auth failed')
      expect(response.timestamp).toBeDefined()
    })

    it('should return structured response for generic Error', () => {
      const error = new Error('Something went wrong')
      const response = getErrorResponse(error)
      
      expect(response.success).toBe(false)
      expect(response.error.code).toBe(ERROR_CODES.UNKNOWN_ERROR)
      expect(response.error.message).toBe('Something went wrong')
    })

    it('should detect auth error from message', () => {
      const error = new Error('Invalid API key')
      const response = getErrorResponse(error)
      
      expect(response.error.code).toBe(ERROR_CODES.AUTH_ERROR)
    })

    it('should detect 404 error from message', () => {
      const error = new Error('Resource not found')
      const response = getErrorResponse(error)
      
      expect(response.error.code).toBe(ERROR_CODES.NOT_FOUND)
    })

    it('should detect rate limit error from message', () => {
      const error = new Error('Too Many Requests')
      const response = getErrorResponse(error)
      
      expect(response.error.code).toBe(ERROR_CODES.RATE_LIMIT)
    })

    it('should detect network error from message', () => {
      const error = new Error('Network Error')
      const response = getErrorResponse(error)
      
      expect(response.error.code).toBe(ERROR_CODES.NETWORK_ERROR)
    })

    it('should include debugInfo in non-production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const error = new Error('Test error')
      const response = getErrorResponse(error)
      
      expect(response.error.debugInfo).toBeDefined()
      expect(response.error.debugInfo.originalMessage).toBe('Test error')
      expect(response.error.debugInfo.stack).toBeDefined()
      
      process.env.NODE_ENV = originalEnv
    })

    it('should not include debugInfo in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const error = new Error('Test error')
      const response = getErrorResponse(error)
      
      expect(response.error.debugInfo).toBeUndefined()
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('validateParams', () => {
    it('should pass validation with valid params', () => {
      const params = { name: 'test', age: 25 }
      const schema = {
        name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
        age: { required: true, type: 'number', min: 1, max: 120 }
      }
      
      expect(() => validateParams(params, schema)).not.toThrow()
    })

    it('should throw error for missing required field', () => {
      const params = { name: 'test' }
      const schema = {
        name: { required: true },
        age: { required: true }
      }
      
      expect(() => validateParams(params, schema)).toThrow(/age.*必填/)
    })

    it('should throw error for type mismatch', () => {
      const params = { name: 123 }
      const schema = {
        name: { required: true, type: 'string' }
      }
      
      expect(() => validateParams(params, schema)).toThrow(/类型错误/)
    })

    it('should throw error for string length', () => {
      const params = { name: 'a' }
      const schema = {
        name: { required: true, type: 'string', minLength: 3 }
      }
      
      expect(() => validateParams(params, schema)).toThrow(/长度不足/)
    })

    it('should throw error for number range', () => {
      const params = { age: 150 }
      const schema = {
        age: { required: true, type: 'number', max: 120 }
      }
      
      expect(() => validateParams(params, schema)).toThrow(/数值过大/)
    })

    it('should throw error for pattern mismatch', () => {
      const params = { email: 'invalid-email' }
      const schema = {
        email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      }
      
      expect(() => validateParams(params, schema)).toThrow(/格式不符合/)
    })

    it('should collect multiple errors', () => {
      const params = { name: '', age: 'not-a-number' }
      const schema = {
        name: { required: true, type: 'string', minLength: 3 },
        age: { required: true, type: 'number' }
      }
      
      expect(() => validateParams(params, schema)).toThrow(/长度不足.*类型错误/)
    })
  })

  describe('wrapAsync', () => {
    it('should return result from async function', async () => {
      const fn = async () => 'success'
      const wrapped = wrapAsync(fn)
      
      const result = await wrapped()
      
      expect(result).toBe('success')
    })

    it('should catch and log errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const fn = async () => { throw new Error('test error') }
      const wrapped = wrapAsync(fn)
      
      await expect(wrapped()).rejects.toThrow('test error')
      
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('handleAxiosError', () => {
    it('should handle 401 error', () => {
      const error = { response: { status: 401 } }
      
      expect(() => handleAxiosError(error)).toThrow()
    })

    it('should handle 404 error', () => {
      const error = { response: { status: 404 } }
      
      expect(() => handleAxiosError(error)).toThrow()
    })

    it('should handle 429 error', () => {
      const error = { response: { status: 429 } }
      
      expect(() => handleAxiosError(error)).toThrow()
    })

    it('should handle 5xx error', () => {
      const error = { response: { status: 500 } }
      
      expect(() => handleAxiosError(error)).toThrow()
    })

    it('should handle network error', () => {
      const error = { request: {} }
      
      expect(() => handleAxiosError(error)).toThrow()
    })

    it('should handle request error', () => {
      const error = { message: 'Request failed' }
      
      expect(() => handleAxiosError(error)).toThrow()
    })
  })

  describe('isProduction', () => {
    it('should return true in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      expect(isProduction()).toBe(true)
      
      process.env.NODE_ENV = originalEnv
    })

    it('should return false in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      expect(isProduction()).toBe(false)
      
      process.env.NODE_ENV = originalEnv
    })
  })
})