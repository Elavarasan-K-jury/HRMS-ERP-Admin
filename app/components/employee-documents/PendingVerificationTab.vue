<template>
    <div class="h-full flex flex-col gap-4">
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Pending Verification</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents submitted by employees that are awaiting your review.</p>
                <p v-if="!loading && !error && store.pendingVerificationTotal > 0" class="text-xs text-amber-300/80 mt-2">
                    {{ store.pendingVerificationTotal }} document{{ store.pendingVerificationTotal === 1 ? '' : 's' }} awaiting verification
                </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <UiSearch v-model="search" placeholder="Search employee or document..." class="w-64" color="#fff" @search="onSearch" @clear="onSearch('')" />
                <UiButton @click="load(search)" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="loading" />
            </div>
        </div>

        <ReviewDocumentDrawer v-model="reviewOpen" :pending="reviewTarget" :organization-id="organizationId" @actioned="onActioned" />

        <div v-if="loading && !store.pendingVerificationDocuments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <div v-for="i in 5" :key="i" class="p-4 border-b border-white/5 animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="skeleton w-10 h-10 rounded-full" />
                    <div class="flex-1 space-y-2">
                        <div class="skeleton w-48 h-4" />
                        <div class="skeleton w-36 h-3" />
                    </div>
                    <div class="skeleton w-20 h-8 rounded-lg" />
                </div>
            </div>
        </div>

        <div v-else-if="error" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Could not load pending verification documents.</p>
            <UiButton @click="load" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <div v-else-if="!employeeGroups.length && !loading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:checkmark-circle-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">{{ search ? 'No documents match your search.' : 'No documents pending verification' }}</p>
            <p class="text-xs text-white/50 text-center max-w-md">{{ search ? 'Try a different search term.' : 'All submitted documents have been reviewed.' }}</p>
            <UiButton v-if="search" @click="onSearch('')" color="#fff" text="Clear Search" size="sm" class="mt-1" />
        </div>

        <div v-else class="flex flex-col gap-3">
            <p class="text-xs text-white/45 font-medium uppercase tracking-wide px-1">
                Pending ({{ employeeGroups.length }} Employee{{ employeeGroups.length === 1 ? '' : 's' }})
            </p>

            <div v-for="emp in employeeGroups" :key="emp.employee_id" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
                <button
                    type="button"
                    class="w-full p-4 flex items-center gap-4 text-left transition-colors hover:bg-white/5"
                    @click="toggleEmployee(emp.employee_id)"
                >
                    <span class="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-xs font-semibold text-white/80 shrink-0">
                        {{ initials(emp.employee_name) }}
                    </span>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <p class="text-sm font-medium text-white/90 truncate">{{ emp.employee_name || '—' }}</p>
                            <span v-if="emp.employee_code" class="text-xs text-white/40">{{ emp.employee_code }}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span v-if="emp.designation" class="text-xs text-white/50">{{ emp.designation }}</span>
                            <span v-if="emp.designation && emp.department" class="text-xs text-white/30">·</span>
                            <span v-if="emp.department" class="text-xs text-white/50">{{ emp.department }}</span>
                        </div>
                    </div>
                    <span class="text-xs text-amber-300/80 font-medium shrink-0">
                        {{ emp.docs.length }} pending
                    </span>
                    <Icon
                        :name="expandedEmployees.has(emp.employee_id) ? 'ion:chevron-down' : 'ion:chevron-forward'"
                        class="w-4 h-4 text-white/40 shrink-0 transition-transform"
                    />
                </button>

                <div v-if="expandedEmployees.has(emp.employee_id)" class="border-t border-white/10">
                    <div class="hidden md:grid grid-cols-[1fr_140px_100px_110px_90px] gap-2 px-4 py-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                        <span>Document Type</span>
                        <span>Folder</span>
                        <span>Status</span>
                        <span>Submitted On</span>
                        <span class="text-right">Action</span>
                    </div>
                    <div v-for="doc in emp.docs" :key="doc.submission_id"
                        class="grid grid-cols-1 md:grid-cols-[1fr_140px_100px_110px_90px] gap-1 md:gap-2 px-4 py-3 border-t border-white/5 items-center"
                    >
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-medium text-white/80">{{ doc.document_type_name }}</span>
                        </div>
                        <span class="text-xs text-white/50 hidden md:block">{{ doc.folder_name }}</span>
                        <span class="inline-flex self-start md:self-center w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/20">Pending</span>
                        <span class="text-[11px] text-white/40 hidden md:block">{{ formatDate(doc.submitted_at) }}</span>
                        <div class="flex justify-end">
                            <UiButton @click.stop="openReview(doc)" color="#4aff7a" text="Review" prepend-icon="ion:eye-outline" size="sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import ReviewDocumentDrawer from './ReviewDocumentDrawer.vue'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()
const search = ref('')
const reviewOpen = ref(false)
const reviewTarget = ref(null)
const expandedEmployees = ref(new Set())

const loading = computed(() => store.pendingVerificationLoading)
const error = computed(() => store.pendingVerificationError)

const employeeGroups = computed(() => {
    const docs = store.pendingVerificationDocuments
    const map = new Map()
    for (const doc of docs) {
        if (!map.has(doc.employee_id)) {
            map.set(doc.employee_id, {
                employee_id: doc.employee_id,
                employee_name: doc.employee_name,
                employee_code: doc.employee_code,
                designation: doc.designation,
                department: doc.department,
                docs: [],
            })
        }
        map.get(doc.employee_id).docs.push(doc)
    }
    return Array.from(map.values()).sort((a, b) => (a.employee_name || '').localeCompare(b.employee_name || ''))
})

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDate(d) { if (!d) return '—'; const dt = new Date(d); return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

function toggleEmployee(empId) {
    const s = new Set(expandedEmployees.value)
    if (s.has(empId)) s.delete(empId); else s.add(empId)
    expandedEmployees.value = s
}

let debounceTimer = null
async function load(term) {
    try {
        await store.fetchPendingVerificationDocuments({ organization_id: props.organizationId, search: term })
    } catch (e) { /* store sets error */ }
}
function onSearch(value) {
    search.value = value
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => load(value), 300)
}
function openReview(d) { reviewTarget.value = d; reviewOpen.value = true }
function onActioned() { reviewOpen.value = false; load(search.value) }

watch(() => props.organizationId, (v) => { if (v) load('') })
onMounted(() => { if (props.organizationId) load('') })
</script>
