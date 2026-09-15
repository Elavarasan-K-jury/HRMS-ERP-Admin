<template>
    <section class="doc-layout">
        <aside class="sidebar">
            <div class="sidebar-hdr">
                <Icon name="lucide:folder-open" class="h-4 w-4 text-white/60" />
                <span class="sidebar-title">Documents</span>
            </div>

            <div class="sidebar-section">
                <p class="section-label">ACTIONS</p>
                <button class="sidebar-item" :class="{ active: selectedFolder === null }" @click="selectFolder(null)">
                    <div class="sidebar-item-left">
                        <Icon name="lucide:inbox" class="h-4 w-4" />
                        <span>Pending Documents</span>
                    </div>
                    <span class="badge">{{ pendingCount }}</span>
                </button>
            </div>

            <div v-if="folders.length" class="sidebar-section">
                <p class="section-label">FOLDERS</p>
                <button v-for="folder in folders" :key="folder.id" class="sidebar-item" :class="{ active: selectedFolder === folder.id }" @click="selectFolder(folder.id)">
                    <div class="sidebar-item-left">
                        <Icon name="lucide:folder" class="h-4 w-4" />
                        <span>{{ folder.name }}</span>
                    </div>
                    <span class="badge">{{ folder.count }}</span>
                </button>
            </div>
        </aside>

        <div class="main-content">
            <div class="main-header">
                <div>
                    <h2 class="main-title">{{ activeViewTitle }}</h2>
                    <p class="main-subtitle">{{ filteredDocTypes.length }} document{{ filteredDocTypes.length !== 1 ? 's' : '' }}</p>
                </div>
                <div class="search-box">
                    <Icon name="lucide:search" class="h-4 w-4 text-white/40" />
                    <input v-model="searchQuery" type="text" placeholder="Search documents..." class="search-input" />
                </div>
            </div>

            <div v-if="loading" class="skeleton-list">
                <div v-for="i in 5" :key="i" class="skeleton-row">
                    <div class="skeleton-icon"></div>
                    <div class="skeleton-lines">
                        <div class="skeleton-line w-48"></div>
                        <div class="skeleton-line w-32"></div>
                    </div>
                </div>
            </div>

            <div v-else-if="error" class="error-state">
                <Icon name="lucide:alert-circle" class="h-10 w-10 text-red-400/70 mb-3" />
                <p class="text-sm text-white/60 mb-3">{{ error }}</p>
                <button class="retry-btn" @click="loadData">
                    <Icon name="lucide:refresh-cw" class="h-4 w-4" /> Retry
                </button>
            </div>

            <div v-else-if="filteredDocTypes.length === 0" class="empty-state">
                <Icon name="lucide:file-question" class="h-10 w-10 text-white/25 mb-3" />
                <p class="text-sm text-white/50">No documents assigned</p>
                <p class="text-xs text-white/35 mt-1">Your assigned employee documents will appear here.</p>
            </div>

            <div v-else class="doc-list">
                <div v-for="dt in filteredDocTypes" :key="dt.document_type_id" class="doc-card" :class="{ 'doc-card--verified': dt.state === 'VERIFIED', 'doc-card--pending': dt.state === 'PENDING_VERIFICATION' }">
                    <div class="doc-card-header">
                        <div class="doc-card-left">
                            <div class="doc-card-icon" :class="{ 'doc-card-icon--verified': dt.state === 'VERIFIED', 'doc-card-icon--pending': dt.state === 'PENDING_VERIFICATION' }">
                                <Icon v-if="dt.state === 'PENDING_VERIFICATION'" name="lucide:clock" class="h-5 w-5" />
                                <Icon v-else name="lucide:file-text" class="h-5 w-5" />
                            </div>
                            <div class="doc-card-info">
                                <div class="flex items-center gap-2">
                                    <h3 class="doc-card-name">{{ dt.document_type_name }}</h3>
                                    <span v-if="dt.state === 'VERIFIED'" class="status-badge status-green">
                                        <Icon name="lucide:check-circle" class="h-3 w-3" /> Verified
                                    </span>
                                    <span v-else-if="dt.state === 'PENDING_VERIFICATION'" class="status-badge status-amber">
                                        <Icon name="lucide:clock" class="h-3 w-3" /> Pending Verification
                                    </span>
                                    <span v-else-if="dt.state === 'REJECTED'" class="status-badge status-red">
                                        <Icon name="lucide:x-circle" class="h-3 w-3" /> Rejected
                                    </span>
                                    <span v-else-if="dt.document_is_mandatory" class="meta-mandatory">Required</span>
                                </div>
                                <div class="doc-card-meta">
                                    <span v-if="dt.folder_name" class="meta-tag">
                                        <Icon name="lucide:folder" class="h-3 w-3" /> {{ dt.folder_name }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button v-if="dt.state === 'VERIFIED'" class="edit-btn" @click="openSubmitDrawer(dt)">
                            <Icon name="lucide:pencil" class="h-4 w-4" /> Edit
                        </button>
                        <button v-else-if="dt.state === 'PENDING_VERIFICATION'" class="pending-btn" disabled>
                            <Icon name="lucide:clock" class="h-4 w-4" /> Pending
                        </button>
                        <button v-else class="add-details-btn" @click="openSubmitDrawer(dt)">
                            <Icon name="lucide:plus-circle" class="h-4 w-4" /> Add details
                        </button>
                    </div>

                    <div v-if="dt.state === 'VERIFIED' && dt.verifiedDocument" class="doc-card-details">
                        <div v-if="hasFieldValues(dt.verifiedDocument)" class="doc-fields">
                            <div v-for="field in getVisibleFields(dt.verifiedDocument)" :key="field.key" class="field-row">
                                <span class="field-label">{{ field.label }}</span>
                                <span class="field-value">{{ maskFieldValue(dt.verifiedDocument.field_values, field) }}</span>
                            </div>
                        </div>

                        <div v-if="dt.verifiedDocument.file_name" class="file-row">
                            <div class="file-info">
                                <Icon name="lucide:file-text" class="h-4 w-4 text-emerald-400/70" />
                                <span class="text-sm text-white/80 truncate">{{ dt.verifiedDocument.file_name }}</span>
                            </div>
                            <button class="lnk-btn" @click="downloadFile(dt.verifiedDocument)">
                                <Icon name="lucide:download" class="h-4 w-4" /> Download
                            </button>
                        </div>
                    </div>

                    <div v-if="dt.state === 'PENDING_VERIFICATION'" class="doc-card-details">
                        <p class="text-xs text-amber-400/70 italic">Your submission is awaiting admin verification.</p>
                    </div>

                    <div v-if="dt.state === 'REJECTED'" class="doc-card-details">
                        <p class="text-xs text-red-400/70 italic">Your submission was rejected. Please review and resubmit.</p>
                    </div>
                </div>
            </div>
        </div>

        <EmployeeSubmitDocumentDrawer
            v-model="submitDrawerOpen"
            :document-type-id="submitDrawerDocTypeId"
            :assignment-id="submitDrawerAssignmentId"
            :existing-submission="submitDrawerExisting"
            @submitted="onSubmitted"
        />
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import { resolveMediaUrl } from '~/utils/media'
import EmployeeSubmitDocumentDrawer from '~/components/employee-documents/EmployeeSubmitDocumentDrawer.vue'

const props = defineProps({
    employee: { type: Object, required: true },
})

const docStore = useEmployeeDocumentStore()
const route = useRoute()

const assignments = ref([])
const verifiedDocs = ref([])
const submissions = ref([])
const loading = ref(true)
const error = ref(null)
const selectedFolder = ref(null)
const searchQuery = ref('')

const submitDrawerOpen = ref(false)
const submitDrawerDocTypeId = ref('')
const submitDrawerAssignmentId = ref('')
const submitDrawerExisting = ref(null)

const verifiedByType = computed(() => {
    const map = new Map()
    for (const v of verifiedDocs.value) {
        if (v.document_type_id && !map.has(v.document_type_id)) {
            map.set(v.document_type_id, v)
        }
    }
    return map
})

const latestSubmissionByType = computed(() => {
    const map = new Map()
    for (const s of submissions.value) {
        if (!s.document_type_id) continue
        if (!map.has(s.document_type_id)) {
            map.set(s.document_type_id, s)
        }
    }
    return map
})

const mergedDocTypes = computed(() => {
    return assignments.value.map(a => {
        const sub = latestSubmissionByType.value.get(a.document_type_id) || null
        const hasVerified = verifiedByType.value.has(a.document_type_id)
        const hasPending = sub && sub.status === 'PENDING_VERIFICATION'
        const isRejected = sub && sub.status === 'REJECTED'

        let state = 'UNSUBMITTED'
        if (hasPending) state = 'PENDING_VERIFICATION'
        else if (hasVerified) state = 'VERIFIED'
        else if (isRejected) state = 'REJECTED'

        return {
            ...a,
            state,
            hasVerifiedDocument: hasVerified,
            verifiedDocument: verifiedByType.value.get(a.document_type_id) || null,
            latestSubmission: sub,
        }
    })
})

const pendingCount = computed(() => mergedDocTypes.value.filter(d => d.state === 'UNSUBMITTED' || d.state === 'REJECTED').length)

const folders = computed(() => {
    const map = new Map()
    for (const a of assignments.value) {
        if (!a.folder_id) continue
        if (!map.has(a.folder_id)) {
            map.set(a.folder_id, { id: a.folder_id, name: a.folder_name, count: 0 })
        }
        map.get(a.folder_id).count++
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredDocTypes = computed(() => {
    let list = mergedDocTypes.value
    if (selectedFolder.value === null) {
        list = list.filter(d => d.state === 'UNSUBMITTED' || d.state === 'REJECTED')
    } else {
        list = list.filter(d => d.folder_id === selectedFolder.value)
    }
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase()
        list = list.filter(d =>
            d.document_type_name.toLowerCase().includes(q) ||
            (d.folder_name && d.folder_name.toLowerCase().includes(q))
        )
    }
    return list
})

const activeViewTitle = computed(() => {
    if (selectedFolder.value === null) return 'Pending Documents'
    const folder = folders.value.find(f => f.id === selectedFolder.value)
    return folder ? folder.name : 'Documents'
})

function selectFolder(folderId) {
    selectedFolder.value = folderId
    searchQuery.value = ''
}

function openSubmitDrawer(dt) {
    submitDrawerDocTypeId.value = dt.document_type_id
    submitDrawerAssignmentId.value = dt.id
    submitDrawerExisting.value = dt.state === 'VERIFIED' ? dt.verifiedDocument : null
    submitDrawerOpen.value = true
}

async function onSubmitted() {
    submitDrawerOpen.value = false
    await loadData()
}

const SENSITIVE_KEYS = ['aadhaar_number', 'aadhaar', 'aadhar', 'pan_number', 'pan', 'passport_number', 'passport', 'driving_licence', 'voter_id', 'ssn', 'social_security']

function isSensitiveField(field) {
    const key = (field.key || '').toLowerCase()
    return SENSITIVE_KEYS.some(sk => key.includes(sk))
}

function maskValue(val) {
    const s = String(val)
    if (s.length <= 4) return s
    return 'X'.repeat(Math.max(0, s.length - 4)) + s.slice(-4)
}

function maskFieldValue(fieldValues, field) {
    const val = fieldValues?.[field.key]
    if (val === undefined || val === null || val === '') return '—'
    if (Array.isArray(val)) return val.join(', ')
    if (isSensitiveField(field) && String(val).length > 4) return maskValue(val)
    return String(val)
}

function hasFieldValues(verifiedDoc) {
    const fv = verifiedDoc?.field_values
    return fv && typeof fv === 'object' && Object.keys(fv).length > 0
}

function getVisibleFields(verifiedDoc) {
    if (verifiedDoc?.fields?.length) {
        return verifiedDoc.fields.filter(f => f.field_type !== 'FILE')
    }
    if (hasFieldValues(verifiedDoc)) {
        return Object.keys(verifiedDoc.field_values).map(key => ({
            key,
            label: formatLabel(key),
            field_type: 'TEXTBOX',
        }))
    }
    return []
}

function formatLabel(key) {
    return String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function downloadFile(verifiedDoc) {
    if (verifiedDoc?.file_url) {
        const a = document.createElement('a')
        a.href = resolveMediaUrl(verifiedDoc.file_url)
        a.download = verifiedDoc.file_name || 'document'
        a.click()
    }
}

async function loadData() {
    loading.value = true
    error.value = null
    try {
        const [assignResult, verifiedResult, submissionsResult] = await Promise.all([
            docStore.fetchMyAssignments(),
            docStore.fetchMyVerifiedDocuments(),
            docStore.fetchMySubmissions(),
        ])
        assignments.value = assignResult
        verifiedDocs.value = verifiedResult
        submissions.value = submissionsResult
    } catch (e) {
        error.value = e?.message || 'Failed to load documents'
    } finally {
        loading.value = false
    }
}

onMounted(loadData)
</script>

<style scoped>
.doc-layout {
    display: flex;
    gap: 16px;
    min-height: 500px;
}

.sidebar {
    width: 240px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: all 0.2s ease;
}
.sidebar:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
}

.sidebar-hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-title {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
}

.sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    margin-bottom: 6px;
    padding-left: 4px;
}

.sidebar-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.65);
    transition: all 0.15s ease;
    cursor: pointer;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
}
.sidebar-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.85);
    transform: translateX(2px);
}
.sidebar-item.active {
    background: rgba(52, 211, 153, 0.12);
    border-color: rgba(52, 211, 153, 0.25);
    color: #34d399;
}

