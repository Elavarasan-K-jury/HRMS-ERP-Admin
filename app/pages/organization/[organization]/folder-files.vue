<template>
    <div class="h-[calc(100vh-4rem)] overflow-auto p-2">
        <div class="flex flex-col border border-white/20 rounded-lg">
            <!-- Top Bar -->
            <div
                class="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <!-- Left: Breadcrumb -->
                <div class="flex items-center gap-2 text-sm">
                    <button @click="navigateToRoot"
                        class="flex items-center gap-4 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all text-white/70 hover:text-white">
                        <Icon name="lucide:hard-drive" class="w-4 h-4" />
                        <div class="flex flex-col items-start">
                            <span class="font-medium">My Drive</span>
                            <span>{{ usedStorage }} / {{ totalStorage }}</span>
                        </div>
                    </button>
                    <template v-if="currentFolder">
                        <Icon name="lucide:chevron-right" class="w-4 h-4 text-white/30" />
                        <span
                            class="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30">
                            {{ currentFolder.name }}
                        </span>
                    </template>
                </div>

                <!-- Right: Actions -->
                <div class="flex items-center gap-2">
                    <!-- View Toggle -->
                    <div class="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
                        <button @click="viewMode = 'grid'"
                            :class="viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'"
                            class="px-2 py-1 rounded transition-all">
                            <Icon name="lucide:grid-3x3" class="w-4 h-4" />
                        </button>
                        <button @click="viewMode = 'list'"
                            :class="viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'"
                            class="px-2 py-1 rounded transition-all">
                            <Icon name="lucide:list" class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Upload Button -->
                    <button @click="triggerFileUpload"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold transition-all shadow-lg shadow-sky-500/25">
                        <Icon name="lucide:upload" class="w-4 h-4" />
                        <span>Upload</span>
                    </button>
                    <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileSelect" />

                    <!-- New Folder Button -->
                    <button @click="openCreateFolderDialog"
                        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all">
                        <Icon name="lucide:folder-plus" class="w-4 h-4" />
                        <span>New Folder</span>
                    </button>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 overflow-y-auto px-3 py-2">
                <!-- Upload Progress -->
                <div v-if="storageStore.isUploading"
                    class="mb-4 rounded-lg bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 p-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                                <Icon name="lucide:upload-cloud" class="w-5 h-5 text-sky-400 animate-pulse" />
                            </div>
                            <div>
                                <p class="text-white font-semibold text-sm">Uploading {{ storageStore.uploadingFileName
                                    }}
                                </p>
                                <p class="text-white/60 text-xs">{{ storageStore.uploadPercentage }}% complete</p>
                            </div>
                        </div>
                    </div>
                    <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300 rounded-full"
                            :style="{ width: storageStore.uploadPercentage + '%' }"></div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="storageStore.foldersLoading || storageStore.filesLoading"
                    class="flex items-center justify-center h-64">
                    <div class="flex flex-col items-center gap-4">
                        <div class="w-12 h-12 border-4 border-white/20 border-t-sky-500 rounded-full animate-spin">
                        </div>
                        <p class="text-white/60 font-medium">Loading...</p>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="!storageStore.hasFolders && !storageStore.hasFiles"
                    class="flex items-center justify-center h-64">
                    <div class="text-center">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                            <Icon name="lucide:folder-open" class="w-10 h-10 text-white/20" />
                        </div>
                        <h3 class="text-white/80 font-bold text-lg mb-2">No files or folders yet</h3>
                        <p class="text-white/50 text-sm mb-4">Start by creating a folder or uploading files</p>
                        <div class="flex items-center justify-center gap-3">
                            <button @click="openCreateFolderDialog"
                                class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all">
                                Create Folder
                            </button>
                            <button @click="triggerFileUpload"
                                class="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-all">
                                Upload Files
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div v-else>
                    <!-- Folders Section -->
                    <div v-if="storageStore.hasFolders" class="mb-4">
                        <h3 class="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 px-1">Folders</h3>

                        <!-- Grid View -->
                        <div v-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-4 gap-2" @drop="handleDrop"
                            @dragover.prevent>
                            <div v-for="folder in storageStore.folders" :key="folder.id" @click="openFolder(folder)"
                                @contextmenu.prevent="openFolderContextMenu($event, folder)"
                                @dragover="handleFolderDragOver" @drop="handleFolderDrop($event, folder)"
                                class="group flex items-center justify-between relative rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 px-3 py-2 hover:border-sky-500/50 hover:bg-white/15 transition-all duration-200 cursor-pointer hover:border-sky-500/50 drag-over:border-sky-400">

                                <!-- Folder Icon -->
                                <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                                    :style="{ backgroundColor: folder.color + '20', borderColor: folder.color + '40', borderWidth: '1px' }">
                                    <Icon name="lucide:folder" class="w-6 h-6" :style="{ color: folder.color }" />
                                </div>
                                <div class="flex flex-col items-end">
                                    <!-- Folder Name -->
                                    <h4 class="text-white font-semibold text-sm mb-1 truncate">{{ folder.name }}</h4>
                                    <span class="flex gap-1">
                                        <p class="text-white/40 text-xs">{{ folder.files_count }} items</p>
                                        <p class="text-white/40 text-xs">({{
                                            bytesToSize(folder.folder_storage_used_in_bytes)
                                            }})</p>
                                    </span>

                                    <!-- Visibility Badge -->
                                    <div
                                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span v-if="folder.visibility === 'SHARED'"
                                            class="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                                            <Icon name="lucide:users" class="w-3 h-3 inline" />
                                        </span>
                                        <span v-else-if="folder.visibility === 'PUBLIC'"
                                            class="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-[10px] font-bold">
                                            <Icon name="lucide:globe" class="w-3 h-3 inline" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- List View -->
                        <div v-else class="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            <div v-for="folder in storageStore.folders" :key="folder.id" @click="openFolder(folder)"
                                @contextmenu.prevent="openFolderContextMenu($event, folder)"
                                class="flex items-center gap-4 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer transition-all group">
                                <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                                    :style="{ backgroundColor: folder.color + '20' }">
                                    <Icon name="lucide:folder" class="w-5 h-5" :style="{ color: folder.color }" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-white font-semibold text-sm truncate">{{ folder.name }}</h4>
                                    <p class="text-white/40 text-xs">{{ folder.files_count }} items</p>
                                </div>
                                <div class="text-white/40 text-xs">{{ formatDate(folder.created_at) }}</div>
                                <span v-if="folder.visibility === 'SHARED'" class="text-blue-400 text-xs">
                                    <Icon name="lucide:users" class="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Files Section -->
                    <div v-if="storageStore.hasFiles">
                        <h3 class="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 px-1">Files</h3>

                        <!-- Grid View -->
                        <div v-if="viewMode === 'grid'" class="grid grid-cols-3 md:grid-cols-4 gap-4">
                            <div v-for="file in storageStore.files" :key="file.id"
                                @contextmenu.prevent="openFileContextMenu($event, file)"
                                class="group relative rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-sky-500/50 hover:bg-white/15 transition-all duration-200 cursor-pointer">

                                <!-- File Preview -->
                                <div
                                    class="w-full aspect-square mb-2 bg-white/5 flex items-center justify-center overflow-hidden">
                                    <img v-if="isImage(file.file_url)" :src="getFileUrl(file.file_url)"
                                        class="w-full h-full object-cover" />
                                    <Icon v-else :name="getFileIcon(file.file_url)" class="w-8 h-8 text-white/40" />
                                </div>

                                <!-- File Name -->
                                <div class="flex px-4 items-center justify-between">
                                    <h4 class="text-white text-xs font-medium truncate">
                                        {{ getFileName(file.file_url, 7, 7) }}
                                    </h4>
                                    <span class="text-sm">
                                        {{ file.size ?
                                            `(${bytesToSize(Number(file.size))})` : ''
                                        }}
                                    </span>
                                </div>

                                <div class="mt-1 mb-1 px-4 flex items-center gap-1 text-[11px] text-white/40">
                                    <Icon :name="getFileLocationIcon(file)" class="w-3 h-3" />
                                    <span class="truncate">{{ getFileLocation(file) }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- List View -->
                        <div v-else class="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            <div v-for="file in storageStore.files" :key="file.id"
                                @contextmenu.prevent="openFileContextMenu($event, file)"
                                class="flex items-center gap-4 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer transition-all group">
                                <Icon :name="getFileIcon(file.file_url)" class="w-5 h-5 text-white/40" />
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-white text-xs font-medium truncate">
                                        {{ getFileName(file.file_url, 15, 15) }}
                                    </h4>

                                    <div class="mt-1 flex items-center gap-1 text-[11px] text-white/40">
                                        <Icon :name="getFileLocationIcon(file)" class="w-3 h-3" />
                                        <span class="truncate">{{ getFileLocation(file) }}</span>
                                    </div>
                                </div>
                                <div class="text-white/40 text-xs">{{ formatDate(file.created_at) }}</div>
                                <a @click="handleDownloadFile"
                                    class="opacity-0 group-hover:opacity-100 transition-opacity text-sky-400 hover:text-sky-300">
                                    <Icon name="lucide:download" class="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Context Menu for Folders -->
            <div v-if="showFolderContextMenu" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
                class="fixed z-50 w-48 rounded-xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden backdrop-blur-xl">
                <button @click="handleRenameFolder"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-white text-sm transition-all">
                    <Icon name="lucide:edit" class="w-4 h-4" />
                    <span>Rename</span>
                </button>
                <!-- <button @click="handleShareFolder"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-white text-sm transition-all">
                    <Icon name="lucide:share-2" class="w-4 h-4" />
                    <span>Share</span>
                </button> -->
                <button @click="handleDeleteFolder"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/20 text-red-400 text-sm transition-all border-t border-white/10">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                    <span>Delete</span>
                </button>
            </div>

            <!-- Context Menu for Files -->
            <div v-if="showFileContextMenu" :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
                class="fixed z-50 w-48 rounded-xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden backdrop-blur-xl">
                <button @click="handleDownloadFile"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-white text-sm transition-all">
                    <Icon name="lucide:download" class="w-4 h-4" />
                    <span>Download</span>
                </button>
                <button @click="handleDeleteFile"
                    class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/20 text-red-400 text-sm transition-all border-t border-white/10">
                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                    <span>Delete</span>
                </button>
            </div>

            <!-- Create Folder Modal -->
            <div v-if="showCreateFolderModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                @click.self="showCreateFolderModal = false">
                <div class="w-full max-w-md rounded-2xl bg-slate-900 border border-white/20 p-6 shadow-2xl">
                    <h3 class="text-xl font-bold text-white mb-4">Create New Folder</h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-white/60 text-sm mb-2">Folder Name</label>
                            <input v-model="storageStore.folderForm.name" type="text" placeholder="Enter folder name..."
                                class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500/50" />
                        </div>

                        <div>
                            <label class="block text-white/60 text-sm mb-2">Color</label>
                            <div class="flex gap-2">
                                <button v-for="color in colors" :key="color"
                                    @click="storageStore.folderForm.color = color"
                                    :class="storageStore.folderForm.color === color ? 'ring-2 ring-white' : ''"
                                    class="w-8 h-8 rounded-lg transition-all"
                                    :style="{ backgroundColor: color }"></button>
                            </div>
                        </div>

                        <div>
                            <label class="block text-white/60 text-sm mb-2">Visibility</label>
                            <select v-model="storageStore.folderForm.visibility"
                                class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50">
                                <option value="PRIVATE">Private</option>
                                <!-- <option value="SHARED">Shared</option> -->
                                <option value="PUBLIC">Public</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button @click="showCreateFolderModal = false"
                            class="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
                            Cancel
                        </button>
                        <button @click="createFolder"
                            class="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold transition-all">
                            Create
                        </button>
                    </div>
                </div>
            </div>

            <!-- Click outside to close context menus -->
            <div v-if="showFolderContextMenu || showFileContextMenu" @click="closeContextMenus"
                class="fixed inset-0 z-40">
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStorageStore } from '~/stores/organization/storage.store'
import { useAuthStore } from '~/stores/shared/auth.store'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
});

