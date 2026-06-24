<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h3>⚙️ 设置</h3>
    </div>
    
    <div class="settings-content">
      <div class="settings-section">
        <h4>🤖 AI模型设置</h4>
        <div class="setting-item">
          <label>AI模型</label>
          <select v-model="settings.aiModel" @change="saveSettings">
            <option value="local">本地模式（无需API）</option>
            <option value="openai">OpenAI GPT-4</option>
            <option value="anthropic">Anthropic Claude</option>
            <option value="ollama">Ollama（本地LLM）</option>
          </select>
        </div>
        <div class="setting-item" v-if="settings.aiModel === 'openai'">
          <label>OpenAI API Key</label>
          <input 
            type="password" 
            v-model="settings.openaiApiKey" 
            @blur="saveSettings"
            placeholder="sk-..."
          />
        </div>
        <div class="setting-item" v-if="settings.aiModel === 'anthropic'">
          <label>Anthropic API Key</label>
          <input 
            type="password" 
            v-model="settings.anthropicApiKey" 
            @blur="saveSettings"
            placeholder="sk-ant-..."
          />
        </div>
        <div class="setting-item" v-if="settings.aiModel === 'ollama'">
          <label>Ollama模型</label>
          <select v-model="settings.ollamaModel" @change="saveSettings">
            <option value="llama3">Llama 3</option>
            <option value="qwen">通义千问</option>
            <option value="mistral">Mistral</option>
          </select>
        </div>
      </div>
      
      <div class="settings-section">
        <h4>🎤 语音设置</h4>
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="settings.voiceEnabled" @change="saveSettings" />
            启用语音功能
          </label>
        </div>
        <div class="setting-item" v-if="settings.voiceEnabled">
          <label>语音识别服务</label>
          <select v-model="settings.sttProvider" @change="saveSettings">
            <option value="whisper">Whisper API</option>
            <option value="browser">浏览器语音</option>
          </select>
        </div>
        <div class="setting-item" v-if="settings.voiceEnabled">
          <label>语音合成服务</label>
          <select v-model="settings.ttsProvider" @change="saveSettings">
            <option value="elevenlabs">ElevenLabs</option>
            <option value="openai">OpenAI TTS</option>
            <option value="browser">浏览器语音</option>
          </select>
        </div>
        <div class="setting-item" v-if="settings.voiceEnabled && settings.ttsProvider === 'elevenlabs'">
          <label>ElevenLabs API Key</label>
          <input 
            type="password" 
            v-model="settings.elevenlabsApiKey" 
            @blur="saveSettings"
            placeholder="..."
          />
        </div>
      </div>
      
      <div class="settings-section">
        <h4>👁️ 视觉设置</h4>
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="settings.visionEnabled" @change="saveSettings" />
            启用图像识别
          </label>
        </div>
        <div class="setting-item" v-if="settings.visionEnabled">
          <label>视觉服务提供商</label>
          <select v-model="settings.visionProvider" @change="saveSettings">
            <option value="openai">OpenAI GPT-4V</option>
          </select>
        </div>
      </div>
      
      <div class="settings-section">
        <h4>🧠 RAG知识库</h4>
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="settings.ragEnabled" @change="saveSettings" />
            启用知识库增强
          </label>
        </div>
        <div class="setting-item" v-if="settings.ragEnabled">
          <button @click="openKnowledgeBase" class="btn-secondary">
            📚 管理知识库
          </button>
        </div>
      </div>
      
      <div class="settings-section">
        <h4>🤖 AI Agent</h4>
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="settings.agentEnabled" @change="saveSettings" />
            启用智能体工具调用
          </label>
        </div>
        <div class="setting-item" v-if="settings.agentEnabled">
          <label>
            <input type="checkbox" v-model="settings.autoExecute" @change="saveSettings" />
            自动执行工具（需确认）
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h4>💡 推荐设置</h4>
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="settings.recommendEnabled" @change="saveSettings" />
            启用个性化推荐
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h4>🔒 数据管理</h4>
        <div class="setting-item">
          <button @click="clearAllData" class="btn-danger">
            🗑️ 清除所有数据
          </button>
        </div>
      </div>
    </div>
    
    <div class="settings-footer">
      <p class="version">AI智能桌宠 v2.0 - 全面AI升级</p>
    </div>
  </div>
</template>

<script>
const { ref, onMounted } = require('vue')

module.exports = {
  name: 'SettingsPanel',
  emits: ['update:settings', 'open-knowledge-base'],
  setup(props, { emit }) {
    const settings = ref({
      aiModel: 'local',
      openaiApiKey: '',
      anthropicApiKey: '',
      ollamaModel: 'llama3',
      voiceEnabled: true,
      sttProvider: 'whisper',
      ttsProvider: 'browser',
      elevenlabsApiKey: '',
      visionEnabled: true,
      visionProvider: 'openai',
      ragEnabled: true,
      agentEnabled: true,
      autoExecute: false,
      recommendEnabled: true
    })
    
    const loadSettings = async () => {
      try {
        const aiService = require('../services/aiService')
        const cfg = aiService.getConfig()
        if (cfg) {
          settings.value = { ...settings.value, ...cfg }
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    
    const saveSettings = () => {
      try {
        const aiService = require('../services/aiService')
        aiService.saveConfig(settings.value)
        emit('update:settings', settings.value)
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
    }
    
    const openKnowledgeBase = () => {
      emit('open-knowledge-base')
    }
    
    const clearAllData = () => {
      if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
        try {
          const memoryService = require('../services/memoryService')
          memoryService.clearAllData()
          alert('数据已清除')
        } catch (error) {
          console.error('Failed to clear data:', error)
        }
      }
    }
    
    onMounted(() => {
      loadSettings()
    })
    
    return {
      settings,
      saveSettings,
      openKnowledgeBase,
      clearAllData
    }
  }
}
</script>

<style scoped>
.settings-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.settings-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.settings-section {
  margin-bottom: 16px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
}

.settings-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #667eea;
}

.setting-item {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-item label {
  font-size: 12px;
  color: #666;
}

.setting-item input[type="text"],
.setting-item input[type="password"],
.setting-item select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.3s;
}

.setting-item input:focus,
.setting-item select:focus {
  border-color: #667eea;
}

.setting-item input[type="checkbox"] {
  margin-right: 6px;
}

.setting-item button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-secondary {
  background: #667eea;
  color: white;
}

.btn-secondary:hover {
  background: #5a67d8;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.settings-footer {
  padding: 8px 16px;
  border-top: 1px solid #eee;
  text-align: center;
}

.version {
  margin: 0;
  font-size: 11px;
  color: #999;
}
</style>
