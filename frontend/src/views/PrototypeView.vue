<template>
  <div class="prototype">
    <div class="module-intro">
      <h2>产品原型设计基础</h2>
      <p class="intro-text">好铁汁带你掌握原型设计方法论，快速构建产品交互原型</p>
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
        <p>原型设计是产品经理的核心技能之一，但初学者往往缺乏系统的方法论指导和实践工具。本模块提供原型设计方法论知识库（用户流程图、线框图、交互设计原则、移动端适配）、基础组件库说明文档，以及简易原型草图工具，帮助用户快速掌握原型设计核心能力。</p>
      </template>
    </el-alert>
    
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 方法论知识库 -->
      <el-tab-pane label="设计方法论" name="methodology">
        <el-row :gutter="20">
          <el-col :xs="24" :md="12" v-for="item in methodology" :key="item.id">
            <el-card class="method-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
                  <span>{{ item.title }}</span>
                </div>
              </template>
              <p class="desc">{{ item.desc }}</p>
              <el-collapse>
                <el-collapse-item title="核心要点">
                  <ul>
                    <li v-for="(point, idx) in item.points" :key="idx">{{ point }}</li>
                  </ul>
                </el-collapse-item>
              </el-collapse>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 组件库说明 -->
      <el-tab-pane label="组件库规范" name="components">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="item in components" :key="item.id">
            <el-card class="component-card" shadow="hover">
              <div class="component-preview">
                <component :is="item.preview" />
              </div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.desc }}</p>
              <el-tag size="small" type="info">{{ item.usage }}</el-tag>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 原型草图工具 -->
      <el-tab-pane label="原型草图工具" name="sketch">
        <div class="sketch-tool">
          <div class="toolbar">
            <el-button-group>
              <el-button :type="currentTool === 'select' ? 'primary' : ''" @click="setTool('select')">
                <el-icon><Pointer /></el-icon> 选择
              </el-button>
              <el-button :type="currentTool === 'rect' ? 'primary' : ''" @click="setTool('rect')">
                <el-icon><Square /></el-icon> 矩形
              </el-button>
              <el-button :type="currentTool === 'circle' ? 'primary' : ''" @click="setTool('circle')">
                <el-icon><CircleFilled /></el-icon> 圆形
              </el-button>
              <el-button :type="currentTool === 'line' ? 'primary' : ''" @click="setTool('line')">
                <el-icon><Minus /></el-icon> 线条
              </el-button>
              <el-button :type="currentTool === 'text' ? 'primary' : ''" @click="setTool('text')">
                <el-icon><EditPen /></el-icon> 文本
              </el-button>
            </el-button-group>
            
            <el-divider direction="vertical" />
            
            <el-color-picker v-model="currentColor" size="small" />
            <el-input-number v-model="lineWidth" :min="1" :max="10" size="small" style="width: 120px; margin-left: 10px;" />
            
            <el-divider direction="vertical" />
            
            <el-button type="danger" size="small" @click="clearCanvas">清空画布</el-button>
            <el-button type="success" size="small" @click="exportSketch">导出原型</el-button>
          </div>
          
          <div class="canvas-container">
            <canvas
              ref="canvasRef"
              :width="canvasWidth"
              :height="canvasHeight"
              @mousedown="startDraw"
              @mousemove="drawing"
              @mouseup="endDraw"
              @mouseleave="endDraw"
            ></canvas>
          </div>
          
          <div class="canvas-info">
            <span>画布尺寸: {{ canvasWidth }} x {{ canvasHeight }}</span>
            <span>当前工具: {{ toolNames[currentTool] }}</span>
            <span>图形数量: {{ shapes.length }}</span>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { Pointer, Square, CircleFilled, Minus, EditPen, Document, Connection, Monitor, Cellphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { trackPageView, trackButtonClick } from '@/utils/stats'

const activeTab = ref('methodology')

// 方法论数据
const methodology = [
  {
    id: 1,
    title: '用户流程图',
    icon: 'Connection',
    color: '#409eff',
    desc: '描述用户完成目标的步骤路径',
    points: ['明确用户目标与起点终点', '梳理关键决策节点', '标注异常流程与分支', '保持流程简洁清晰']
  },
  {
    id: 2,
    title: '线框图设计',
    icon: 'Monitor',
    color: '#67c23a',
    desc: '快速表达页面布局与信息架构',
    points: ['聚焦信息层级而非视觉细节', '使用灰度色彩避免干扰', '标注交互元素与功能区域', '配合注释说明交互逻辑']
  },
  {
    id: 3,
    title: '交互设计原则',
    icon: 'Document',
    color: '#e6a23c',
    desc: '提升用户体验的核心设计准则',
    points: ['一致性：保持操作与视觉统一', '反馈：及时响应用户操作', '容错：允许撤销与恢复', '简约：减少认知负荷']
  },
  {
    id: 4,
    title: '移动端适配',
    icon: 'Cellphone',
    color: '#f56c6c',
    desc: '多设备场景下的设计策略',
    points: ['触摸目标尺寸不小于44px', '关键操作置于拇指热区', '考虑横竖屏切换场景', '优化加载性能与流量消耗']
  }
]

// 组件库数据
const ButtonPreview = () => h('div', { class: 'preview-box' }, [
  h('div', { class: 'mock-btn primary' }, '主要按钮'),
  h('div', { class: 'mock-btn default' }, '次要按钮')
])

const FormPreview = () => h('div', { class: 'preview-box' }, [
  h('div', { class: 'mock-input' }),
  h('div', { class: 'mock-input short' })
])

const ListPreview = () => h('div', { class: 'preview-box' }, [
  h('div', { class: 'mock-list-item' }),
  h('div', { class: 'mock-list-item' }),
  h('div', { class: 'mock-list-item' })
])

const CardPreview = () => h('div', { class: 'preview-box' }, [
  h('div', { class: 'mock-card' })
])

const NavPreview = () => h('div', { class: 'preview-box' }, [
  h('div', { class: 'mock-nav' }),
  h('div', { class: 'mock-nav-item' }),
  h('div', { class: 'mock-nav-item' })
])

const TablePreview = () => h('div', { class: 'preview-box' }, [
  h('div', { class: 'mock-table-header' }),
  h('div', { class: 'mock-table-row' }),
  h('div', { class: 'mock-table-row' })
])

const components = [
  { id: 1, name: '按钮组件', desc: '主要、次要、文字、链接等按钮类型', preview: ButtonPreview, usage: '操作触发' },
  { id: 2, name: '表单组件', desc: '输入框、选择器、开关等表单元素', preview: FormPreview, usage: '数据录入' },
  { id: 3, name: '列表组件', desc: '信息列表、卡片列表、时间线', preview: ListPreview, usage: '信息展示' },
  { id: 4, name: '卡片组件', desc: '信息卡片、统计卡片、操作卡片', preview: CardPreview, usage: '内容聚合' },
  { id: 5, name: '导航组件', desc: '顶部导航、侧边栏、面包屑', preview: NavPreview, usage: '路径指引' },
  { id: 6, name: '表格组件', desc: '数据表格、可编辑表格、树形表格', preview: TablePreview, usage: '数据管理' }
]

// 原型草图工具
const canvasRef = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(500)
const currentTool = ref('select')
const currentColor = ref('#409eff')
const lineWidth = ref(2)
const isDrawing = ref(false)
const startX = ref(0)
const startY = ref(0)
const shapes = ref([])

const toolNames = {
  select: '选择',
  rect: '矩形',
  circle: '圆形',
  line: '线条',
  text: '文本'
}

const setTool = (tool) => {
  currentTool.value = tool
}

const startDraw = (e) => {
  if (currentTool.value === 'select') return
  
  const rect = canvasRef.value.getBoundingClientRect()
  startX.value = e.clientX - rect.left
  startY.value = e.clientY - rect.top
  isDrawing.value = true
  
  if (currentTool.value === 'text') {
    const text = prompt('输入文本内容：')
    if (text) {
      shapes.value.push({
        type: 'text',
        x: startX.value,
        y: startY.value,
        text,
        color: currentColor.value,
        size: lineWidth.value * 8
      })
      redrawCanvas()
    }
    isDrawing.value = false
  }
}

const drawing = (e) => {
  if (!isDrawing.value || currentTool.value === 'select' || currentTool.value === 'text') return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const currentX = e.clientX - rect.left
  const currentY = e.clientY - rect.top
  
  redrawCanvas()
  
  const ctx = canvasRef.value.getContext('2d')
  ctx.strokeStyle = currentColor.value
  ctx.lineWidth = lineWidth.value
  ctx.setLineDash([])
  
  if (currentTool.value === 'rect') {
    ctx.strokeRect(startX.value, startY.value, currentX - startX.value, currentY - startY.value)
  } else if (currentTool.value === 'circle') {
    const radius = Math.sqrt(Math.pow(currentX - startX.value, 2) + Math.pow(currentY - startY.value, 2))
    ctx.beginPath()
    ctx.arc(startX.value, startY.value, radius, 0, Math.PI * 2)
    ctx.stroke()
  } else if (currentTool.value === 'line') {
    ctx.beginPath()
    ctx.moveTo(startX.value, startY.value)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()
  }
}

const endDraw = (e) => {
  if (!isDrawing.value || currentTool.value === 'select' || currentTool.value === 'text') return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const endX = e.clientX - rect.left
  const endY = e.clientY - rect.top
  
  if (currentTool.value === 'rect') {
    shapes.value.push({
      type: 'rect',
      x: startX.value,
      y: startY.value,
      width: endX - startX.value,
      height: endY - startY.value,
      color: currentColor.value,
      lineWidth: lineWidth.value
    })
  } else if (currentTool.value === 'circle') {
    const radius = Math.sqrt(Math.pow(endX - startX.value, 2) + Math.pow(endY - startY.value, 2))
    shapes.value.push({
      type: 'circle',
      x: startX.value,
      y: startY.value,
      radius,
      color: currentColor.value,
      lineWidth: lineWidth.value
    })
  } else if (currentTool.value === 'line') {
    shapes.value.push({
      type: 'line',
      x1: startX.value,
      y1: startY.value,
      x2: endX,
      y2: endY,
      color: currentColor.value,
      lineWidth: lineWidth.value
    })
  }
  
  isDrawing.value = false
  redrawCanvas()
}

const redrawCanvas = () => {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // 绘制网格背景
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1
  for (let i = 0; i < canvasWidth.value; i += 20) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, canvasHeight.value)
    ctx.stroke()
  }
  for (let i = 0; i < canvasHeight.value; i += 20) {
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(canvasWidth.value, i)
    ctx.stroke()
  }
  
  // 绘制所有图形
  shapes.value.forEach(shape => {
    ctx.strokeStyle = shape.color
    ctx.lineWidth = shape.lineWidth
    ctx.setLineDash([])
    
    if (shape.type === 'rect') {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
    } else if (shape.type === 'circle') {
      ctx.beginPath()
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2)
      ctx.stroke()
    } else if (shape.type === 'line') {
      ctx.beginPath()
      ctx.moveTo(shape.x1, shape.y1)
      ctx.lineTo(shape.x2, shape.y2)
      ctx.stroke()
    } else if (shape.type === 'text') {
      ctx.fillStyle = shape.color
      ctx.font = `${shape.size}px Arial`
      ctx.fillText(shape.text, shape.x, shape.y)
    }
  })
}

