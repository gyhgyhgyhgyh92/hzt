<template>
  <el-breadcrumb separator="/" class="breadcrumb">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumb"
      :key="index"
      :to="index < breadcrumb.length - 1 ? { path: getPath(item) } : null"
    >
      {{ item }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumb = computed(() => route.meta.breadcrumb || ['首页'])

const getPath = (item) => {
  if (item === '首页') return '/'
  const map = {
    'AI产品案例分析': '/cases',
    'PRD模板库': '/prd',
    '用户画像构建工具': '/persona',
    '产品原型设计基础': '/prototype',
    '关于': '/about',
    '个人资料': '/profile'
  }
  return map[item] || '/'
}
</script>

<style scoped>
.breadcrumb {
  margin-bottom: 20px;
}
</style>
