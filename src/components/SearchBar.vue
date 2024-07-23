<template>
  <div :class="['search-bar-container', { 'active': isActive }]">
    <form @submit.prevent="performSearch" class="relative flex items-center justify-center bg-white dark:bg-gray-800 rounded-full overflow-hidden">
      <div 
        @click="rotateSearchEngine" 
        class="flex-shrink-0 flex items-center justify-center w-12 h-12 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
      >
        <img :src="currentEngine.iconUrl" :alt="currentEngine.name" class="w-6 h-6">
      </div>
      <input 
        type="text" 
        v-model="searchQuery" 
        @focus="activateSearch"
        @blur="deactivateSearch"
        @input="getSuggestions"
        placeholder="输入搜索内容"
        class="search-input flex-grow min-w-0 px-2 sm:px-4 py-3 focus:outline-none bg-transparent text-gray-800 dark:text-gray-200"
      >
      <button 
        type="submit" 
        class="flex-shrink-0 px-2 sm:px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-300"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
    </form>
    <div 
      v-show="isActive && (suggestions.length > 0 || searchHistory.length > 0)" 
      class="dropdown-container absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mt-1 overflow-hidden shadow-lg"
    >
      <div v-if="suggestions.length > 0">
        <div 
          v-for="(item, index) in suggestions" 
          :key="'suggestion-' + index" 
          @mousedown.prevent="useSearchSuggestion(item)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300 flex items-center"
        >
          <svg class="flex-shrink-0 w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span class="truncate">{{ item }}</span>
        </div>
        <div class="px-4 py-2 text-xs text-gray-500">
          搜索建议来源: {{ currentSuggestionApi }}
        </div>
      </div>
      <div v-else-if="searchHistory.length > 0">
        <div 
          v-for="(item, index) in searchHistory" 
          :key="'history-' + index" 
          class="px-4 py-2 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300"
        >
          <span @mousedown.prevent="useSearchSuggestion(item)" class="cursor-pointer flex-grow flex items-center min-w-0">
            <svg class="flex-shrink-0 w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="truncate">{{ item }}</span>
          </span>
          <button @click.stop.prevent="removeFromHistory(index)" class="flex-shrink-0 ml-2 text-red-500 hover:text-red-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="px-4 py-2 flex justify-end">
          <button @click.stop.prevent="clearSearchHistory" class="text-sm text-blue-500 hover:text-blue-700">
            清空搜索历史
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'SearchBar',
  props: {
    searchEngines: {
      type: Array,
      required: true
    },
    currentEngineIndex: {
      type: Number,
      required: true
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  emits: ['showEngineManager', 'searchActivated'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const suggestions = ref([])
    const isActive = ref(false)
    const searchHistory = ref([])
    const isInChina = ref(false)
    const currentSuggestionApi = ref('None')

    const currentEngine = computed(() => {
      return props.searchEngines[props.currentEngineIndex] || props.searchEngines[0] || { name: 'Default', url: 'https://www.google.com/search?q=%s', iconUrl: '/icons/default.svg' }
    })

    function activateSearch() {
      console.log('Activating search'); // 添加这行来调试
      isActive.value = true;
      emit('searchActivated', true);
    }

    function deactivateSearch() {
      console.log('Deactivating search'); // 添加这行来调试
      setTimeout(() => {
        isActive.value = false;
        emit('searchActivated', false);
      }, 200);
    }

    function performSearch(query = searchQuery.value) {
      const searchTerm = typeof query === 'string' ? query : searchQuery.value;
      if (searchTerm && searchTerm.trim()) {
        addToSearchHistory(searchTerm.trim())
        const searchUrl = currentEngine.value.url.replace('%s', encodeURIComponent(searchTerm.trim()))
        window.open(searchUrl, '_blank')
        searchQuery.value = ''
        suggestions.value = []
        isActive.value = false
        emit('searchActivated', false)
      }
    }

    async function getSuggestions() {
      if (searchQuery.value.length > 0) {
        let baiduSuggestions = []
        let googleSuggestions = []

        if (isInChina.value) {
          baiduSuggestions = await getBaiduSuggestions()
          currentSuggestionApi.value = 'Baidu'
        } else {
          try {
            const [baidu, google] = await Promise.all([
              getBaiduSuggestions(),
              getGoogleSuggestions()
            ])
            baiduSuggestions = baidu
            googleSuggestions = google
            currentSuggestionApi.value = 'Baidu + Google'
          } catch (error) {
            console.error('Error fetching suggestions:', error)
            if (baiduSuggestions.length > 0) {
              currentSuggestionApi.value = 'Baidu'
            } else if (googleSuggestions.length > 0) {
              currentSuggestionApi.value = 'Google'
            } else {
              currentSuggestionApi.value = 'None'
            }
          }
        }

        suggestions.value = optimizeSuggestions(baiduSuggestions, googleSuggestions)
      } else {
        suggestions.value = []
        currentSuggestionApi.value = 'None'
      }
    }

    function getBaiduSuggestions() {
      return new Promise((resolve) => {
        window.baiduSuggestionCallback = function(data) {
          resolve(data.s)
        }
        const script = document.createElement('script')
        script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(searchQuery.value)}&cb=baiduSuggestionCallback`
        document.body.appendChild(script)
        document.body.removeChild(script)
      })
    }

    function getGoogleSuggestions() {
      return new Promise((resolve) => {
        window.googleSuggestionCallback = function(data) {
          resolve(data[1])
        }
        const script = document.createElement('script')
        script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(searchQuery.value)}&callback=googleSuggestionCallback`
        document.body.appendChild(script)
        document.body.removeChild(script)
      })
    }

    function optimizeSuggestions(baiduSuggestions, googleSuggestions) {
      const allSuggestions = [...baiduSuggestions, ...googleSuggestions]
      const uniqueSuggestions = Array.from(new Set(allSuggestions))
      
      return uniqueSuggestions.sort((a, b) => {
        const aCount = baiduSuggestions.includes(a) + googleSuggestions.includes(a)
        const bCount = baiduSuggestions.includes(b) + googleSuggestions.includes(b)
        if (aCount !== bCount) {
          return bCount - aCount
        }
        return allSuggestions.indexOf(a) - allSuggestions.indexOf(b)
      }).slice(0, 10)  // 只保留前10个建议
    }

    function useSearchSuggestion(suggestion) {
      searchQuery.value = suggestion
      performSearch(suggestion)
    }

    function addToSearchHistory(query) {
      const index = searchHistory.value.indexOf(query)
      if (index > -1) {
        searchHistory.value.splice(index, 1)
      }
      searchHistory.value.unshift(query)
      if (searchHistory.value.length > 10) searchHistory.value.pop()
      saveSearchHistory()
    }

    function removeFromHistory(index) {
      searchHistory.value.splice(index, 1)
      saveSearchHistory()
    }

    function clearSearchHistory() {
      searchHistory.value = []
      saveSearchHistory()
    }

    function saveSearchHistory() {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
    }

    function rotateSearchEngine() {
      const nextIndex = (props.currentEngineIndex + 1) % props.searchEngines.length
      localStorage.setItem('defaultEngineIndex', nextIndex.toString())
      window.location.reload()
    }

    function checkIfInChina() {
      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          isInChina.value = data.country === 'CN'
        })
        .catch(() => {
          isInChina.value = false
        })
    }

    onMounted(() => {
      searchHistory.value = JSON.parse(localStorage.getItem('searchHistory') || '[]')
      checkIfInChina()
      document.addEventListener('click', hideDropdown)
    })

    onUnmounted(() => {
      document.removeEventListener('click', hideDropdown)
      delete window.baiduSuggestionCallback
      delete window.googleSuggestionCallback
    })

    watch(() => props.currentEngineIndex, () => {
      if (searchQuery.value) {
        getSuggestions()
      }
    })

    function hideDropdown(event) {
      if (!event.target.closest('.search-bar-container')) {
        isActive.value = false
        emit('searchActivated', false)
      }
    }

    return {
      searchQuery,
      suggestions,
      currentEngine,
      performSearch,
      getSuggestions,
      useSearchSuggestion,
      rotateSearchEngine,
      isActive,
      searchHistory,
      currentSuggestionApi,
      removeFromHistory,
      clearSearchHistory,
      activateSearch,
      deactivateSearch
    }
  }
}
</script>

