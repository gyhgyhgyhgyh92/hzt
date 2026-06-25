<template>
  <div class="cases">
    <div class="module-intro">
      <h2>AI产品案例分析</h2>
      <p class="intro-text">好铁汁精心整理的AI产品案例库，帮你快速理解行业最佳实践</p>
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
        <p>大二学生在学习AI产品相关知识时，缺乏系统化的案例库和学习路径。本模块通过深度解析10+真实AI产品案例，覆盖消费级应用、企业服务、垂直行业解决方案，帮助学生快速理解行业最佳实践，培养产品分析思维。</p>
      </template>
    </el-alert>
    
    <!-- 搜索筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索案例名称、背景、技术" clearable @keyup.enter="loadCases" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="filterForm.category" placeholder="全部类别" clearable>
            <el-option label="消费级" value="消费级" />
            <el-option label="企业服务" value="企业服务" />
            <el-option label="垂直行业" value="垂直行业" />
          </el-select>
        </el-form-item>
        <el-form-item label="领域">
          <el-select v-model="filterForm.field" placeholder="全部领域" clearable>
            <el-option label="通用对话" value="通用对话" />
            <el-option label="AI绘画" value="AI绘画" />
            <el-option label="AI音乐" value="AI音乐" />
            <el-option label="效率工具" value="效率工具" />
            <el-option label="开发工具" value="开发工具" />
            <el-option label="CRM" value="CRM" />
            <el-option label="营销自动化" value="营销自动化" />
            <el-option label="医疗健康" value="医疗健康" />
            <el-option label="教育科技" value="教育科技" />
            <el-option label="金融科技" value="金融科技" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCases">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 案例列表 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="8" v-for="item in cases" :key="item.id">
        <el-card class="case-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="title">{{ item.title }}</span>
              <div class="tags">
                <el-tag size="small" type="success">{{ item.category }}</el-tag>
                <el-tag size="small">{{ item.field }}</el-tag>
              </div>
            </div>
          </template>
          <p class="desc">{{ item.background }}</p>
          <div class="tech-tag">
            <el-tag size="small" type="info">{{ item.ai_tech }}</el-tag>
          </div>
          <div class="footer">
            <el-button type="primary" size="small" @click="viewDetail(item)">查看详情</el-button>
            <el-button size="small" @click="toggleFavorite(item)">
              <el-icon><Star /></el-icon>
              {{ item.isFavorite ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 案例详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="currentCase.title" width="800px">
      <div v-if="currentCase" class="case-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="产品名称">{{ currentCase.title }}</el-descriptions-item>
          <el-descriptions-item label="类别">{{ currentCase.category }}</el-descriptions-item>
          <el-descriptions-item label="领域">{{ currentCase.field }}</el-descriptions-item>
          <el-descriptions-item label="AI技术">{{ currentCase.ai_tech }}</el-descriptions-item>
        </el-descriptions>

        <h4>产品背景</h4>
        <p>{{ currentCase.background }}</p>

        <h4>功能拆解</h4>
        <p>{{ currentCase.feature_analysis }}</p>

        <h4>AI技术分析</h4>
        <p>{{ currentCase.ai_tech_analysis }}</p>

        <h4>商业模式</h4>
        <p>{{ currentCase.business_model }}</p>

        <h4>优缺点评估</h4>
        <p>{{ currentCase.pros_cons }}</p>

        <h4>改进建议</h4>
        <p>{{ currentCase.improvement }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { trackPageView, trackButtonClick } from '@/utils/stats'

const cases = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentCase = ref({})

const filterForm = ref({
  keyword: '',
  category: '',
  field: ''
})

const loadCases = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filterForm.value.keyword) params.append('keyword', filterForm.value.keyword)
    if (filterForm.value.category) params.append('category', filterForm.value.category)
    if (filterForm.value.field) params.append('field', filterForm.value.field)
    
    const response = await fetch(`http://localhost:3001/api/cases?${params}`)
    const result = await response.json()
    
    if (result.code === 0) {
      cases.value = result.data.map(c => ({ ...c, isFavorite: false }))
    } else {
      ElMessage.error('加载案例失败')
    }
  } catch (error) {
    console.error('加载案例错误:', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.value = { keyword: '', category: '', field: '' }
  loadCases()
}

const viewDetail = (item) => {
  currentCase.value = item
  dialogVisible.value = true
  trackButtonClick('cases', 'view_detail')
}

const toggleFavorite = (item) => {
  item.isFavorite = !item.isFavorite
  trackButtonClick('cases', 'toggle_favorite')
  ElMessage.success(item.isFavorite ? '已收藏' : '已取消收藏')
}

onMounted(() => {
  trackPageView('cases')
  loadCases()
})
</script>

<style scoped>
.module-intro {
  margin-bottom: 30px;
}

.module-intro h2 {
  margin-bottom: 10px;
  color: #303133;
}

.intro-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.filter-card {
  margin-bottom: 20px;
}

.case-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-weight: bold;
  font-size: 16px;
}

.tags {
  display: flex;
  gap: 5px;
}

.desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tech-tag {
  margin-bottom: 15px;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-detail h4 {
  margin: 15px 0 8px;
  color: #303133;
  font-size: 15px;
}

.case-detail p {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 10px;
}
</style>
