const { createApp } = require('vue')
const App = require('./src/App.vue').default

const app = createApp(App)
app.mount('#app')