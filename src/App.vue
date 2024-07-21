<template>
  <div id="app" class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative" @click="handleOutsideClick">
    <!-- 背景图片 -->
    <div v-if="backgroundImage" class="fixed inset-0 z-0">
      <img :src="backgroundImage" alt="Background" class="w-full h-full object-cover">
    </div>
    
    <!-- 半透明遮罩层 -->
    <div class="fixed inset-0 bg-black bg-opacity-30 z-0"></div>

    <!-- 毛玻璃效果背景 -->
    <div 
      v-show="!isMobile && isSearchActive" 
      class="fixed inset-0 bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 backdrop-blur-md z-10 transition-opacity duration-300"
    ></div>
    
    <div :class="['container', 'mx-auto', 'px-4', 'py-8', 'flex', 'flex-col', 'items-center', 'relative', 'min-h-screen', { 'mobile-layout': isMobile }]">
      <h3 :class="['text-2xl', 'font-bold', 'mb-8', 'text-center', 'text-white', { 'mobile-title': isMobile }]">个人起始页</h3>
      
      <!-- 搜索栏组件 -->
      <div :class="['w-full', 'max-w-2xl', 'search-bar-container', { 'active': isSearchActive }]">
        <SearchBar 
          class="w-full relative z-20" 
          :searchEngines="searchEngines" 
          :currentEngineIndex="currentEngineIndex" 
          :isMobile="isMobile"
          @searchActivated="handleSearchActivated"
        />
      </div>

      <!-- 书签列表组件 -->
      <LinkList 
        v-if="!isMobile"
        :bookmarks="bookmarks" 
        @update:bookmarks="updateBookmarks" 
        :showLeftSidebar="showLeftSidebar"
        @close-left-sidebar="closeLeftSidebar"
        @open-add-bookmark-modal="openAddLinkModal"
        :isMobile="isMobile"
        class="w-full"
        v-show="!isSearchActive"
      />

      <!-- 响应式设备的书签按钮 -->
      <button 
        v-if="isMobile"
        @click.stop="toggleLeftSidebar" 
        class="fixed top-4 left-4 text-white hover:text-gray-200 transition-all duration-300 z-50"
        :class="{ 'opacity-0 invisible': showLeftSidebar }"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- 设置按钮（所有设备都显示） -->
      <button 
        @click.stop="toggleSidebar" 
        class="fixed bottom-4 right-4 text-white hover:text-gray-200 transition-all duration-300 z-50"
        :class="{ 'opacity-0 invisible': showSidebar }"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </button>

      <!-- 夜间模式切换按钮 -->
      <button @click.stop="toggleNightMode" class="fixed top-4 right-4 text-white hover:text-gray-200 transition duration-300 z-20">
        <svg v-if="isNightMode" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      </button>

      <!-- 遮罩层 -->
      <transition name="fade">
        <div 
          v-if="showLeftSidebar || showSidebar || showAddLinkModal || showEngineManager" 
          class="fixed inset-0 bg-black bg-opacity-50 z-30"
          @click.stop="closeAllSidebars"
        ></div>
      </transition>

      <!-- 左侧边栏（书签侧边栏） -->
      <transition name="slide">
        <div v-if="showLeftSidebar" class="fixed inset-y-0 left-0 w-3/4 bg-transparent shadow-lg z-40 overflow-y-auto sidebar left-sidebar">
          <div class="p-4 backdrop-blur-md bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-10 h-full">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-white">书签</h2>
              <button @click="closeLeftSidebar" class="text-white hover:text-gray-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <LinkList 
              :bookmarks="bookmarks" 
              @update:bookmarks="updateBookmarks" 
              :showLeftSidebar="showLeftSidebar"
              @close-left-sidebar="closeLeftSidebar"
              @open-add-bookmark-modal="openAddLinkModal"
              :isMobile="true"
              class="w-full"
            />
          </div>
        </div>
      </transition>

      <!-- 右侧边栏组件（设置侧边栏） -->
      <transition name="slide">
        <div v-if="showSidebar" class="fixed inset-y-0 right-0 w-3/4 max-w-md z-40 overflow-hidden sidebar right-sidebar backdrop-blur-md bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-10">
          <Sidebar 
            :show="showSidebar"
            :bookmarks="bookmarks"
            :searchEngines="searchEngines"
            :defaultEngineIndex="currentEngineIndex"
            :unsplashChangeInterval="unsplashChangeInterval"
            @close="showSidebar = false"
            @linkAdded="handleLinkAdded"
            @linkUpdated="handleLinkUpdated"
            @update:bookmarks="updateBookmarks"
            @updateDefaultEngine="updateDefaultEngine"
            @settingsImported="importSettings"
            @openAddLinkModal="openAddLinkModal"
            @openEngineManager="openEngineManager"
            @setBackgroundImage="setBackgroundImage"
            @setUnsplashImage="setUnsplashImage"
            @updateUnsplashInterval="updateUnsplashInterval"
            @updateUnsplashAccessKey="updateUnsplashAccessKey"
            class="h-full overflow-y-auto"
          />
        </div>
      </transition>

      <!-- 添加书签模态框 -->
      <transition name="fade">
        <div v-if="showAddLinkModal" class="fixed inset-0 flex items-center justify-center z-50">
          <AddLinkModal
            :show="showAddLinkModal"
            @close="closeAddLinkModal"
            @linkAdded="handleLinkAdded"
          />
        </div>
      </transition>

      <!-- 搜索引擎管理器模态框 -->
      <transition name="fade">
        <div v-if="showEngineManager" class="fixed inset-0 flex items-center justify-center z-50">
          <EngineManager
            :show="showEngineManager"
            :initialDefaultEngineIndex="currentEngineIndex"
            @close="closeEngineManager"
            @engines-updated="handleEnginesUpdated"
            @default-engine-updated="handleDefaultEngineUpdated"
          />
        </div>
      </transition>

      <!-- 实时时间显示（桌面端和移动端都显示） -->
      <div class="fixed bottom-4 left-0 right-0 flex justify-center z-20">
        <Clock />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import SearchBar from './components/SearchBar.vue'
