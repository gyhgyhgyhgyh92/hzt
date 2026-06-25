<template>
  <div class="profile">
    <div class="profile-header">
      <h1>好铁汁</h1>
      <p>AI产品经理 | 校园文档助手</p>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <el-card class="info-card">
          <template #header>
            <span>基本信息</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="姓名">好铁汁</el-descriptions-item>
            <el-descriptions-item label="职位">AI产品经理</el-descriptions-item>
            <el-descriptions-item label="邮箱">haotieze@example.com</el-descriptions-item>
            <el-descriptions-item label="电话">138****8888</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card class="info-card">
          <template #header>
            <span>个人简介</span>
          </template>
          <p class="bio">
            专注于AI产品设计与落地，擅长将复杂的AI技术转化为用户友好的产品方案。
            在需求分析、产品设计、项目管理等方面具有丰富经验，致力于通过AI技术提升用户体验和业务价值。
          </p>
        </el-card>

        <el-card class="info-card">
          <template #header>
            <span>技能标签</span>
          </template>
          <div class="tags">
            <el-tag v-for="tag in tags" :key="tag" class="skill-tag">{{ tag }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const tags = [
  '需求分析', '产品设计', '用户研究', '数据分析',
  '项目管理', 'AI技术', 'PRD撰写', '原型设计',
  '竞品分析', '用户画像'
]
</script>

<style scoped>
.profile {
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: #fff;
}

.profile-header h1 {
  font-size: 36px;
  margin-bottom: 10px;
}

.profile-header p {
  font-size: 16px;
  opacity: 0.9;
}

.info-card {
  margin-bottom: 20px;
}

.bio {
  line-height: 1.8;
  color: #606266;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  margin: 0;
}
</style>
