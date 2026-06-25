<template>
  <el-menu
    :default-active="activeIndex"
    class="sidebar"
    :collapse="sidebarCollapsed"
    @select="handleSelect"
  >
    <el-menu-item index="/cases">
      <el-icon><Document /></el-icon>
      <span>案例分析</span>
    </el-menu-item>
    <el-menu-item index="/prd">
      <el-icon><Files /></el-icon>
      <span>PRD模板</span>
    </el-menu-item>
    <el-menu-item index="/persona">
      <el-icon><User /></el-icon>
      <span>用户画像</span>
    </el-menu-item>
    <el-menu-item index="/prototype">
      <el-icon><PictureFilled /></el-icon>
      <span>原型设计</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const activeIndex = computed(() => route.path)
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  min-height: calc(100vh - 60px);
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.sidebar:not(.el-menu--collapse) {
  width: 200px;
}
</style>
