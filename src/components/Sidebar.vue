<template>
  <div class="h-full flex flex-col">
    <div class="pt-6 pr-6 pl-6 pb-0 flex-shrink-0">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-white dark:text-gray-200">设置</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="flex-grow overflow-y-auto px-6 pb-6">
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-2 text-white dark:text-gray-200">搜索引擎</h3>
          <button @click="$emit('openEngineManager')" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            管理搜索引擎
          </button>
        </div>

        <div v-if="!isMobile" class="settings-group">
  <h3 class="text-lg font-semibold mb-2 text-white dark:text-gray-200">桌面书签显示</h3>
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-gray-300">隐藏</span>
    <label class="relative inline-flex items-center cursor-pointer mx-4">
      <input 
        type="checkbox" 
        v-model="localShowDesktopBookmarks" 
        @change="toggleDesktopBookmarks" 
        class="sr-only peer"
      >
      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
    <span class="text-sm font-medium text-gray-300">显示</span>
  </div>
</div>


        <div>
          <h3 class="text-lg font-semibold mb-2 text-white dark:text-gray-200">导入/导出设置</h3>
          <div class="flex space-x-2">
            <button @click="exportSettings" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2">
              导出设置
            </button>
            <input type="file" ref="importFile" class="hidden" @change="importSettings" accept=".json">
            <button @click="$refs.importFile.click()" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              导入设置
            </button>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-2 text-white dark:text-gray-200">背景图片设置</h3>
          <div class="space-y-2">
            <div class="flex space-x-2">
              <div class="flex-1">
                <button @click="setBingDailyImage" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Bing
                </button>
              </div>
              <div class="flex-1">
                <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" class="hidden">
                <button @click.stop="triggerFileInput" class="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  本地
                </button>
              </div>
            </div>
            <div class="flex space-x-2">
              <input 
                v-model="imageUrl" 
                type="text"
                placeholder="图片URL" 
                class="flex-grow px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white"
              >
              <button @click="setCustomImageUrl" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 whitespace-nowrap">
                保存
              </button>
            </div>
            <div class="flex space-x-2">
              <div class="flex-1">
                <button @click="setUnsplashImage" class="unsplash-button w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Unsplash
                </button>
              </div>
              <div class="flex-1 flex items-center">
                <div class="flex items-center space-x-1 mr-2 ">
                  <input 
                    :value="unsplashChangeIntervalInput"
                    @input="unsplashChangeIntervalInput = $event.target.value"
                    type="number" 
                    min="0" 
                    inputmode="numeric"
                    class="w-16 px-2 py-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white appearance-none text-center"
                    placeholder="间隔"
                  >
                </div>
                <button @click="updateUnsplashInterval" class="flex-grow whitespace-nowrap bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-2 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm">
                  保存
                </button>
              </div>
            </div>
            <div class="text-white text-sm text-center">(单位秒,为 0 时不切换)</div>
            <div class="flex space-x-2">
              <input 
                v-model="unsplashAccessKey" 
                type="password"
                placeholder="Unsplash Access Key" 
                class="flex-grow px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white"
              >
              <button @click="saveUnsplashAccessKey" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 whitespace-nowrap">
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { getBingDailyImage } from '../utlis/bingImageService';

