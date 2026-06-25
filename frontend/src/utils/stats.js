const API_BASE = 'http://localhost:3001/api/stats'

export const trackUserAction = async (module, action, userId = 'anonymous') => {
  try {
    await fetch(`${API_BASE}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, action, user_id: userId })
    })
  } catch (error) {
    console.error('统计埋点失败:', error)
  }
}

export const trackPageView = (module) => {
  trackUserAction(module, 'page_view')
}

export const trackButtonClick = (module, buttonName) => {
  trackUserAction(module, `button_click_${buttonName}`)
}

export const trackFeatureUse = (module, featureName) => {
  trackUserAction(module, `feature_use_${featureName}`)
}
