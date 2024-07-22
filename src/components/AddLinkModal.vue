<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 overflow-y-auto max-h-[90vh]">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200" id="modal-title">
          {{ editingBookmark ? '编辑书签' : '添加新书签' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="mt-2">
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label for="linkName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">名称</label>
            <input type="text" id="linkName" v-model="linkName" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          </div>
          <div>
            <label for="linkUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
            <input type="text" id="linkUrl" v-model="linkUrl" @input="debouncedUpdateIconUrl" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <p v-if="urlError" class="mt-1 text-sm text-red-600">{{ urlError }}</p>
          </div>
          <div>
            <label for="linkIcon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">图标 URL（可选）</label>
            <input type="text" id="linkIcon" v-model="userIconUrl" @input="updateIconPreview" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
            <button type="button" @click="$emit('close')" class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
              取消
            </button>
            <button type="submit" class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
              {{ editingBookmark ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'AddLinkModal',
  props: {
    editingBookmark: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'linkAdded', 'linkUpdated'],
  setup(props, { emit }) {
    const linkName = ref('')
    const linkUrl = ref('')
    const userIconUrl = ref('')
    const apiIcons = ref([])
    const currentIconIndex = ref(0)
    const iconPreview = ref('')
    const debugInfo = ref('')
    const urlError = ref('')
    let debounceTimer = null
    const iconKey = ref(0)

    const updateIconUrl = async () => {
  debugInfo.value = '开始更新图标 URL...'
  urlError.value = ''

  if (linkUrl.value) {
    try {
      let url = linkUrl.value
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      const domain = new URL(url).hostname;
      apiIcons.value = [
        { api: 'google', url: `https://api.20010522.xyz/icon-1/${domain}` },
        { api: 'iowen', url: `https://api.20010522.xyz/icon-2/${domain}` },
        { api: 'horse', url: `https://api.20010522.xyz/icon-3/${domain}` },
        { api: 'kongfandong', url: `https://api.20010522.xyz/icon-4/${domain}` }
      ];
      
      currentIconIndex.value = 0
      updateIconPreview()
      debugInfo.value = `已成功获取图标，当前显示: ${apiIcons.value[currentIconIndex.value].api}`
    } catch (error) {
      console.error('Error updating icon URL:', error)
      debugInfo.value = `更新图标 URL 时出错: ${error.message}`
      urlError.value = '无法获取图标，请检查 URL 是否正确或手动输入图标 URL'
      apiIcons.value = []
      iconPreview.value = ''
    }
  }
}

    const updateIconPreview = () => {
      if (userIconUrl.value) {
        iconPreview.value = userIconUrl.value
      } else if (apiIcons.value.length > 0) {
        iconPreview.value = apiIcons.value[currentIconIndex.value].url
      } else {
        iconPreview.value = ''
      }
      iconKey.value += 1
    }

    const cycleIcon = () => {
      if (apiIcons.value.length > 0) {
        currentIconIndex.value = (currentIconIndex.value + 1) % apiIcons.value.length
        updateIconPreview()
        debugInfo.value = `已切换到 ${apiIcons.value[currentIconIndex.value].api} 的图标`
      }
    }

    const debouncedUpdateIconUrl = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(updateIconUrl, 500)
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

    const submitForm = () => {
      if (urlError.value) {
        return // 如果 URL 无效，阻止表单提交
      }
      const newLink = {
        name: linkName.value,
        url: linkUrl.value.startsWith('http') ? linkUrl.value : `https://${linkUrl.value}`,
        iconUrl: userIconUrl.value || (apiIcons.value.length > 0 ? apiIcons.value[currentIconIndex.value].url : ''),
        class: linkName.value.toLowerCase()
      }

      if (props.editingBookmark) {
        emit('linkUpdated', { ...newLink, id: props.editingBookmark.id })
      } else {
        emit('linkAdded', newLink)
      }
      emit('close')

      // 重置表单
      resetForm()
    }

    const resetForm = () => {
      linkName.value = ''
      linkUrl.value = ''
      userIconUrl.value = ''
      apiIcons.value = []
      currentIconIndex.value = 0
      iconPreview.value = ''
      debugInfo.value = ''
      urlError.value = ''
      iconKey.value = 0
    }

    watch(() => props.editingBookmark, (newVal) => {
      if (newVal) {
        linkName.value = newVal.name
        linkUrl.value = newVal.url
        userIconUrl.value = newVal.iconUrl
        iconPreview.value = newVal.iconUrl
        iconKey.value += 1
        // 如果是编辑模式，我们也可以尝试获取新的图标
        debouncedUpdateIconUrl()
      } else {
        resetForm()
      }
    }, { immediate: true })

    return {
      linkName,
      linkUrl,
      userIconUrl,
      iconPreview,
      debugInfo,
      urlError,
      iconKey,
      updateIconPreview,
      debouncedUpdateIconUrl,
      cycleIcon,
      handleImageError,
      submitForm
    }
  }
}
</script>