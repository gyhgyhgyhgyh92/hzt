<template>
  <div class="chat-panel">
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(msg, index) in conversations" 
        :key="index"
        :class="['message', msg.type]"
      >
        <div class="avatar">
          <span v-if="msg.type === 'user'">👤</span>
          <span v-else>🐱</span>
        </div>
        <div class="message-content">
          <div v-if="msg.toolUsed" class="tool-badge">
            🛠️ 使用工具: {{ msg.toolUsed }}
          </div>
          <p class="msg-text">{{ msg.content }}</p>
          <span class="time">{{ msg.time }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="recommendations && recommendations.length > 0" class="quick-replies">
      <button 
        v-for="(reply, idx) in recommendations" 
        :key="idx"
        class="quick-reply-btn"
        @click="$emit('quick-reply', reply)"
      >
        {{ reply }}
      </button>
    </div>
    
    <div class="chat-input">
      <button 
        class="voice-btn" 
        :class="{ recording: isRecording }"
        @click="$emit('voice-toggle')"
        :title="isRecording ? '停止录音' : '语音输入'"
      >
        <span v-if="isRecording">🔴</span>
        <span v-else>🎤</span>
      </button>
      <input 
        type="text" 
        v-model="inputMessage"
        placeholder="输入消息..."
        @keyup.enter="handleSend"
        class="message-input"
      />
      <button @click="handleSend" class="send-btn">
        <span>➤</span>
      </button>
    </div>
  </div>
</template>

<script>
const { ref, watch, nextTick } = require('vue')

module.exports = {
  name: 'ChatPanel',
  props: {
    conversations: {
      type: Array,
      default: () => []
    },
    recommendations: {
      type: Array,
      default: () => []
    },
    isRecording: {
      type: Boolean,
      default: false
    }
  },
  emits: ['send', 'voice-toggle', 'quick-reply'],
  setup(props, { emit }) {
    const inputMessage = ref('')
    const messagesContainer = ref(null)
    
    const handleSend = () => {
      const message = inputMessage.value.trim()
      if (message) {
        emit('send', message)
        inputMessage.value = ''
      }
    }
    
    watch(() => props.conversations.length, async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
    
    return {
      inputMessage,
      messagesContainer,
      handleSend
    }
  }
}
</script>

<style scoped>
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.message {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  max-width: 90%;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message.pet {
  margin-right: auto;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message.user .avatar {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.message-content {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 16px;
  max-width: calc(100% - 44px);
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tool-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-radius: 10px;
  font-size: 11px;
  margin-bottom: 4px;
}

.message.user .tool-badge {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.msg-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
}

.message-content .time {
  font-size: 10px;
  opacity: 0.6;
  margin-top: 4px;
  display: block;
}

.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.quick-reply-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background: white;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-reply-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #eee;
  align-items: center;
}

.voice-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
}

.voice-btn:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.voice-btn.recording {
  background: #ef4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.message-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #667eea;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.send-btn:hover {
  transform: scale(1.1);
}

.send-btn:active {
  transform: scale(0.95);
}
</style>