.sidebar-item-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.badge {
    font-size: 11px;
    font-weight: 600;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.15s ease;
}
.active .badge {
    background: rgba(52, 211, 153, 0.2);
    color: #34d399;
}

.main-content {
    flex: 1;
    min-width: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s ease;
}
.main-content:hover {
    background: rgba(255, 255, 255, 0.06);
}

.main-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 16px;
}

.main-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
}

.main-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    margin-top: 2px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 7px 12px;
    min-width: 220px;
    transition: all 0.2s ease;
}
.search-box:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
}
.search-box:focus-within {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(52, 211, 153, 0.3);
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.1);
}

.search-input {
    background: transparent;
    border: none;
    outline: none;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    width: 100%;
}
.search-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
}

.doc-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.doc-card {
    display: flex;
    flex-direction: column;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
}
.doc-card:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.doc-card--verified {
    border-color: rgba(52, 211, 153, 0.15);
}

.doc-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.doc-card-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.doc-card-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(52, 211, 153, 0.12);
    border: 1px solid rgba(52, 211, 153, 0.2);
    display: grid;
    place-items: center;
    color: #34d399;
    flex-shrink: 0;
}

.doc-card-info {
    min-width: 0;
}

.doc-card-name {
    font-size: 13.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.doc-card-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 3px;
}