const storageStore = useStorageStore()
const authStore = useAuthStore()

// UI State
const viewMode = ref('grid')
const searchQuery = ref('')
const currentFolder = ref(null)

// Context Menus
const showFolderContextMenu = ref(false)
const showFileContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const selectedFolder = ref(null)
const selectedFile = ref(null)

function bytesToSize(bytes, decimals = 3) {
    if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
    if (bytes === 0) return "0 B";

    const k = 1024;
    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);

    const value = bytes / Math.pow(k, i);
    const d = i === 0 ? 0 : decimals; // no decimals for bytes
    return `${parseFloat(value.toFixed(d))} ${units[i]}`;
}

const usedStorage = computed(() => bytesToSize(storageStore.usedStorage))
const totalStorage = computed(() => bytesToSize(storageStore.totalStorage))

// Modals
const showCreateFolderModal = ref(false)

function getFileLocation(file) {
    return file.folder_name || 'My Drive'
}
function getFileLocationIcon(file) {
    return file.folder_name ? 'lucide:folder' : 'lucide:hard-drive'
}

// File Input
const fileInput = ref(null)

// Colors for folder customization
const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444']

// Lifecycle
onMounted(async () => {
    await storageStore.fetchFolders()
    await storageStore.fetchFiles()
    document.addEventListener('click', closeContextMenus)
})

