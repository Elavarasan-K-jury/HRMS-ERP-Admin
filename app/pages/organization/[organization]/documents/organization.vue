<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Organization Documents</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents in these folders can be uploaded/filled by admin. All these documents are available for viewing by all employees.</p>
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
            <p class="text-xs text-white/50 text-center max-w-sm">Create your first document folder to organize organization documents.</p>
            <UiButton @click="openAddFolder" color="#4aff7a" text="+ Add Document Folder" prepend-icon="ion:add-circle" size="md" class="mt-2" />
        </div>

        <!-- Two-column layout -->
        <div v-else class="grid grid-cols-12 gap-3 flex-1 min-h-0">
            <!-- LEFT: folder navigation -->
            <div class="col-span-12 md:col-span-4 lg:col-span-3 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col min-h-[300px]">
                <div class="px-4 py-3 border-b border-white/10 bg-white/5">
                    <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Organization Document Folders ({{ store.folders?.length || 0 }})</p>
                </div>
                <OrgFolderNavigation
                    :folders="store.folders"
                    :selected-id="store.selectedFolderId"
                    :loading="store.foldersLoading"
                    :error="!!foldersError"
                    class="flex-1 min-h-0"
                    @select="onSelectFolder"
                    @search="onFolderSearch"
                    @refresh="reload"
                />
                <div v-if="foldersError" class="p-3 text-center text-white/50 text-xs">Unable to load folders.</div>
            </div>

            <!-- RIGHT: folder detail + documents -->
            <div class="col-span-12 md:col-span-8 lg:col-span-9 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col min-h-[400px]">
                <template v-if="selectedFolder">
                    <!-- Folder header with targeting summary -->
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
                                    <p class="text-xs text-white/45 mt-2">
                                        <span class="text-emerald-300/80">Applicable to:</span> {{ targetingSummary || 'All Employees' }}
                                    </p>
                                    <button v-if="store.applicableEmployeesTotal > 0" type="button" class="mt-2 text-xs text-emerald-300/80 hover:text-emerald-200" @click="showApplicableModal = true">
                                        {{ store.applicableEmployeesTotal }} employees
                                    </button>
                                </div>
                            </div>
                            <span class="relative shrink-0">
                                <button type="button" class="p-1.5 rounded-lg" :class="menuOpen ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'" @click="menuOpen = !menuOpen">
                                    <Icon name="lucide:more-horizontal" class="w-5 h-5" />
                                </button>
                                <div v-if="menuOpen" class="absolute right-0 top-full z-40 mt-1 w-48 rounded-lg border border-white/10 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl p-1">
                                    <button type="button" class="menu-item" @click="openEditFolder"><Icon name="lucide:pencil" class="w-4 h-4" /> Edit Folder</button>
                                    <div class="my-1 border-t border-white/10" />
                                    <button type="button" class="menu-item-danger" @click="confirmDeleteFolder"><Icon name="lucide:trash-2" class="w-4 h-4" /> Delete Folder</button>
                                </div>
                            </span>
                        </div>
                    </div>

                    <!-- Documents area -->
                    <div class="flex-1 overflow-y-auto p-5">
                        <!-- Toolbar: search + lifecycle filter + sort + add -->
                        <div class="flex items-center gap-3 mb-4 flex-wrap">
                            <div class="relative flex-1 min-w-[200px] max-w-sm">
                                <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                                <input v-model="docSearchInput" type="text" placeholder="Search documents..."
                                    class="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-white placeholder-white/35 outline-none focus:border-emerald-300/50 transition-colors" />
                                <button v-if="docSearchInput" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60" @click="clearDocSearch">
                                    <Icon name="ion:close-circle" class="w-4 h-4" />
                                </button>
                            </div>
                            <select :value="docLifecycleFilter" @change="onLifecycleFilterChange($event.target.value)" class="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-white/80 outline-none focus:border-emerald-300/50 cursor-pointer">
                                <option v-for="opt in LIFECYCLE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                            </select>
                            <select v-model="docSortField" class="px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-white/80 outline-none focus:border-emerald-300/50 cursor-pointer">
                                <option value="created_at">Created Date</option>
                                <option value="updated_at">Updated Date</option>
                                <option value="expiry_date">Expiry Date</option>
                                <option value="name">Name</option>
                            </select>
                            <button type="button" class="p-2 rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/10 transition-colors" :title="docSortOrder === 'desc' ? 'Newest first' : 'Oldest first'" @click="toggleSortOrder">
                                <Icon :name="docSortOrder === 'desc' ? 'ion:arrow-down' : 'ion:arrow-up'" class="w-4 h-4 text-white/60" />
                            </button>
                            <UiButton @click="openAddDocument" color="#4aff7a" text="+ Add Document" prepend-icon="ion:add-circle" size="sm" :disabled="store.saving" />
                        </div>

                        <!-- Loading skeleton -->
                        <div v-if="store.documentsLoading" class="space-y-2">
                            <div v-for="i in 4" :key="i" class="animate-pulse p-4 rounded-lg bg-white/5 border border-white/10">
                                <div class="flex items-center gap-3">
                                    <div class="skeleton w-9 h-9 rounded-lg" />
                                    <div class="flex-1 space-y-2">
                                        <div class="skeleton w-40 h-4" />
                                        <div class="skeleton w-24 h-3" />
                                    </div>
                                    <div class="skeleton w-16 h-4" />
                                </div>
                            </div>
                        </div>

                        <!-- Empty: no documents at all -->
                        <div v-else-if="!store.documents.length && !store.documentsSearch && !docLifecycleFilter" class="rounded-lg border border-dashed border-white/15 py-10 flex flex-col items-center gap-2 text-white/45">
                            <Icon name="ion:document-text-outline" class="w-8 h-8 opacity-50" />
                            <p class="text-sm">No documents in this folder yet</p>
                            <UiButton @click="openAddDocument" color="#4aff7a" text="+ Add Document" prepend-icon="ion:add-circle" size="sm" class="mt-1" />
                        </div>

                        <!-- Empty: lifecycle filter returned nothing -->
                        <div v-else-if="!store.documents.length && docLifecycleFilter" class="rounded-lg border border-dashed border-white/15 py-10 flex flex-col items-center gap-2 text-white/45">
                            <Icon name="ion:filter-outline" class="w-8 h-8 opacity-50" />
                            <p class="text-sm">No {{ lifecycleLabel(docLifecycleFilter).toLowerCase() }} documents</p>
                            <button type="button" class="text-xs text-emerald-300 hover:text-emerald-200 underline mt-1" @click="clearLifecycleFilter">Clear Filter</button>
                        </div>

                        <!-- Empty: search returned nothing -->
                        <div v-else-if="!store.documents.length && store.documentsSearch" class="rounded-lg border border-dashed border-white/15 py-10 flex flex-col items-center gap-2 text-white/45">
                            <Icon name="ion:search-outline" class="w-8 h-8 opacity-50" />
                            <p class="text-sm">No documents match your search</p>
                            <button type="button" class="text-xs text-emerald-300 hover:text-emerald-200 underline mt-1" @click="clearDocSearch">Clear Search</button>
                        </div>

                        <!-- Document list -->
                        <div v-else class="space-y-2">
                            <div v-for="doc in store.documents" :key="doc.id"
                                class="group rounded-lg border border-white/10 bg-white/5 p-4 flex items-center gap-3 hover:bg-white/[0.08] transition-colors cursor-pointer"
                                @click="openDetailDrawer(doc)">
                                <span class="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Icon name="ion:document-text-outline" class="w-4.5 h-4.5 text-emerald-300" />
                                </span>
                                <div class="min-w-0 flex-1">
                                    <span class="block text-sm font-medium text-white/90 truncate">{{ doc.name }}</span>
                                    <span class="block text-xs text-white/45">{{ doc.file_name || 'No file' }}{{ doc.file_size ? ' · ' + formatFileSize(doc.file_size) : '' }}</span>
                                    <span v-if="doc.ask_expiry_date && doc.expiry_date" class="block text-xs text-white/40 mt-0.5">{{ expiryDisplayText(doc) }}</span>
                                </div>
                                <div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border" :class="lifecycleBadgeClass(doc.expiry_status)">
                                        <Icon :name="lifecycleBadgeIcon(doc.expiry_status)" class="w-3 h-3" />
                                        {{ lifecycleLabel(doc.expiry_status) }}
                                    </span>
                                    <span v-if="doc.acknowledgement_required" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-sky-500/15 text-sky-300">Acknowledgement Required</span>
                                    <span v-if="doc.block_until_acknowledged" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-300">Portal Block</span>
                                    <span v-if="doc.allow_download" class="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300">Downloadable</span>
                                </div>
                                <div class="relative shrink-0">
                                    <button type="button" class="p-1.5 rounded-lg text-white/30 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" @click.stop="openDocMenu(doc, $event)">
                                        <Icon name="lucide:more-horizontal" class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Pagination -->
                        <div v-if="store.documentsTotalPages > 1" class="mt-4 px-4 py-3 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between">
                            <p class="text-xs text-white/45">
                                Page {{ store.documentsPage }} of {{ store.documentsTotalPages }} ({{ store.documentsTotal }} total)
                            </p>
                            <div class="flex items-center gap-1">
                                <button type="button" class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                                    :class="store.documentsPage <= 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                                    :disabled="store.documentsPage <= 1" @click="pagePrev">Previous</button>
                                <button type="button" class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                                    :class="store.documentsPage >= store.documentsTotalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                                    :disabled="store.documentsPage >= store.documentsTotalPages" @click="pageNext">Next</button>
                            </div>
                        </div>
                    </div>
                </template>

                <div v-else class="flex-1 flex items-center justify-center text-sm text-white/40">Select a folder to view its documents.</div>
            </div>
        </div>

        <!-- Document context menu (positioned absolutely) -->
        <Teleport to="body">
            <div v-if="docMenuTarget" class="fixed z-50 w-44 rounded-lg border border-white/10 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl p-1" :style="docMenuStyle">
                <button type="button" class="menu-item" @click="openDetailDrawer(docMenuTarget); closeDocMenu()"><Icon name="lucide:eye" class="w-4 h-4" /> View Details</button>
                <button type="button" class="menu-item" @click="openEditDocument"><Icon name="lucide:pencil" class="w-4 h-4" /> Edit Document</button>
                <div class="my-1 border-t border-white/10" />
                <button type="button" class="menu-item-danger" @click="confirmDeleteDocument"><Icon name="lucide:trash-2" class="w-4 h-4" /> Delete Document</button>
            </div>
        </Teleport>

        <!-- Folder create/edit drawer -->
        <OrgDocFolderFormDrawer v-model="folderFormOpen" :folder="editingFolder" :organization-id="orgId" @saved="onFolderSaved" />

        <!-- Document create/edit drawer -->
        <OrgDocumentFormDrawer v-model="docFormOpen" :document="editingDocument" :folder-id="selectedFolder?.id" :organization-id="orgId" @saved="onDocumentSaved" />

        <!-- Document detail drawer -->
        <OrgDocumentDetailDrawer v-model="detailDrawerOpen" :document-id="detailDocumentId" :organization-id="orgId" @edit="onDetailEdit" @view-applicable="onDetailViewMonitoring" @view-monitoring="onDetailViewMonitoring" />

        <!-- Document monitoring drawer -->
        <OrgDocumentMonitoringDrawer v-model="monitoringDrawerOpen" :document-id="monitoringDocumentId" :document-name="monitoringDocumentName" :folder-id="monitoringFolderId" :organization-id="orgId" />

        <!-- Delete folder confirmation -->
        <UiModal v-model="deleteFolderModal" title="Delete Folder?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteFolderTarget?.name }}"</span>?</p>
                <p class="mt-2 text-xs text-white/45">This folder and its organization documents will be affected.</p>
            </template>
            <template #footer>
                <UiButton @click="deleteFolderModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doDeleteFolder" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleting" :loading="deleting" />
            </template>
        </UiModal>

        <!-- Delete document confirmation -->
        <UiModal v-model="deleteDocModal" title="Delete Document?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteDocTarget?.name }}"</span>?</p>
                <p class="mt-2 text-xs text-white/45">This action cannot be undone.</p>
            </template>
            <template #footer>
                <UiButton @click="deleteDocModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doDeleteDocument" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleting" :loading="deleting" />
            </template>
        </UiModal>

        <!-- Applicable employees modal -->
        <UiModal v-model="showApplicableModal" title="Applicable Employees" size="lg">
            <template #default>
                <div v-if="store.applicableEmployeesLoading" class="space-y-2">
                    <div v-for="i in 5" :key="i" class="animate-pulse flex items-center gap-3 p-2">
                        <div class="skeleton w-8 h-8 rounded-full" />
                        <div class="flex-1 space-y-1"><div class="skeleton w-32 h-3" /><div class="skeleton w-20 h-2" /></div>
                    </div>
                </div>
                <div v-else-if="!store.applicableEmployees.length" class="text-center py-6 text-white/45 text-sm">No employees match the targeting criteria.</div>
                <div v-else class="max-h-80 overflow-y-auto space-y-1">
                    <div v-for="emp in store.applicableEmployees" :key="emp.employee_id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                        <span class="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-semibold text-emerald-300 shrink-0">
                            {{ emp.full_name?.charAt(0) || '?' }}
                        </span>
                        <div class="min-w-0 flex-1">
                            <span class="block text-sm text-white/90 truncate">{{ emp.full_name }}</span>
                            <span class="block text-xs text-white/45">{{ emp.employee_code }}{{ emp.department_name ? ' · ' + emp.department_name : '' }}</span>
                        </div>
                        <span class="text-xs text-white/35 shrink-0">{{ emp.branch_name }}</span>
                    </div>
                </div>
            </template>
            <template #footer>
                <UiButton @click="showApplicableModal = false" color="#fff" text="Close" prepend-icon="ion:close-circle" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useOrganizationDocumentStore } from '~/stores/organization/organizationDocument.store'