export default {
  name: 'Sidebar',
  props: {
    show: Boolean,
    editingBookmark: {
      type: Object,
      default: null
    },
    bookmarks: {
      type: Array,
      default: () => []
    },
    searchEngines: {
      type: Array,
      default: () => []
    },
    defaultEngineIndex: {
      type: Number,
      default: 0
    },
    unsplashChangeInterval: {
      type: Number,
      default: 0
    },
    showDesktopBookmarks: {
      type: Boolean,
      default: true
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'close', 
    'linkAdded', 
    'linkUpdated', 
    'update:bookmarks', 
    'updateDefaultEngine', 
    'settingsImported', 
    'openAddLinkModal', 
    'openEngineManager', 
    'setBackgroundImage', 
    'setUnsplashImage', 
    'updateUnsplashInterval', 
    'updateUnsplashAccessKey',
    'update:showDesktopBookmarks'
  ],
  setup(props, { emit }) {
    const unsplashChangeIntervalInput = ref(props.unsplashChangeInterval)
    const unsplashAccessKey = ref(localStorage.getItem('unsplashAccessKey') || '')
    const imageUrl = ref('')
    const localShowDesktopBookmarks = ref(props.showDesktopBookmarks)

    watch(() => props.unsplashChangeInterval, (newVal) => {
      unsplashChangeIntervalInput.value = newVal
    })

    watch(() => props.showDesktopBookmarks, (newVal) => {
      localShowDesktopBookmarks.value = newVal
    })

    const exportSettings = () => {
      const settings = {
        bookmarks: props.bookmarks,
        searchEngines: props.searchEngines,
        defaultEngineIndex: props.defaultEngineIndex,
        unsplashChangeInterval: unsplashChangeIntervalInput.value,
        unsplashAccessKey: unsplashAccessKey.value,
        showDesktopBookmarks: localShowDesktopBookmarks.value
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings))
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "personal_startpage_settings.json")
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
    }

    const importSettings = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target.result)
            emit('settingsImported', settings)
            if (settings.unsplashChangeInterval !== undefined) {
              unsplashChangeIntervalInput.value = settings.unsplashChangeInterval
              updateUnsplashInterval()
            }
            if (settings.unsplashAccessKey) {
              unsplashAccessKey.value = settings.unsplashAccessKey
              saveUnsplashAccessKey()
            }
            if (settings.showDesktopBookmarks !== undefined) {
              localShowDesktopBookmarks.value = settings.showDesktopBookmarks
              toggleDesktopBookmarks()
            }
            emit('close')
          } catch (error) {
            console.error('Error parsing JSON:', error)
            alert('无效的设置文件')
          }
        }
        reader.readAsText(file)
      }
    }

    const setBingDailyImage = async () => {
      try {
        const imageUrl = await getBingDailyImage();
        emit('setBackgroundImage', imageUrl);
      } catch (error) {
        console.error('Error fetching Bing daily image:', error);
        // 使用默认图片
        emit('setBackgroundImage', 'https://picsum.photos/1920/1080');
      }
    }

    const triggerFileInput = () => {
      const fileInput = document.querySelector('#fileInput')
      if (fileInput) {
        fileInput.click()
      }
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          emit('setBackgroundImage', e.target.result)
        }
        reader.readAsDataURL(file)
      }
    }

    const setCustomImageUrl = () => {
      if (imageUrl.value) {
        emit('setBackgroundImage', imageUrl.value)
      }
    }

    const setUnsplashImage = async () => {
      if (!unsplashAccessKey.value) {
        console.error('Unsplash Access Key is not set')
        return
      }
      try {
        const response = await fetch('https://api.20010522.xyz/unsplash/photos/random', {
          headers: {
            'X-Unsplash-Api-Key': unsplashAccessKey.value
          }
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        emit('setBackgroundImage', data.urls.regular)
      } catch (error) {
        console.error('Error fetching Unsplash image:', error)
      }
    }

    const updateUnsplashInterval = () => {
      emit('updateUnsplashInterval', parseInt(unsplashChangeIntervalInput.value))
    }

    const saveUnsplashAccessKey = () => {
      localStorage.setItem('unsplashAccessKey', unsplashAccessKey.value)
      emit('updateUnsplashAccessKey', unsplashAccessKey.value)
    }

    const toggleDesktopBookmarks = () => {
  console.log('Toggling desktop bookmarks:', localShowDesktopBookmarks.value)
  emit('update:showDesktopBookmarks', localShowDesktopBookmarks.value)
}

    return {
      unsplashChangeIntervalInput,
      unsplashAccessKey,
      imageUrl,
      localShowDesktopBookmarks,
      exportSettings,
      importSettings,
      setBingDailyImage,
      triggerFileInput,
      handleFileUpload,
      setCustomImageUrl,
      setUnsplashImage,
      updateUnsplashInterval,
      saveUnsplashAccessKey,
      toggleDesktopBookmarks
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 40;
  transition: transform 0.3s ease-in-out;
  will-change: transform;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(241, 241, 241, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(136, 136, 136, 0.5);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(85, 85, 85, 0.7);
}

.dark .sidebar {
  background-color: rgba(26, 32, 44, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.dark .sidebar::-webkit-scrollbar-track {
  background: rgba(45, 55, 72, 0.1);
}

.dark .sidebar::-webkit-scrollbar-thumb {
  background: rgba(74, 85, 104, 0.5);
}

.dark .sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(113, 128, 150, 0.7);
}

@media (max-width: 768px) {
  .sidebar {
    width: 75%;
    max-width: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* 隐藏数字输入框的上下箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* 增强输入框样式 */
input[type="text"],
input[type="number"],
input[type="password"] {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="password"]:focus {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  outline: none;
}

/* 暗色模式下的输入框样式 */
.dark input[type="text"],
.dark input[type="number"],
.dark input[type="password"] {
  background-color: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.dark input[type="text"]:focus,
.dark input[type="number"]:focus,
.dark input[type="password"]:focus {
  background-color: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 按钮悬停效果增强 */
button {
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media (max-width: 640px) {
  button, input {
    font-size: 0.875rem;
  }
  
  input[type="number"] {
    width: 3rem;
    padding: 0.25rem;
  }
  
  button {
    padding: 0.5rem;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }
  
  .flex-grow {
    flex-grow: 1;
  }
}

/* 确保输入框在所有设备上都是居中对齐的文本 */
input[type="number"] {
  text-align: center;
}

/* 新增：桌面书签显示/隐藏按钮样式 */
.toggle-desktop-bookmarks {
  background-color: #4299e1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.toggle-desktop-bookmarks:hover {
  background-color: #3182ce;
}

.dark .toggle-desktop-bookmarks {
  background-color: #2b6cb0;
}

.dark .toggle-desktop-bookmarks:hover {
  background-color: #2c5282;
}

@media (max-width: 400px) {
  input {
    width: 100%;
  }

  .unsplash-button {
    width: 100%;
  }
}

.peer:checked ~ .peer-checked\:after\:translate-x-full::after {
  transition: transform 0.3s ease-in-out;
}
</style>