onUnmounted(() => {
    document.removeEventListener('click', closeContextMenus)
    storageStore.clearAll()
})

// Navigation
function navigateToRoot() {
    currentFolder.value = null
    storageStore.fetchFolders()
    storageStore.fetchFiles()
}

function openFolder(folder) {
    currentFolder.value = folder
    storageStore.fetchFiles(folder.id)
}

// Search
// let searchTimeout
// function handleSearch() {
//     clearTimeout(searchTimeout)
//     searchTimeout = setTimeout(() => {
//         storageStore.setSearchQuery(searchQuery.value)
//         storageStore.fetchFolders()
//     }, 300)
// }

// File Upload
function triggerFileUpload() {
    fileInput.value?.click()
}

async function handleFileSelect(event) {
    const files = Array.from(event.target.files)
    if (!files.length) return

    const folderId = currentFolder.value?.id || null

    // if (folderId) {
    await storageStore.uploadMultipleFiles(folderId, authStore.admin?.id, files)
    // } else {
    //     const toast = useToast()
    //     toast.error({
    //         title: 'No Folder Selected',
    //         message: 'Please open a folder first to upload files',
    //         timeout: 2000,
    //     })
    // }

    // Reset input
    event.target.value = ''
}

// Drag and Drop
function handleDrop(event) {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    if (!files.length) return

    const folderId = currentFolder.value?.id
    // if (!folderId) {
    //     const toast = useToast()
    //     toast.error({
    //         title: 'No Folder Selected',
    //         message: 'Please open a folder first to upload files',
    //         timeout: 2000,
    //     })
    //     return
    // }

    storageStore.uploadMultipleFiles(folderId, authStore.admin?.id, files)
}

