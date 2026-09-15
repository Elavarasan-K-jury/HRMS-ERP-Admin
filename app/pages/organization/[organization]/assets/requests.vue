<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- HEADER -->
        <div class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Asset Request<span v-if="total !== 1">s</span>
            </h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="loading" />
                <UiButton @click="fetchData" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- FILTERS -->
        <div class="rounded-lg p-3 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex items-center gap-3">
            <FormSelect
                color="#fff"
                v-model="statusFilter"
                :options="statusFilterOptions"
                placeholder="All Statuses"
                clearable
                class="w-48"
            />
            <span class="text-xs text-white/50">
                {{ filteredRequests.length }} request(s) shown
            </span>
        </div>

        <!-- TABLE -->
        <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/10 border-b border-white/10">
                        <tr>
                            <th class="th">Request</th>
                            <th class="th">Employee</th>
                            <th class="th">Category</th>
                            <th class="th">Model</th>
                            <th class="th">Priority</th>
                            <th class="th">Status</th>
                            <th class="th">Date</th>
                            <th class="th text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        <!-- Skeleton -->
                        <template v-if="loading">
                            <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                                <td v-for="j in 8" :key="j" class="td">
                                    <div class="skeleton w-full" />
                                </td>
                            </tr>
                        </template>

                        <!-- Empty State -->
                        <tr v-else-if="!filteredRequests.length">
                            <td colspan="8" class="td text-center py-10">
                                <div class="flex flex-col items-center gap-2 text-white/50">
                                    <Icon name="lucide:inbox" class="w-8 h-8" />
                                    <span>No asset requests found.</span>
                                </div>
                            </td>
                        </tr>

                        <!-- Rows -->
                        <tr v-else v-for="row in filteredRequests" :key="row.id"
                            class="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                            @click="viewDetails(row)">
                            <td class="td">
                                <div class="font-mono text-xs">#{{ row.id?.slice(-8) }}</div>
                            </td>
                            <td class="td">
                                <div class="font-semibold">{{ row.employee?.full_name || '—' }}</div>
                                <div class="text-xs text-white/50">{{ row.employee?.employee_code || '' }}</div>
                            </td>
                            <td class="td">{{ row.category?.name || '—' }}</td>
                            <td class="td">{{ row.model ? `${row.model.brand} ${row.model.model_name}` : '—' }}</td>
                            <td class="td">
                                <span class="badge" :class="priorityClass(row.priority)">{{ row.priority }}</span>
                            </td>
                            <td class="td">
                                <span class="badge" :class="requestStatusClass(row.status)">{{ row.status }}</span>
                            </td>
                            <td class="td text-xs text-white/60">{{ formatDate(row.created_at) }}</td>
                            <td class="td text-right">
                                <div class="inline-flex gap-1" @click.stop>
                                    <UiButton v-if="row.status === 'PENDING'" color="#22c55e" class="btn-icon"
                                        title="Approve" @click="approveRequest(row)">
                                        <Icon name="lucide:check" />
                                    </UiButton>
                                    <UiButton v-if="row.status === 'PENDING'" color="#ef4444" class="btn-icon"
                                        title="Reject" @click="rejectRequest(row)">
                                        <Icon name="lucide:x" />
                                    </UiButton>
                                    <UiButton v-if="row.status === 'APPROVED' && !row.assignment_id" color="#3b82f6" class="btn-icon"
                                        title="Assign Asset" @click="assignRequest(row)">
                                        <Icon name="lucide:link" />
                                    </UiButton>
                                    <UiButton color="#fff" class="btn-icon" title="View Details" @click="viewDetails(row)">
                                        <Icon name="lucide:eye" />
                                    </UiButton>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1"
                class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10 bg-white/5">
                <div class="text-xs text-white/70">
                    Page <span class="text-white">{{ page }}</span> of
                    <span class="text-white">{{ totalPages }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button class="btn-lite" :disabled="page <= 1 || loading" @click="prevPage">
                        <Icon name="lucide:chevron-left" class="w-4 h-4" /> Prev
                    </button>
                    <button class="btn-lite" :disabled="page >= totalPages || loading" @click="nextPage">
                        Next <Icon name="lucide:chevron-right" class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        <!-- APPROVE MODAL -->
        <UiModal v-model="approveModal" title="Approve Asset Request?" size="sm">
            <template #default>
                <div v-if="selectedRequest" class="space-y-2">
                    <p>Are you sure you want to approve this request?</p>
                    <div class="text-sm text-white/60 space-y-1">
                        <div><span class="text-white/40">Employee:</span> {{ selectedRequest.employee?.full_name }}</div>
                        <div><span class="text-white/40">Category:</span> {{ selectedRequest.category?.name || '—' }}</div>
                        <div><span class="text-white/40">Priority:</span> {{ selectedRequest.priority }}</div>
                    </div>
                    <p class="text-xs text-amber-400">After approval, you will need to select a physical asset for assignment.</p>
                </div>
            </template>
            <template #footer>
                <UiButton @click="cancelApproval" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="confirmApproval" color="#4aff7a" text="Approve" prepend-icon="ion:checkmark-circle-outline" />
            </template>
        </UiModal>

        <!-- REJECT MODAL -->
        <UiModal v-model="rejectionModal" title="Reject Asset Request?" size="sm">
            <template #default>
                <div class="space-y-3">
                    <p>Are you sure you want to reject this request?</p>
                    <div class="flex flex-col gap-2">
                        <label class="text-white/70 text-sm font-medium">Rejection Reason <span class="text-red-400">*</span></label>
                        <InputArea v-model="reason" color="#fff" placeholder="Provide a reason for rejection" rows="3" />
                    </div>
                </div>
            </template>
            <template #footer>
                <UiButton @click="cancelRejection" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="confirmRejection" :disabled="!reason?.trim()" color="#ef4444" text="Reject" prepend-icon="ion:close-circle" />
            </template>
        </UiModal>

        <!-- DETAILS DRAWER -->
        <RequestDetailsDrawer />

        <!-- ASSIGN MODAL -->
        <AssignFromRequestModal @assigned="fetchData" />
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetRequestsStore } from '../../../../stores/organization/assetRequest.store'
import RequestDetailsDrawer from '../../../../components/asset/RequestDetailsDrawer.vue'
import AssignFromRequestModal from '../../../../components/asset/AssignFromRequestModal.vue'

