<template>
  <div class="persona">
    <div class="module-intro">
      <h2>用户画像构建工具</h2>
      <p class="intro-text">好铁汁帮你精准定义目标用户，深入理解用户需求与行为特征</p>
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
        <p>产品设计过程中，精准定义目标用户是确保产品成功的关键。本工具提供标准化用户画像模板，涵盖基本属性、行为特征、需求痛点、用户目标、使用场景等核心要素，并支持智能标签推荐，帮助用户快速构建清晰、可量化的用户画像。</p>
      </template>
    </el-alert>
    
    <!-- 画像列表 -->
    <el-card class="list-card" shadow="never" v-if="!showForm">
      <template #header>
        <div class="card-header">
          <span>已创建的用户画像</span>
          <el-button type="primary" size="small" @click="showForm = true">
            <el-icon><Plus /></el-icon> 新建画像
          </el-button>
        </div>
      </template>
      
      <el-table :data="personas" v-loading="loading" stripe>
        <el-table-column prop="name" label="用户名称" width="150" />
        <el-table-column prop="basic_attrs" label="基本信息" />
        <el-table-column prop="tags" label="标签">
          <template #default="scope">
            <el-tag v-for="tag in parseTags(scope.row.tags)" :key="tag" size="small" style="margin-right: 5px;">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewPersona(scope.row)">查看</el-button>
            <el-button size="small" type="danger" @click="deletePersona(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑表单 -->
    <el-card v-if="showForm" class="form-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ editId ? '编辑画像' : '新建画像' }}</span>
          <el-button size="small" @click="showForm = false">返回列表</el-button>
        </div>
      </template>
      
      <el-form :model="form" label-width="120px" class="persona-form">
        <el-form-item label="用户名称" required>
          <el-input v-model="form.name" placeholder="输入用户名称或代号" />
        </el-form-item>
        
        <el-divider content-position="left">基本属性</el-divider>
        <el-form-item label="年龄">
          <el-input v-model="form.basicAttrs.age" placeholder="如：22岁" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.basicAttrs.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="职业">
          <el-input v-model="form.basicAttrs.occupation" placeholder="如：大二学生、产品经理" />
        </el-form-item>
        <el-form-item label="学历">
          <el-input v-model="form.basicAttrs.education" placeholder="如：本科在读" />
        </el-form-item>
        
        <el-divider content-position="left">行为特征</el-divider>
        <el-form-item label="使用频率">
          <el-select v-model="form.behaviorTraits.frequency" placeholder="选择使用频率">
            <el-option label="每天多次" value="每天多次" />
            <el-option label="每天一次" value="每天一次" />
            <el-option label="每周几次" value="每周几次" />
            <el-option label="偶尔使用" value="偶尔使用" />
          </el-select>
        </el-form-item>
        <el-form-item label="偏好渠道">
          <el-checkbox-group v-model="form.behaviorTraits.channels">
            <el-checkbox label="手机App">手机App</el-checkbox>
            <el-checkbox label="网页端">网页端</el-checkbox>
            <el-checkbox label="小程序">小程序</el-checkbox>
            <el-checkbox label="桌面端">桌面端</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="决策因素">
          <el-input v-model="form.behaviorTraits.decisionFactors" type="textarea" :rows="2" placeholder="影响用户决策的关键因素" />
        </el-form-item>
        
        <el-divider content-position="left">需求痛点</el-divider>
        <el-form-item label="核心痛点">
          <el-input v-model="form.painPoints" type="textarea" :rows="3" placeholder="描述用户面临的主要问题和挑战" />
        </el-form-item>
        
        <el-divider content-position="left">用户目标</el-divider>
        <el-form-item label="短期目标">
          <el-input v-model="form.goals.shortTerm" type="textarea" :rows="2" placeholder="用户近期想要达成的目标" />
        </el-form-item>
        <el-form-item label="长期目标">
          <el-input v-model="form.goals.longTerm" type="textarea" :rows="2" placeholder="用户的长远期望" />
        </el-form-item>
        
        <el-divider content-position="left">使用场景</el-divider>
        <el-form-item label="典型场景">
          <el-checkbox-group v-model="form.scenarios">
            <el-checkbox label="学习提升">学习提升</el-checkbox>
            <el-checkbox label="工作办公">工作办公</el-checkbox>
            <el-checkbox label="娱乐休闲">娱乐休闲</el-checkbox>
            <el-checkbox label="社交互动">社交互动</el-checkbox>
            <el-checkbox label="生活管理">生活管理</el-checkbox>
            <el-checkbox label="创作表达">创作表达</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="场景描述">
          <el-input v-model="form.scenarioDetail" type="textarea" :rows="2" placeholder="详细描述用户的使用场景" />
        </el-form-item>
        
        <el-divider content-position="left">标签</el-divider>
        <el-form-item label="智能标签">
          <div class="tag-input">
            <el-tag
              v-for="tag in form.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              style="margin-right: 8px; margin-bottom: 8px;"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model="tagInputValue"
              size="small"
              style="width: 120px;"
              @keyup.enter="addTag"
              @blur="addTag"
            />
            <el-button v-else size="small" @click="showTagInput">+ 添加标签</el-button>
          </div>
          <div class="tag-suggestions">
            <span class="suggestion-label">推荐标签：</span>
            <el-tag
              v-for="tag in suggestedTags"
              :key="tag"
              size="small"
              type="info"
              style="margin-right: 5px; margin-bottom: 5px; cursor: pointer;"
              @click="addSuggestedTag(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="savePersona" :loading="saving">保存画像</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 画像详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="currentPersona.name" width="800px">
      <div v-if="currentPersona" class="persona-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名称">{{ currentPersona.name }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentPersona.created_at }}</el-descriptions-item>
        </el-descriptions>

        <h4>基本属性</h4>
        <div v-html="formatJson(currentPersona.basic_attrs)"></div>

        <h4>行为特征</h4>
        <div v-html="formatJson(currentPersona.behavior_traits)"></div>

        <h4>需求痛点</h4>
        <p>{{ currentPersona.pain_points }}</p>

        <h4>用户目标</h4>
        <div v-html="formatJson(currentPersona.goals)"></div>

        <h4>使用场景</h4>
        <p>{{ currentPersona.scenarios }}</p>

        <h4>标签</h4>
        <div>
          <el-tag v-for="tag in parseTags(currentPersona.tags)" :key="tag" size="small" style="margin-right: 5px;">
            {{ tag }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportPersona">导出报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { trackPageView, trackButtonClick } from '@/utils/stats'

const personas = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editId = ref(null)
const dialogVisible = ref(false)
const currentPersona = ref({})

const form = reactive({
  name: '',
  basicAttrs: {
    age: '',
    gender: '',
    occupation: '',
    education: ''
  },
  behaviorTraits: {
    frequency: '',
    channels: [],
    decisionFactors: ''
  },
  painPoints: '',
  goals: {
    shortTerm: '',
    longTerm: ''
  },
  scenarios: [],
  scenarioDetail: '',
  tags: []
})

const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

const suggestedTags = ref(['学生', '职场新人', '效率控', '技术爱好者', '创作者', '社交达人', '价格敏感', '品质追求'])

const parseTags = (tagsStr) => {
  if (!tagsStr) return []
  try {
    return JSON.parse(tagsStr)
  } catch {
    return tagsStr.split(',').filter(t => t.trim())
  }
}

const loadPersonas = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3001/api/persona')
    const result = await response.json()
    if (result.code === 0) {
      personas.value = result.data
    }
  } catch (error) {
    console.error('加载画像失败:', error)
    ElMessage.error('加载画像失败')
  } finally {
    loading.value = false
  }
}

