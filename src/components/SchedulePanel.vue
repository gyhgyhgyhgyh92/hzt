<template>
  <div class="schedule-panel">
    <div class="schedule-header">
      <h3>日程安排</h3>
      <button @click="showAddModal = true" class="add-schedule-btn">+ 添加</button>
    </div>
    
    <div class="schedule-list" v-if="events.length > 0">
      <div 
        v-for="event in sortedEvents" 
        :key="event.id"
        class="schedule-item"
      >
        <div class="event-time">
          <span class="time-icon">🕐</span>
          <span>{{ event.time }}</span>
        </div>
        <div class="event-content">
          <h4>{{ event.title }}</h4>
          <p class="event-desc">{{ event.description || '无描述' }}</p>
        </div>
        <div class="event-date">{{ formatDate(event.date) }}</div>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <span class="empty-icon">📅</span>
      <p>暂无日程安排</p>
    </div>
    
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>添加日程</h3>
        
        <div class="form-group">
          <label>标题</label>
          <input 
            type="text" 
            v-model="newEvent.title"
            placeholder="输入日程标题"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>日期</label>
          <input 
            type="date" 
            v-model="newEvent.date"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>时间</label>
          <input 
            type="time" 
            v-model="newEvent.time"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>描述</label>
          <textarea 
            v-model="newEvent.description"
            placeholder="输入日程描述（可选）"
            class="form-textarea"
          ></textarea>
        </div>
        
        <div class="modal-actions">
          <button @click="showAddModal = false" class="cancel-btn">取消</button>
          <button @click="handleAdd" class="confirm-btn">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, computed, reactive } = require('vue')

module.exports = {
  name: 'SchedulePanel',
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['add'],
  setup(props, { emit }) {
    const showAddModal = ref(false)
    const newEvent = reactive({
      title: '',
      date: '',
      time: '',
      description: ''
    })
    
    const sortedEvents = computed(() => {
      return [...props.events].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA - dateB
      })
    })
    
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return `${month}月${day}日 ${weekdays[date.getDay()]}`
    }
    
    const handleAdd = () => {
      if (newEvent.title && newEvent.date && newEvent.time) {
        emit('add', { ...newEvent })
        newEvent.title = ''
        newEvent.date = ''
        newEvent.time = ''
        newEvent.description = ''
        showAddModal.value = false
      }
    }
    
    return {
      showAddModal,
      newEvent,
      sortedEvents,
      formatDate,
      handleAdd
    }
  }
}
</script>

<style scoped>
.schedule-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  position: relative;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.schedule-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.add-schedule-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-schedule-btn:hover {
  transform: scale(1.05);
}

.schedule-list {
  flex: 1;
  overflow-y: auto;
}

.schedule-list::-webkit-scrollbar {
  width: 4px;
}

.schedule-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.schedule-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.schedule-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.schedule-item:hover {
  background: #f0f0f0;
}

.event-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.time-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.event-time span:last-child {
  font-size: 12px;
  color: #667eea;
  font-weight: bold;
}

.event-content {
  flex: 1;
}

.event-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.event-desc {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.event-date {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 280px;
}

.modal-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 60px;
}

.form-textarea:focus {
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.cancel-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.confirm-btn {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  cursor: pointer;
}
</style>