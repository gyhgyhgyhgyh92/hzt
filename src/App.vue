<template>
  <div class="app-container">
    <div class="window-controls">
      <button class="control-btn settings" @click="toggleSettings" title="设置">⚙️</button>
      <button class="control-btn close" @click="closeWindow">✕</button>
    </div>
    
    <div class="pet-area">
      <PetCharacter 
        :mood="currentMood" 
        :animation="currentAnimation"
        @click="handlePetClick"
      />
    </div>
    
    <div class="tab-bar">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div class="content-area">
      <ChatPanel 
        v-if="activeTab === 'chat'"
        :conversations="conversations"
        :recommendations="chatRecommendations"
        :isRecording="isRecording"
        @send="sendMessage"
        @voice-toggle="toggleVoiceInput"
        @quick-reply="sendQuickReply"
      />
      <TaskPanel 
        v-if="activeTab === 'task'"
        :tasks="tasks"
        @add="addTask"
        @complete="completeTask"
      />
      <SchedulePanel 
        v-if="activeTab === 'schedule'"
        :events="events"
        @add="addEvent"
      />
      <div v-if="activeTab === 'discover'" class="discover-panel">
        <div class="discover-header">
          <h3>✨ 为你推荐</h3>
        </div>
        <div class="discover-content">
          <div class="recommend-section">
            <h4>💡 今日推荐</h4>
            <div class="recommend-list">
              <div 
                v-for="rec in generalRecommendations" 
                :key="rec.id"
                class="recommend-card"
                @click="handleRecommendation(rec)"
              >
                <div class="rec-icon">{{ getRecIcon(rec.type) }}</div>
                <div class="rec-content">
                  <div class="rec-title">{{ rec.title }}</div>
                  <div class="rec-desc">{{ rec.description || rec.reason }}</div>
                </div>
                <div class="rec-arrow">→</div>
              </div>
            </div>
          </div>
          
          <div class="recommend-section">
            <h4>📊 用户洞察</h4>
            <div class="insights-card">
              <p>{{ userInsights.insight || '正在分析你的使用习惯...' }}</p>
              <div class="insights-tags" v-if="userInsights.topInterests">
                <span class="tag" v-for="interest in userInsights.topInterests" :key="interest">
                  #{{ interest }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="recommend-section">
            <h4>🛠️ AI工具箱</h4>
            <div class="tools-grid">
              <div class="tool-card" @click="useTool('calculator')">
                <div class="tool-icon">🔢</div>
                <div class="tool-name">计算器</div>
              </div>
              <div class="tool-card" @click="useTool('translator')">
                <div class="tool-icon">🌐</div>
                <div class="tool-name">翻译</div>
              </div>
              <div class="tool-card" @click="useTool('tell_joke')">
                <div class="tool-icon">😄</div>
                <div class="tool-name">讲笑话</div>
              </div>
              <div class="tool-card" @click="useTool('get_quote')">
                <div class="tool-icon">💬</div>
                <div class="tool-name">名言</div>
              </div>
              <div class="tool-card" @click="useTool('get_weather')">
                <div class="tool-icon">🌤️</div>
                <div class="tool-name">天气</div>
              </div>
              <div class="tool-card" @click="useTool('get_time')">
                <div class="tool-icon">⏰</div>
                <div class="tool-name">时间</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SettingsPanel 
        v-if="activeTab === 'settings'"
        @update:settings="updateSettings"
        @open-knowledge-base="openKnowledgeBase"
      />
    </div>
    
    <div v-if="showSettingsModal" class="settings-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>⚙️ 设置</h3>
          <button class="close-btn" @click="showSettingsModal = false">✕</button>
        </div>
        <div class="modal-body">
          <SettingsPanel 
            @update:settings="updateSettings"
            @open-knowledge-base="openKnowledgeBase"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, onMounted, onUnmounted, watch } = require('vue')
const PetCharacter = require('./components/PetCharacter.vue').default
const ChatPanel = require('./components/ChatPanel.vue').default
const TaskPanel = require('./components/TaskPanel.vue').default
const SchedulePanel = require('./components/SchedulePanel.vue').default
const SettingsPanel = require('./components/SettingsPanel.vue').default

const aiService = require('./services/aiService')
const memoryService = require('./services/memoryService')
const scheduleService = require('./services/scheduleService')
const recommendService = require('./services/recommendService')
const agentService = require('./services/agentService')
const ragService = require('./services/ragService')

