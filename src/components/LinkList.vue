<template>
  <div :class="['bookmark-container', { 'mobile-mode': isMobile }]">
    <!-- 桌面视图的书签列表 -->
    <div v-if="!isMobile" class="desktop-bookmarks">
      <div v-for="(link, index) in bookmarks" 
           :key="index" 
           class="bookmark-wrapper md:border md:border-gray-200 md:rounded"
           @dragstart="dragStart($event, index)"
           @dragover.prevent
           @dragenter="dragEnter($event)"
           @dragleave="dragLeave($event)"
           @drop="drop($event, index)"
           draggable="true">
        <div class="bookmark-content">
          <button class="edit-button" @click.stop="handleEditBookmark(index)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <a :class="['bookmark', link.class]" 
             :href="link.url" 
             target="_blank"
             rel="noopener noreferrer"
             @click.prevent="openLink(link.url)">
            <img :src="link.iconUrl" :alt="link.name" width="48" height="48" loading="lazy" />
            <span class="bookmark-name">{{ link.name }}</span>
          </a>
          <button class="delete-button" @click.stop="confirmDelete(index)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 桌面端的添加书签按钮 -->
      <div class="bookmark-wrapper md:border md:border-gray-200 md:rounded" @click="openAddBookmarkModal">
        <div class="bookmark-content">
          <div class="bookmark add-bookmark">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="bookmark-name">添加书签</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动设备视图的书签列表 -->
    <div v-else class="mobile-bookmarks">
      <div class="mobile-bookmark-row" v-for="(row, rowIndex) in mobileBookmarkRows" :key="rowIndex">
        <div v-for="(link, colIndex) in row" 
             :key="colIndex" 
             class="mobile-bookmark-wrapper">
          <div class="mobile-bookmark-content" @click.stop="openLink(link.url)">
            <img :src="link.iconUrl" :alt="link.name" class="mobile-bookmark-icon" loading="lazy" />
            <span class="mobile-bookmark-name">{{ link.name }}</span>
          </div>
          <div class="mobile-bookmark-actions">
            <button class="mobile-edit-button" @click.stop="handleEditBookmark(rowIndex * 2 + colIndex)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button class="mobile-delete-button" @click.stop="confirmDelete(rowIndex * 2 + colIndex)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 移动端的添加书签按钮 -->
      <div class="mobile-bookmark-row">
        <div class="mobile-bookmark-wrapper add-bookmark" @click="openAddBookmarkModal">
          <div class="mobile-bookmark-content">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="mobile-bookmark-name">添加书签</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <teleport to="body">
      <EditBookmarkModal
        v-if="showEditModal"
        :bookmark="editingBookmark"
        @close="closeEditModal"
        @update="updateBookmark"
      />
    </teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import EditBookmarkModal from './EditBookmarkModal.vue'