.meta-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
}

.meta-mandatory {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(251, 191, 36, 0.8);
    background: rgba(251, 191, 36, 0.12);
    padding: 2px 6px;
    border-radius: 4px;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}
.status-green { border: 1px solid rgba(34, 197, 94, 0.7); background: rgba(34, 197, 94, 0.18); color: #bbf7d0; }
.status-amber { border: 1px solid rgba(245, 158, 11, 0.7); background: rgba(245, 158, 11, 0.18); color: #fde68a; }
.status-red { border: 1px solid rgba(244, 63, 94, 0.7); background: rgba(244, 63, 94, 0.18); color: #fecdd3; }

.doc-card-details {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.doc-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.field-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.field-label {
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
}

.field-value {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
}

.file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 4px;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
}

.lnk-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #7dd3fc;
    font-size: 12px;
    white-space: nowrap;
    transition: all 0.15s ease;
    padding: 4px 8px;
    border-radius: 6px;
}
.lnk-btn:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
    background: rgba(125, 211, 252, 0.1);
}

.add-details-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 500;
    color: #34d399;
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.2);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
}
.add-details-btn:hover {
    background: rgba(52, 211, 153, 0.2);
    border-color: rgba(52, 211, 153, 0.35);
    color: #6ee7b7;
}

.edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(52, 211, 153, 0.8);
    background: rgba(52, 211, 153, 0.1);
    border: 1px solid rgba(52, 211, 153, 0.2);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
}
.edit-btn:hover {
    background: rgba(52, 211, 153, 0.2);
    border-color: rgba(52, 211, 153, 0.35);
    color: #6ee7b7;
}