module.exports = {
  name: 'App',
  components: {
    PetCharacter,
    ChatPanel,
    TaskPanel,
    SchedulePanel,
    SettingsPanel
  },
  setup() {
    const tabs = [
      { id: 'chat', name: '💬 聊天' },
      { id: 'task', name: '📝 待办' },
      { id: 'schedule', name: '📅 日程' },
      { id: 'discover', name: '✨ 发现' }
    ]
    
    const activeTab = ref('chat')
    const conversations = ref([])
    const tasks = ref([])
    const events = ref([])
    const currentMood = ref('happy')
    const currentAnimation = ref('idle')
    const isRecording = ref(false)
    const showSettingsModal = ref(false)
    const chatRecommendations = ref([])
    const generalRecommendations = ref([])
    const userInsights = ref({})
    
    let autoChatInterval = null
    let mediaRecorder = null
    let audioChunks = []
    
    const closeWindow = () => {
      window.close()
    }
    
    const toggleSettings = () => {
      showSettingsModal.value = !showSettingsModal.value
    }
    
    const handlePetClick = () => {
      currentAnimation.value = 'bounce'
      setTimeout(() => {
        currentAnimation.value = 'idle'
      }, 500)
      
      recommendService.recordBehavior('pet_click', { type: 'interaction' })
    }
    
    const sendMessage = async (message) => {
      conversations.value.push({
        type: 'user',
        content: message,
        time: new Date().toLocaleTimeString()
      })
      
      currentAnimation.value = 'thinking'
      
      recommendService.recordBehavior('message', { 
        content: message, 
        type: 'user' 
      })
      
      try {
        const agentResult = await agentService.agentProcess(message, conversations.value)
        
        let response
        let toolUsed = null
        
        if (agentResult.type === 'tool_result' || agentResult.type === 'auto_tool') {
          response = agentResult.message
          toolUsed = agentResult.toolCall?.toolName
        } else {
          const ragResult = await ragService.query(message, 3)
          if (ragResult.total > 0) {
            const context = ragService.buildContextFromResults(ragResult.results)
            const ragPrompt = ragService.generateRAGPrompt(message, context)
            response = await aiService.generateResponse(ragPrompt, conversations.value)
          } else {
            response = agentResult.response
          }
        }
        
        conversations.value.push({
          type: 'pet',
          content: response,
          time: new Date().toLocaleTimeString(),
          toolUsed
        })
        
        await memoryService.saveConversation(conversations.value)
        
        updateMoodBasedOnMessage(message, response)
        updateRecommendations(message)
        
      } catch (error) {
        console.error('Message error:', error)
        conversations.value.push({
          type: 'pet',
          content: '哎呀，出了点小问题，请稍后再试~',
          time: new Date().toLocaleTimeString()
        })
      }
      
      currentAnimation.value = 'idle'
    }
    
    const updateMoodBasedOnMessage = (userMsg, petResponse) => {
      const emotion = aiService.analyzeEmotion(userMsg)
      currentMood.value = emotion || 'happy'
    }
    
    const updateRecommendations = async (message) => {
      try {
        const suggestedReplies = await recommendService.getSuggestedReplies(message)
        chatRecommendations.value = suggestedReplies.suggestions
      } catch (error) {
        console.error('Update recommendations error:', error)
      }
    }
    
    const sendQuickReply = (reply) => {
      sendMessage(reply)
    }
    
    const toggleVoiceInput = async () => {
      if (!isRecording.value) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          mediaRecorder = new MediaRecorder(stream)
          audioChunks = []
          
          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data)
          }
          
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            isRecording.value = false
            
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
              const recognition = new SpeechRecognition()
              recognition.lang = 'zh-CN'
              recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                if (transcript) {
                  sendMessage(transcript)
                }
              }
              recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
              }
              recognition.start()
            }
          }
          
          mediaRecorder.start()
          isRecording.value = true
        } catch (error) {
          console.error('Voice input error:', error)
          alert('无法访问麦克风，请检查权限设置')
        }
      } else {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
        }
        isRecording.value = false
      }
    }
    
    const addTask = (task) => {
      tasks.value.push({
        id: Date.now(),
        text: task,
        completed: false,
        createdAt: new Date().toLocaleString()
      })
      recommendService.recordBehavior('task_add', { task })
    }
    
    const completeTask = (id) => {
      const task = tasks.value.find(t => t.id === id)
      if (task) {
        task.completed = !task.completed
        if (task.completed) {
          recommendService.recordBehavior('task_complete', { taskId: id })
        }
      }
    }
    
    const addEvent = (event) => {
      events.value.push({
        id: Date.now(),
        ...event,
        createdAt: new Date().toLocaleString()
      })
      recommendService.recordBehavior('schedule_create', { eventTitle: event.title })
    }
    
    const handleRecommendation = (rec) => {
      if (rec.action?.type === 'send_message') {
        activeTab.value = 'chat'
        sendMessage(rec.action.payload)
      } else if (rec.action?.type === 'open_tasks') {
        activeTab.value = 'task'
      } else if (rec.action?.type === 'open_schedule') {
        activeTab.value = 'schedule'
      }
    }
    
    const getRecIcon = (type) => {
      const icons = {
        'conversation_topic': '💬',
        'learning_tip': '📚',
        'task_suggestion': '✅',
        'morning_routine': '🌅',
        'lunch_reminder': '🍱',
        'night_routine': '🌙',
        'knowledge': '💡'
      }
      return icons[type] || '✨'
    }
    
    const useTool = async (toolName) => {
      activeTab.value = 'chat'
      
      let message = ''
      switch(toolName) {
        case 'calculator':
          message = '调用工具: calculator(expression="2+2*3")'
          break
        case 'translator':
          message = '调用工具: translator(text="你好", targetLang="en")'
          break
        case 'tell_joke':
          message = '调用工具: tell_joke(type="general")'
          break
        case 'get_quote':
          message = '调用工具: get_quote(category="inspiration")'
          break
        case 'get_weather':
          message = '调用工具: get_weather(city="北京")'
          break
        case 'get_time':
          message = '调用工具: get_time()'
          break
        default:
          message = `使用${toolName}工具`
      }
      
      sendMessage(message)
    }
    
    const updateSettings = (settings) => {
      console.log('Settings updated:', settings)
    }
    
    const openKnowledgeBase = () => {
      activeTab.value = 'chat'
      sendMessage('帮我管理知识库')
    }
    
    const loadRecommendations = async () => {
      try {
        const recs = await recommendService.getRecommendations('general', 6)
        generalRecommendations.value = recs.recommendations
        
        const insights = await recommendService.getUserInsights()
        userInsights.value = insights
      } catch (error) {
        console.error('Load recommendations error:', error)
      }
    }
    
    const autoChat = () => {
      const greetings = [
        '你今天过得怎么样呀？😊',
        '要不要和我聊聊天呢？',
        '有什么我可以帮你的吗？',
        '今天天气真好呀！☀️',
        '想不想听个笑话？😄'
      ]
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
      
      if (conversations.value.length === 0 || 
          Date.now() - new Date(conversations.value[conversations.value.length - 1].time).getTime() > 300000) {
        conversations.value.push({
          type: 'pet',
          content: randomGreeting,
          time: new Date().toLocaleTimeString()
        })
      }
    }
    
    onMounted(async () => {
      try {
        agentService.initAgent()
      } catch (e) {
        console.log('Agent init skipped')
      }
      
      conversations.value = await memoryService.loadConversations()
      tasks.value = await memoryService.loadTasks()
      events.value = await scheduleService.loadEvents()
      
      loadRecommendations()
      
      autoChatInterval = setInterval(autoChat, 60000)
      
      setTimeout(() => {
        if (conversations.value.length === 0) {
          conversations.value.push({
            type: 'pet',
            content: '你好呀！我是你的AI桌宠小助手~ 🐱\n\n我现在有好多新功能哦：\n🎤 语音输入\n📚 知识库问答\n✨ 智能推荐\n🛠️ AI工具调用\n\n有什么我可以帮你的吗？',
            time: new Date().toLocaleTimeString()
          })
        }
      }, 1000)
      
      chatRecommendations.value = ['你好呀！', '今天天气怎么样？', '讲个笑话', '几点了']
    })
    
    onUnmounted(() => {
      if (autoChatInterval) {
        clearInterval(autoChatInterval)
      }
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
      memoryService.saveTasks(tasks.value)
      scheduleService.saveEvents(events.value)
    })
    
    watch(activeTab, (newTab) => {
      if (newTab === 'discover') {
        loadRecommendations()
      }
      recommendService.recordBehavior('tab_switch', { tab: newTab })
    })
    
    return {
      tabs,
      activeTab,
      conversations,
      tasks,
      events,
      currentMood,
      currentAnimation,
      isRecording,
      showSettingsModal,
      chatRecommendations,
      generalRecommendations,
      userInsights,
      closeWindow,
      toggleSettings,
      handlePetClick,
      sendMessage,
      addTask,
      completeTask,
      addEvent,
      toggleVoiceInput,
      sendQuickReply,
      handleRecommendation,
      getRecIcon,
      useTool,
      updateSettings,
      openKnowledgeBase
    }
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.window-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 100;
  display: flex;
  gap: 6px;
}

.control-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.control-btn.close {
  background: #ff5f56;
  color: white;
}

.pet-area {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 30px;
}

.tab-bar {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  font-weight: 500;
}

.content-area {
  height: calc(100% - 220px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin: 0 8px 8px;
  overflow: hidden;
}

.discover-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.discover-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.discover-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.discover-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.recommend-section {
  margin-bottom: 16px;
}

.recommend-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #667eea;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommend-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.recommend-card:hover {
  background: #eef2ff;
  transform: translateX(4px);
}

.rec-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.rec-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.rec-arrow {
  color: #ccc;
  font-size: 14px;
}

.insights-card {
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  border-radius: 8px;
  padding: 12px;
}

.insights-card p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

.insights-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-radius: 10px;
  font-size: 11px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.tool-card:hover {
  background: #eef2ff;
  transform: scale(1.05);
}

.tool-icon {
  font-size: 24px;
}

.tool-name {
  font-size: 11px;
  color: #666;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
}
</style>