import OrgFolderNavigation from '~/components/organization-documents/OrgFolderNavigation.vue'
import OrgDocFolderFormDrawer from '~/components/organization-documents/OrgDocFolderFormDrawer.vue'
import OrgDocumentFormDrawer from '~/components/organization-documents/OrgDocumentFormDrawer.vue'
import OrgDocumentDetailDrawer from '~/components/organization-documents/OrgDocumentDetailDrawer.vue'
import OrgDocumentMonitoringDrawer from '~/components/organization-documents/OrgDocumentMonitoringDrawer.vue'
import { LIFECYCLE_OPTIONS, lifecycleLabel, lifecycleBadgeClass, lifecycleBadgeIcon, expiryDisplayText, formatFileSize } from '~/utils/orgDocument'

definePageMeta({ layout: 'organization', key: route => route.fullPath })

const route = useRoute()
const orgId = computed(() => route.params.organization)
const store = useOrganizationDocumentStore()

const foldersError = ref(false)
const menuOpen = ref(false)
const folderFormOpen = ref(false)
const editingFolder = ref(null)
const deleteFolderModal = ref(false)
const deleteFolderTarget = ref(null)
const deleting = ref(false)
const showApplicableModal = ref(false)

// Document search + sort
const docSearchInput = ref('')
const docSortField = ref('created_at')
const docSortOrder = ref('desc')
const docLifecycleFilter = ref('')
let searchDebounce = null