export default {
  name: 'LinkList',
  components: {
    EditBookmarkModal
  },
  props: {
    bookmarks: {
      type: Array,
      required: true
    },
    showLeftSidebar: {
      type: Boolean,
      default: false
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    showDesktopBookmarks: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:bookmarks', 'close-left-sidebar', 'edit-bookmark', 'open-add-bookmark-modal'],
  setup(props, { emit }) {
    const itemsPerRow = ref(8)
    const showEditModal = ref(false)
    const editingBookmark = ref(null)

    const bookmarkRows = computed(() => {
      const rows = []
      for (let i = 0; i < props.bookmarks.length; i += itemsPerRow.value) {
        rows.push(props.bookmarks.slice(i, i + itemsPerRow.value))
      }
      return rows
    })

    const mobileBookmarkRows = computed(() => {
      const rows = []
      for (let i = 0; i < props.bookmarks.length; i += 2) {
        rows.push(props.bookmarks.slice(i, i + 2))
      }
      return rows
    })

    const visibleBookmarks = computed(() => {
      return props.isMobile || props.showDesktopBookmarks ? props.bookmarks : []
    })

    const openLink = (url) => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const handleEditBookmark = (index) => {
      editingBookmark.value = { ...props.bookmarks[index], index }
      showEditModal.value = true
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingBookmark.value = null
    }

    const updateBookmark = (updatedBookmark) => {
      const newBookmarks = [...props.bookmarks]
      newBookmarks[updatedBookmark.index] = updatedBookmark
      emit('update:bookmarks', newBookmarks)
      closeEditModal()
    }

    const confirmDelete = (index) => {
      if (confirm('Are you sure you want to delete this bookmark?')) {
        deleteBookmark(index)
      }
    }

    const deleteBookmark = (index) => {
      const newBookmarks = props.bookmarks.filter((_, i) => i !== index)
      emit('update:bookmarks', newBookmarks)
    }

    // Drag and drop functions
    const dragStart = (event, index) => {
      event.dataTransfer.setData('text/plain', index)
    }

    const dragEnter = (event) => {
      event.target.classList.add('drag-over')
    }

    const dragLeave = (event) => {
      event.target.classList.remove('drag-over')
    }

    const drop = (event, index) => {
      event.target.classList.remove('drag-over')
      const draggedIndex = parseInt(event.dataTransfer.getData('text/plain'))
      if (draggedIndex !== index) {
        const newBookmarks = [...props.bookmarks]
        const [removed] = newBookmarks.splice(draggedIndex, 1)
        newBookmarks.splice(index, 0, removed)
        emit('update:bookmarks', newBookmarks)
      }
    }

    const openAddBookmarkModal = () => {
      emit('open-add-bookmark-modal')
    }

    onMounted(() => {
      // Adjust itemsPerRow based on screen size if needed
      const adjustItemsPerRow = () => {
        if (window.innerWidth > 1536) {
          itemsPerRow.value = 8
        } else if (window.innerWidth > 1280) {
          itemsPerRow.value = 6
        } else if (window.innerWidth > 1024) {
          itemsPerRow.value = 5
        } else if (window.innerWidth > 768) {
          itemsPerRow.value = 4
        } else {
          itemsPerRow.value = 3
        }
      }

      adjustItemsPerRow()
      window.addEventListener('resize', adjustItemsPerRow)

      return () => {
        window.removeEventListener('resize', adjustItemsPerRow)
      }
    })

    return {
      bookmarkRows,
      mobileBookmarkRows,
      visibleBookmarks,
      itemsPerRow,
      showEditModal,
      editingBookmark,
      openLink,
      handleEditBookmark,
      closeEditModal,
      updateBookmark,
      confirmDelete,
      deleteBookmark,
      dragStart,
      dragEnter,
      dragLeave,
      drop,
      openAddBookmarkModal
    }
  }
}
</script>

<style scoped>
/* 书签容器样式 */
.bookmark-container {
  width: 100%;
  padding: 1rem;
}

/* 桌面端书签列表样式 */
.desktop-bookmarks {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: flex-start;
  background-color: rgba(255, 255, 255, 0.1); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 磨砂玻璃效果 */
  -webkit-backdrop-filter: blur(10px); /* 为 Safari 浏览器添加前缀 */
  border-radius: 1rem; /* 圆角 */
  padding: 1.5rem; /* 内边距 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 轻微阴影 */
}

/* 深色模式下的样式 */
.dark .desktop-bookmarks {
  background-color: rgba(0, 0, 0, 0.2); /* 深色模式下使用半透明黑色背景 */
}

/* 为不支持 backdrop-filter 的浏览器提供回退方案 */
@supports not (backdrop-filter: blur(10px)) {
  .desktop-bookmarks {
    background-color: rgba(255, 255, 255, 0.8);
  }
  
  .dark .desktop-bookmarks {
    background-color: rgba(0, 0, 0, 0.8);
  }
}

/* 单个书签包装器样式 */
.bookmark-wrapper {
  position: relative;
  flex: 0 0 calc(12.5% - 1.5rem);
  max-width: calc(12.5% - 1.5rem);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 书签内容样式 */
.bookmark-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  height: 100%;
}

/* 书签链接样式 */
.bookmark {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  background-color: transparent;
  height: 100%;
  width: 100%;
}

/* 书签悬停效果 */
.bookmark:hover {
  transform: translateY(-5px);
}

/* 书签图标样式 */
.bookmark img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 0.75rem;
  transition: transform 0.3s ease;
  margin-top: 10px;
}

/* 书签图标悬停效果 */
.bookmark:hover img {
  transform: scale(1.1);
}

/* 书签名称样式 */
.bookmark-name {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  text-align: center;
  color: #ffffff;
  word-break: break-word;
  max-width: 100%;
  font-weight: 500;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.5em;
  line-height: 1.25em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 编辑和删除按钮共同样式 */
.edit-button,
.delete-button {
  position: absolute;
  top: 0.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  color: #4a5568;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
  display: none;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 编辑按钮位置 */
.edit-button {
  left: 0.5rem;
}

/* 删除按钮样式和位置 */
.delete-button {
  right: 0.5rem;
  background-color: rgba(255, 59, 48, 0.9);
  color: white;
}

/* 显示编辑和删除按钮 */
.bookmark-wrapper:hover .edit-button,
.bookmark-wrapper:hover .delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 编辑和删除按钮悬停效果 */
.edit-button:hover,
.delete-button:hover {
  transform: scale(1.1);
}

/* 编辑按钮悬停背景 */
.edit-button:hover {
  background-color: rgba(255, 255, 255, 1);
}

/* 删除按钮悬停背景 */
.delete-button:hover {
  background-color: rgba(255, 59, 48, 1);
}

/* 移动端样式 */
/* 移动端书签容器样式 */
.mobile-mode .bookmark-container {
  padding: 0.75rem;
}

/* 移动端书签列表样式 */
.mobile-bookmarks {
  width: 100%;
}

/* 移动端书签行样式 */
.mobile-bookmark-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

/* 移动端单个书签包装器样式 */
.mobile-bookmark-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 15px 10px rgba(0, 0, 0, 0.1);
}

/* 移动端书签内容样式 */
.mobile-bookmark-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

/* 移动端书签图标样式 */
.mobile-bookmark-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  object-fit: contain;
}

/* 移动端书签名称样式 */
.mobile-bookmark-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin: 0;
  padding: 0;
  height: auto;
  line-height: normal;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 移动端书签操作按钮容器 */
.mobile-bookmark-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 100%;
}

