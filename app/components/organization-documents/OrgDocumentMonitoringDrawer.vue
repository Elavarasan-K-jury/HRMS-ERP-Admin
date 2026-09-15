<template>
    <UiSidebarModal v-model="open" title="Employee Monitoring" width="820px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">{{ documentName }} — Applicable Employees</span>
        </template>
        <template #default>
            <!-- Stats row -->
            <div class="grid grid-cols-4 gap-3 mb-5">
                <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p class="text-lg font-semibold text-emerald-300">{{ stats?.applicable_employee_count ?? '—' }}</p>
                    <p class="text-[11px] text-white/45 mt-0.5">Applicable</p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p class="text-lg font-semibold text-sky-300">{{ stats?.viewed_count ?? '—' }}</p>
                    <p class="text-[11px] text-white/45 mt-0.5">Viewed</p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p class="text-lg font-semibold text-violet-300">{{ stats?.acknowledged_count ?? '—' }}</p>
                    <p class="text-[11px] text-white/45 mt-0.5">Acknowledged</p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p class="text-lg font-semibold text-amber-300">{{ pendingCount }}</p>
                    <p class="text-[11px] text-white/45 mt-0.5">Pending</p>
                </div>
            </div>

            <!-- Search bar -->
            <div class="mb-4">
                <div class="relative max-w-sm">
                    <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                    <input v-model="searchInput" type="text" placeholder="Search by name or code..."
                        class="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-sm text-white placeholder-white/35 outline-none focus:border-emerald-300/50 transition-colors" />
                    <button v-if="searchInput" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60" @click="clearSearch">
                        <Icon name="ion:close-circle" class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <!-- Employee list -->
            <div v-if="loading" class="space-y-2">
                <div v-for="i in 5" :key="i" class="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div class="skeleton w-9 h-9 rounded-full" />
                    <div class="flex-1 space-y-1.5">
                        <div class="skeleton w-32 h-3.5" />
                        <div class="skeleton w-20 h-2.5" />
                    </div>
                    <div class="skeleton w-24 h-3" />
                </div>
            </div>

            <div v-else-if="error" class="py-8 flex flex-col items-center gap-2 text-white/50">
                <Icon name="ion:alert-circle-outline" class="w-8 h-8 text-rose-400" />
                <p class="text-sm text-rose-300">Failed to load employees.</p>
                <button class="text-xs text-emerald-300 hover:text-emerald-200 underline" @click="loadEmployees">Retry</button>
            </div>

            <div v-else-if="!employees.length && searchInput" class="py-8 text-center text-white/45 text-sm">
                <Icon name="ion:search-outline" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No employees match your search</p>
                <button type="button" class="mt-1 text-xs text-emerald-300 hover:text-emerald-200 underline" @click="clearSearch">Clear Search</button>
            </div>

            <div v-else-if="!employees.length" class="py-8 text-center text-white/45 text-sm">
                <Icon name="ion:people-outline" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No employees match this folder's targeting rules.</p>
            </div>

            <template v-else>
                <!-- Table header -->
                <div class="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
                    <div class="col-span-4">Employee</div>
                    <div class="col-span-2">Code</div>
                    <div class="col-span-3">Department</div>
                    <div class="col-span-3">Branch</div>
                </div>

                <!-- Employee rows -->
                <div class="max-h-80 overflow-y-auto">
                    <div v-for="emp in employees" :key="emp.employee_id"
                        class="grid grid-cols-12 gap-2 px-3 py-2.5 items-center border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <div class="col-span-4 flex items-center gap-2.5 min-w-0">
                            <span class="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-[11px] font-semibold text-emerald-300 shrink-0">
                                {{ emp.full_name?.charAt(0) || '?' }}
                            </span>
                            <span class="text-sm text-white/85 truncate">{{ emp.full_name }}</span>
                        </div>
                        <div class="col-span-2 text-xs text-white/55">{{ emp.employee_code }}</div>
                        <div class="col-span-3 text-xs text-white/55 truncate">{{ emp.department_name || '—' }}</div>
                        <div class="col-span-3 text-xs text-white/55 truncate">{{ emp.branch_name || '—' }}</div>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="mt-3 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between">
                    <p class="text-xs text-white/45">
                        Page {{ page }} of {{ totalPages }} ({{ total }} total)
                    </p>
                    <div class="flex items-center gap-1">
                        <button type="button" class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                            :class="page <= 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                            :disabled="page <= 1" @click="pagePrev">Previous</button>
                        <button type="button" class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                            :class="page >= totalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                            :disabled="page >= totalPages" @click="pageNext">Next</button>
                    </div>
                </div>
            </template>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Close" prepend-icon="ion:close-circle" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useOrganizationDocumentStore } from '~/stores/organization/organizationDocument.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    documentId: { type: String, default: null },
    documentName: { type: String, default: '' },
    folderId: { type: String, default: null },
    organizationId: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const store = useOrganizationDocumentStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const loading = ref(false)
const error = ref(false)
const employees = ref([])
const total = ref(0)
const page = ref(1)
const limit = ref(15)
const totalPages = ref(0)
const searchInput = ref('')
const stats = ref(null)
let searchDebounce = null

const pendingCount = computed(() => {
    if (!stats.value) return '—'
    const applicable = stats.value.applicable_employee_count || 0
    const acknowledged = stats.value.acknowledged_count || 0
    if (!applicable) return 0
    return Math.max(0, applicable - acknowledged)
})

function clearSearch() {
    searchInput.value = ''
    page.value = 1
    loadEmployees()
}

function pagePrev() {
    if (page.value > 1) { page.value--; loadEmployees() }
}

function pageNext() {
    if (page.value < totalPages.value) { page.value++; loadEmployees() }
}

async function loadEmployees() {
    if (!props.folderId || !props.organizationId) return
    loading.value = true
    error.value = false
    try {
        const { $api } = useNuxtApp()
        const params = {
            organization_id: props.organizationId,
            page: page.value,
            limit: limit.value,
            search: searchInput.value || '',
        }
        const { data } = await $api.get(`/organization-documents/folders/${props.folderId}/applicable-employees`, { params })
        employees.value = (data?.employees || []).map(e => ({
            employee_id: e?.employee_id || '',
            full_name: e?.employee_name || e?.full_name || '',
            employee_code: e?.employee_code || '',
            branch_name: e?.branch_name || '',
            department_name: e?.department_name || '',
            designation_name: e?.designation_name || '',
            worker_type: e?.worker_type || '',
        }))
        total.value = data?.total || 0
        page.value = data?.page || 1
        totalPages.value = data?.total_pages || 0
    } catch (e) {
        error.value = true
    } finally {
        loading.value = false
    }
}

async function loadStats() {
    if (!props.documentId || !props.organizationId) return
    try {
        const s = await store.fetchDocumentStats(props.organizationId, props.documentId)
        stats.value = s
    } catch (_) {}
}

function onSearchInput() {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
        page.value = 1
        loadEmployees()
    }, 300)
}

watch(searchInput, () => { onSearchInput() })

watch(() => props.modelValue, (v) => {
    if (v && props.documentId && props.folderId) {
        employees.value = []
        stats.value = null
        searchInput.value = ''
        page.value = 1
        error.value = false
        loadEmployees()
        loadStats()
    }
})
</script>
