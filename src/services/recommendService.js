const fs = require('fs')
const path = require('path')

let userProfile = null
let behaviorLogs = []

const loadUserProfile = async () => {
  try {
    const profilePath = path.join(__dirname, '../../data/user_profile.json')
    if (fs.existsSync(profilePath)) {
      userProfile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'))
    } else {
      userProfile = createDefaultProfile()
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
    userProfile = createDefaultProfile()
  }
  return userProfile
}

const createDefaultProfile = () => ({
  id: 'local-user',
  createdAt: new Date().toISOString(),
  interests: {},
  usagePatterns: {
    activeHours: {},
    dailyUsage: {},
    featureUsage: {}
  },
  preferences: {
    topics: [],
    tone: 'friendly',
    responseLength: 'medium'
  },
  stats: {
    totalConversations: 0,
    totalMessages: 0,
    tasksCompleted: 0,
    schedulesCreated: 0
  }
})

const saveUserProfile = async () => {
  try {
    const dataDir = path.join(__dirname, '../../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    const profilePath = path.join(dataDir, 'user_profile.json')
    fs.writeFileSync(profilePath, JSON.stringify(userProfile, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save user profile:', error)
    return false
  }
}

const loadBehaviorLogs = async () => {
  try {
    const logsPath = path.join(__dirname, '../../data/behavior_logs.json')
    if (fs.existsSync(logsPath)) {
      const data = JSON.parse(fs.readFileSync(logsPath, 'utf-8'))
      behaviorLogs = data.logs || []
    }
  } catch (error) {
    console.error('Failed to load behavior logs:', error)
    behaviorLogs = []
  }
  return behaviorLogs
}

const saveBehaviorLogs = async () => {
  try {
    const dataDir = path.join(__dirname, '../../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    const logsPath = path.join(dataDir, 'behavior_logs.json')
    const recentLogs = behaviorLogs.slice(-500)
    fs.writeFileSync(logsPath, JSON.stringify({ logs: recentLogs }, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save behavior logs:', error)
    return false
  }
}

const recordBehavior = async (action, details = {}) => {
  if (!userProfile) {
    await loadUserProfile()
  }
  if (!behaviorLogs.length) {
    await loadBehaviorLogs()
  }
  
  const log = {
    id: Date.now().toString(),
    action,
    details,
    timestamp: new Date().toISOString()
  }
  
  behaviorLogs.push(log)
  
  updateUsagePatterns(action, details)
  updateInterests(action, details)
  updateStats(action, details)
  
  await saveBehaviorLogs()
  await saveUserProfile()
  
  return log
}

const updateUsagePatterns = (action, details) => {
  const now = new Date()
  const hour = now.getHours()
  const day = now.toDateString()
  
  userProfile.usagePatterns.activeHours[hour] = 
    (userProfile.usagePatterns.activeHours[hour] || 0) + 1
  
  userProfile.usagePatterns.dailyUsage[day] = 
    (userProfile.usagePatterns.dailyUsage[day] || 0) + 1
  
  const feature = details.feature || action
  userProfile.usagePatterns.featureUsage[feature] = 
    (userProfile.usagePatterns.featureUsage[feature] || 0) + 1
}

const updateInterests = (action, details) => {
  if (action === 'message' && details.content) {
    const content = details.content.toLowerCase()
    
    const interestKeywords = {
      '学习': ['学习', '考试', '作业', '课程', '知识', '读书'],
      '工作': ['工作', '会议', '项目', '报告', '邮件', '任务'],
      '生活': ['生活', '美食', '旅行', '电影', '音乐', '运动'],
      '科技': ['科技', '编程', 'AI', '技术', '数码', '软件'],
      '娱乐': ['游戏', '综艺', '追剧', '小说', '动漫']
    }
    
    Object.entries(interestKeywords).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          userProfile.interests[category] = 
            (userProfile.interests[category] || 0) + 1
        }
      })
    })
  }
}

const updateStats = (action, details) => {
  if (action === 'message') {
    userProfile.stats.totalMessages++
    if (details.type === 'conversation') {
      userProfile.stats.totalConversations++
    }
  }
  if (action === 'task_complete') {
    userProfile.stats.tasksCompleted++
  }
  if (action === 'schedule_create') {
    userProfile.stats.schedulesCreated++
  }
}

const getRecommendations = async (type = 'general', count = 5) => {
  if (!userProfile) {
    await loadUserProfile()
  }
  
  const recommendations = []
  
  switch (type) {
    case 'conversation':
      recommendations.push(...getConversationRecommendations(count))
      break
    case 'learning':
      recommendations.push(...getLearningRecommendations(count))
      break
    case 'tasks':
      recommendations.push(...getTaskRecommendations(count))
      break
    case 'schedule':
      recommendations.push(...getScheduleRecommendations(count))
      break
    default:
      recommendations.push(...getGeneralRecommendations(count))
  }
  
  return {
    type,
    recommendations: recommendations.slice(0, count),
    timestamp: new Date().toISOString()
  }
}

const getConversationRecommendations = (count) => {
  const recommendations = []
  const interests = Object.entries(userProfile.interests || {})
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
  
  if (interests.length > 0) {
    const topInterest = interests[0]
    const topicSuggestions = {
      '学习': ['想了解什么新知识吗？', '要不要一起学习新技能？', '今天学习计划是什么？'],
      '工作': ['工作进展如何？', '需要帮你整理工作思路吗？', '今天有什么重要任务？'],
      '生活': ['今天有什么好玩的事？', '要不要聊聊生活趣事？', '最近看了什么好电影？'],
      '科技': ['想了解什么新技术？', '最近有什么科技新闻？', '要不要讨论AI发展趋势？'],
      '娱乐': ['想玩什么游戏？', '最近在追什么剧？', '要不要推荐好听的歌？']
    }
    
    const suggestions = topicSuggestions[topInterest] || ['想聊点什么呢？']
    suggestions.slice(0, count).forEach((text, idx) => {
      recommendations.push({
        id: `conv-${idx}`,
        type: 'conversation_topic',
        title: text,
        reason: `基于你对${topInterest}的兴趣`,
        action: {
          type: 'send_message',
          payload: text
        }
      })
    })
  }
  
  return recommendations
}

const getLearningRecommendations = (count) => {
  return [
    {
      id: 'learn-1',
      type: 'learning_tip',
      title: '番茄工作法',
      description: '专注25分钟，休息5分钟，提升学习效率',
      reason: '提升学习效率',
      action: { type: 'start_focus', payload: { duration: 25 } }
    },
    {
      id: 'learn-2',
      type: 'learning_tip',
      title: '每日学习计划',
      description: '制定今天的学习目标，让学习更有方向',
      reason: '规划学习',
      action: { type: 'create_plan', payload: { type: 'study' } }
    },
    {
      id: 'learn-3',
      type: 'knowledge',
      title: '今日知识卡片',
      description: '每天学习一个小知识点',
      reason: '扩展知识面',
      action: { type: 'show_knowledge', payload: {} }
    }
  ].slice(0, count)
}

const getTaskRecommendations = (count) => {
  const recommendations = []
  
  recommendations.push({
    id: 'task-1',
    type: 'task_suggestion',
    title: '整理今天的待办事项',
    description: '列出今天需要完成的任务，让生活更有条理',
    reason: '提高效率',
    action: { type: 'open_tasks', payload: {} }
  })
  
  recommendations.push({
    id: 'task-2',
    type: 'priority_tip',
    title: '四象限工作法',
    description: '按重要紧急程度安排任务优先级',
    reason: '提升执行力',
    action: { type: 'show_method', payload: { method: 'four_quadrants' } }
  })
  
  return recommendations.slice(0, count)
}

const getScheduleRecommendations = (count) => {
  const now = new Date()
  const hour = now.getHours()
  
  const recommendations = []
  
  if (hour < 10) {
    recommendations.push({
      id: 'sched-1',
      type: 'morning_routine',
      title: '早安！今天有什么计划？',
      description: '规划今天的日程，开启美好一天',
      reason: '晨间规划',
      action: { type: 'open_schedule', payload: {} }
    })
  }
  
  if (hour >= 12 && hour <= 14) {
    recommendations.push({
      id: 'sched-2',
      type: 'lunch_reminder',
      title: '午饭时间到了',
      description: '记得按时吃饭，休息一下',
      reason: '健康作息',
      action: { type: 'set_reminder', payload: { time: '12:00', event: '午饭' } }
    })
  }
  
  if (hour >= 22) {
    recommendations.push({
      id: 'sched-3',
      type: 'night_routine',
      title: '夜深了，准备休息吧',
      description: '回顾今天，规划明天，早点休息',
      reason: '健康作息',
      action: { type: 'day_review', payload: {} }
    })
  }
  
  return recommendations.slice(0, count)
}

const getGeneralRecommendations = (count) => {
  const all = [
    ...getConversationRecommendations(Math.ceil(count / 2)),
    ...getLearningRecommendations(Math.ceil(count / 4)),
    ...getTaskRecommendations(Math.ceil(count / 4))
  ]
  return all.slice(0, count)
}

const getSuggestedReplies = async (context = '') => {
  const suggestions = [
    '你好呀！😊',
    '今天过得怎么样？',
    '想聊点什么呢？',
    '有什么我可以帮你的吗？'
  ]
  
  if (context) {
    const lowerContext = context.toLowerCase()
    if (lowerContext.includes('学习') || lowerContext.includes('考试')) {
      suggestions.unshift('加油！你一定可以的💪')
      suggestions.unshift('需要学习建议吗？')
    }
    if (lowerContext.includes('累') || lowerContext.includes('困')) {
      suggestions.unshift('好好休息一下吧')
      suggestions.unshift('要我给你讲个笑话吗？')
    }
    if (lowerContext.includes('开心') || lowerContext.includes('高兴')) {
      suggestions.unshift('我也开心！🎉')
      suggestions.unshift('分享一下开心的事吧')
    }
  }
  
  return {
    suggestions: suggestions.slice(0, 4),
    context
  }
}

const getUserInsights = async () => {
  if (!userProfile) {
    await loadUserProfile()
  }
  
  const topInterests = Object.entries(userProfile.interests || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category)
  
  const activeHours = Object.entries(userProfile.usagePatterns.activeHours || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`)
  
  return {
    topInterests,
    activeHours,
    stats: userProfile.stats,
    insight: `你最活跃的时间是${activeHours.join('、')}，对${topInterests.join('、')}话题最感兴趣。`
  }
}

const getPersonalization = async () => {
  if (!userProfile) {
    await loadUserProfile()
  }
  
  return {
    tone: userProfile.preferences?.tone || 'friendly',
    responseLength: userProfile.preferences?.responseLength || 'medium',
    favoriteTopics: Object.entries(userProfile.interests || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category),
    style: '可爱活泼'
  }
}

const updatePreferences = async (preferences) => {
  if (!userProfile) {
    await loadUserProfile()
  }
  
  userProfile.preferences = {
    ...userProfile.preferences,
    ...preferences
  }
  
  await saveUserProfile()
  return userProfile.preferences
}

const resetProfile = async () => {
  userProfile = createDefaultProfile()
  behaviorLogs = []
  await saveUserProfile()
  await saveBehaviorLogs()
  return true
}

module.exports = {
  loadUserProfile,
  saveUserProfile,
  recordBehavior,
  getRecommendations,
  getSuggestedReplies,
  getUserInsights,
  getPersonalization,
  updatePreferences,
  resetProfile,
  loadBehaviorLogs
}
