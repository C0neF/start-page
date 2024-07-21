<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 overflow-y-auto max-h-[90vh]">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200" id="modal-title">
          编辑书签
        </h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="mt-2">
        <form @submit.prevent="updateBookmark" class="space-y-4">
          <div>
            <label for="bookmark-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">名称</label>
            <input type="text" id="bookmark-name" v-model="editedBookmark.name" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="bookmark-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
            <input type="url" id="bookmark-url" v-model="editedBookmark.url" @input="debouncedUpdateIconUrl" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="bookmark-icon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">图标 URL（可选）</label>
            <input type="url" id="bookmark-icon" v-model="userIconUrl" @input="updateIconPreview" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">图标预览</label>
            <div class="mt-1 flex items-center">
              <img 
                v-if="iconPreview" 
                :key="iconKey"
                :src="iconPreview" 
                alt="Icon preview" 
                class="w-8 h-8 mr-2 cursor-pointer"
                @click="cycleIcon"
                @error="handleImageError"
              >
              <span v-else class="text-sm text-gray-500 dark:text-gray-400">无图标</span>
            </div>
          </div>
          <div v-if="debugInfo" class="text-sm text-gray-500 dark:text-gray-400">
            {{ debugInfo }}
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
              取消
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'

export default {
  name: 'EditBookmarkModal',
  props: {
    bookmark: Object
  },
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const editedBookmark = ref({ ...props.bookmark })
    const userIconUrl = ref('')
    const apiIcons = ref([])
    const currentIconIndex = ref(0)
    const iconPreview = ref('')
    const debugInfo = ref('')
    const iconKey = ref(0)

    let debounceTimer = null

    onMounted(() => {
      userIconUrl.value = editedBookmark.value.iconUrl
      iconPreview.value = editedBookmark.value.iconUrl
    })

    watch(() => props.bookmark, (newVal) => {
      editedBookmark.value = { ...newVal }
      userIconUrl.value = newVal.iconUrl
      iconPreview.value = newVal.iconUrl
      iconKey.value++
    })

    const updateIconUrl = async () => {
      debugInfo.value = '开始更新图标 URL...'

      if (editedBookmark.value.url) {
        try {
          let url = editedBookmark.value.url
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url
          }
          
          const domain = new URL(url).hostname;
          apiIcons.value = [
            { api: 'iowen', url: `https://api.iowen.cn/favicon/${domain}.png` },
            { api: 'horse', url: `https://icon.horse/icon/${domain}` },
            { api: 'kongfandong', url: `https://kongfandong.cn/api/icon?url=${encodeURIComponent(domain)}` }
          ];
          
          currentIconIndex.value = 0
          userIconUrl.value = '' // 清除用户自定义的图标URL
          updateIconPreview()
          debugInfo.value = `已成功获取图标，当前显示: ${apiIcons.value[currentIconIndex.value].api}`
        } catch (error) {
          console.error('Error updating icon URL:', error)
          debugInfo.value = `更新图标 URL 时出错: ${error.message}`
          apiIcons.value = []
          iconPreview.value = ''
        }
      }
    }

    const debouncedUpdateIconUrl = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(updateIconUrl, 500)
    }

    const updateIconPreview = () => {
      if (userIconUrl.value) {
        iconPreview.value = userIconUrl.value
      } else if (apiIcons.value.length > 0) {
        iconPreview.value = apiIcons.value[currentIconIndex.value].url
      } else {
        iconPreview.value = ''
      }
      iconKey.value++
    }

    const cycleIcon = () => {
      if (apiIcons.value.length > 0) {
        currentIconIndex.value = (currentIconIndex.value + 1) % apiIcons.value.length
        userIconUrl.value = '' // 清除用户自定义的图标URL
        updateIconPreview()
        debugInfo.value = `已切换到 ${apiIcons.value[currentIconIndex.value].api} 的图标`
      }
    }

    const handleImageError = () => {
      console.error('Image failed to load')
      if (apiIcons.value.length > 0) {
        cycleIcon() // Try next icon if current one fails
      } else {
        iconPreview.value = ''
        debugInfo.value = '图标加载失败，请尝试重新输入URL或手动输入图标URL'
      }
    }

    const updateBookmark = () => {
      editedBookmark.value.iconUrl = iconPreview.value
      emit('update', editedBookmark.value)
      emit('close')
    }

    return {
      editedBookmark,
      userIconUrl,
      iconPreview,
      debugInfo,
      iconKey,
      updateIconUrl,
      debouncedUpdateIconUrl,
      updateIconPreview,
      cycleIcon,
      handleImageError,
      updateBookmark
    }
  }
}
</script>

<style scoped>
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: backdrop-filter 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.backdrop-blur-md.active {
  opacity: 1;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

input[type="text"],
input[type="url"] {
  @apply w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600;
}

button {
  @apply px-4 py-2 font-bold rounded-lg transition-colors duration-200;
}

button:focus {
  @apply outline-none ring-2 ring-offset-2;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500;
}

.icon-preview {
  @apply w-8 h-8 object-contain cursor-pointer transition-transform duration-200 hover:scale-110;
}

.debug-info {
  @apply text-xs text-gray-500 dark:text-gray-400 mt-2;
}

@media (max-width: 640px) {
  .modal-content {
    @apply px-4 py-6;
  }

  input[type="text"],
  input[type="url"] {
    @apply text-sm;
  }

  button {
    @apply text-sm;
  }
}
</style>