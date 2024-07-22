<template>
  <div class="clock-container" @click="handleClick">
    <div class="time">{{ currentTime }}</div>
    <div v-if="!isMobile" class="bookmark-hint">
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
      timer = setInterval(updateDateTime, 100)
    })

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
      }
    })

    const bookmarkHint = computed(() => {
      return props.showBottomBookmarkBar ? '点击关闭书签栏' : '点击打开书签栏'
    })

    return {
      currentTime,
      currentDate,
      handleClick,
      bookmarkHint
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