const savePersona = async () => {
  if (!form.name) {
    ElMessage.warning('请输入用户名称')
    return
  }
  
  saving.value = true
  try {
    const data = {
      name: form.name,
      basic_attrs: JSON.stringify(form.basicAttrs),
      behavior_traits: JSON.stringify(form.behaviorTraits),
      pain_points: form.painPoints,
      goals: JSON.stringify(form.goals),
      scenarios: JSON.stringify(form.scenarios),
      tags: JSON.stringify(form.tags)
    }
    
    const url = editId.value 
      ? `http://localhost:3001/api/persona/${editId.value}`
      : 'http://localhost:3001/api/persona'
    const method = editId.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success(editId.value ? '更新成功' : '创建成功')
      showForm.value = false
      resetForm()
      loadPersonas()
    } else {
      ElMessage.error('保存失败')
    }
  } catch (error) {
    console.error('保存画像失败:', error)
    ElMessage.error('网络错误')
  } finally {
    saving.value = false
  }
}

const deletePersona = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个画像吗？', '提示', {
      type: 'warning'
    })
    
    const response = await fetch(`http://localhost:3001/api/persona/${id}`, { method: 'DELETE' })
    const result = await response.json()
    
    if (result.code === 0) {
      ElMessage.success('删除成功')
      loadPersonas()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const viewPersona = (item) => {
  currentPersona.value = item
  dialogVisible.value = true
  trackButtonClick('persona', 'view_persona')
}

const formatJson = (str) => {
  if (!str) return '<p style="color: #909399;">暂无数据</p>'
  try {
    const obj = JSON.parse(str)
    return Object.entries(obj)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${Array.isArray(value) ? value.join('、') : value || '暂无'}</p>`)
      .join('')
  } catch {
    return `<p>${str}</p>`
  }
}

const exportPersona = () => {
  const p = currentPersona.value
  const content = `
# 用户画像报告：${p.name}

## 基本信息
- 用户名称：${p.name}
- 创建时间：${p.created_at}

## 基本属性
${formatJson(p.basic_attrs)}

## 行为特征
${formatJson(p.behavior_traits)}

## 需求痛点
${p.pain_points || '暂无'}

## 用户目标
${formatJson(p.goals)}

## 使用场景
${p.scenarios || '暂无'}

## 标签
${parseTags(p.tags).join('、') || '暂无'}
`
  
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `用户画像-${p.name}.md`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('报告已导出')
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    basicAttrs: { age: '', gender: '', occupation: '', education: '' },
    behaviorTraits: { frequency: '', channels: [], decisionFactors: '' },
    painPoints: '',
    goals: { shortTerm: '', longTerm: '' },
    scenarios: [],
    scenarioDetail: '',
    tags: []
  })
  editId.value = null
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.input?.focus()
  })
}

const addTag = () => {
  if (tagInputValue.value && !form.tags.includes(tagInputValue.value)) {
    form.tags.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const removeTag = (tag) => {
  form.tags = form.tags.filter(t => t !== tag)
}

const addSuggestedTag = (tag) => {
  if (!form.tags.includes(tag)) {
    form.tags.push(tag)
  }
}

onMounted(() => {
  trackPageView('persona')
  loadPersonas()
})
</script>

<style scoped>
.persona h2 {
  margin-bottom: 20px;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-card, .form-card {
  margin-bottom: 20px;
}

.persona-form {
  max-width: 800px;
}

.tag-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.tag-suggestions {
  margin-top: 10px;
}

.suggestion-label {
  color: #909399;
  font-size: 13px;
  margin-right: 8px;
}

.persona-detail h4 {
  margin: 15px 0 8px;
  color: #303133;
  font-size: 15px;
}

.persona-detail p {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 10px;
}
</style>
