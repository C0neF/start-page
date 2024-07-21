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
                <button @click="setUnsplashImage" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Unsplash
                </button>
              </div>
              <div class="flex-1 flex items-center">
                <div class="flex items-center space-x-1 mr-2">
                  <input 
                    :value="unsplashChangeIntervalInput"
                    @input="unsplashChangeIntervalInput = $event.target.value"
                    type="number" 
                    min="0" 
                    inputmode="numeric"
                    class="w-16 px-2 py-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white appearance-none text-center"
                    placeholder="间隔"
                  >
                  <span class="text-white text-sm whitespace-nowrap">秒</span>
                </div>
                <button @click="updateUnsplashInterval" class="flex-grow whitespace-nowrap bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-2 rounded transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm">
                  保存
                </button>
              </div>
            </div>
            <div class="text-white text-sm text-center">(间隔为 0 时禁用自动切换)</div>
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
import { nextTick } from 'vue'

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
    }
  },
  emits: ['close', 'linkAdded', 'linkUpdated', 'update:bookmarks', 'updateDefaultEngine', 'settingsImported', 'openAddLinkModal', 'openEngineManager', 'setBackgroundImage', 'setUnsplashImage', 'updateUnsplashInterval', 'updateUnsplashAccessKey'],
  data() {
    return {
      unsplashChangeIntervalInput: this.unsplashChangeInterval,
      unsplashAccessKey: localStorage.getItem('unsplashAccessKey') || '',
      imageUrl: ''
    }
  },
  watch: {
    editingBookmark(newVal) {
      if (newVal) {
        this.$emit('openAddLinkModal')
      }
    },
    unsplashChangeInterval(newVal) {
      this.unsplashChangeIntervalInput = newVal
    }
  },
  methods: {
    exportSettings() {
      const settings = {
        bookmarks: this.bookmarks,
        searchEngines: this.searchEngines,
        defaultEngineIndex: this.defaultEngineIndex,
        unsplashChangeInterval: this.unsplashChangeIntervalInput,
        unsplashAccessKey: this.unsplashAccessKey
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings))
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "personal_startpage_settings.json")
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
    },
    importSettings(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const settings = JSON.parse(e.target.result)
            this.$emit('settingsImported', settings)
            if (settings.unsplashChangeInterval !== undefined) {
              this.unsplashChangeIntervalInput = settings.unsplashChangeInterval
              this.updateUnsplashInterval()
            }
            if (settings.unsplashAccessKey) {
              this.unsplashAccessKey = settings.unsplashAccessKey
              this.saveUnsplashAccessKey()
            }
            this.$emit('close')
          } catch (error) {
            console.error('Error parsing JSON:', error)
            alert('无效的设置文件')
          }
        }
        reader.readAsText(file)
      }
    },
    async setBingDailyImage() {
      try {
        const response = await fetch('/bing-api/HPImageArchive.aspx?format=js&idx=0&n=1')
        const data = await response.json()
        const imageUrl = `https://www.bing.com${data.images[0].url}`
        this.$emit('setBackgroundImage', imageUrl)
      } catch (error) {
        console.error('Error fetching Bing daily image:', error)
      }
    },
    triggerFileInput() {
      console.log('Triggering file input')
      nextTick(() => {
        if (this.$refs.fileInput) {
          console.log('File input ref found')
          this.$refs.fileInput.click()
        } else {
          console.error('File input ref not found')
        }
      })
    },
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.$emit('setBackgroundImage', e.target.result)
        }
        reader.readAsDataURL(file)
      }
    },
    setCustomImageUrl() {
      if (this.imageUrl) {
        this.$emit('setBackgroundImage', this.imageUrl)
      }
    },
    setUnsplashImage() {
      this.$emit('setUnsplashImage')
    },
    updateUnsplashInterval() {
      this.$emit('updateUnsplashInterval', parseInt(this.unsplashChangeIntervalInput))
    },
    saveUnsplashAccessKey() {
      localStorage.setItem('unsplashAccessKey', this.unsplashAccessKey)
      this.$emit('updateUnsplashAccessKey', this.unsplashAccessKey)
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
  background-color: #fff;
  z-index: 40;
  transition: transform 0.3s ease-in-out;
  will-change: transform;
  box-shadow: none;
  border: none;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:active {
  transform: translateY(0);
  box-shadow: none;
}

.dark .sidebar {
  background-color: #1a202c;
}

.dark .sidebar::-webkit-scrollbar-track {
  background: #2d3748;
}

.dark .sidebar::-webkit-scrollbar-thumb {
  background: #4a5568;
}

.dark .sidebar::-webkit-scrollbar-thumb:hover {
  background: #718096;
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
input[type="number"] {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  outline: none;
}

/* 暗色模式下的输入框样式 */
.dark input[type="text"],
.dark input[type="number"] {
  background-color: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.dark input[type="text"]:focus,
.dark input[type="number"]:focus {
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
    padding: 0.25rem 0.5rem;
  }
}

/* 确保输入框在所有设备上都是居中对齐的文本 */
input[type="number"] {
  text-align: center;
}

/* 在小屏幕上优化布局 */
@media (max-width: 640px) {
  .flex-wrap {
    flex-wrap: wrap;
  }
  
  .flex-grow {
    flex-grow: 1;
  }
}
</style>