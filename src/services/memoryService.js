const fs = require('fs')
const path = require('path')

const { ipcRenderer } = require('electron')

let dataPath = ''

const initDataPath = async () => {
  if (!dataPath) {
    try {
      dataPath = await ipcRenderer.invoke('get-user-data-path')
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true })
      }
    } catch (error) {
      dataPath = path.join(__dirname, '../../data')
      if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true })
      }
    }
  }
  return dataPath
}

const getMemoryFilePath = async (fileName) => {
  const dp = await initDataPath()
  return path.join(dp, fileName)
}

const saveConversation = async (conversations) => {
  const filePath = await getMemoryFilePath('memory.json')
  try {
    const data = {
      conversations: conversations.slice(-50),
      lastUpdated: new Date().toISOString()
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save conversation:', error)
    return false
  }
}

const loadConversations = async () => {
  const filePath = await getMemoryFilePath('memory.json')
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      return data.conversations || []
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
  }
  return []
}

const saveTasks = async (tasks) => {
  const filePath = await getMemoryFilePath('tasks.json')
  try {
    const data = {
      tasks,
      lastUpdated: new Date().toISOString()
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save tasks:', error)
    return false
  }
}

const loadTasks = async () => {
  const filePath = await getMemoryFilePath('tasks.json')
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      return data.tasks || []
    }
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
  return []
}

const saveUserProfile = async (profile) => {
  const filePath = await getMemoryFilePath('profile.json')
  try {
    fs.writeFileSync(filePath, JSON.stringify(profile, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save user profile:', error)
    return false
  }
}

const loadUserProfile = async () => {
  const filePath = await getMemoryFilePath('profile.json')
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
  return {}
}

const clearAllData = async () => {
  const dp = await initDataPath()
  try {
    const files = fs.readdirSync(dp)
    files.forEach(file => {
      fs.unlinkSync(path.join(dp, file))
    })
    return true
  } catch (error) {
    console.error('Failed to clear data:', error)
    return false
  }
}

module.exports = {
  saveConversation,
  loadConversations,
  saveTasks,
  loadTasks,
  saveUserProfile,
  loadUserProfile,
  clearAllData
}