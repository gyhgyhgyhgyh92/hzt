<template>
  <el-menu
    :default-active="activeIndex"
    class="navbar"
    mode="horizontal"
    @select="handleSelect"
  >
    <div class="logo">
      <el-icon><Monitor /></el-icon>
      <span>校园文档助手</span>
    </div>
    <el-menu-item index="/">首页</el-menu-item>
    <el-menu-item index="/cases">案例分析</el-menu-item>
    <el-menu-item index="/prd">PRD模板</el-menu-item>
    <el-menu-item index="/persona">用户画像</el-menu-item>
    <el-menu-item index="/prototype">原型设计</el-menu-item>
    <el-menu-item index="/stats">数据统计</el-menu-item>
    <el-menu-item index="/about">关于</el-menu-item>
    <el-menu-item index="/profile">个人资料</el-menu-item>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeIndex = computed(() => route.path)

const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}
</style>
