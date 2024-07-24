<template>
  <div class="clock-container" @click="handleClick">
    <div class="clock-content">
      <div class="time">{{ currentTime }}</div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Clock',
  props: {
    isMobile: {
      type: Boolean,
      default: false
    },
    showBottomBookmarkBar: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggleBottomBookmarkBar'],
  setup(props, { emit }) {
    const currentTime = ref('')
    const currentDate = ref('')
    let timer = null

    const updateDateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    }

    const handleClick = () => {
      if (!props.isMobile) {
        emit('toggleBottomBookmarkBar')
      }
    }

    onMounted(() => {
      updateDateTime()
      timer = setInterval(updateDateTime, 1000)
    })

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
      }
    })

    return {
      currentTime,
      currentDate,
      handleClick
    }
  }
}
</script>

<style scoped>
.clock-container {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0.5rem;
  position: relative;
  z-index: 25; /* 确保时钟在夜间模式按钮之下 */
}

.clock-content {
  display: inline-flex; /* 改为 inline-flex */
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  user-select: none;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  padding: 0.5rem 0.5rem;
  border-radius: 0.5rem;
}

.clock-content:active {
  transform: scale(0.98);
}

.time {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
}

.date {
  font-size: 1rem;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .time {
    font-size: 2rem;
  }

  .date {
    font-size: 0.875rem;
  }
}
</style>