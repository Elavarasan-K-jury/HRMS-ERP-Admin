<template>
    <div class="flex flex-col gap-3">
        <div class="probation-nav" role="tablist" aria-label="Employee probation">
            <button v-for="(tab, index) in tabs" :key="tab.label" type="button" role="tab"
                :aria-selected="activeTab === index" class="probation-nav-item"
                :class="{ 'probation-nav-item-active': activeTab === index }" @click="activeTab = index">
                <Icon :name="tab.icon" class="text-lg" />
                <span>{{ tab.label }}</span>
            </button>
        </div>

        <section v-show="activeTab === 0" class="probation-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">In probation</p>
                    <h3>Probations</h3>
                    <p>View all probations with assigned employees.</p>
                </div>
                <UiButton @click="fetchProbations" color="#fff" text="Reload" prepend-icon="ion:refresh"
                    :disabled="loading" />
            </div>
            <div v-if="loading" class="py-10 text-center text-sm text-white/50">Loading probations…</div>
            <div v-else-if="!probations.length" class="py-10 text-center text-sm text-white/50">
                No employees currently in probation.
            </div>
            <div v-else class="overflow-x-auto">
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-gradient-to-r from-emerald-900/30 via-slate-900/50 to-slate-900/50 border-b border-white/10 sticky top-0 z-10">
                        <tr>
                            <th class="th text-left">Employee</th>
                            <th class="th text-left">Department</th>
                            <th class="th text-left">Sub Department</th>
                            <th class="th text-left">Designation</th>
                            <th class="th text-left">Probation Start</th>
                            <th class="th text-left">Probation End</th>
                            <th class="th text-left">Status</th>
                            <th class="th text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in filteredProbations" :key="p.id"
                            class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td class="td py-5 px-6">
                                <div class="font-semibold text-white">{{ p.employee?.full_name || p.name || '—' }}</div>
                                <div class="text-xs text-white/70 mt-1">{{ p.employee?.employee_code || p.employee_code || '—' }}</div>
                            </td>
                            <td class="td py-5 px-6">{{ p.department_name || '—' }}</td>
                            <td class="td py-5 px-6">{{ p.sub_department_name || '—' }}</td>
                            <td class="td py-5 px-6">{{ p.designation_name || '—' }}</td>
                            <td class="td py-5 px-6">
                                <span v-if="p.probation?.start_date" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs font-medium">
                                    <Icon name="ion:calendar-outline" class="w-3.5 h-3.5" />
                                    {{ formatDate(p.probation.start_date) }}
                                </span>
                                <span v-else class="text-white/40 text-sm">—</span>
                            </td>
                            <td class="td py-5 px-6">
                                <div>
                                    <span v-if="p.probation?.end_date" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs font-medium">
                                        <Icon name="ion:calendar-outline" class="w-3.5 h-3.5" />
                                        {{ formatDate(p.probation.end_date) }}
                                    </span>
                                    <span v-else class="text-white/40 text-sm">—</span>
                                    <div v-if="p.probation?.extended" class="text-xs text-amber-300/90 mt-1">
                                        extended {{ p.probation.extended_by_months }} mo
                                    </div>
                                </div>
                            </td>
                            <td class="td py-5 px-6">
                                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium" :class="statusClass(p.status)">
                                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    {{ p.status || 'In Progress' }}
                                </span>
                            </td>
                            <td class="td py-5 px-6 text-right">
                                <UiButton size="xs" color="#4aff7a" text="View" prepend-icon="ion:eye-outline"
                                    @click="viewDetails(p)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section v-show="activeTab === 1" class="probation-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Under evaluation</p>
                    <h3>Evaluation Pending</h3>
                    <p>Employees currently being evaluated during their probation period.</p>
                </div>
            </div>
            <div class="py-12 text-center">
                <Icon name="ion:time-outline" class="mx-auto mb-3 text-4xl text-white/30" />
                <p class="text-sm text-white/50">No evaluations pending yet.</p>
            </div>
        </section>

        <section v-show="activeTab === 2" class="probation-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Completed</p>
                    <h3>Completed Probations</h3>
                    <p>Employees who successfully completed their probation period.</p>
                </div>
            </div>
            <div class="py-12 text-center">
                <Icon name="ion:checkmark-done-outline" class="mx-auto mb-3 text-4xl text-white/30" />
                <p class="text-sm text-white/50">No completed probations yet.</p>
            </div>
        </section>

        <section v-show="activeTab === 3" class="probation-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Employment Policies</p>
                    <h3>Policy Library</h3>
                    <p>Configure probation, internship, trainee and contract policies for employees.</p>
                </div>
                <div class="flex items-center gap-2">
                    <UiButton @click="fetchPolicies" color="#fff" text="Reload" prepend-icon="ion:refresh"
                        :disabled="ppLoading" />
                    <UiButton @click="openAddPolicy" color="#4aff7a" text="Add Policy" prepend-icon="ion:add-circle"
                        :disabled="ppLoading" />
                </div>
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-white/45">Total</span>
                        <Icon name="lucide:file-stack" class="w-4 h-4 text-white/40" />
                    </div>
                    <p class="mt-2 text-2xl font-bold text-white/90">{{ policyStats.total }}</p>
                </div>
                <div class="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/70">Active</span>
                        <Icon name="lucide:circle-check" class="w-4 h-4 text-emerald-300/70" />
                    </div>
                    <p class="mt-2 text-2xl font-bold text-emerald-200">{{ policyStats.active }}</p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-white/45">Inactive</span>
                        <Icon name="lucide:circle-slash" class="w-4 h-4 text-white/40" />
                    </div>
                    <p class="mt-2 text-2xl font-bold text-white/90">{{ policyStats.inactive }}</p>
                </div>
                <div class="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">Default</span>
                        <Icon name="lucide:star" class="w-4 h-4 text-amber-300/70" />
                    </div>
                    <p class="mt-2 text-2xl font-bold text-amber-200">{{ policyStats.defaults }}</p>
                </div>
            </div>

            <div class="mt-5 border-b border-white/10">
                <div class="flex items-center gap-1 overflow-x-auto">
                    <button v-for="t in policyTypeTabs" :key="t.value" type="button"
                        class="type-filter-item"
                        :class="policyTypeFilter === t.value ? 'type-filter-item-active' : ''"
                        @click="setPolicyTypeFilter(t.value)">
                        <span class="w-1.5 h-1.5 rounded-full" :style="{ background: t.color }"></span>
                        {{ t.label }}
                        <span class="type-filter-count"
                            :class="policyTypeFilter === t.value ? 'type-filter-count-active' : ''">
                            {{ policyTypeCount(t.value) }}
                        </span>
                    </button>
                </div>
            </div>

            <div class="mt-4">
                <ProbationPolicyList :items="filteredPolicies" :loading="ppLoading" :total="filteredPolicies.length"
                    @edit="editPolicy" @delete="openDelete" @toggle="togglePolicy" @clone="clonePolicy"
                    @set-default="setDefaultPolicy" />
            </div>
        </section>

        <section v-show="activeTab === 4" class="probation-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Feedback</p>
                    <h3>Feedback Forms</h3>
                    <p>Manage feedback forms used during probation evaluation.</p>
                </div>
            </div>
            <div class="py-12 text-center">
                <Icon name="ion:chatbubbles-outline" class="mx-auto mb-3 text-4xl text-white/30" />
                <p class="text-sm text-white/50">No feedback forms created yet.</p>
            </div>
        </section>

        <!-- Probation Policy modals -->
        <ProbationPolicyView v-model="ppViewModal" :policy="ppViewData" />

        <UiSidebarModal v-model="ppModal" :title="ppFormTitle" width="720px" :show-footer="false">
            <template #default>
                <ProbationPolicyForm :saving="ppSaving" @save="savePolicy" @cancel="closePolicyForm" />
            </template>
        </UiSidebarModal>

        <UiModal v-model="ppDeleteModal" title="Are you sure?" size="sm">
            <template #default>
                <span>Delete policy <b>{{ ppDeleteData?.name }}</b>?</span>
            </template>
            <template #footer>
                <UiButton @click="ppDeleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="confirmDeletePolicy" color="#750d0d" text="Delete Policy" prepend-icon="ion:trash" />
            </template>
        </UiModal>

        <UiModal v-model="detailModal" title="Probation Details" size="lg">
            <div v-if="selectedProbation" class="space-y-5">
                <div class="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 via-slate-900/50 to-slate-900/50 p-5">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <Icon name="lucide:user" class="w-6 h-6 text-emerald-300" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-white truncate">{{ selectedProbation.employee?.full_name || '—' }}</h3>
                                    <div class="flex items-center gap-2 mt-1 text-sm text-white/60">
                                        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">{{ selectedProbation.employee?.employee_code || '—' }}</span>
                                        <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg font-medium" :class="statusClass(selectedProbation.status)">
                                            <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {{ selectedProbation.status || 'In Progress' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">Policy</div>
                        <div class="text-sm text-white/90">{{ selectedProbation.probation?.policy_name || '—' }}</div>
                        <div v-if="selectedProbation.probation?.duration_value" class="text-xs text-white/60 mt-1">
                            Duration: {{ selectedProbation.probation.duration_value }} {{ selectedProbation.probation.duration_unit || '' }}
                        </div>
                    </div>
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">Status</div>
                        <div class="text-sm text-white/90">{{ selectedProbation.status || '—' }}</div>
                    </div>
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">Start Date</div>
                        <div class="text-sm text-white/90">{{ formatDate(selectedProbation.probation?.start_date) }}</div>
                    </div>
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">End Date</div>
                        <div class="text-sm text-white/90">{{ formatDate(selectedProbation.probation?.end_date) }}</div>
                    </div>
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">Extended By</div>
                        <div class="text-sm text-white/90">{{ selectedProbation.probation?.extended_by_months || 0 }} month(s)</div>
                    </div>
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">Joining Date</div>
                        <div class="text-sm text-white/90">{{ formatDate(selectedProbation.probation?.joining_date) }}</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <UiButton color="#fff" text="Close" @click="detailModal = false" />
            </template>
        </UiModal>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useProbationPolicyStore } from '../../stores/probationPolicy.store'
import ProbationPolicyList from '../probation-policy/ProbationPolicyList.vue'
import ProbationPolicyForm from '../probation-policy/ProbationPolicyForm.vue'
import ProbationPolicyView from '../probation-policy/ProbationPolicyView.vue'

const route = useRoute()
const activeTab = ref(0)
const statusFilter = ref(null)
const loading = ref(false)
const probations = ref([])
const detailModal = ref(false)
const selectedProbation = ref(null)

/* Probation Policies */
const ppStore = useProbationPolicyStore()
const ppLoading = computed(() => ppStore.loading)
const ppSaving = ref(false)
const ppModal = ref(false)
const ppFormTitle = ref('Add New Probation Policy')
const ppViewModal = ref(false)
const ppViewData = ref(null)
const ppDeleteModal = ref(false)
const ppDeleteData = ref(null)

const policyTypeTabs = [
    { value: 'ALL', label: 'All', color: '#94a3b8' },
    { value: 'PROBATION', label: 'Probation', color: '#4aff7a' },
    { value: 'INTERNSHIP', label: 'Internship', color: '#38bdf8' },
    { value: 'TRAINEE', label: 'Trainee', color: '#fbbf24' },
    { value: 'CONTRACT', label: 'Contract', color: '#f472b6' },
]
const policyTypeFilter = ref('PROBATION')

const policyStats = computed(() => {
    const all = ppStore.policies || []
    return {
        total: all.length,
        active: all.filter(p => p.is_active).length,
        inactive: all.filter(p => !p.is_active).length,
        defaults: all.filter(p => p.is_default).length,
    }
})

const policyTypeCount = (value) => {
    if (value === 'ALL') return ppStore.policies.length
    return ppStore.policies.filter(p => p.policy_type === value).length
}

const filteredPolicies = computed(() => {
    if (policyTypeFilter.value === 'ALL') return ppStore.policies
    return ppStore.policies.filter(p => p.policy_type === policyTypeFilter.value)
})

const fetchPolicies = async () => {
    await ppStore.fetchPolicies()
}

const setPolicyTypeFilter = (value) => {
    policyTypeFilter.value = value
}

const openAddPolicy = () => {
    ppStore.resetForm()
    ppStore.policy_type = policyTypeFilter.value === 'ALL' ? 'PROBATION' : policyTypeFilter.value
    ppFormTitle.value = 'Add New Employment Policy'
    ppModal.value = true
}

const editPolicy = (policy) => {
    ppStore.loadPolicy(policy)
    ppFormTitle.value = 'Update Employment Policy'
    ppModal.value = true
}

const viewPolicy = (policy) => {
    ppViewData.value = policy
    ppViewModal.value = true
}

const closePolicyForm = () => {
    ppModal.value = false
    ppStore.resetForm()
}

const savePolicy = async () => {
    ppSaving.value = true
    try {
        if (ppStore.policy_id) {
            await ppStore.updatePolicy()
        } else {
            await ppStore.createPolicy()
        }
        ppStore.completeStep(4)
        ppModal.value = false
    } finally {
        ppSaving.value = false
    }
}

const openDelete = (policy) => {
    ppDeleteData.value = policy
    ppDeleteModal.value = true
}

const confirmDeletePolicy = async () => {
    if (ppDeleteData.value?.id) {
        await ppStore.deletePolicy(ppDeleteData.value.id)
    }
    ppDeleteModal.value = false
    ppDeleteData.value = null
}

const togglePolicy = async (policy) => {
    await ppStore.toggleActive(policy)
}

const clonePolicy = async (policy) => {
    await ppStore.clonePolicy(policy)
    useToast().success({ title: 'Cloned!', message: `"${policy.name}" was cloned.` })
}

const setDefaultPolicy = async (policy) => {
    await ppStore.setDefault(policy)
    useToast().success({ title: 'Default set', message: `"${policy.name}" is now the default policy.` })
}

const statusOptions = [
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Extended', value: 'Extended' },
    { label: 'Terminated', value: 'Terminated' },
]

const filteredProbations = computed(() => {
    if (!statusFilter.value) return probations.value
    return probations.value.filter(p => p.status === statusFilter.value)
})

const statusClass = (status) => {
    switch (status) {
        case 'In Progress': return 'bg-blue-500/20 text-blue-300'
        case 'Completed': return 'bg-emerald-500/20 text-emerald-300'
        case 'Extended': return 'bg-amber-500/20 text-amber-300'
        case 'Terminated': return 'bg-red-500/20 text-red-300'
        default: return 'bg-white/10 text-white/60'
    }
}

const formatDate = (date) => {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleString('en-IN', { dateStyle: 'medium' })
    } catch {
        return date
    }
}