definePageMeta({ layout: 'organization' })

const store = useAssetRequestsStore()
const {
    total, page, totalPages, search, loading,
    approveModal, rejectionModal, selectedRequest, reason,
} = storeToRefs(store)

const statusFilter = ref('')

const statusFilterOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
]

const filteredRequests = computed(() => store.asset_requests)

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function priorityClass(p) {
    return ({
        CRITICAL: 'bg-red-600/20 text-red-400',
        URGENT: 'bg-red-500/20 text-red-300',
        HIGH: 'bg-orange-500/20 text-orange-300',
        MEDIUM: 'bg-yellow-500/20 text-yellow-300',
        LOW: 'bg-sky-500/20 text-sky-300',
    }[p] || 'bg-white/10 text-white/70')
}

function requestStatusClass(s) {
    return ({
        PENDING: 'bg-amber-500/20 text-amber-300',
        APPROVED: 'bg-emerald-500/20 text-emerald-300',
        REJECTED: 'bg-red-500/20 text-red-300',
    }[s] || 'bg-white/10 text-white/70')
}

function viewDetails(row) { store.openDetails(row) }
function approveRequest(row) { store.openApprove(row) }
function rejectRequest(row) { store.openReject(row) }
function assignRequest(row) { store.openAssign(row) }

function cancelApproval() { store.closeAll() }
function cancelRejection() { store.closeAll() }

async function confirmApproval() { await store.approveAssetRequest() }
async function confirmRejection() { await store.rejectAssetRequest() }

async function fetchData() {
    store.statusFilter = statusFilter.value
    await store.fetchAssetRequests()
}

function prevPage() { if (page.value > 1) { page.value--; fetchData() } }
function nextPage() { if (page.value < totalPages.value) { page.value++; fetchData() } }

watch(statusFilter, () => { page.value = 1; fetchData() })

const searchTimer = ref(null)
watch(search, () => {
    clearTimeout(searchTimer.value)
    searchTimer.value = setTimeout(() => { page.value = 1; fetchData() }, 300)
})

onMounted(fetchData)
</script>

<style scoped>
.th {
    @apply px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60;
}
.td {
    @apply px-4 py-3 align-middle;
}
.badge {
    @apply inline-flex px-2 py-1 rounded-lg text-xs font-medium;
}
.btn-icon {
    @apply p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white;
}
.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}
.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
}
@keyframes shimmer {
    from { background-position: 200% 0 }
    to { background-position: -200% 0 }
}
</style>
