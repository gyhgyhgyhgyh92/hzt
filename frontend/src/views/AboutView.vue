<template>
  <div class="about">
    <div class="module-intro">
      <h2>AI产品经理核心技能</h2>
      <p class="intro-text">好铁汁通过本项目展示的AI产品经理核心能力与专业素养</p>
    </div>

    <!-- 核心技能展示 -->
    <el-row :gutter="20" class="skills-section">
      <el-col :xs="24" :sm="12" :md="8" v-for="skill in skills" :key="skill.name">
        <el-card class="skill-card">
          <el-icon :size="40" :color="skill.color">
            <component :is="skill.icon" />
          </el-icon>
          <h3>{{ skill.name }}</h3>
          <p>{{ skill.desc }}</p>
          <el-progress :percentage="skill.level" :color="skill.color" />
          <div class="skill-details">
            <p v-for="(detail, idx) in skill.details" :key="idx">{{ detail }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 产品思考专栏 -->
    <el-card class="thinking-section" shadow="hover">
      <template #header>
        <div class="section-header">
          <el-icon :size="24" color="#409eff"><Document /></el-icon>
          <span>产品思考专栏</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="item in productThinking"
          :key="item.title"
          :timestamp="item.date"
          placement="top"
          :color="item.color"
        >
          <el-card shadow="never">
            <h4>{{ item.title }}</h4>
            <p class="thinking-content">{{ item.content }}</p>
            <div class="thinking-tags">
              <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 项目数据统计 -->
    <el-card class="stats-section" shadow="hover">
      <template #header>
        <div class="section-header">
          <el-icon :size="24" color="#67c23a"><DataAnalysis /></el-icon>
          <span>项目数据统计</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.label">
          <div class="stat-item">
            <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { Document, DataAnalysis } from '@element-plus/icons-vue'

const skills = [
  { 
    name: '需求分析', 
    desc: '深入理解用户需求，转化为产品功能', 
    icon: 'Document', 
    color: '#409eff', 
    level: 90,
    details: ['用户访谈与调研', '需求优先级排序', '用户故事编写', '需求文档输出']
  },
  { 
    name: '产品设计', 
    desc: '设计直观易用的产品界面和交互流程', 
    icon: 'PictureFilled', 
    color: '#67c23a', 
    level: 85,
    details: ['信息架构设计', '交互流程优化', '原型设计', '用户体验优化']
  },
  { 
    name: '数据分析', 
    desc: '通过数据驱动产品决策和优化', 
    icon: 'DataAnalysis', 
    color: '#e6a23c', 
    level: 80,
    details: ['数据指标体系', '用户行为分析', 'A/B测试设计', '数据可视化']
  },
  { 
    name: '项目管理', 
    desc: '协调团队资源，把控项目进度', 
    icon: 'Timer', 
    color: '#f56c6c', 
    level: 88,
    details: ['敏捷开发流程', '跨部门协作', '风险管控', '资源调配']
  },
  { 
    name: 'AI技术理解', 
    desc: '理解AI技术原理和应用场景', 
    icon: 'Cpu', 
    color: '#909399', 
    level: 75,
    details: ['大语言模型应用', 'RAG技术架构', '多模态AI', 'AI Agent设计']
  },
  { 
    name: '用户研究', 
    desc: '深入用户场景，挖掘真实需求', 
    icon: 'User', 
    color: '#409eff', 
    level: 82,
    details: ['用户画像构建', '使用场景分析', '竞品分析', '用户反馈收集']
  }
]

const productThinking = [
  {
    title: '需求背景：为什么做AI产品案例分析模块？',
    content: '大二学生在学习AI产品相关知识时，缺乏系统化的案例库和学习路径。通过深度解析10+真实AI产品案例，帮助学生快速理解行业最佳实践，培养产品分析思维。',
    date: '2026-06-25',
    color: '#409eff',
    tags: ['用户需求', '学习痛点', '案例驱动']
  },
  {
    title: '设计决策：PRD模板库的差异化设计',
    content: '针对不同产品场景（AI功能类、工具类、服务类），设计3套差异化PRD模板。每套模板包含完整文档结构，并提供使用指南和撰写示例，降低学习门槛。',
    date: '2026-06-25',
    color: '#67c23a',
    tags: ['产品设计', '模板化', '场景化']
  },
  {
    title: '技术选型：为什么选择sql.js替代better-sqlite3？',
    content: '在Node v24环境下，better-sqlite3因C++20编译失败。经过技术调研，选择纯JavaScript实现的sql.js，虽然性能略有牺牲，但确保了跨平台兼容性和部署便捷性。',
    date: '2026-06-25',
    color: '#e6a23c',
    tags: ['技术选型', '兼容性', '权衡取舍']
  },
  {
    title: '迭代优化：用户画像工具的智能标签推荐',
    content: '基于用户行为数据和场景特征，实现智能标签推荐功能。通过预设标签库和自定义标签机制，帮助用户快速构建精准用户画像。',
    date: '2026-06-25',
    color: '#f56c6c',
    tags: ['用户研究', '智能化', '迭代优化']
  }
]

const stats = [
  { label: 'AI产品案例', value: '10+', color: '#409eff' },
  { label: 'PRD模板', value: '3套', color: '#67c23a' },
  { label: '核心功能模块', value: '4个', color: '#e6a23c' },
  { label: '用户画像模板', value: '8+', color: '#f56c6c' }
]
</script>

<style scoped>
.about {
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

.skills-section {
  margin-bottom: 40px;
}

.skill-card {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px 10px;
  transition: all 0.3s;
}

.skill-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.skill-card h3 {
  font-size: 18px;
  color: #303133;
  margin: 15px 0 10px;
}

.skill-card p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 15px;
}

.skill-details {
  margin-top: 15px;
  text-align: left;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.skill-details p {
  font-size: 13px;
  color: #606266;
  margin: 5px 0;
  padding-left: 15px;
  position: relative;
}

.skill-details p::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #409eff;
}

.thinking-section,
.stats-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.thinking-section h4 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 10px;
}

.thinking-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}

.thinking-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>