/* 移动端编辑和删除按钮共同样式 */
.mobile-edit-button,
.mobile-delete-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 移动端编辑按钮颜色 */
.mobile-edit-button {
  color: #3b82f6;
}

/* 移动端删除按钮颜色 */
.mobile-delete-button {
  color: #ef4444;
}

/* 移动端编辑和删除按钮图标大小 */
.mobile-edit-button svg,
.mobile-delete-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* 新增的添加书签按钮样式 */
.add-bookmark {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 添加书签按钮图标样式 */
.add-bookmark svg {
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

/* 移动端的"添加书签"按钮样式 */
.mobile-bookmark-wrapper.add-bookmark {
  background-color: rgba(255, 255, 255, 0.1);
  height: 100px;
}

/* 移动端添加书签按钮悬停效果 */
.mobile-bookmark-wrapper.add-bookmark:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 深色模式样式 */
.dark .bookmark-wrapper {
  background-color: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .bookmark-name,
.dark .mobile-bookmark-name {
  color: rgba(255, 255, 255, 0.8);
}

.dark .edit-button {
  background-color: rgba(0, 0, 0, 0.5);
  color: #e2e8f0;
}

.dark .edit-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.dark .mobile-bookmark-wrapper {
  border-color: rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.2);
}

.dark .mobile-edit-button {
  color: #60a5fa;
}

.dark .mobile-delete-button {
  color: #f87171;
}

.dark .add-bookmark:hover,
.dark .mobile-bookmark-wrapper.add-bookmark:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark .mobile-bookmark-wrapper.add-bookmark {
  background-color: rgba(255, 255, 255, 0.05);
}

/* 响应式布局调整 */
@media (max-width: 1280px) {
  .bookmark-wrapper {
    flex: 0 0 calc(16.666% - 1.5rem);
    max-width: calc(16.666% - 1.5rem);
  }
}

@media (max-width: 1024px) {
  .bookmark-wrapper {
    flex: 0 0 calc(20% - 1.5rem);
    max-width: calc(20% - 1.5rem);
  }
}

@media (max-width: 768px) {
  .bookmark-wrapper {
    flex: 0 0 calc(25% - 1.5rem);
    max-width: calc(25% - 1.5rem);
  }
}

@media (max-width: 640px) {
  .bookmark-wrapper {
    flex: 0 0 calc(33.333% - 1.5rem);
    max-width: calc(33.333% - 1.5rem);
  }
}

@media (max-width: 480px) {
  .bookmark-wrapper {
    flex: 0 0 calc(50% - 1.5rem);
    max-width: calc(50% - 1.5rem);
  }

  .mobile-bookmark-icon {
    width: 40px;
    height: 40px;
  }

  .mobile-bookmark-name {
    font-size: 0.8rem;
  }

  .mobile-edit-button svg,
  .mobile-delete-button svg {
    width: 1.1rem;
    height: 1.1rem;
  }
}

/* 底部书签栏样式 */
.bottom-bookmark-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.5); /* 更透明的背景 */
  backdrop-filter: blur(15px); /* 增加模糊效果 */
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  transition: transform 0.5s ease; /* 减慢过渡速度 */
  transform: translateY(100%); /* 初始状态隐藏 */
}

.bottom-bookmark-bar.show {
  transform: translateY(0); /* 显示状态 */
}

.dark .bottom-bookmark-bar {
  background-color: rgba(26, 32, 44, 0.5); /* 深色模式更透明的背景 */
  box-shadow: 0 -2px 10px rgba(255, 255, 255, 0.1);
}

/* 为不支持 backdrop-filter 的浏览器提供后备方案 */
@supports not (backdrop-filter: blur(15px)) {
  .bottom-bookmark-bar {
    background-color: rgba(255, 255, 255, 0.9);
  }

  .dark .bottom-bookmark-bar {
    background-color: rgba(26, 32, 44, 0.9);
  }
}

/* 底部书签栏中的书签样式 */
.bottom-bookmark-bar .bookmark-wrapper {
  flex: 0 0 calc(10% - 1rem);
  max-width: calc(10% - 1rem);
}

@media (max-width: 1280px) {
  .bottom-bookmark-bar .bookmark-wrapper {
    flex: 0 0 calc(12.5% - 1rem);
    max-width: calc(12.5% - 1rem);
  }
}

@media (max-width: 1024px) {
  .bottom-bookmark-bar .bookmark-wrapper {
    flex: 0 0 calc(14.285% - 1rem);
    max-width: calc(14.285% - 1rem);
  }
}

@media (max-width: 768px) {
  .bottom-bookmark-bar .bookmark-wrapper {
    flex: 0 0 calc(16.666% - 1rem);
    max-width: calc(16.666% - 1rem);
  }
}
</style>