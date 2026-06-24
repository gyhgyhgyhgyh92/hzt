const { ipcRenderer } = require('electron')

const STORAGE_KEYS = {
  OPENAI_API_KEY: 'openai_api_key',
  ANTHROPIC_API_KEY: 'anthropic_api_key',
  ELEVENLABS_API_KEY: 'elevenlabs_api_key'
}

const storeSecureKey = async (key, value) => {
  try {
    const result = await ipcRenderer.invoke('secure-store', { key, value })
    return result.success
  } catch (error) {
    console.error('Secure store error:', error)
    return false
  }
}

const getSecureKey = async (key) => {
  try {
    const result = await ipcRenderer.invoke('secure-get', { key })
    if (result.success) {
      return result.value
    }
    return null
  } catch (error) {
    console.error('Secure get error:', error)
    return null
  }
}

const deleteSecureKey = async (key) => {
  try {
    const result = await ipcRenderer.invoke('secure-delete', { key })
    return result.success
  } catch (error) {
    console.error('Secure delete error:', error)
    return false
  }
}

const clearAllSecureKeys = async () => {
  const keys = Object.values(STORAGE_KEYS)
  let allSuccess = true
  
  for (const key of keys) {
    const success = await deleteSecureKey(key)
    if (!success) {
      allSuccess = false
    }
  }
  
  return allSuccess
}

const hasSecureStorage = async () => {
  try {
    const result = await ipcRenderer.invoke('secure-is-available')
    return result.available
  } catch (error) {
    return false
  }
}

module.exports = {
  STORAGE_KEYS,
  storeSecureKey,
  getSecureKey,
  deleteSecureKey,
  clearAllSecureKeys,
  hasSecureStorage
}