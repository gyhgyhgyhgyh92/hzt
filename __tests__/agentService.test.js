describe('Agent Service', () => {
  let agentService

  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    agentService = require('../src/services/agentService')
    agentService.initAgent()
  })

  describe('initAgent', () => {
    it('should initialize agent with built-in tools', () => {
      const result = agentService.initAgent()
      
      expect(result).toHaveProperty('toolsRegistered')
      expect(result.toolsRegistered).toBeGreaterThan(0)
      expect(result).toHaveProperty('config')
    })

    it('should register 12 built-in tools', () => {
      const tools = agentService.listTools()
      expect(tools.length).toBe(12)
    })
  })

  describe('registerTool', () => {
    it('should register a new tool', () => {
      const mockTool = {
        name: 'test_tool',
        description: 'Test tool',
        parameters: {},
        category: 'test',
        execute: async () => ({ success: true })
      }
      
      const result = agentService.registerTool(mockTool)
      
      expect(result).toBe(true)
      expect(agentService.getTool('test_tool')).not.toBeNull()
    })

    it('should throw error if tool has no name', () => {
      const mockTool = {
        description: 'Test tool',
        execute: async () => ({ success: true })
      }
      
      expect(() => agentService.registerTool(mockTool)).toThrow()
    })

    it('should throw error if tool has no execute function', () => {
      const mockTool = {
        name: 'test_tool',
        description: 'Test tool'
      }
      
      expect(() => agentService.registerTool(mockTool)).toThrow()
    })
  })

  describe('getTool', () => {
    it('should return tool by name', () => {
      const tool = agentService.getTool('calculator')
      
      expect(tool).not.toBeNull()
      expect(tool.name).toBe('calculator')
    })

    it('should return null for non-existent tool', () => {
      const tool = agentService.getTool('nonexistent_tool')
      
      expect(tool).toBeNull()
    })
  })

  describe('executeTool', () => {
    it('should execute calculator tool', async () => {
      const result = await agentService.executeTool('calculator', { expression: '2+2' })
      
      expect(result.success).toBe(true)
      expect(result.result.result).toBe(4)
    })

    it('should handle invalid expression in calculator', async () => {
      const result = await agentService.executeTool('calculator', { expression: 'invalid' })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle security attack in calculator', async () => {
      const result = await agentService.executeTool('calculator', { expression: 'window.location="http://evil.com"' })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should execute get_time tool', async () => {
      const result = await agentService.executeTool('get_time', {})
      
      expect(result.success).toBe(true)
      expect(result.result).toHaveProperty('time')
      expect(result.result).toHaveProperty('date')
      expect(result.result).toHaveProperty('weekday')
    })

    it('should execute tell_joke tool', async () => {
      const result = await agentService.executeTool('tell_joke', {})
      
      expect(result.success).toBe(true)
      expect(result.result).toHaveProperty('joke')
    })

    it('should execute get_quote tool', async () => {
      const result = await agentService.executeTool('get_quote', {})
      
      expect(result.success).toBe(true)
      expect(result.result).toHaveProperty('quote')
    })

    it('should fail for non-existent tool', async () => {
      const result = await agentService.executeTool('nonexistent_tool', {})
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('parseToolCall', () => {
    it('should parse basic tool call format', () => {
      const result = agentService.parseToolCall('调用工具: calculator(expression="2+2")')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('calculator')
      expect(result.params).toEqual({ expression: '2+2' })
    })

    it('should parse simplified tool call format', () => {
      const result = agentService.parseToolCall('工具: get_time()')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('get_time')
      expect(result.params).toEqual({})
    })

    it('should parse markdown style tool call', () => {
      const result = agentService.parseToolCall('[calculator](expression="10*5")')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('calculator')
      expect(result.params).toEqual({ expression: '10*5' })
    })

    it('should return null for invalid format', () => {
      const result = agentService.parseToolCall('just a normal message')
      
      expect(result).toBeNull()
    })
  })

  describe('detectImplicitToolCall', () => {
    it('should detect time query', () => {
      const result = agentService.detectImplicitToolCall('现在几点了')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('get_time')
    })

    it('should detect joke request', () => {
      const result = agentService.detectImplicitToolCall('讲个笑话')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('tell_joke')
    })

    it('should detect calculation', () => {
      const result = agentService.detectImplicitToolCall('计算 10+5')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('calculator')
    })

    it('should detect weather request', () => {
      const result = agentService.detectImplicitToolCall('今天天气怎么样')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('get_weather')
    })

    it('should detect quote request', () => {
      const result = agentService.detectImplicitToolCall('给我一句名言')
      
      expect(result).not.toBeNull()
      expect(result.toolName).toBe('get_quote')
    })

    it('should return null for unrelated message', () => {
      const result = agentService.detectImplicitToolCall('你好呀')
      
      expect(result).toBeNull()
    })
  })

  describe('agentProcess', () => {
    it('should process tool call message', async () => {
      const result = await agentService.agentProcess('调用工具: get_time()', [])
      
      expect(result.type).toBe('tool_result')
      expect(result.toolCall.toolName).toBe('get_time')
    })

    it('should process normal chat message', async () => {
      const result = await agentService.agentProcess('你好', [])
      
      expect(result.type).toBe('chat')
      expect(result.response).toBeDefined()
    })
  })

  describe('listTools', () => {
    it('should list all tools', () => {
      const tools = agentService.listTools()
      
      expect(tools.length).toBe(12)
    })

    it('should filter tools by category', () => {
      const utilityTools = agentService.listTools('utility')
      const knowledgeTools = agentService.listTools('knowledge')
      
      expect(utilityTools.length).toBeGreaterThan(0)
      expect(knowledgeTools.length).toBeGreaterThan(0)
    })
  })
})