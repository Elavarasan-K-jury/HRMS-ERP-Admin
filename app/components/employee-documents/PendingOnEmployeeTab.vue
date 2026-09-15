<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Pending on Employee</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents assigned to employees that are yet to be submitted.</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <UiSearch v-model="localSearch" placeholder="Search employee or document..." class="w-64" color="#fff" @search="onSearch" @clear="onSearch('')" />
                <UiButton @click="load(1, localSearch.value)" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="store.pendingLoading" />
            </div>
        </div>

        <!-- Submit Document drawer -->
        <SubmitDocumentDrawer v-model="submitOpen" :pending="submitTarget" :organization-id="organizationId" @submitted="onSubmitted" />

        <!-- Loading skeleton -->
        <div v-if="store.pendingLoading && !store.pendingEmployeeDocuments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-white/10 bg-white/5">
                <div class="skeleton w-40 h-4" />
            </div>
            <div v-for="i in 5" :key="i" class="p-4 border-b border-white/5 animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="skeleton w-10 h-10 rounded-full" />
                    <div class="flex-1 space-y-2">
                        <div class="skeleton w-48 h-4" />
                        <div class="skeleton w-36 h-3" />
                    </div>
                    <div class="skeleton w-16 h-5 rounded-full" />
                    <div class="skeleton w-5 h-5 rounded" />
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="store.pendingError" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Could not load pending documents.</p>
            <UiButton @click="load(1, localSearch.value)" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <!-- Empty -->
        <div v-else-if="!store.pendingEmployeeDocuments.length && !store.pendingLoading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:checkmark-circle-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">{{ localSearch ? 'No employees or documents match your search.' : 'No pending employee documents' }}</p>
            <p class="text-xs text-white/50 text-center max-w-md">{{ localSearch ? 'Try a different search term.' : 'All assigned documents have been submitted, or no documents have been assigned yet.' }}</p>
            <UiButton v-if="localSearch" @click="clearSearch" color="#fff" text="Clear Search" size="sm" class="mt-1" />
        </div>

        <!-- Main list -->
        <div v-else class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
            <!-- Sub-header -->
            <div class="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Pending ({{ store.pendingTotalEmployees }} Employee{{ store.pendingTotalEmployees === 1 ? '' : 's' }})</p>
            </div>

            <!-- Employee groups -->
            <div class="flex flex-col">
                <div v-for="group in groupedPending" :key="group.employee_id" class="border-b border-white/5 last:border-b-0">
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
                        <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0" :class="group.submitted_count > 0 ? 'bg-sky-500/15 text-sky-300' : 'bg-amber-500/15 text-amber-300'">
                            <template v-if="group.submitted_count > 0">{{ group.submitted_count }} submitted · {{ group.documents.length - group.submitted_count }} pending</template>
                            <template v-else>{{ group.documents.length }} pending</template>
                        </span>
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
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Assigned On</th>
                                        <th class="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-white/45">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="d in group.documents" :key="d.assignment_id" class="border-b border-white/5 hover:bg-white/5">
                                        <td class="px-4 pl-16 py-2.5">
                                            <div class="flex items-center gap-2 min-w-0">
                                                <span class="text-sm text-white/85 truncate">{{ d.document_type_name }}</span>
                                                <span v-if="d.document_is_mandatory" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 shrink-0">Required</span>
                                                <span v-if="d.document_is_verification_required" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-sky-500/15 text-sky-300 shrink-0">Verify</span>
                                                <span v-if="d.document_is_multiple" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-violet-500/15 text-violet-300 shrink-0">Multi</span>
                                                <span v-if="d.document_ask_expiry_date" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 shrink-0">Expiry</span>
                                                <span v-if="d.document_is_appliable_na" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/50 shrink-0">N/A</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-2.5 text-xs text-white/50">{{ d.folder_name || '—' }}</td>
                                        <td class="px-4 py-2.5">
                                            <span v-if="d.submission_status" class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="subStatusClass(d.submission_status)">{{ subStatusLabel(d.submission_status) }}</span>
                                            <span v-else class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300">Pending</span>
                                        </td>
                                        <td class="px-4 py-2.5 text-xs text-white/50">{{ formatDate(d.assigned_at) }}</td>
                                        <td class="px-4 py-2.5 text-right">
                                            <UiButton v-if="!d.submission_status" @click.stop="openSubmit(d)" color="#4aff7a" text="Submit" prepend-icon="ion:cloud-upload-outline" size="sm" />
                                            <span v-else class="text-[11px] text-white/40 italic">Submitted</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="store.pendingTotalPages > 1" class="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <p class="text-xs text-white/45">
                    Page {{ store.pendingPage }} of {{ store.pendingTotalPages }}
                </p>
                <div class="flex items-center gap-1">
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.pendingPage <= 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.pendingPage <= 1"
                        @click="pagePrev"
                    >Previous</button>
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.pendingPage >= store.pendingTotalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.pendingPage >= store.pendingTotalPages"
                        @click="pageNext"
                    >Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import SubmitDocumentDrawer from './SubmitDocumentDrawer.vue'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()
const localSearch = ref('')
const submitOpen = ref(false)
const submitTarget = ref(null)
const expanded = ref(new Set())

const groupedPending = computed(() => {
    const map = {}
    for (const d of store.pendingEmployeeDocuments) {
        const key = d.employee_id
        if (!map[key]) {
            map[key] = {
                employee_id: d.employee_id,
                employee_name: d.employee_name,
                employee_code: d.employee_code,
                designation: d.designation,
                department: d.department,
                documents: [],
                submitted_count: 0,
            }
        }
        map[key].documents.push(d)
        if (d.submission_status) map[key].submitted_count++
    }
    return Object.values(map)
})

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
function subStatusLabel(s) { return { PENDING: 'Pending', PENDING_VERIFICATION: 'Pending Verification', VERIFIED: 'Verified', REJECTED: 'Rejected', EXPIRED: 'Expired' }[s] || s || 'Pending' }
function subStatusClass(s) { return { PENDING: 'bg-amber-500/15 text-amber-300', PENDING_VERIFICATION: 'bg-sky-500/15 text-sky-300', VERIFIED: 'bg-emerald-500/15 text-emerald-300', REJECTED: 'bg-rose-500/15 text-rose-300', EXPIRED: 'bg-white/10 text-white/50' }[s] || 'bg-white/10 text-white/50' }

async function load(page, searchTerm) {
    try {
        await store.fetchPendingEmployeeDocuments({ organization_id: props.organizationId, page, search: searchTerm })
    } catch (e) { /* store sets error */ }
}

function onSearch(value) {
    localSearch.value = value
    load(1, value)
}
function clearSearch() {
    localSearch.value = ''
    load(1, '')
}
function pagePrev() { if (store.pendingPage > 1) load(store.pendingPage - 1, localSearch.value) }
function pageNext() { if (store.pendingPage < store.pendingTotalPages) load(store.pendingPage + 1, localSearch.value) }
function openSubmit(d) { submitTarget.value = d; submitOpen.value = true }
function onSubmitted() { submitOpen.value = false; load(store.pendingPage, localSearch.value) }

function toggleEmployee(empId) {
    const next = new Set(expanded.value)
    if (next.has(empId)) next.delete(empId)
    else next.add(empId)
    expanded.value = next
}

watch(() => props.organizationId, (v) => { if (v) load(1, '') })
onMounted(() => { if (props.organizationId) load(1, '') })
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
