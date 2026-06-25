<template>
  <div class="home">
    <div class="welcome">
      <h1>好铁汁，欢迎使用校园文档助手</h1>
      <p>AI产品经理的一站式工作平台</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in modules" :key="item.path">
        <el-card class="module-card" @click="$router.push(item.path)">
          <el-icon :size="40" :color="item.color">
            <component :is="item.icon" />
          </el-icon>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Document, Files, User, PictureFilled, InfoFilled, UserFilled, DataLine } from '@element-plus/icons-vue'
import { trackPageView } from '@/utils/stats'
import { onMounted } from 'vue'

const modules = [
  {
    path: '/cases',
    title: 'AI产品案例分析',
    desc: '深度解析AI产品案例',
    icon: 'Document',
    color: '#409eff'
  },
  {
    path: '/prd',
    title: 'PRD模板库',
    desc: '标准化产品需求文档',
    icon: 'Files',
    color: '#67c23a'
  },
  {
    path: '/persona',
    title: '用户画像构建',
    desc: '精准定义目标用户',
    icon: 'User',
    color: '#e6a23c'
  },
  {
    path: '/prototype',
    title: '产品原型设计',
    desc: '快速构建产品原型',
    icon: 'PictureFilled',
    color: '#f56c6c'
  },
  {
    path: '/stats',
    title: '数据统计',
    desc: '产品数据分析',
    icon: 'DataLine',
    color: '#909399'
  },
  {
    path: '/about',
    title: '关于平台',
    desc: '了解核心技能与能力',
    icon: 'InfoFilled',
    color: '#909399'
  },
  {
    path: '/profile',
    title: '个人资料',
    desc: '管理个人信息',
    icon: 'UserFilled',
    color: '#409eff'
  }
]

onMounted(() => {
  trackPageView('home')
})
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome {
  text-align: center;
  margin-bottom: 40px;
}

.welcome h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 10px;
}

.welcome p {
  font-size: 16px;
  color: #909399;
}

.module-card {
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  margin-bottom: 20px;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.module-card h3 {
  margin: 15px 0 10px;
  font-size: 18px;
  color: #303133;
}

.module-card p {
  color: #909399;
  font-size: 14px;
}
</style>