.pending-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 500;
    color: rgba(251, 191, 36, 0.8);
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
    cursor: not-allowed;
    flex-shrink: 0;
}

.doc-card--verified {
    border-color: rgba(52, 211, 153, 0.15);
}
.doc-card--pending {
    border-color: rgba(251, 191, 36, 0.15);
}

.doc-card-icon--verified {
    background: rgba(52, 211, 153, 0.18);
    border-color: rgba(52, 211, 153, 0.3);
}
.doc-card-icon--pending {
    background: rgba(251, 191, 36, 0.12);
    border-color: rgba(251, 191, 36, 0.25);
    color: #fbbf24;
}

.meta-verified {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(52, 211, 153, 0.9);
    background: rgba(52, 211, 153, 0.12);
    padding: 2px 6px;
    border-radius: 4px;
}

.skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.skeleton-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
}

.skeleton-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-lines {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.08);
    animation: pulse 1.5s ease-in-out infinite;
}
.w-48 { width: 192px; }
.w-32 { width: 128px; }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.error-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 56px 0;
}

.retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    cursor: pointer;
    transition: all 0.2s ease;
}
.retry-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-1px);
}

@media (max-width: 768px) {
    .doc-layout {
        flex-direction: column;
    }
    .sidebar {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        gap: 12px;
        padding: 12px;
    }
    .sidebar-hdr { display: none; }
    .sidebar-section {
        flex-direction: row;
        gap: 6px;
        flex-shrink: 0;
    }
    .section-label { display: none; }
    .main-header { flex-direction: column; }
    .search-box { min-width: 100%; }
    .doc-card-header { flex-direction: column; align-items: flex-start; gap: 10px; }
    .add-details-btn, .edit-btn, .pending-btn { align-self: flex-end; }
    .file-row { flex-direction: column; align-items: flex-start; gap: 8px; }
}
</style>
