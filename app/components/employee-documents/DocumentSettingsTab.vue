<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Employee document settings</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents in these folders can be uploaded/filed by employee or generated from letter templates by HR/Managers. They are visible in each employee's profile.</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <UiButton @click="openAddFolder" color="#4aff7a" text="+ Add Document Folder" prepend-icon="ion:add-circle" :disabled="store.saving" />
                <UiButton @click="reload" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="store.foldersLoading" />
            </div>
        </div>

        <!-- Empty state: no folders -->
        <div v-if="!store.foldersLoading && !store.folders?.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:folder-open-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">No document folders found</p>
            <p class="text-xs text-white/50 text-center max-w-sm">Create your first document folder to start configuring employee documents.</p>
            <UiButton @click="openAddFolder" color="#4aff7a" text="+ Add Document Folder" prepend-icon="ion:add-circle" size="md" class="mt-2" />
        </div>

        <!-- Two-column layout -->
        <div v-else class="grid grid-cols-12 gap-3 flex-1 min-h-0">
            <!-- LEFT: folder navigation -->
            <div class="col-span-12 md:col-span-4 lg:col-span-3 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col min-h-[300px]">
                <div class="px-4 py-3 border-b border-white/10 bg-white/5">
                    <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Document Folders ({{ store.folders?.length || 0 }})</p>
                </div>
                <FolderNavigation
                    :folders="store.folders"
                    :selected-id="store.selectedFolderId"
                    :loading="store.foldersLoading"
                    :error="foldersError"
                    class="flex-1 min-h-0"
                    @select="onSelectFolder"
                    @search="onFolderSearch"
                    @refresh="reload"
                />
                <div v-if="foldersError" class="p-3 text-center text-white/50 text-xs">Unable to load folders.</div>
            </div>

            <!-- RIGHT: folder detail -->
            <div class="col-span-12 md:col-span-8 lg:col-span-9 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col min-h-[400px]">
                <template v-if="selectedFolder">
                    <!-- Folder header -->
                    <div class="px-5 py-4 border-b border-white/10 bg-white/5">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0 flex items-start gap-3">
                                <span class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center shrink-0">
                                    <Icon name="ion:folder" class="w-5 h-5 text-emerald-300" />
                                </span>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-2">
                                        <h3 class="text-lg font-semibold text-white/90 truncate">{{ selectedFolder.name }}</h3>
                                        <Icon v-if="selectedFolder.is_confidential" name="ion:lock-closed" class="w-4 h-4 text-amber-300/80" />
                                        <span v-if="!selectedFolder.is_active" class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/50">Inactive</span>
                                    </div>
                                    <p v-if="selectedFolder.description" class="text-sm text-white/60 mt-1">{{ selectedFolder.description }}</p>
                                    <p v-if="permissionSummary" class="text-xs text-white/45 mt-2">
                                        <span class="text-emerald-300/80">Permissions:</span> {{ permissionSummary }}
                                    </p>
                                </div>
                            </div>
                            <span class="relative shrink-0">
                                <button type="button" class="p-1.5 rounded-lg" :class="menuOpen ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'" @click="menuOpen = !menuOpen">
                                    <Icon name="lucide:more-horizontal" class="w-5 h-5" />
                                </button>
                                <div v-if="menuOpen" class="absolute right-0 top-full z-40 mt-1 w-44 rounded-lg border border-white/10 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl p-1">
                                    <button type="button" class="menu-item" @click="openEditFolder"><Icon name="lucide:pencil" class="w-4 h-4" /> Edit</button>
                                    <div class="my-1 border-t border-white/10" />
                                    <button type="button" class="menu-item-danger" @click="confirmDeleteFolder"><Icon name="lucide:trash-2" class="w-4 h-4" /> Delete</button>
                                </div>
                            </span>
                        </div>
                    </div>

                    <!-- Document types -->
                    <div class="flex-1 overflow-y-auto p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <h4 class="text-sm font-semibold text-white/80">Document Types ({{ store.documentTypes.length }})</h4>
                            <UiButton @click="openAddType" color="#4aff7a" text="+ Add Document Type" prepend-icon="ion:add-circle" size="sm" />
                        </div>

                        <!-- Loading -->
                        <div v-if="store.documentTypesLoading" class="space-y-2">
                            <div v-for="i in 3" :key="i" class="animate-pulse p-4 rounded-lg bg-white/5 border border-white/10">
                                <div class="skeleton w-40 h-4 mb-2" />
                                <div class="skeleton w-24 h-3" />
                            </div>
                        </div>

                        <!-- Empty -->
                        <div v-else-if="!store.documentTypes.length" class="rounded-lg border border-dashed border-white/15 py-10 flex flex-col items-center gap-2 text-white/45">
                            <Icon name="ion:document-text-outline" class="w-8 h-8 opacity-50" />
                            <p class="text-sm">No document types found</p>
                            <UiButton @click="openAddType" color="#4aff7a" text="+ Add Document Type" prepend-icon="ion:add-circle" size="sm" class="mt-1" />
                        </div>

                        <!-- Cards -->
                        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            <div v-for="t in store.documentTypes" :key="t.id" class="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-2 hover:border-emerald-400/30 transition-colors relative group">
                                <div class="flex items-start justify-between gap-2">
                                    <button type="button" class="text-left min-w-0" @click="openEditType(t)">
                                        <span class="block text-sm font-semibold text-white/90 truncate">{{ t.name }}</span>
                                    </button>
                                    <span class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" class="p-1 rounded-lg hover:bg-white/10 text-white/50" title="Edit" @click="openEditType(t)">
                                            <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                </div>
                                <div class="flex flex-wrap gap-1.5">
                                    <span v-if="t.is_mandatory" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">Document Required</span>
                                    <span v-if="t.is_verification_required" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-sky-500/15 text-sky-300 border border-sky-400/20">Verification Required</span>
                                    <span v-if="t.is_multiple" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-violet-500/15 text-violet-300 border border-violet-400/20">Multiple Documents</span>
                                    <span v-if="!t.is_file_upload_enabled" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/50 border border-white/10">File Upload Disabled</span>
                                    <span v-if="t.ask_expiry_date" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300 border border-amber-400/20">Expiry Date Required</span>
                                    <span v-if="t.is_appliable_na" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/50 border border-white/10">Can mark N/A</span>
                                </div>
                                <div class="mt-auto flex items-center justify-between text-[11px] text-white/45">
                                    <span>{{ t.field_count }} fields</span>
                                    <button type="button" class="p-1 rounded-lg hover:bg-red-500/10 text-white/35 hover:text-red-300" title="Delete" @click="confirmDeleteType(t)">
                                        <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- No folder selected -->
                <div v-else class="flex-1 flex items-center justify-center text-sm text-white/40">Select a folder to view its document types.</div>
            </div>
        </div>

        <!-- Folder create/edit drawer -->
        <FolderFormDrawer v-model="folderFormOpen" :folder="editingFolder" @saved="onFolderSaved" />

        <!-- Document type create/manage drawer -->
        <DocumentTypeFormDrawer
            v-model="typeFormOpen"
            :folder-id="selectedFolder?.id"
            :document-type="editingType"
            @saved="onTypeSaved"
        />

        <!-- Delete folder confirmation -->
        <UiModal v-model="deleteFolderModal" title="Delete Document Folder?" size="sm">
            <template #default>
                <p v-if="deleteFolderBlocked" class="text-amber-300 text-sm">This folder contains document types and cannot be deleted.</p>
                <template v-else>
                    <p class="text-white/85 text-sm">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteFolderTarget?.name }}"</span>?</p>
                    <p class="mt-2 text-xs text-white/45">This will soft-delete the folder.</p>
                </template>
            </template>
            <template #footer>
                <UiButton @click="deleteFolderModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doDeleteFolder" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleteFolderBlocked || deleting" :loading="deleting" />
            </template>
        </UiModal>

        <!-- Delete type confirmation -->
        <UiModal v-model="deleteTypeModal" title="Delete Document Type?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteTypeTarget?.name }}"</span>?</p>
                <p class="mt-2 text-xs text-white/45">This will soft-delete the document type.</p>
            </template>
            <template #footer>
                <UiButton @click="deleteTypeModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doDeleteType" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleting" :loading="deleting" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import FolderNavigation from './FolderNavigation.vue'