// Document form
const docFormOpen = ref(false)
const editingDocument = ref(null)
const docMenuTarget = ref(null)
const docMenuStyle = ref({})
const deleteDocModal = ref(false)
const deleteDocTarget = ref(null)

// Document detail
const detailDrawerOpen = ref(false)
const detailDocumentId = ref(null)

// Document monitoring
const monitoringDrawerOpen = ref(false)
const monitoringDocumentId = ref(null)
const monitoringDocumentName = ref('')
const monitoringFolderId = ref(null)

const selectedFolder = computed(() => store.selectedFolder)

const targetingSummary = computed(() => {
    if (!selectedFolder.value) return ''
    const parts = []
    const f = selectedFolder.value
    if (f.legal_entity_names?.length) parts.push(f.legal_entity_names.join(', '))
    if (f.branch_names?.length) parts.push(f.branch_names.join(', '))
    if (f.location_names?.length) parts.push(f.location_names.join(', '))
    if (f.department_names?.length || f.sub_department_names?.length) {
        const deps = [...(f.department_names || []), ...(f.sub_department_names || [])]
        parts.push(deps.join(', '))
    }
    if (f.worker_types?.length) parts.push(f.worker_types.join(', '))
    return parts.join(' · ') || ''
})

function closeDocMenu() { docMenuTarget.value = null }