const fetchProbations = async () => {
    loading.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get('/employees/all', {
            params: { organization_id: route.params.organization },
        })
        const employees = data.employees || []
        probations.value = employees
            .filter(e => e.probation?.in_progress)
            .map(e => ({
                id: e.id,
                employee: {
                    id: e.id,
                    full_name: e.full_name,
                    employee_code: e.employee_code,
                },
                department_name: e.department_name || '',
                sub_department_name: e.sub_department_name || '',
                designation_name: e.designation?.name || '',
                probation: e.probation,
                status: e.probation?.status || 'In Progress',
            }))
    } catch (err) {
        console.error('Failed to fetch probations:', err)
    } finally {
        loading.value = false
    }
}

const tabs = [
    { label: 'In Probation', icon: 'ion:briefcase-outline' },
    { label: 'Under Evaluation', icon: 'ion:time-outline' },
    { label: 'Completed Probations', icon: 'ion:checkmark-done-outline' },
    { label: 'Employment Policies', icon: 'ion:document-text-outline' },
    { label: 'Feedback Forms', icon: 'ion:chatbubbles-outline' },
]

const confirmProbation = (p, newStatus) => {
    p.status = newStatus
}

const viewDetails = (p) => {
    selectedProbation.value = p
    detailModal.value = true
}

