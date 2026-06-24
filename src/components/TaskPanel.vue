<template>
  <div class="task-panel">
    <div class="task-header">
      <h3>待办事项</h3>
      <span class="count">{{ tasks.length }} 项</span>
    </div>
    
    <div class="task-list" v-if="tasks.length > 0">
      <div 
        v-for="task in tasks" 
        :key="task.id"
        :class="['task-item', { completed: task.completed }]"
      >
        <input 
          type="checkbox" 
          :checked="task.completed"
          @change="$emit('complete', task.id)"
          class="task-checkbox"
        />
        <span class="task-text">{{ task.text }}</span>
        <span class="task-time">{{ task.createdAt }}</span>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <span class="empty-icon">📝</span>
      <p>暂无待办事项</p>
    </div>
    
    <div class="task-input">
      <input 
        type="text" 
        v-model="newTask"
        placeholder="添加新任务..."
        @keyup.enter="handleAdd"
        class="task-input-field"
      />
      <button @click="handleAdd" class="add-btn">+</button>
    </div>
  </div>
</template>

<script>
const { ref } = require('vue')

module.exports = {
  name: 'TaskPanel',
  props: {
    tasks: {
      type: Array,
      default: () => []
    }
  },
  emits: ['add', 'complete'],
  setup(props, { emit }) {
    const newTask = ref('')
    
    const handleAdd = () => {
      const task = newTask.value.trim()
      if (task) {
        emit('add', task)
        newTask.value = ''
      }
    }
    
    return {
      newTask,
      handleAdd
    }
  }
}
</script>

<style scoped>
.task-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.count {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.task-list {
  flex: 1;
  overflow-y: auto;
}

.task-list::-webkit-scrollbar {
  width: 4px;
}

.task-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.task-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.task-item:hover {
  background: #f0f0f0;
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: #999;
}

.task-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.task-time {
  font-size: 10px;
  color: #999;
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

.task-input {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.task-input-field {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.task-input-field:focus {
  border-color: #667eea;
}

.add-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.add-btn:hover {
  transform: scale(1.1);
}

.add-btn:active {
  transform: scale(0.95);
}
</style>