onMounted(() => { document.addEventListener('click', closeDocMenu) })
onBeforeUnmount(() => { document.removeEventListener('click', closeDocMenu); clearTimeout(searchDebounce) })

function fetchDocs(opts = {}) {
    if (!selectedFolder.value?.id) return
    store.fetchDocuments(orgId.value, selectedFolder.value.id, opts)
}

function debounceFetchDocs() {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        fetchDocs({ search: docSearchInput.value, page: 1 })
    }, 300)
}

function clearDocSearch() {
    docSearchInput.value = ''
    fetchDocs({ search: '', page: 1 })
}

function clearLifecycleFilter() {
    docLifecycleFilter.value = ''
    fetchDocs({ expiry_status: '', page: 1 })
}

function toggleSortOrder() {
    docSortOrder.value = docSortOrder.value === 'desc' ? 'asc' : 'desc'
    fetchDocs({ sort_by: docSortField.value, sort_order: docSortOrder.value, page: 1 })
}

function onLifecycleFilterChange(value) {
    docLifecycleFilter.value = value
    fetchDocs({ expiry_status: value, page: 1 })
}

function pagePrev() {
    if (store.documentsPage > 1) fetchDocs({ page: store.documentsPage - 1 })
}

function pageNext() {
    if (store.documentsPage < store.documentsTotalPages) fetchDocs({ page: store.documentsPage + 1 })
}