const handleRefresh = (e) => {
    if (e.detail.tab === 4) fetchProbations()
}

onMounted(() => {
    fetchProbations()
    fetchPolicies()
    window.addEventListener('refresh-tab', handleRefresh)
})

onBeforeUnmount(() => {
    window.removeEventListener('refresh-tab', handleRefresh)
})

</script>

<style scoped>
.probation-nav { @apply flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-black/10 p-1; }
.probation-nav-item { @apply relative inline-flex min-w-max items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white/55 transition-all hover:bg-white/10 hover:text-white/90; }
.probation-nav-item::after { content: ''; @apply absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-transparent transition-all; }
.probation-nav-item-active { @apply bg-emerald-300/10 text-emerald-200; }
.probation-nav-item-active::after { @apply bg-emerald-300 shadow-[0_0_12px_rgba(74,255,122,.8)]; }
.probation-panel { @apply rounded-xl border border-white/15 bg-white/[.07] backdrop-blur-xl shadow-lg p-6; }
.type-filter-item { @apply relative inline-flex min-w-max items-center gap-1.5 rounded-t-lg px-4 py-3 text-xs font-semibold text-white/55 transition-all hover:bg-white/5 hover:text-white/90; }
.type-filter-item::after { content: ''; @apply absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-transparent transition-all; }
.type-filter-item-active { @apply bg-emerald-300/10 text-emerald-200; }
.type-filter-item-active::after { @apply bg-emerald-300 shadow-[0_0_12px_rgba(74,255,122,.8)]; }
.type-filter-count { @apply ml-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold bg-white/10 text-white/50 transition-colors; }
.type-filter-count-active { @apply bg-emerald-400/20 text-emerald-100; }
.panel-heading { @apply flex items-start justify-between gap-4 border-b border-white/10 pb-5; }
.panel-heading h3 { @apply mt-1 text-lg font-semibold text-white/90; }
.panel-heading p:not(.eyebrow) { @apply mt-1 text-sm text-white/50; }
.eyebrow { @apply text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300/75; }
.th { @apply px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80; }
.td { @apply text-sm; }
</style>
