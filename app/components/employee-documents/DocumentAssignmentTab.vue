<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Assign Employee Documents</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Assign required employee documents to employees.</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <UiButton @click="openAssignDrawer" color="#4aff7a" text="+ Assign Documents" prepend-icon="ion:person-add" :disabled="saving" />
                <UiButton @click="load" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="loading" />
            </div>
        </div>

        <!-- Assign drawer -->
        <AssignDocumentDrawer v-model="assignDrawerOpen" @assigned="onAssigned" />

        <!-- Loading skeleton -->
        <div v-if="loading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-4 space-y-2">
            <div v-for="i in 6" :key="i" class="animate-pulse p-3">
                <div class="skeleton w-40 h-4 mb-2" />
                <div class="skeleton w-24 h-3" />
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Could not load assignments.</p>
            <UiButton @click="load" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredAssignments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:document-text-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">No assigned documents</p>
            <p class="text-xs text-white/50 text-center max-w-sm">Assign document types to employees to track their requirements.</p>
            <UiButton @click="openAssignDrawer" color="#4aff7a" text="+ Assign Documents" prepend-icon="ion:person-add" size="md" class="mt-2" />
        </div>

        <!-- Table -->
        <div v-else class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
            <div class="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Assignments ({{ filteredAssignments.length }})</p>
                <UiSearch v-model="search" placeholder="Search employee or document..." class="w-56" color="#fff" size="sm" @search="onSearch" @clear="onSearch('')" />
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Employee</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Document Type</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Folder</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Status</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Assigned Date</th>
                            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="a in filteredAssignments" :key="a.id" class="border-b border-white/5 hover:bg-white/5">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-2.5">
                                    <span class="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-semibold text-white/80 shrink-0">{{ initials(a.employee_name) }}</span>
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium text-white/90 truncate">{{ a.employee_name || '—' }}</p>
                                        <p class="text-xs text-white/40 truncate">{{ a.employee_code || '' }}{{ a.designation ? ' • ' + a.designation : '' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3">
                                <div class="min-w-0">
                                    <p class="text-sm text-white/85 truncate">{{ a.document_type_name || '—' }}</p>
                                    <div v-if="a.document_is_mandatory" class="inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300">Mandatory</div>
                                </div>
                            </td>
                            <td class="px-4 py-3 text-xs text-white/50">{{ a.folder_name || '—' }}</td>
                            <td class="px-4 py-3">
                                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="statusClass(a.status)">{{ statusLabel(a.status) }}</span>
                            </td>
                            <td class="px-4 py-3 text-xs text-white/50">{{ formatDate(a.assigned_at || a.created_at) }}</td>
                            <td class="px-4 py-3 text-right">
                                <button type="button" class="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-300" title="Unassign" @click="confirmUnassign(a)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Unassign confirmation -->
        <UiModal v-model="unassignModal" title="Unassign Document?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to unassign <span class="font-semibold text-white">"{{ unassignTarget?.document_type_name }}"</span> from <span class="font-semibold text-white">{{ unassignTarget?.employee_name }}</span>?</p>
                <p v-if="unassignError" class="mt-2 text-xs text-amber-300">{{ unassignError }}</p>
                <p v-else class="mt-2 text-xs text-white/45">This will remove the document requirement for this employee.</p>
            </template>
            <template #footer>
                <UiButton @click="closeUnassign" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doUnassign" color="#750d0d" text="Unassign" prepend-icon="ion:trash" :disabled="unassignBlocked || unassigning" :loading="unassigning" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/employeeDocument.store'
import AssignDocumentDrawer from './AssignDocumentDrawer.vue'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()

const loading = ref(true)
const error = ref(false)
const saving = ref(false)
const search = ref('')
const assignDrawerOpen = ref(false)

const unassignModal = ref(false)
const unassignTarget = ref(null)
const unassigning = ref(false)
const unassignBlocked = ref(false)
const unassignError = ref('')

const assignments = ref([])

const filteredAssignments = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return assignments.value
    return assignments.value.filter(a =>
        (a.employee_name || '').toLowerCase().includes(q) ||
        (a.document_type_name || '').toLowerCase().includes(q) ||
        (a.folder_name || '').toLowerCase().includes(q) ||
        (a.employee_code || '').toLowerCase().includes(q)
    )
})

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() }
function statusLabel(s) { return { PENDING: 'Pending', VERIFIED: 'Verified', REJECTED: 'Rejected', EXPIRED: 'Expired', PENDING_VERIFICATION: 'Pending Verification' }[s] || s || 'Pending' }
function statusClass(s) { return { PENDING: 'bg-amber-500/15 text-amber-300', VERIFIED: 'bg-emerald-500/15 text-emerald-300', REJECTED: 'bg-rose-500/15 text-rose-300', EXPIRED: 'bg-white/10 text-white/50', PENDING_VERIFICATION: 'bg-sky-500/15 text-sky-300' }[s] || 'bg-white/10 text-white/50' }

async function load() {
    loading.value = true
    error.value = false
    try {
        // Load all active folders -> types -> their assignments, aggregate into a flat list
        const folders = await store.fetchFolders(props.organizationId, { limit: 100 })
        const all = []
        for (const f of folders) {
            try {
                const types = await store.fetchDocumentTypes(f.id, { limit: 100 })
                for (const t of types) {
                    if (!t.is_active) continue
                    const res = await store.fetchDocumentAssignments(t.id, { limit: 100 })
                    res.forEach(a => {
                        all.push({ ...a, document_type_name: t.name, folder_name: f.name })
                    })
                }
            } catch (e) { /* skip folder */ }
        }
        assignments.value = all
    } catch (e) {
        error.value = true
        console.error('[docAssignment] load error:', e)
    } finally {
        loading.value = false
    }
}

function openAssignDrawer() { assignDrawerOpen.value = true }
async function onAssigned() { await load() }
function onSearch() { /* client-side filter via computed */ }

function confirmUnassign(a) {
    unassignTarget.value = a
    unassignError.value = ''
    unassignBlocked.value = false
    unassignModal.value = true
}
function closeUnassign() { unassignModal.value = false; unassignTarget.value = null; unassignError.value = '' }
async function doUnassign() {
    if (!unassignTarget.value) return
    unassigning.value = true
    unassignError.value = ''
    try {
        await store.unassignDocument(unassignTarget.value.id)
        unassignModal.value = false
        unassignTarget.value = null
        await load()
    } catch (err) {
        const msg = err?.response?.data?.error || err.message || 'Failed to unassign'
        if (/submission/i.test(msg) || /in use/i.test(msg) || /412/i.test(msg)) {
            unassignBlocked.value = true
            unassignError.value = String(msg).replace(/^\d+ [A-Z_]+:\s*/, '')
        } else {
            unassignError.value = String(msg).replace(/^\d+ [A-Z_]+:\s*/, '')
        }
    } finally {
        unassigning.value = false
    }
}

watch(() => props.organizationId, (v) => { if (v) load() })
watch(() => store.selectedFolderId, () => { /* assignments are org-scoped; no-op */ })

onMounted(() => { if (props.organizationId) load() })
</script>
