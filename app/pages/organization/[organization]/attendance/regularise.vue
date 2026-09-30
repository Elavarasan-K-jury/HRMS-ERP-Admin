<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl font-semibold text-white/90">Regularise & Cancel Penalties</h1>
                <p class="text-xs text-white/50 mt-1">Bulk regularise attendance records for multiple employees. This bypasses the approval chain.</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
                <label class="block text-xs font-medium text-white/60 mb-1">Date From</label>
                <input type="date" v-model="filters.dateFrom"
                    class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30" />
            </div>
            <div>
                <label class="block text-xs font-medium text-white/60 mb-1">Date To</label>
                <input type="date" v-model="filters.dateTo"
                    class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30" />
            </div>
            <div>
                <label class="block text-xs font-medium text-white/60 mb-1">Status</label>
                <select v-model="filters.status"
                    class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30">
                    <option value="">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>
            <div class="flex items-end">
                <button @click="fetchData"
                    class="px-4 py-2 text-xs rounded-lg bg-white/10 border border-white/15 text-white/70 hover:bg-white/15 transition">
                    Refresh
                </button>
            </div>
        </div>

        <!-- Attendance Table -->
        <div class="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-xs">
                    <thead>
                        <tr class="border-b border-white/10">
                            <th class="px-4 py-3 text-left text-white/50 font-medium">
                                <input type="checkbox" @change="toggleSelectAll" :checked="allSelected"
                                    class="rounded border-white/20" />
                            </th>
                            <th class="px-4 py-3 text-left text-white/50 font-medium">Employee</th>
                            <th class="px-4 py-3 text-left text-white/50 font-medium">Date</th>
                            <th class="px-4 py-3 text-left text-white/50 font-medium">Check In</th>
                            <th class="px-4 py-3 text-left text-white/50 font-medium">Check Out</th>
                            <th class="px-4 py-3 text-left text-white/50 font-medium">Status</th>
                            <th class="px-4 py-3 text-left text-white/50 font-medium">Regularise</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in attendanceRows" :key="row.id"
                            class="border-b border-white/5 hover:bg-white/5 transition">
                            <td class="px-4 py-3">
                                <input type="checkbox" :value="row.id" v-model="selectedIds"
                                    class="rounded border-white/20" />
                            </td>
                            <td class="px-4 py-3 text-white/80">{{ row.employee_name }}</td>
                            <td class="px-4 py-3 text-white/60">{{ row.date }}</td>
                            <td class="px-4 py-3 text-white/60 font-mono">{{ row.check_in || '—' }}</td>
                            <td class="px-4 py-3 text-white/60 font-mono">{{ row.check_out || '—' }}</td>
                            <td class="px-4 py-3">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                                    :class="statusChipClass(row.status)">
                                    {{ row.status }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <select v-model="row.regulariseType"
                                    class="bg-white/10 border border-white/15 rounded px-2 py-1 text-[11px] text-white/70 focus:outline-none">
                                    <option value="">—</option>
                                    <option value="ADJUST_LOGS">Adjust Logs</option>
                                    <option value="EXEMPT_PENALTY">Exempt Penalty</option>
                                </select>
                            </td>
                        </tr>
                        <tr v-if="!attendanceRows.length">
                            <td colspan="7" class="px-4 py-8 text-center text-white/40">No attendance records found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Bulk Action Bar -->
        <div v-if="selectedIds.length" class="flex items-center justify-between bg-blue-600/10 border border-blue-500/20 rounded-xl px-4 py-3">
            <div class="text-xs text-blue-300">
                {{ selectedIds.length }} row(s) selected
            </div>
            <button @click="confirmBulkAction"
                :disabled="bulkSubmitting"
                class="px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50">
                {{ bulkSubmitting ? 'Processing...' : 'Regularise Selected (Skip Approval)' }}
            </button>
        </div>

        <!-- Results Toast -->
        <div v-if="bulkResult" class="fixed bottom-4 right-4 z-50 bg-gray-900 border border-white/15 rounded-xl p-4 shadow-2xl max-w-sm">
            <div class="text-sm font-medium text-white/90 mb-1">Bulk Regularisation Result</div>
            <div class="text-xs text-white/60">{{ bulkResult.processed }} of {{ bulkResult.total }} processed successfully.</div>
            <button @click="bulkResult = null" class="mt-2 text-[11px] text-blue-400 hover:underline">Dismiss</button>
        </div>

        <!-- Confirm Dialog -->
        <Teleport to="body">
            <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                @click.self="showConfirm = false">
                <div class="bg-gray-900 border border-white/15 rounded-xl w-full max-w-sm p-6 shadow-2xl">
                    <h3 class="text-lg font-semibold text-white/90 mb-2">Confirm Bulk Regularisation</h3>
                    <p class="text-xs text-white/60 mb-4">
                        This will directly update {{ selectedIds.length }} attendance record(s) without going through the approval chain.
                        Are you sure?
                    </p>
                    <div class="flex justify-end gap-2">
                        <button @click="showConfirm = false"
                            class="px-4 py-2 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 transition">
                            Cancel
                        </button>
                        <button @click="executeBulkAction"
                            :disabled="bulkSubmitting"
                            class="px-4 py-2 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50">
                            {{ bulkSubmitting ? 'Processing...' : 'Confirm' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAttendanceRegularisationStore } from '../../../../stores/organization/attendanceRegularisation.store'

definePageMeta({ layout: 'organization' })

const regStore = useAttendanceRegularisationStore()

const filters = reactive({
    dateFrom: '',
    dateTo: '',
    status: '',
})

const attendanceRows = ref([])
const selectedIds = ref([])
const showConfirm = ref(false)
const bulkSubmitting = ref(false)
const bulkResult = ref(null)

const allSelected = computed(() =>
    attendanceRows.value.length > 0 && selectedIds.value.length === attendanceRows.value.length
)

const toggleSelectAll = () => {
    if (allSelected.value) {
        selectedIds.value = []
    } else {
        selectedIds.value = attendanceRows.value.map(r => r.id)
    }
}

const statusChipClass = (status) => ({
    'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30': status === 'PRESENT',
    'bg-red-600/20 text-red-300 border border-red-500/30': status === 'ABSENT',
    'bg-amber-600/20 text-amber-300 border border-amber-500/30': status === 'LATE',
    'bg-blue-600/20 text-blue-300 border border-blue-500/30': status === 'PENDING',
    'bg-purple-600/20 text-purple-300 border border-purple-500/30': status === 'REGULARISED',
})

const fetchData = async () => {
    await regStore.fetchRegularisations({
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        status: filters.status,
    })
    // For the bulk view, we also need attendance data
    // This would typically come from a dedicated endpoint
    // For now, use the regularisation list
    attendanceRows.value = regStore.regularisations.map(r => ({
        ...r,
        employee_name: r.employee_id,
        date: r.date,
        check_in: r.requested_in_time || '—',
        check_out: r.requested_out_time || '—',
        regulariseType: '',
    }))
}

const confirmBulkAction = () => {
    if (!selectedIds.value.length) return
    showConfirm.value = true
}

const executeBulkAction = async () => {
    bulkSubmitting.value = true
    try {
        const items = selectedIds.value.map(id => {
            const row = attendanceRows.value.find(r => r.id === id)
            return {
                employee_id: row.employee_id,
                attendance_id: row.attendance_id,
                date: row.date,
                type: row.regulariseType || 'EXEMPT_PENALTY',
                note: 'Bulk admin regularisation',
            }
        })

        const result = await regStore.submitBulkRegularise(items)
        showConfirm.value = false

        if (result.success) {
            bulkResult.value = { processed: result.processed, total: items.length }
            selectedIds.value = []
            await fetchData()
        }
    } finally {
        bulkSubmitting.value = false
    }
}

onMounted(() => fetchData())
</script>
