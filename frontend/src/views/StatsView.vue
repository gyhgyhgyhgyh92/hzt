<template>
  <div class="stats">
    <div class="module-intro">
      <h2>数据统计与分析</h2>
      <p class="intro-text">好铁汁通过数据驱动产品优化，持续改进用户体验</p>
    </div>
    
    <!-- 总体统计 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #409eff;">
            <el-icon :size="32" color="#fff"><DataLine /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summary.total_visits }}</div>
            <div class="stat-label">总访问量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #67c23a;">
            <el-icon :size="32" color="#fff"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summary.unique_users }}</div>
            <div class="stat-label">独立用户</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c;">
            <el-icon :size="32" color="#fff"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summary.today_visits }}</div>
            <div class="stat-label">今日访问</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 模块访问统计 -->
    <el-card class="module-stats" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>模块访问排行</span>
          <el-button type="primary" size="small" @click="loadModuleStats">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </template>
      <el-table :data="moduleStats" stripe style="width: 100%">
        <el-table-column prop="module" label="模块名称" width="180">
          <template #default="scope">
            <el-tag :type="getModuleTag(scope.row.module)">{{ scope.row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="visit_count" label="访问次数" width="120" />
        <el-table-column prop="unique_users" label="独立用户" width="120" />
        <el-table-column prop="last_visit" label="最后访问">
          <template #default="scope">
            {{ formatTime(scope.row.last_visit) }}
          </template>
        </el-table-column>
        <el-table-column label="占比">
          <template #default="scope">
            <el-progress 
              :percentage="calcPercentage(scope.row.visit_count)" 
              :color="getModuleColor(scope.row.module)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 用户行为分析 -->
    <el-card class="behavior-stats" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户行为分析</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :md="12" v-for="item in topActions" :key="item.action">
          <div class="behavior-item">
            <div class="behavior-info">
              <el-tag size="small" type="info">{{ item.module }}</el-tag>
              <span class="action-name">{{ item.action }}</span>
            </div>
            <div class="behavior-count">{{ item.count }} 次</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 产品优化建议 -->
    <el-card class="optimization" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>产品优化洞察</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item 
          v-for="(insight, index) in insights" 
          :key="index"
          :color="insight.color"
        >
          <h4>{{ insight.title }}</h4>
          <p>{{ insight.content }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { DataLine, User, TrendCharts, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const summary = ref({
  total_visits: 0,
  unique_users: 0,
  today_visits: 0
})

const moduleStats = ref([])
const topActions = ref([])

const insights = ref([
  {
    title: '高频功能识别',
    content: '通过模块访问统计，识别用户最常用的功能模块，优先优化这些功能的性能和用户体验。',
    color: '#409eff'
  },
  {
    title: '用户行为洞察',
    content: '分析用户在不同模块的行为模式，发现潜在的使用痛点和改进机会。',
    color: '#67c23a'
  },
  {
    title: '功能迭代方向',
    content: '基于访问数据，识别低使用率的功能模块，评估是否需要优化或调整产品策略。',
    color: '#e6a23c'
  },
  {
    title: '用户增长策略',
    content: '通过独立用户数和访问频次，评估产品粘性和用户增长潜力。',
    color: '#f56c6c'
  }
])

const loadSummary = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/stats/summary')
    const data = await res.json()
    if (data.code === 0) {
      summary.value = data.data
    }
  } catch (error) {
    console.error('加载总体统计失败:', error)
  }
}

const loadModuleStats = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/stats/modules')
    const data = await res.json()
    if (data.code === 0) {
      moduleStats.value = data.data
    }
  } catch (error) {
    console.error('加载模块统计失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const loadBehaviorStats = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/stats/behavior')
    const data = await res.json()
    if (data.code === 0) {
      topActions.value = data.data.slice(0, 6)
    }
  } catch (error) {
    console.error('加载行为统计失败:', error)
  }
}

const getModuleTag = (module) => {
  const tags = {
    'cases': 'primary',
    'prd': 'success',
    'persona': 'warning',
    'prototype': 'danger'
  }
  return tags[module] || 'info'
}

const getModuleColor = (module) => {
  const colors = {
    'cases': '#409eff',
    'prd': '#67c23a',
    'persona': '#e6a23c',
    'prototype': '#f56c6c'
  }
  return colors[module] || '#909399'
}

const calcPercentage = (count) => {
  if (moduleStats.value.length === 0) return 0
  const max = Math.max(...moduleStats.value.map(m => m.visit_count))
  return Math.round((count / max) * 100)
}

const formatTime = (time) => {
  if (!time) return '暂无'
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadSummary()
  loadModuleStats()
  loadBehaviorStats()
})
</script>

<style scoped>
.stats {
  padding: 20px;
}

.module-intro {
  text-align: center;
  margin-bottom: 40px;
}

.module-intro h2 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
}

.intro-text {
  font-size: 16px;
  color: #909399;
}

.summary-cards {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.module-stats,
.behavior-stats,
.optimization {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.behavior-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 10px;
}

.behavior-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-name {
  font-size: 14px;
  color: #606266;
}

.behavior-count {
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
}

.optimization h4 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 10px;
}

.optimization p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>
