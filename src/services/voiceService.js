const axios = require('axios')
const fs = require('fs')
const path = require('path')

let config = null

const loadConfig = () => {
  if (!config) {
    try {
      const configPath = path.join(__dirname, '../../config.json')
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      } else {
        config = getDefaultConfig()
      }
    } catch (error) {
      config = getDefaultConfig()
    }
  }
  return config
}

const getDefaultConfig = () => ({
  voice: {
    enabled: true,
    sttProvider: 'whisper',
    ttsProvider: 'elevenlabs',
    elevenlabsApiKey: '',
    openaiApiKey: '',
    voiceId: 'default',
    speed: 1.0,
    autoPlay: true
  }
})

const speechToText = async (audioData) => {
  const cfg = loadConfig()
  
  if (!cfg.voice?.enabled) {
    return { success: false, error: 'Voice not enabled' }
  }

  try {
    if (cfg.voice.sttProvider === 'whisper' && cfg.voice.openaiApiKey) {
      return await whisperSTT(audioData, cfg.voice.openaiApiKey)
    } else {
      return await browserSTT(audioData)
    }
  } catch (error) {
    console.error('STT error:', error)
    return { success: false, error: error.message }
  }
}

const whisperSTT = async (audioData, apiKey) => {
  try {
    const formData = new FormData()
    formData.append('file', new Blob([audioData], { type: 'audio/webm' }), 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'zh')

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      }
    )

    return {
      success: true,
      text: response.data.text
    }
  } catch (error) {
    console.error('Whisper STT error:', error)
    return { success: false, error: error.message }
  }
}

const browserSTT = async (audioData) => {
  return {
    success: false,
    error: 'Browser STT requires Web Speech API in renderer process'
  }
}

const textToSpeech = async (text, options = {}) => {
  const cfg = loadConfig()
  
  if (!cfg.voice?.enabled) {
    return { success: false, error: 'Voice not enabled' }
  }

  try {
    if (cfg.voice.ttsProvider === 'elevenlabs' && cfg.voice.elevenlabsApiKey) {
      return await elevenlabsTTS(text, cfg.voice.elevenlabsApiKey, options)
    } else if (cfg.voice.ttsProvider === 'openai' && cfg.voice.openaiApiKey) {
      return await openaiTTS(text, cfg.voice.openaiApiKey, options)
    } else {
      return await browserTTS(text, options)
    }
  } catch (error) {
    console.error('TTS error:', error)
    return { success: false, error: error.message }
  }
}

const elevenlabsTTS = async (text, apiKey, options = {}) => {
  try {
    const voiceId = options.voiceId || '21m00Tcm4TlvDq8ikWAM'
    const speed = options.speed || 1.0

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    )

    return {
      success: true,
      audioBuffer: Buffer.from(response.data),
      mimeType: 'audio/mpeg'
    }
  } catch (error) {
    console.error('ElevenLabs TTS error:', error)
    return { success: false, error: error.message }
  }
}

const openaiTTS = async (text, apiKey, options = {}) => {
  try {
    const voice = options.voice || 'alloy'

    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: text,
        voice
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    )

    return {
      success: true,
      audioBuffer: Buffer.from(response.data),
      mimeType: 'audio/mpeg'
    }
  } catch (error) {
    console.error('OpenAI TTS error:', error)
    return { success: false, error: error.message }
  }
}

const browserTTS = async (text, options = {}) => {
  return {
    success: false,
    error: 'Browser TTS requires Web Speech API in renderer process',
    useBrowserAPI: true,
    text
  }
}

const getAvailableVoices = async (provider = 'elevenlabs') => {
  const cfg = loadConfig()
  
  try {
    if (provider === 'elevenlabs' && cfg.voice?.elevenlabsApiKey) {
      const response = await axios.get(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'xi-api-key': cfg.voice.elevenlabsApiKey
          },
          timeout: 10000
        }
      )
      
      return {
        success: true,
        voices: response.data.voices.map(v => ({
          id: v.voice_id,
          name: v.name,
          category: v.category
        }))
      }
    }
    
    return {
      success: true,
      voices: [
        { id: 'alloy', name: 'Alloy', category: 'openai' },
        { id: 'echo', name: 'Echo', category: 'openai' },
        { id: 'fable', name: 'Fable', category: 'openai' },
        { id: 'onyx', name: 'Onyx', category: 'openai' },
        { id: 'nova', name: 'Nova', category: 'openai' },
        { id: 'shimmer', name: 'Shimmer', category: 'openai' }
      ]
    }
  } catch (error) {
    console.error('Get voices error:', error)
    return { success: false, error: error.message }
  }
}

const saveVoiceConfig = (newConfig) => {
  const cfg = loadConfig()
  config = {
    ...cfg,
    voice: {
      ...cfg.voice,
      ...newConfig
    }
  }
  
  const configPath = path.join(__dirname, '../../config.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  return config
}

const getVoiceConfig = () => {
  return loadConfig().voice || getDefaultConfig().voice
}

module.exports = {
  speechToText,
  textToSpeech,
  getAvailableVoices,
  saveVoiceConfig,
  getVoiceConfig
}