<style scoped>
.search-bar-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 20;
}

.search-bar-container form {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 9999px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.dark .search-bar-container form {
  background-color: #374151;
}

.search-input {
  border: none;
  background-color: transparent;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: inherit;
}

.search-bar-container *:focus {
  outline: none;
  box-shadow: none;
}

.search-bar-container input:focus {
  outline: none;
  border-color: transparent;
}

.search-bar-container button:focus {
  outline: none;
}

.dropdown-container {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  left: 0;
  right: 0;
  margin-top: 1rem;
}

.dark .dropdown-container {
  background-color: #374151;
  border-color: #4b5563;
}

.search-bar-container.active form {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

@media (min-width: 769px) {
  .search-bar-container.active {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .search-bar-container {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: none;
    padding: 0;
    top: 50%;
    transition: all 0.3s ease;
    z-index: 1001;
  }

  .search-bar-container.active {
    top: 1rem;
  }

  .search-input {
    max-width: none;
  }

  .dropdown-container {
    position: fixed;
    top: calc(1rem + 3.5rem);
    left: 5%;
    width: 90%;
    max-height: calc(100vh - 5rem);
    overflow-y: auto;
    z-index: 1001;
    margin-top: -1rem;
  }
}

.search-engine-icon {
  width: 24px;
  height: 24px;
  margin-right: 0.5rem;
}

.search-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .search-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.suggestion-item,
.history-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.suggestion-item:hover,
.history-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .suggestion-item:hover,
.dark .history-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.clear-history-button {
  background-color: transparent;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.clear-history-button:hover {
  text-decoration: underline;
}
</style>