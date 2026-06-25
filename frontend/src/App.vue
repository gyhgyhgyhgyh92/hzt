<template>
  <div id="app">
    <Navbar />
    <div class="main-container">
      <Sidebar v-if="showSidebar" />
      <div class="content-wrapper">
        <Breadcrumb />
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import Breadcrumb from './components/Breadcrumb.vue'

const route = useRoute()

const showSidebar = computed(() => {
  return route.path !== '/' && route.path !== '/about' && route.path !== '/profile'
})
</script>

<style scoped>
.main-container {
  display: flex;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
