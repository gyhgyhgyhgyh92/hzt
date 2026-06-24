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

const getScheduleFilePath = async () => {
  const dp = await initDataPath()
  return path.join(dp, 'schedule.json')
}

const saveEvents = async (events) => {
  const filePath = await getScheduleFilePath()
  try {
    const data = {
      events,
      lastUpdated: new Date().toISOString()
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Failed to save events:', error)
    return false
  }
}

const loadEvents = async () => {
  const filePath = await getScheduleFilePath()
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      return data.events || []
    }
  } catch (error) {
    console.error('Failed to load events:', error)
  }
  return []
}

const getUpcomingEvents = async (days = 7) => {
  const events = await loadEvents()
  const now = new Date()
  const future = new Date()
  future.setDate(future.getDate() + days)
  
  return events.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}`)
    return eventDate >= now && eventDate <= future
  }).sort((a, b) => {
    return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
  })
}

const deleteEvent = async (eventId) => {
  const events = await loadEvents()
  const filtered = events.filter(e => e.id !== eventId)
  return await saveEvents(filtered)
}

const updateEvent = async (eventId, updatedEvent) => {
  const events = await loadEvents()
  const index = events.findIndex(e => e.id === eventId)
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedEvent }
    return await saveEvents(events)
  }
  return false
}

const checkReminders = async () => {
  const events = await loadEvents()
  const now = new Date()
  const reminders = []
  
  events.forEach(event => {
    const eventDate = new Date(`${event.date}T${event.time}`)
    const diffMinutes = Math.floor((eventDate - now) / (1000 * 60))
    
    if (diffMinutes >= 0 && diffMinutes <= 10) {
      reminders.push({
        ...event,
        minutesUntil: diffMinutes
      })
    }
  })
  
  return reminders
}

module.exports = {
  saveEvents,
  loadEvents,
  getUpcomingEvents,
  deleteEvent,
  updateEvent,
  checkReminders
}