// Folder Operations
function openCreateFolderDialog() {
    storageStore.resetFolderForm()
    showCreateFolderModal.value = true
}

async function createFolder() {
    await storageStore.createFolder(authStore.admin?.id)
    showCreateFolderModal.value = false
}

// Context Menus
function openFolderContextMenu(event, folder) {
    selectedFolder.value = folder
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
    showFolderContextMenu.value = true
    showFileContextMenu.value = false
}

function openFileContextMenu(event, file) {
    selectedFile.value = file
    contextMenuX.value = event.clientX
    contextMenuY.value = event.clientY
    showFileContextMenu.value = true
    showFolderContextMenu.value = false
}

function closeContextMenus() {
    showFolderContextMenu.value = false
    showFileContextMenu.value = false
}

function handleRenameFolder() {
    storageStore.openEditFolderModal(selectedFolder.value)
    closeContextMenus()
    // You'd open an edit modal here
}

function handleFolderDragOver(event) {
    event.preventDefault()
}

function handleFolderDrop(event, folder) {
    event.preventDefault()

    const files = Array.from(event.dataTransfer.files)
    if (!files.length) return

    storageStore.uploadMultipleFiles(
        folder.id,
        authStore.admin?.id,
        files
    )
}

function handleShareFolder() {
    storageStore.openShareFolderModal(selectedFolder.value)
    closeContextMenus()
    // You'd open a share modal here
}

async function handleDeleteFolder() {
    storageStore.deleteFolderId = selectedFolder.value.id
    await storageStore.deleteFolder()
    closeContextMenus()
}

async function handleDeleteFile() {
    storageStore.deleteFileId = selectedFile.value.id
    await storageStore.deleteFile(currentFolder.value?.id)
    closeContextMenus()
}

async function downloadFromUrlFetch(url, filename) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed: ${res.status} ${res.statusText}`);

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename || getNameFromUrl(url);
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(objectUrl);
}

async function handleDownloadFile() {
    const url = getFileUrl(selectedFile.value.file_url)
    const fileName = selectedFile.value.file_url.split('/').pop()
    downloadFromUrlFetch(url, fileName)
    closeContextMenus()
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getFileName(url, startLength = 10, endLength = 10) {
    const fullName = url.split('/').pop() || 'Unknown';

    const lastDotIndex = fullName.lastIndexOf('.');
    if (lastDotIndex === -1) return fullName;

    const name = fullName.slice(0, lastDotIndex);
    const ext = fullName.slice(lastDotIndex);

    if (name.length <= startLength + endLength) {
        return fullName;
    }

    const start = name.slice(0, startLength);
    const end = name.slice(-endLength);

    return `${start}....${end}${ext}`;
}

function isImage(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
}

function getFileUrl(url) {
    const base = `${useRuntimeConfig().public.apiBase}${url}`
    if (String(url).startsWith('/file/') && typeof document !== 'undefined') {
        const match = document.cookie.split('; ').find(r => r.startsWith('ADMIN_ACCESS_KEY='))
        if (match) {
            const token = decodeURIComponent(match.slice('ADMIN_ACCESS_KEY='.length))
            if (token) return `${base}?token=${encodeURIComponent(token)}`
        }
    }
    return base
}
function getFileIcon(url) {
    const ext = url.split('.').pop()?.toLowerCase()
    const iconMap = {
        pdf: 'lucide:file-text',
        doc: 'lucide:file-text',
        docx: 'lucide:file-text',
        xls: 'lucide:sheet',
        xlsx: 'lucide:sheet',
        csv: 'lucide:sheet',
        zip: 'lucide:file-archive',
        mp4: 'lucide:video',
        mp3: 'lucide:music',
        jpg: 'lucide:image',
        jpeg: 'lucide:image',
        png: 'lucide:image',
        gif: 'lucide:image',
    }
    return iconMap[ext] || 'lucide:file'
}
</script>