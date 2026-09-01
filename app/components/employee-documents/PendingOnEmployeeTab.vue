<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Pending on Employee</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents assigned to employees that are yet to be submitted.</p>
                <p v-if="!loading && !error && store.pendingTotalEmployees > 0" class="text-xs text-emerald-300/80 mt-2">
                    {{ store.pendingTotalEmployees }} Employee{{ store.pendingTotalEmployees === 1 ? '' : 's' }} • {{ store.pendingTotal }} Document{{ store.pendingTotal === 1 ? '' : 's' }} Pending
                </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <UiSearch v-model="search" placeholder="Search employee or document..." class="w-64" color="#fff" @search="onSearch" @clear="onSearch('')" />
                <UiButton @click="load(store.pendingPage, search.value)" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="loading" />
            </div>
        </div>

        <!-- Submit Document drawer -->
        <SubmitDocumentDrawer v-model="submitOpen" :pending="submitTarget" @submitted="onSubmitted" />

        <!-- Loading -->
        <div v-if="store.pendingLoading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-4 space-y-2">
            <div v-for="i in 4" :key="i" class="animate-pulse p-3">
                <div class="skeleton w-40 h-4 mb-2" />
                <div class="skeleton w-24 h-3" />
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="store.pendingError" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Could not load pending documents.</p>
            <UiButton @click="load" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <!-- Empty -->
        <div v-else-if="!store.pendingEmployeeDocuments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:checkmark-circle-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">No pending employee documents</p>
            <p class="text-xs text-white/50 text-center max-w-md">No employee document assignments found, or all assigned documents have been submitted.</p>
        </div>

        <!-- Employee-grouped list -->
        <div v-else class="space-y-3">
            <div v-for="group in groupedPending" :key="group.employee_id" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
                <!-- Employee header -->
                <div class="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center gap-3">
                    <span class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-sm font-semibold text-white/85 shrink-0">{{ initials(group.employee_name) }}</span>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-white/90 truncate">{{ group.employee_name }}</p>
                        <p class="text-xs text-white/45 truncate">{{ group.employee_code || '' }}{{ group.designation ? ' • ' + group.designation : '' }}{{ group.department ? ' • ' + group.department : '' }}</p>
                    </div>
                    <span class="ml-auto inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/20">{{ group.documents.length }} pending</span>
                </div>
                <!-- Documents -->
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Document</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Folder</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Status</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Assigned On</th>
                            <th class="px-5 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in group.documents" :key="d.assignment_id" class="border-b border-white/5 hover:bg-white/5">
                            <td class="px-5 py-2.5">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="text-sm text-white/85 truncate">{{ d.document_type_name }}</span>
                                    <span v-if="d.document_is_mandatory" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 shrink-0">Required</span>
                                    <span v-if="d.document_is_verification_required" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-sky-500/15 text-sky-300 shrink-0">Verify</span>
                                    <span v-if="d.document_is_multiple" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-violet-500/15 text-violet-300 shrink-0">Multi</span>
                                    <span v-if="d.document_ask_expiry_date" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 shrink-0">Expiry</span>
                                    <span v-if="d.document_is_appliable_na" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/50 shrink-0">N/A</span>
                                </div>
                            </td>
                            <td class="px-5 py-2.5 text-xs text-white/50">{{ d.folder_name || '—' }}</td>
                            <td class="px-5 py-2.5">
                                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300">Pending on Employee</span>
                            </td>
                            <td class="px-5 py-2.5 text-xs text-white/50">{{ formatDate(d.assigned_at) }}</td>
                            <td class="px-5 py-2.5 text-right">
                                <UiButton @click="openSubmit(d)" color="#4aff7a" text="Submit" prepend-icon="ion:cloud-upload-outline" size="sm" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="store.pendingTotalPages > 1" class="flex items-center justify-between">
                <p class="text-xs text-white/40">Page {{ store.pendingPage }} of {{ store.pendingTotalPages }} ({{ store.pendingTotal }} total)</p>
                <div class="flex items-center gap-1">
                    <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="store.pendingPage <= 1" @click="pagePrev">Prev</button>
                    <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="store.pendingPage >= store.pendingTotalPages" @click="pageNext">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/employeeDocument.store'
import SubmitDocumentDrawer from './SubmitDocumentDrawer.vue'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()
const search = ref('')
const submitOpen = ref(false)
const submitTarget = ref(null)

const loading = computed(() => store.pendingLoading)
const error = computed(() => store.pendingError)

// Group flat pending records by employee
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
            }
        }
        map[key].documents.push(d)
    }
    return Object.values(map)
})

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() }

async function load(page, searchTerm) {
    try {
        await store.fetchPendingEmployeeDocuments({ page, search: searchTerm })
    } catch (e) { /* store sets pendingError */ }
}

function onSearch(value) {
    search.value = value
    load(1, value)
}
function pagePrev() { if (store.pendingPage > 1) load(store.pendingPage - 1, search.value) }
function pageNext() { if (store.pendingPage < store.pendingTotalPages) load(store.pendingPage + 1, search.value) }
function openSubmit(d) { submitTarget.value = d; submitOpen.value = true }
function onSubmitted() { submitOpen.value = false; load(store.pendingPage, search.value) }

watch(() => props.organizationId, (v) => { if (v) load(1, '') })
onMounted(() => { if (props.organizationId) load(1, '') })
</script>