const clearCanvas = () => {
  shapes.value = []
  redrawCanvas()
  trackButtonClick('prototype', 'clear_canvas')
  ElMessage.success('画布已清空')
}

const exportSketch = () => {
  const canvas = canvasRef.value
  const link = document.createElement('a')
  link.download = '原型草图.png'
  link.href = canvas.toDataURL()
  link.click()
  trackButtonClick('prototype', 'export_sketch')
  ElMessage.success('原型已导出')
}

onMounted(() => {
  trackPageView('prototype')
  redrawCanvas()
})
</script>

<style scoped>
.prototype h2 {
  margin-bottom: 20px;
  color: #303133;
}

.element-card {
  margin-bottom: 20px;
  text-align: center;
}

.element-preview {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 12px;
}

.preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.mock-btn {
  padding: 4px 16px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.mock-btn.primary { background: #409eff; }
.mock-btn.default { background: #909399; }

.mock-input {
  width: 80%;
  height: 24px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.mock-input.short { width: 50%; }

.mock-list-item {
  width: 80%;
  height: 16px;
  background: #e4e7ed;
  border-radius: 3px;
}

.mock-card {
  width: 80%;
  height: 50px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.mock-nav {
  width: 80%;
  height: 20px;
  background: #409eff;
  border-radius: 3px;
}

.mock-nav-item {
  width: 50%;
  height: 12px;
  background: #e4e7ed;
  border-radius: 3px;
}

.mock-table-header {
  width: 90%;
  height: 18px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
}

.mock-table-row {
  width: 90%;
  height: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-top: none;
}

.element-card h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 6px;
}

.element-card p {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
</style>
