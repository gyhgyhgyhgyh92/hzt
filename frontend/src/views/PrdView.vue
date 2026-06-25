<template>
  <div class="prd">
    <div class="module-intro">
      <h2>PRD模板库</h2>
      <p class="intro-text">好铁汁为你准备的标准化PRD模板，快速产出专业产品需求文档</p>
    </div>
    
    <!-- 需求背景说明 -->
    <el-alert
      title="需求背景"
      type="info"
      :closable="false"
      show-icon
      class="requirement-bg"
    >
      <template #default>
        <p>产品经理在撰写需求文档时，常面临格式不统一、结构不完整的问题。本模块提供3套差异化PRD模板（AI功能类、工具类、服务类），每套包含完整文档结构、使用指南和撰写示例，帮助用户快速产出专业规范的产品需求文档。</p>
      </template>
    </el-alert>
    
    <!-- 模板筛选 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true">
        <el-form-item label="模板类型">
          <el-select v-model="filterType" placeholder="全部类型" clearable @change="loadTemplates">
            <el-option label="AI功能类" value="AI功能类" />
            <el-option label="工具类" value="工具类" />
            <el-option label="服务类" value="服务类" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 模板列表 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="8" v-for="item in templates" :key="item.id">
        <el-card class="template-card" shadow="hover">
          <div class="template-icon">
            <el-icon :size="36" color="#67c23a"><Files /></el-icon>
          </div>
          <h3>{{ item.name }}</h3>
          <el-tag size="small" type="success">{{ item.type }}</el-tag>
          <p class="desc">{{ item.content?.substring(0, 80) }}...</p>
          <div class="footer">
            <el-button type="success" size="small" @click="viewTemplate(item)">查看详情</el-button>
            <el-button size="small" @click="downloadTemplate(item)">下载</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 模板详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="currentTemplate.name" width="900px" top="5vh">
      <div v-if="currentTemplate" class="template-detail">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="模板内容" name="content">
            <div class="content-section" v-html="currentTemplate.content"></div>
          </el-tab-pane>
          <el-tab-pane label="使用指南" name="guide">
            <div class="content-section" v-html="currentTemplate.guide"></div>
          </el-tab-pane>
          <el-tab-pane label="撰写示例" name="example">
            <div class="content-section" v-html="currentTemplate.example"></div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="success" @click="downloadTemplate(currentTemplate)">下载模板</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Files } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { trackPageView, trackButtonClick } from '@/utils/stats'

const templates = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentTemplate = ref({})
const activeTab = ref('content')
const filterType = ref('')

const loadTemplates = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filterType.value) params.append('type', filterType.value)
    
    const response = await fetch(`http://localhost:3001/api/prd?${params}`)
    const result = await response.json()
    
    if (result.code === 0) {
      templates.value = result.data
    } else {
      ElMessage.error('加载模板失败')
    }
  } catch (error) {
    console.error('加载模板错误:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const viewTemplate = (item) => {
  currentTemplate.value = item
  activeTab.value = 'content'
  dialogVisible.value = true
  trackButtonClick('prd', 'view_template')
}

const downloadTemplate = (item) => {
  const blob = new Blob([item.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${item.name}.md`
  a.click()
  URL.revokeObjectURL(url)
  trackButtonClick('prd', 'download_template')
  ElMessage.success('模板下载成功')
}

onMounted(() => {
  trackPageView('prd')
  loadTemplates()
})
</script>

<style scoped>
.prd h2 {
  margin-bottom: 20px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.template-card {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px 10px;
}

.template-icon {
  margin-bottom: 12px;
}

.template-card h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: #909399;
  margin: 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.template-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.content-section {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}
</style>