import LinkList from './components/LinkList.vue'
import Sidebar from './components/Sidebar.vue'
import AddLinkModal from './components/AddLinkModal.vue'
import EngineManager from './components/EngineManager.vue'
import Clock from './components/Clock.vue'
import { getBingDailyImage } from './utlis/bingImageService'

export default {
  name: 'App',
  components: {
    SearchBar,
    LinkList,
    Sidebar,
    AddLinkModal,
    EngineManager,
    Clock
  },
  setup() {
    const showSidebar = ref(false)
    const showLeftSidebar = ref(false)
    const isNightMode = ref(false)
    const bookmarks = ref([])
    const isMobile = ref(false)
    const searchEngines = ref([])
    const currentEngineIndex = ref(parseInt(localStorage.getItem('defaultEngineIndex') || '0'))
    const isSearchActive = ref(false)
    const showAddLinkModal = ref(false)
    const showEngineManager = ref(false)
    const backgroundImage = ref('')
    const unsplashChangeInterval = ref(parseInt(localStorage.getItem('unsplashChangeInterval') || '0'))
    const unsplashAccessKey = ref(localStorage.getItem('unsplashAccessKey') || '')
    let unsplashIntervalId = null

    const toggleSidebar = () => {
      showSidebar.value = !showSidebar.value
      if (showSidebar.value) {
        showLeftSidebar.value = false
        showAddLinkModal.value = false
        showEngineManager.value = false
      }
    }

    const toggleLeftSidebar = () => {
      showLeftSidebar.value = !showLeftSidebar.value
      if (showLeftSidebar.value) {
        showSidebar.value = false
        showAddLinkModal.value = false
        showEngineManager.value = false
      }
    }

    const closeLeftSidebar = () => {
      showLeftSidebar.value = false
    }

    const closeAllSidebars = () => {
      showSidebar.value = false
      showLeftSidebar.value = false
      showAddLinkModal.value = false
      showEngineManager.value = false
    }

    const toggleNightMode = () => {
      isNightMode.value = !isNightMode.value
      localStorage.setItem('nightMode', isNightMode.value.toString())
      document.documentElement.classList.toggle('dark', isNightMode.value)
    }

    const loadBookmarks = () => {
      bookmarks.value = JSON.parse(localStorage.getItem('customLinks') || '[]')
    }

    const updateBookmarks = (newBookmarks) => {
      bookmarks.value = newBookmarks
      localStorage.setItem('customLinks', JSON.stringify(newBookmarks))
    }

    const handleLinkAdded = (newLink) => {
      bookmarks.value.push(newLink)
      updateBookmarks(bookmarks.value)
      closeAddLinkModal()
    }

    const handleLinkUpdated = (updatedLink, index) => {
      bookmarks.value[index] = updatedLink
      updateBookmarks(bookmarks.value)
      showSidebar.value = false
    }

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }

    const loadSearchEngines = () => {
      searchEngines.value = JSON.parse(localStorage.getItem('searchEngines') || '[]')
      if (searchEngines.value.length === 0) {
        searchEngines.value = [
          { name: 'Google', url: 'https://www.google.com/search?q=%s', iconUrl: '/icons/google.svg' },
          { name: '百度', url: 'https://www.baidu.com/s?wd=%s', iconUrl: '/icons/baidu.svg' },
          { name: 'Bing', url: 'https://www.bing.com/search?q=%s', iconUrl: '/icons/bing.svg' }
        ]
        localStorage.setItem('searchEngines', JSON.stringify(searchEngines.value))
      }
      if (currentEngineIndex.value >= searchEngines.value.length) {
        currentEngineIndex.value = 0
        localStorage.setItem('defaultEngineIndex', '0')
      }
    }

    const updateDefaultEngine = (index) => {
      currentEngineIndex.value = index
      localStorage.setItem('defaultEngineIndex', index.toString())
    }

    const handleSearchActivated = (active) => {
      isSearchActive.value = active
      if (active && isMobile.value) {
        closeAllSidebars()
      }
    }

    const importSettings = (settings) => {
      if (settings.bookmarks) {
        updateBookmarks(settings.bookmarks)
      }
      if (settings.searchEngines) {
        searchEngines.value = settings.searchEngines
        localStorage.setItem('searchEngines', JSON.stringify(settings.searchEngines))
      }
      if (settings.defaultEngineIndex !== undefined) {
        updateDefaultEngine(settings.defaultEngineIndex)
      }
      if (settings.nightMode !== undefined) {
        isNightMode.value = settings.nightMode
        localStorage.setItem('nightMode', settings.nightMode.toString())
        document.documentElement.classList.toggle('dark', settings.nightMode)
      }
      if (settings.backgroundImage) {
        setBackgroundImage(settings.backgroundImage)
      }
      if (settings.unsplashChangeInterval !== undefined) {
        updateUnsplashInterval(settings.unsplashChangeInterval)
      }
      if (settings.unsplashAccessKey) {
        updateUnsplashAccessKey(settings.unsplashAccessKey)
      }
    }

    const handleOutsideClick = (event) => {
      if (showSidebar.value && !event.target.closest('.sidebar')) {
        showSidebar.value = false
      }
      if (showLeftSidebar.value && !event.target.closest('.sidebar')) {
        closeLeftSidebar()
      }
    }

    const openAddLinkModal = () => {
      showAddLinkModal.value = true
      showSidebar.value = false
      showLeftSidebar.value = false
    }

    const closeAddLinkModal = () => {
      showAddLinkModal.value = false
    }

    const openEngineManager = () => {
      showEngineManager.value = true
      showSidebar.value = false
    }

    const closeEngineManager = () => {
      showEngineManager.value = false
    }

    const handleEnginesUpdated = (updatedEngines) => {
      searchEngines.value = updatedEngines
      localStorage.setItem('searchEngines', JSON.stringify(updatedEngines))
    }

    const handleDefaultEngineUpdated = (index) => {
      updateDefaultEngine(index)
    }

    const setBackgroundImage = async (imageUrl) => {
  if (imageUrl) {
    backgroundImage.value = imageUrl;
  } else {
    try {
      const bingImageUrl = await getBingDailyImage();
      backgroundImage.value = bingImageUrl;
    } catch (error) {
      console.error('Error setting background image:', error);
      // 使用默认图片
      backgroundImage.value = 'https://picsum.photos/1920/1080';
    }
  }
  localStorage.setItem('backgroundImage', backgroundImage.value);
}

    const setUnsplashImage = async () => {
      if (!unsplashAccessKey.value) {
        console.error('Unsplash Access Key is not set')
        return
      }
      try {
        const response = await fetch(`https://api.unsplash.com/photos/random?client_id=${unsplashAccessKey.value}`)
        const data = await response.json()
        setBackgroundImage(data.urls.regular)
      } catch (error) {
        console.error('Error fetching Unsplash image:', error)
      }
    }

    const updateUnsplashInterval = (interval) => {
      unsplashChangeInterval.value = interval
      localStorage.setItem('unsplashChangeInterval', interval.toString())
      if (unsplashIntervalId) {
        clearInterval(unsplashIntervalId)
      }
      if (interval > 0) {
        unsplashIntervalId = setInterval(setUnsplashImage, interval * 1000)
      }
    }

    const updateUnsplashAccessKey = (key) => {
      unsplashAccessKey.value = key
      localStorage.setItem('unsplashAccessKey', key)
    }

    onMounted(() => {
      loadBookmarks()
      loadSearchEngines()
      const savedNightMode = localStorage.getItem('nightMode') === 'true'
      isNightMode.value = savedNightMode
      document.documentElement.classList.toggle('dark', savedNightMode)
      
      checkMobile()
      window.addEventListener('resize', checkMobile)

      const savedBackgroundImage = localStorage.getItem('backgroundImage');
  if (savedBackgroundImage) {
    backgroundImage.value = savedBackgroundImage;
  } else {
    setBackgroundImage(); // 这将获取 Bing 图片或使用默认图片
  }

      if (unsplashChangeInterval.value > 0) {
        unsplashIntervalId = setInterval(setUnsplashImage, unsplashChangeInterval.value * 1000)
      }
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
      if (unsplashIntervalId) {
        clearInterval(unsplashIntervalId)
      }
    })

    watch(() => isMobile.value, (newValue) => {
      if (newValue) {
        closeAllSidebars()
      }
    })

    return {
      showSidebar,
      showLeftSidebar,
      isNightMode,
      bookmarks,
      isMobile,
      searchEngines,
      currentEngineIndex,
      isSearchActive,
      showAddLinkModal,
      showEngineManager,
      backgroundImage,
      unsplashChangeInterval,
      toggleSidebar,
      toggleLeftSidebar,
      closeLeftSidebar,
      closeAllSidebars,
      toggleNightMode,
      handleLinkAdded,
      handleLinkUpdated,
      updateBookmarks,
      updateDefaultEngine,
      handleSearchActivated,
      importSettings,
      handleOutsideClick,
      openAddLinkModal,
      closeAddLinkModal,
      openEngineManager,
      closeEngineManager,
      handleEnginesUpdated,
      handleDefaultEngineUpdated,
      setBackgroundImage,
      setUnsplashImage,
      updateUnsplashInterval,
      updateUnsplashAccessKey
    }
  }
}
</script>

