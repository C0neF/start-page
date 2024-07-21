<template>
  <div class="clock-container">
    <div class="time">{{ currentTime }}</div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Clock',
  setup() {
    const currentTime = ref('')
    let timer = null

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    onMounted(() => {
      updateTime()
      timer = setInterval(updateTime, 100)
    })

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
      }
    })

    return {
      currentTime
    }
  }
}
</script>

<style scoped>
.clock-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.time {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
}

.dark .clock-container {
  background-color: rgba(26, 32, 44, 0.8);
}

.dark .time {
  color: #e2e8f0;
}

@media (hover: hover) {
  .clock-container:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 640px) {
  .clock-container {
    padding: 0.25rem 0.5rem;
  }

  .time {
    font-size: 1rem;
  }
}
</style>