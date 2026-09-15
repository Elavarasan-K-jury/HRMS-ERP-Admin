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
                <UiButton @click="load" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="store.groupedLoading" />
            </div>
        </div>

        <!-- Assign drawer -->
        <AssignDocumentDrawer v-model="assignDrawerOpen" @assigned="onAssigned" />

        <!-- Loading skeleton -->
        <div v-if="store.groupedLoading && !store.groupedAssignments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-white/10 bg-white/5">
                <div class="skeleton w-32 h-4" />
            </div>
            <div v-for="i in 5" :key="i" class="p-4 border-b border-white/5 animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="skeleton w-10 h-10 rounded-full" />
                    <div class="flex-1 space-y-2">
                        <div class="skeleton w-48 h-4" />
                        <div class="skeleton w-36 h-3" />
                    </div>
                    <div class="skeleton w-20 h-4" />
                    <div class="skeleton w-5 h-5 rounded" />
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="store.groupedError" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Unable to load document assignments.</p>
            <UiButton @click="load" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <!-- Empty -->
        <div v-else-if="!store.groupedAssignments.length && !store.groupedLoading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:document-text-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">{{ store.groupedSearch ? 'No employees or documents match your search.' : 'No document assignments found' }}</p>
            <p class="text-xs text-white/50 text-center max-w-sm">{{ store.groupedSearch ? 'Try a different search term.' : 'No documents have been assigned to employees yet.' }}</p>
            <UiButton v-if="store.groupedSearch" @click="clearSearch" color="#fff" text="Clear Search" size="sm" class="mt-1" />
            <UiButton v-else @click="openAssignDrawer" color="#4aff7a" text="+ Assign Documents" prepend-icon="ion:person-add" size="md" class="mt-2" />
        </div>

        <!-- Main list -->
        <div v-else class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
            <!-- Sub-header: count + search -->
            <div class="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Assignments ({{ store.groupedTotalEmployees }} Employee{{ store.groupedTotalEmployees === 1 ? '' : 's' }})</p>
                <UiSearch v-model="localSearch" placeholder="Search employee or document..." class="w-56" color="#fff" size="sm" @search="onSearch" @clear="onSearch('')" />
            </div>

            <!-- Employee groups -->
            <div class="flex flex-col">
                <div v-for="group in store.groupedAssignments" :key="group.employee_id" class="border-b border-white/5 last:border-b-0">
                    <!-- Employee row -->
                    <button
                        type="button"
                        class="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                        @click="toggleEmployee(group.employee_id)"
                    >
                        <span class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-semibold text-white/80 shrink-0">{{ initials(group.employee_name) }}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white/90 truncate">{{ group.employee_name || '—' }}</p>
                            <p class="text-xs text-white/40 truncate">
                                <template v-if="group.employee_code">{{ group.employee_code }}</template>
                                <template v-if="group.designation"> · {{ group.designation }}</template>
                                <template v-if="group.department"> · {{ group.department }}</template>
                            </p>
                        </div>
                        <span class="text-xs text-white/45 shrink-0">{{ group.assignment_count }} Document{{ group.assignment_count === 1 ? '' : 's' }}</span>
                        <Icon
                            :name="expanded.has(group.employee_id) ? 'ion:chevron-down' : 'ion:chevron-forward'"
                            class="w-4 h-4 text-white/40 shrink-0 transition-transform"
                        />
                    </button>

                    <!-- Expanded document list -->
                    <Transition name="accordion">
                        <div v-if="expanded.has(group.employee_id)" class="bg-white/[0.02]">
                            <table class="min-w-full text-sm text-white/90">
                                <thead class="bg-white/5 border-y border-white/10">
                                    <tr>
                                        <th class="px-4 pl-16 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Document Type</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Folder</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Status</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Assigned Date</th>
                                        <th class="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-white/45">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="a in group.assignments" :key="a.id" class="border-b border-white/5 hover:bg-white/5">
                                        <td class="px-4 pl-16 py-2.5">
                                            <div class="min-w-0">
                                                <p class="text-sm text-white/85 truncate">{{ a.document_type_name || '—' }}</p>
                                                <div v-if="a.document_is_mandatory" class="inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300">Mandatory</div>
                                            </div>
                                        </td>
                                        <td class="px-4 py-2.5 text-xs text-white/50">{{ a.folder_name || '—' }}</td>
                                        <td class="px-4 py-2.5">
                                            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="statusClass(a.status)">{{ statusLabel(a.status) }}</span>
                                        </td>
                                        <td class="px-4 py-2.5 text-xs text-white/50">{{ formatDate(a.assigned_at || a.created_at) }}</td>
                                        <td class="px-4 py-2.5 text-right">
                                            <button type="button" class="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-300" title="Unassign" @click.stop="confirmUnassign(a, group.employee_id)">
                                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="store.groupedTotalPages > 1" class="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <p class="text-xs text-white/45">
                    Showing {{ ((store.groupedPage - 1) * store.groupedLimit) + 1 }}–{{ Math.min(store.groupedPage * store.groupedLimit, store.groupedTotalEmployees) }}
                    of {{ store.groupedTotalEmployees }} employees
                </p>
                <div class="flex items-center gap-1">
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.groupedPage <= 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.groupedPage <= 1"
                        @click="goToPage(store.groupedPage - 1)"
                    >Previous</button>
                    <button
                        v-for="p in paginationPages"
                        :key="p"
                        type="button"
                        class="w-7 h-7 rounded text-xs font-medium transition-colors"
                        :class="p === store.groupedPage ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/50 hover:text-white hover:bg-white/10'"
                        @click="goToPage(p)"
                    >{{ p }}</button>
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.groupedPage >= store.groupedTotalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.groupedPage >= store.groupedTotalPages"
                        @click="goToPage(store.groupedPage + 1)"
                    >Next</button>
                </div>
            </div>
        </div>

        <!-- Unassign confirmation -->
        <UiModal v-model="unassignModal" title="Unassign Document?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to unassign <span class="font-semibold text-white">"{{ unassignTarget?.document_type_name }}"</span> from this employee?</p>
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
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import AssignDocumentDrawer from './AssignDocumentDrawer.vue'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()