<style>
/* 基础样式 */
.container {
  min-height: 100vh;
  padding-bottom: 3rem; /* 为时钟腾出空间 */
}

.search-bar-container {
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 桌面端样式 */
@media (min-width: 769px) {
  .search-bar-container {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
}

/* 响应式设备样式 */
@media (max-width: 768px) {
  .mobile-layout {
    padding-top: 4rem;
  }

  .mobile-title {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    backdrop-filter: blur(5px);
  }

  .search-bar-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    z-index: 1;
  }

  .search-bar-container.active {
    top: 4rem;
    transform: translateX(-50%);
  }
}

/* 侧边栏动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* 右侧边栏特定动画 */
.right-sidebar.slide-enter-from,
.right-sidebar.slide-leave-to {
  transform: translateX(100%);
}

.right-sidebar.slide-enter-active,
.right-sidebar.slide-leave-active {
  transition: transform 0.3s ease;
}

/* 遮罩层动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 75%;
  max-width: 400px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 40;
  overflow-y: auto;
  
}

.sidebar.left-sidebar {
  left: 0;
}

.sidebar.right-sidebar {
  right: 0;
}

.dark .sidebar {
  background-color: rgba(26, 32, 44, 0.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

/* 为不支持 backdrop-filter 的浏览器提供后备方案 */
@supports not (backdrop-filter: blur(10px)) {
  .sidebar {
    background-color: rgba(255, 255, 255, 0.9);
  }

  .dark .sidebar {
    background-color: rgba(26, 32, 44, 0.9);
  }
}

/* 按钮样式 */
button {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: transparent;
  border: none;
  outline: none;
}

button:hover {
  transform: scale(1.1);
}

button:active {
  transform: scale(0.95);
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

/* 按钮图标样式 */
button svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* 夜间模式过渡 */
.dark .dark\:bg-gray-900 {
  transition: background-color 0.3s ease;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 241, 241, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(136, 136, 136, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(85, 85, 85, 0.7);
}

/* 确保所有可点击元素有鼠标悬停效果 */
a {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

a:hover {
  opacity: 0.8;
}

/* 确保 focus 状态有明显的视觉提示 */
a:focus, input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .dark\:bg-gray-800 {
    background-color: rgba(26, 32, 44, 0.8);
  }

  .dark\:text-gray-200 {
    color: #e2e8f0;
  }
}

/* 优化动画性能 */
.sidebar, .fade-enter-active, .fade-leave-active {
  will-change: transform, opacity;
}

/* 移动端样式调整 */
@media (max-width: 768px) {
  .sidebar {
    width: 75%;
    max-width: none;
  }

  button.fixed {
    padding: 0.25rem;
  }
  
  button.fixed.top-4.left-4,
  button.fixed.top-4.right-4 {
    top: 0.5rem !important;
  }
  
  button.fixed.bottom-4.right-4 {
    bottom: 0.5rem !important;
    right: 0.5rem !important;
  }
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  width: 400px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dark .modal-content {
  background-color: rgba(45, 55, 72, 0.9);
  color: #e2e8f0;
}

/* 输入框样式 */
input[type="text"],
input[type="url"] {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
}

.dark input[type="text"],
.dark input[type="url"] {
  border-color: #4a5568;
  color: #e2e8f0;
  background-color: rgba(26, 32, 44, 0.1);
}

/* 模态框按钮样式 */
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-button-primary {
  background-color: #4299e1;
  color: white;
}

.modal-button-primary:hover {
  background-color: #3182ce;
}

.modal-button-secondary {
  background-color: #e2e8f0;
  color: #4a5568;
}

.modal-button-secondary:hover {
  background-color: #cbd5e0;
}

.dark .modal-button-secondary {
  background-color: #4a5568;
  color: #e2e8f0;
}

.dark .modal-button-secondary:hover {
  background-color: #2d3748;
}

/* 毛玻璃效果 */
.backdrop-blur-md {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

@supports not (backdrop-filter: blur(8px)) {
  .backdrop-blur-md {
    background-color: rgba(255, 255, 255, 0.8);
  }

  .dark .backdrop-blur-md {
    background-color: rgba(17, 24, 39, 0.8);
  }
}

/* 搜索栏激活状态样式 */
.search-bar-container.active {
  z-index: 20;
}

@media (min-width: 769px) {
  .search-bar-container.active {
    transform: translateY(-10px);
  }
}

/* 时钟样式 */
.clock-container {
  display: inline-flex;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1rem; /* 默认字体大小 */
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.dark .clock-container {
  background-color: rgba(26, 32, 44, 0.2);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .clock-container {
    font-size: 0.875rem; /* 在小屏幕上减小字体大小 */
    padding: 0.25rem 0.5rem; /* 在小屏幕上减小内边距 */
  }
}

.opacity-0 {
  opacity: 0 !important;
}

.invisible {
  visibility: hidden !important;
}

.transition-all {
  transition-property: all;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
}

/* 背景图片样式 */
.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  transition: opacity 0.3s ease;
}

/* 背景遮罩层样式 */
.bg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

/* 确保内容在背景之上 */
.content {
  position: relative;
  z-index: 1;
}

/* 全局文本颜色 */
body {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.dark body {
  color: #e2e8f0;
}
</style>