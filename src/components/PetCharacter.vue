<template>
  <div 
    class="pet-container" 
    :class="[`mood-${mood}`, animation]"
    @click="$emit('click')"
  >
    <div class="pet-body">
      <div class="pet-head">
        <div class="ears">
          <div class="ear left"></div>
          <div class="ear right"></div>
        </div>
        <div class="face">
          <div class="eyes">
            <div class="eye left">
              <div class="pupil"></div>
            </div>
            <div class="eye right">
              <div class="pupil"></div>
            </div>
          </div>
          <div class="nose"></div>
          <div class="mouth" :class="mouthClass">
            <span v-if="mood === 'happy'">😊</span>
            <span v-else-if="mood === 'sad'">😢</span>
            <span v-else-if="mood === 'sleepy'">😴</span>
            <span v-else>😐</span>
          </div>
        </div>
      </div>
      <div class="pet-body-main">
        <div class="body-shape">
          <div class="arm left"></div>
          <div class="arm right"></div>
          <div class="tail"></div>
        </div>
      </div>
    </div>
    <div v-if="animation === 'thinking'" class="thinking-bubbles">
      <span>💭</span>
    </div>
  </div>
</template>

<script>
const { computed } = require('vue')

module.exports = {
  name: 'PetCharacter',
  props: {
    mood: {
      type: String,
      default: 'happy'
    },
    animation: {
      type: String,
      default: 'idle'
    }
  },
  emits: ['click'],
  setup(props) {
    const mouthClass = computed(() => {
      return `mouth-${props.mood}`
    })
    
    return {
      mouthClass
    }
  }
}
</script>

<style scoped>
.pet-container {
  width: 120px;
  height: 140px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.pet-container:hover {
  transform: scale(1.1);
}

.pet-container.bounce {
  animation: bounce 0.5s ease;
}

.pet-container.thinking {
  animation: thinking 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes thinking {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}

.pet-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pet-head {
  position: relative;
}

.ears {
  position: absolute;
  top: -20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}

.ear {
  width: 25px;
  height: 35px;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  border-radius: 50% 50% 50% 50%;
  position: relative;
}

.ear.left {
  transform: rotate(-15deg);
}

.ear.right {
  transform: rotate(15deg);
}

.face {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.eyes {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
}

.eye {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  position: relative;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
}

.pupil {
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  position: absolute;
  top: 5px;
  left: 5px;
}

.nose {
  width: 8px;
  height: 6px;
  background: #ff9a9e;
  border-radius: 50%;
  margin-bottom: 5px;
}

.mouth {
  font-size: 24px;
  transition: all 0.3s ease;
}

.mouth-happy {
  animation: smile 2s ease infinite;
}

.mouth-sad {
  animation: frown 2s ease infinite;
}

@keyframes smile {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes frown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(2px); }
}

.pet-body-main {
  margin-top: -10px;
}

.body-shape {
  width: 70px;
  height: 60px;
  background: linear-gradient(180deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 50% 50% 45% 45%;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.arm {
  width: 20px;
  height: 30px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 50%;
  position: absolute;
  top: 15px;
}

.arm.left {
  left: -15px;
  transform: rotate(-30deg);
}

.arm.right {
  right: -15px;
  transform: rotate(30deg);
}

.tail {
  width: 25px;
  height: 15px;
  background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 50%;
  position: absolute;
  right: -20px;
  top: 30px;
  transform: rotate(45deg);
}

.thinking-bubbles {
  position: absolute;
  top: -30px;
  right: -10px;
  font-size: 24px;
  animation: float 2s ease infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(10deg); }
}

.mood-happy .face {
  filter: brightness(1.05);
}

.mood-sad .face {
  filter: brightness(0.95) hue-rotate(-10deg);
}

.mood-sleepy .face {
  filter: brightness(0.9);
}

.mood-sleepy .pupil {
  transform: scaleY(0.3);
}
</style>