async function reload() {
    foldersError.value = false
    try {
        await store.fetchFolders(orgId.value)
        if (selectedFolder.value?.id) {
            await Promise.all([
                fetchDocs({ page: 1 }),
                store.fetchApplicableEmployees(orgId.value, selectedFolder.value.id),
            ])
        }
    } catch (e) {
        foldersError.value = true
    }
}

function onSelectFolder(folder) {
    store.selectFolder(folder.id)
    menuOpen.value = false
    closeDocMenu()
    docSearchInput.value = ''
    docSortField.value = 'created_at'
    docSortOrder.value = 'desc'
    docLifecycleFilter.value = ''
    fetchDocs({ search: '', sort_by: 'created_at', sort_order: 'desc', expiry_status: '', page: 1 })
    store.fetchApplicableEmployees(orgId.value, folder.id)
}

function onFolderSearch(term) {
    store.fetchFolders(orgId.value, { search: term, page: 1 })
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
    await store.fetchFolders(orgId.value)
    if (store.selectedFolder?.id) {
        await fetchDocs()
        await store.fetchApplicableEmployees(orgId.value, store.selectedFolder.id)
    }
}

function confirmDeleteFolder() {
    deleteFolderTarget.value = selectedFolder.value
    deleteFolderModal.value = true
    menuOpen.value = false
}

async function doDeleteFolder() {
    if (!deleteFolderTarget.value) return
    deleting.value = true
    try {
        await store.deleteFolder(orgId.value, deleteFolderTarget.value.id)
        deleteFolderModal.value = false
    } catch (e) {
        // store toast
    } finally {
        deleting.value = false
    }
}

/* Document functions */

function openAddDocument() {
    editingDocument.value = null
    docFormOpen.value = true
}

function openEditDocument() {
    editingDocument.value = docMenuTarget.value
    docFormOpen.value = true
    closeDocMenu()
}

function openDetailDrawer(doc) {
    detailDocumentId.value = doc.id
    detailDrawerOpen.value = true
}

function onDetailEdit(doc) {
    detailDrawerOpen.value = false
    editingDocument.value = doc
    docFormOpen.value = true
}

function onDetailViewMonitoring(doc) {
    detailDrawerOpen.value = false
    monitoringDocumentId.value = doc.id
    monitoringDocumentName.value = doc.name || ''
    monitoringFolderId.value = doc.folder_id || selectedFolder.value?.id || null
    monitoringDrawerOpen.value = true
}

function openDocMenu(doc, event) {
    event.stopPropagation()
    docMenuTarget.value = doc
    docMenuStyle.value = {
        top: `${event.clientY}px`,
        left: `${Math.min(event.clientX, window.innerWidth - 200)}px`,
    }
}

function confirmDeleteDocument() {
    deleteDocTarget.value = docMenuTarget.value
    deleteDocModal.value = true
    closeDocMenu()
}

async function doDeleteDocument() {
    if (!deleteDocTarget.value) return
    deleting.value = true
    try {
        await store.deleteDocument(orgId.value, deleteDocTarget.value.id)
        deleteDocModal.value = false
        detailDrawerOpen.value = false
    } catch (e) {
        // store toast
    } finally {
        deleting.value = false
    }
}

async function onDocumentSaved() {
    if (store.selectedFolder?.id) {
        await fetchDocs()
        await store.fetchApplicableEmployees(orgId.value, store.selectedFolder.id)
    }
    await store.fetchFolders(orgId.value)
}

watch(docSearchInput, () => { debounceFetchDocs() })

watch(docSortField, (v) => {
    fetchDocs({ sort_by: v, sort_order: docSortOrder.value, page: 1 })
})

watch(() => orgId.value, (v) => { if (v) reload() })
onMounted(async () => { if (orgId.value) await reload() })
</script>

<style scoped>
.menu-item {
    @apply flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 rounded-lg hover:bg-white/10 transition-colors;
}
.menu-item-danger {
    @apply flex items-center gap-2 w-full px-3 py-2 text-sm text-red-300 rounded-lg hover:bg-red-500/10 transition-colors;
}
</style>