import FolderFormDrawer from './FolderFormDrawer.vue'
import DocumentTypeFormDrawer from './DocumentTypeFormDrawer.vue'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()

const foldersError = ref(false)
const menuOpen = ref(false)
const folderFormOpen = ref(false)
const editingFolder = ref(null)
const typeFormOpen = ref(false)
const editingType = ref(null)
const deleteFolderModal = ref(false)
const deleteFolderBlocked = ref(false)
const deleteFolderTarget = ref(null)
const deleteTypeModal = ref(false)
const deleteTypeTarget = ref(null)
const deleting = ref(false)

const selectedFolder = computed(() => store.selectedFolder)

const permissionSummary = computed(() => {
    const perms = selectedFolder.value?.permissions || []
    const viewers = perms.filter(p => p.canViewDocuments).map(p => p.role)
    const editors = perms.filter(p => p.canAddUpdateDocuments).map(p => p.role)
    const parts = []
    if (viewers.length) parts.push('View - ' + viewers.join(', '))
    if (editors.length) parts.push('Add & Update - ' + editors.join(', '))
    return parts.join(' • ')
})

async function reload() {
    foldersError.value = false
    try {
        await store.fetchFolders(props.organizationId)
        if (store.selectedFolder?.id) await store.fetchDocumentTypes(store.selectedFolder.id, { limit: 50 })
    } catch (e) {
        foldersError.value = true
        console.error('[docSettings] reload error:', e)
    }
}

