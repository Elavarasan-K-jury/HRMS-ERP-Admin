<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                Assigned Assets
            </h2>

            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="loading" />
                <UiButton @click="openAssignModal" color="#4aff7a" text="Assign Asset" prepend-icon="ion:add-circle" />
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
                class="w-48 transition-transform hover:scale-[1.01]"
            />
            <span class="text-xs text-white/50">
                {{ groupedEmployees.length }} employee(s) with assignments
            </span>
        </div>

        <!-- TABLE -->
        <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                        <tr>
                            <th class="th">Employee</th>
                            <th class="th">Department</th>
                            <th class="th">Location</th>
                            <th class="th">Status</th>
                            <th class="th">Assets Assigned</th>
                            <th class="th text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        <!-- Skeleton Loader -->
                        <template v-if="loading">
                            <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                                <td class="td"><div class="skeleton w-40" /></td>
                                <td class="td"><div class="skeleton w-24" /></td>
                                <td class="td"><div class="skeleton w-24" /></td>
                                <td class="td"><div class="skeleton w-20" /></td>
                                <td class="td"><div class="skeleton w-16" /></td>
                                <td class="td text-right"><div class="skeleton w-16 ml-auto" /></td>
                            </tr>
                        </template>

                        <!-- Empty State -->
                        <tr v-else-if="!groupedEmployees.length">
                            <td colspan="6" class="td text-center py-10">
                                <div class="flex flex-col items-center gap-2 text-white/50">
                                    <Icon name="lucide:inbox" class="w-8 h-8" />
                                    <span>No assigned assets found.</span>
                                </div>
                            </td>
                        </tr>

                        <!-- Data Rows -->
                        <tr v-else v-for="emp in groupedEmployees" :key="emp.employee_id"
                            class="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            @click="openDrawer(emp)">

                            <td class="td">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                        {{ getInitials(emp.employee_name) }}
                                    </div>
                                    <div>
                                        <div class="font-semibold text-white">{{ emp.employee_name }}</div>
                                        <div class="text-xs text-white/50">{{ emp.employee_code }}</div>
                                    </div>
                                </div>
                            </td>

                            <td class="td text-white/70">{{ emp.department || '—' }}</td>
                            <td class="td text-white/70">{{ emp.location || '—' }}</td>

                            <td class="td">
                                <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300">
                                    <Icon name="lucide:check-circle" class="w-3.5 h-3.5" />
                                    Active
                                </span>
                            </td>

                            <td class="td">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-white font-semibold">{{ emp.assignments.length }}</span>
                                    <span class="text-white/50 text-xs">asset(s)</span>
                                </div>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <span v-for="a in emp.assignments.slice(0, 3)" :key="a.id"
                                        class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                        {{ a.asset?.asset_tag || a.asset?.serial_number || '—' }}
                                    </span>
                                    <span v-if="emp.assignments.length > 3"
                                        class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                                        +{{ emp.assignments.length - 3 }} more
                                    </span>
                                </div>
                            </td>

                            <td class="td text-right">
                                <UiButton color="#fff" class="btn-icon" title="View Assets" @click.stop="openDrawer(emp)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </UiButton>
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
                    <span class="text-white">{{ totalPages }}</span> —
                    <span class="text-white">{{ total }}</span> results
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

        <!-- EMPLOYEE ASSETS DRAWER -->
        <EmployeeAssetsDrawer />

        <!-- ASSIGN ASSET MODAL -->
        <AssignAssetModal @assigned="fetchData" />
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetAssignmentStore } from '../../../../stores/organization/assetAssignment.store'
import EmployeeAssetsDrawer from '../../../../components/asset/employeeAssetsDrawer.vue'
import AssignAssetModal from '../../../../components/asset/assignAssetModal.vue'

definePageMeta({
    layout: 'organization',
})

const assignmentStore = useAssetAssignmentStore()
const {
    loading,
    total,
    search,
    page,
    totalPages,
    statusFilter,
    assignments,
} = storeToRefs(assignmentStore)

const statusFilterOptions = [
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'ASSIGNMENT_PENDING', label: 'Pending' },
    { value: 'RETURN_REQUESTED', label: 'Return Requested' },
    { value: 'RETURNED', label: 'Returned' },
]

// Group assignments by employee
const groupedEmployees = computed(() => {
    const map = new Map()
    for (const a of assignments.value) {
        if (!a.employee) continue
        const empId = a.employee_id
        if (!map.has(empId)) {
            map.set(empId, {
                employee_id: empId,
                employee_name: a.employee.full_name || `${a.employee.first_name || ''} ${a.employee.last_name || ''}`.trim(),
                employee_code: a.employee.employee_code || '',
                department: '',
                location: '',
                assignments: [],
            })
        }
        map.get(empId).assignments.push(a)
    }
    return Array.from(map.values())
})

const fetchData = async () => {
    await assignmentStore.fetchAssignments()
}

const openAssignModal = () => {
    assignmentStore.assignModal = true
}

const openDrawer = (emp) => {
    assignmentStore.openEmployeeDrawer(emp)
}

const prevPage = () => {
    if (page.value > 1) {
        page.value--
        fetchData()
    }
}

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++
        fetchData()
    }
}

function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Debounced search
const searchTimer = ref(null)
watch(search, () => {
    clearTimeout(searchTimer.value)
    searchTimer.value = setTimeout(() => {
        page.value = 1
        fetchData()
    }, 300)
})

watch(statusFilter, () => {
    page.value = 1
    fetchData()
})

onMounted(fetchData)
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}
.td {
    @apply px-4 py-3 align-middle text-white/90;
}
.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}
.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}
.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}
@keyframes shimmer {
    0% { background-position: 200% 0 }
    100% { background-position: -200% 0 }
}
</style>
