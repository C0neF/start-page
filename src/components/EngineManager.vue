<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 overflow-y-auto max-h-[90vh]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">管理搜索引擎</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="space-y-4">
        <div id="engine-list" class="space-y-2 max-h-60 overflow-y-auto">
          <div v-for="(engine, index) in engines" :key="index" class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <div class="flex items-center space-x-2">
              <input 
                type="radio" 
                :id="'engine-' + index" 
                :value="index" 
                v-model="defaultEngineIndex"
                @change="updateDefaultEngine"
                class="form-radio h-4 w-4 text-blue-600"
              >
              <img v-if="!engine.iconUrl.startsWith('data:image/svg+xml')" :src="engine.iconUrl" :alt="engine.name" class="w-4 h-4">
              <span v-else v-html="decodeURIComponent(engine.iconUrl.split(',')[1])" class="w-4 h-4"></span>
              <label :for="'engine-' + index" class="text-sm text-gray-800 dark:text-gray-200">{{ engine.name }}</label>
            </div>
            <div class="flex space-x-1">
              <button @click="editEngine(index)" class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition duration-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button @click="removeEngine(index)" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition duration-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <form @submit.prevent="addEngine" class="space-y-2">
          <input 
            type="text" 
            v-model="engineName" 
            placeholder="搜索引擎名称" 
            required
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
          <input 
            type="text" 
            v-model="engineUrl" 
            placeholder="搜索URL（包含%s作为查询参数）" 
            required
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
          <input 
            type="text" 
            v-model="engineIconUrl" 
            placeholder="搜索引擎图标URL（可选）" 
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 text-sm rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {{ isEditing ? '保存修改' : '添加搜索引擎' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

const defaultSearchIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>`;

export default {
  name: 'EngineManager',
  props: {
    initialDefaultEngineIndex: {
      type: Number,
      default: 0
    }
  },
  emits: ['close', 'engines-updated', 'default-engine-updated'],
  setup(props, { emit }) {
    const engines = ref([])
    const engineName = ref('')
    const engineUrl = ref('')
    const engineIconUrl = ref('')
    const isEditing = ref(false)
    const editingIndex = ref(-1)
    const defaultEngineIndex = ref(props.initialDefaultEngineIndex)

    const loadEngines = () => {
      engines.value = JSON.parse(localStorage.getItem('searchEngines') || '[]')
      defaultEngineIndex.value = parseInt(localStorage.getItem('defaultEngineIndex') || '0')
    }

    const saveEngines = () => {
      localStorage.setItem('searchEngines', JSON.stringify(engines.value))
      localStorage.setItem('defaultEngineIndex', defaultEngineIndex.value.toString())
      emit('engines-updated', engines.value)
    }

    const updateDefaultEngine = () => {
      localStorage.setItem('defaultEngineIndex', defaultEngineIndex.value.toString())
      emit('default-engine-updated', defaultEngineIndex.value)
    }

    const addEngine = async () => {
      if (engineName.value && engineUrl.value) {
        if (!engineUrl.value.includes('%s')) {
          alert('URL必须包含%s作为查询参数')
          return
        }
        let iconUrl = engineIconUrl.value
        if (!iconUrl) {
          try {
            iconUrl = await getFaviconUrl(engineUrl.value)
          } catch (error) {
            console.error('Error getting favicon:', error)
            iconUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultSearchIcon)}`
          }
        }
        if (isEditing.value) {
          engines.value[editingIndex.value] = {
            name: engineName.value,
            url: engineUrl.value,
            iconUrl: iconUrl
          }
          isEditing.value = false
          editingIndex.value = -1
        } else {
          engines.value.push({
            name: engineName.value,
            url: engineUrl.value,
            iconUrl: iconUrl
          })
        }
        saveEngines()
        resetForm()
      }
    }

    const removeEngine = (index) => {
      if (confirm('确定要删除这个搜索引擎吗？')) {
        engines.value.splice(index, 1)
        saveEngines()
        if (defaultEngineIndex.value >= engines.value.length) {
          defaultEngineIndex.value = 0
          updateDefaultEngine()
        }
      }
    }

    const editEngine = (index) => {
      const engine = engines.value[index]
      engineName.value = engine.name
      engineUrl.value = engine.url
      engineIconUrl.value = engine.iconUrl
      isEditing.value = true
      editingIndex.value = index
    }

    const resetForm = () => {
      engineName.value = ''
      engineUrl.value = ''
      engineIconUrl.value = ''
      isEditing.value = false
      editingIndex.value = -1
    }

    const getFaviconUrl = async (url) => {
      const domain = new URL(url).hostname
      try {
        const response = await fetch(`/icon-api?url=${encodeURIComponent(domain)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch icon')
        }
        const data = await response.json()
        return data.icon
      } catch (error) {
        console.error('Error fetching icon:', error)
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultSearchIcon)}`
      }
    }

    onMounted(() => {
      loadEngines()
    })

    watch(() => props.initialDefaultEngineIndex, (newVal) => {
      defaultEngineIndex.value = newVal
    })

    return {
      engines,
      engineName,
      engineUrl,
      engineIconUrl,
      isEditing,
      defaultEngineIndex,
      addEngine,
      removeEngine,
      editEngine,
      updateDefaultEngine
    }
  }
}
</script>