function onSelectFolder(folder) {
    store.selectFolder(folder.id)
    menuOpen.value = false
    store.fetchDocumentTypes(folder.id, { limit: 50 })
}

function onFolderSearch(term) {
    store.fetchFolders(props.organizationId, { search: term, page: 1 })
}

function openAddFolder() {
    editingFolder.value = null
    folderFormOpen.value = true
}
function openEditFolder() {
    editingFolder.value = selectedFolder.value
    folderFormOpen.value = true
    menuOpen.value = false
}

async function onFolderSaved() {
    await store.fetchFolders(props.organizationId)
    if (store.selectedFolder?.id) await store.fetchDocumentTypes(store.selectedFolder.id, { limit: 50 })
}

function openAddType() {
    editingType.value = null
    typeFormOpen.value = true
}
function openEditType(t) {
    editingType.value = t
    typeFormOpen.value = true
}
async function onTypeSaved() {
    if (selectedFolder?.id) await store.fetchDocumentTypes(selectedFolder.id, { limit: 50 })
    // Refresh the selected folder to update document_type_count
    await store.fetchFolders(props.organizationId)
}

function confirmDeleteFolder() {
    const f = selectedFolder.value
    deleteFolderTarget.value = f
    deleteFolderBlocked.value = (f?.document_type_count || 0) > 0
    deleteFolderModal.value = true
    menuOpen.value = false
}
async function doDeleteFolder() {
    if (!deleteFolderTarget.value) return
    deleting.value = true
    try {
        await store.deleteFolder(deleteFolderTarget.value.id)
        deleteFolderModal.value = false
    } catch (e) {
        // store toast
    } finally {
        deleting.value = false
    }
}

function confirmDeleteType(t) {
    deleteTypeTarget.value = t
    deleteTypeModal.value = true
}
async function doDeleteType() {
    if (!deleteTypeTarget.value || !selectedFolder.value) return
    deleting.value = true
    try {
        await store.deleteDocumentType(selectedFolder.value.id, deleteTypeTarget.value.id)
        deleteTypeModal.value = false
    } catch (e) {
        // store toast
    } finally {
        deleting.value = false
    }
}

watch(() => props.organizationId, (v) => { if (v) reload() })
watch(() => store.selectedFolderId, (id) => {
    if (id) store.fetchDocumentTypes(id, { limit: 50 })
})

onMounted(async () => {
    if (props.organizationId) {
        await reload()
    }
})
</script>