const saving = ref(false)
const localSearch = ref('')
const assignDrawerOpen = ref(false)
const expanded = ref(new Set())

const unassignModal = ref(false)
const unassignTarget = ref(null)
const unassignGroupEmployeeId = ref(null)
const unassigning = ref(false)
const unassignBlocked = ref(false)
const unassignError = ref('')

function initials(name) {
    return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(s) {
    return { PENDING: 'Pending', VERIFIED: 'Verified', REJECTED: 'Rejected', EXPIRED: 'Expired', PENDING_VERIFICATION: 'Pending Verification' }[s] || s || 'Pending'
}

function statusClass(s) {
    return { PENDING: 'bg-amber-500/15 text-amber-300', VERIFIED: 'bg-emerald-500/15 text-emerald-300', REJECTED: 'bg-rose-500/15 text-rose-300', EXPIRED: 'bg-white/10 text-white/50', PENDING_VERIFICATION: 'bg-sky-500/15 text-sky-300' }[s] || 'bg-white/10 text-white/50'
}

const paginationPages = computed(() => {
    const total = store.groupedTotalPages
    const current = store.groupedPage
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
    const pages = []
    const start = Math.max(1, current - 2)
    const end = Math.min(total, current + 2)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
})

async function load() {
    try {
        await store.fetchGroupedAssignments({ organization_id: props.organizationId, page: 1, limit: store.groupedLimit, search: localSearch.value })
    } catch (e) {
        console.error('[docAssignment] load error:', e)
    }
}

function openAssignDrawer() { assignDrawerOpen.value = true }
async function onAssigned() { await load() }

function onSearch(q) {
    localSearch.value = q
    store.fetchGroupedAssignments({ organization_id: props.organizationId, page: 1, limit: store.groupedLimit, search: q })
}

function clearSearch() {
    localSearch.value = ''
    store.fetchGroupedAssignments({ organization_id: props.organizationId, page: 1, limit: store.groupedLimit, search: '' })
}

function goToPage(p) {
    if (p < 1 || p > store.groupedTotalPages) return
    store.fetchGroupedAssignments({ organization_id: props.organizationId, page: p, limit: store.groupedLimit, search: localSearch.value })
}

function toggleEmployee(empId) {
    const next = new Set(expanded.value)
    if (next.has(empId)) next.delete(empId)
    else next.add(empId)
    expanded.value = next
}

function confirmUnassign(a, employeeId) {
    unassignTarget.value = a
    unassignGroupEmployeeId.value = employeeId
    unassignError.value = ''
    unassignBlocked.value = false
    unassignModal.value = true
}

function closeUnassign() {
    unassignModal.value = false
    unassignTarget.value = null
    unassignGroupEmployeeId.value = null
    unassignError.value = ''
}

async function doUnassign() {
    if (!unassignTarget.value) return
    unassigning.value = true
    unassignError.value = ''
    try {
        await store.unassignDocument(unassignTarget.value.id)
        unassignModal.value = false
        unassignTarget.value = null
        await store.fetchGroupedAssignments({
            organization_id: props.organizationId,
            page: store.groupedPage,
            limit: store.groupedLimit,
            search: localSearch.value,
        })
        // Remove from expanded if employee has no more assignments
        const group = store.groupedAssignments.find(g => g.employee_id === unassignGroupEmployeeId.value)
        if (group && group.assignment_count === 0) {
            const next = new Set(expanded.value)
            next.delete(unassignGroupEmployeeId.value)
            expanded.value = next
        }
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
onMounted(() => { if (props.organizationId) load() })
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
    max-height: 0;
    opacity: 0;
}
.accordion-enter-to,
.accordion-leave-from {
    max-height: 2000px;
    opacity: 1;
}
</style>
