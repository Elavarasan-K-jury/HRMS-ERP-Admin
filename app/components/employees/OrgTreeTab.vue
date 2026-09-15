<template>
    <div class="flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h3 class="text-lg font-semibold uppercase text-white/90 flex items-center gap-2">
                <Icon name="lucide:git-network" class="w-5 h-5" />
                Organization Chart
            </h3>
            <div class="flex items-center gap-2">
                <UiButton :disabled="orgChartLoading" @click="fetchData" color="#fff" text="Reload"
                    prepend-icon="ion:refresh" />
            </div>
        </div>

        <div class="relative z-20 flex flex-wrap items-center gap-2 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg px-4 py-3">
            <EmployeesFilterDropdown v-model="selectedDepartments" :options="deptOptions" title="Department" />
            <EmployeesFilterDropdown v-model="selectedSubDepartments" :options="subDeptOptions" title="Sub Department" />
            <EmployeesFilterDropdown v-model="selectedBranches" :options="branchOptions" title="Business Unit" />
            <UiButton size="xs" color="#4aff7a" text="Reset" prepend-icon="ion:close-circle-outline"
                @click="resetFilters" :disabled="!hasActiveFilters" />
        </div>

        <div>
            <div v-if="orgChartLoading" class="flex items-center justify-center py-20">
                <UiLoader />
            </div>

            <OrgChartTree v-else-if="orgChart?.roots?.length" :roots="orgChart.roots" />

            <div v-else
                class="rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg p-10 text-center">
                <Icon name="ion:people-outline" class="text-4xl text-white/30 mx-auto mb-3" />
                <p class="text-white/60 text-sm">No employees found in the organization.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/shared/auth.store'
import { useHierarchyStore } from '~/stores/organization/hierarchy.store'
import { useDepartmentStore } from '~/stores/organization/department.store'
import { useBranchStore } from '~/stores/organization/branch.store'
import OrgChartTree from '~/components/hierarchy/OrgChartTree.vue'

const authStore = useAuthStore()
const hierarchyStore = useHierarchyStore()
const departmentStore = useDepartmentStore()
const branchStore = useBranchStore()

const {
    orgChart,
    orgChartLoading,
} = storeToRefs(hierarchyStore)

const selectedDepartments = ref([])
const selectedSubDepartments = ref([])
const selectedBranches = ref([])
const orgName = ref('')

const deptOptions = computed(() =>
    departmentStore.department_select.filter(d => !d.parent_id).map(d => ({ value: d.value, label: d.label }))
)
const subDeptOptions = computed(() => {
    const selected = selectedDepartments.value
    if (!selected.length) return []
    return departmentStore.department_select
        .filter(d => selected.includes(d.parent_id))
        .map(d => ({ value: d.value, label: d.label }))
})
const branchOptions = computed(() => {
    const opts = branchStore.branch_select.map(b => ({ value: b.value, label: b.label }))
    if (orgName.value) opts.unshift({ value: '__org__', label: orgName.value })
    return opts
})

const hasActiveFilters = computed(() =>
    selectedDepartments.value.length > 0 ||
    selectedSubDepartments.value.length > 0 ||
    selectedBranches.value.length > 0)

const resetFilters = () => {
    selectedDepartments.value = []
    selectedSubDepartments.value = []
    selectedBranches.value = []
    fetchData()
}

const fetchData = async () => {
    if (authStore.organization) {
        const deptId = selectedSubDepartments.value.length
            ? selectedSubDepartments.value.join(',')
            : selectedDepartments.value.length
                ? selectedDepartments.value.join(',')
                : null
        const branchId = selectedBranches.value.includes('__org__')
            ? null
            : selectedBranches.value.length
                ? selectedBranches.value.join(',')
                : null
        await hierarchyStore.fetchOrgChart(authStore.organization, deptId, branchId)
    }
}

watch(selectedDepartments, () => {
    selectedSubDepartments.value = []
    fetchData()
})

watch(selectedSubDepartments, () => {
    fetchData()
})

watch(selectedBranches, () => {
    fetchData()
})

const handleRefresh = (e) => {
    if (e.detail.tab === 1) fetchData()
}

onMounted(async () => {
    if (authStore.organization) {
        departmentStore.organization_id = authStore.organization
        await departmentStore.fetchAllDepartments()
        branchStore.organization_id = authStore.organization
        await branchStore.fetchAllBranches()
        try {
            const { $api } = useNuxtApp()
            const { data } = await $api.get(`/organizations/${authStore.organization}`)
            orgName.value = data?.name || ''
        } catch (e) {
            console.error('Failed to fetch organization name:', e)
        }
        await fetchData()
    }
    window.addEventListener('refresh-tab', handleRefresh)
})

onBeforeUnmount(() => {
    window.removeEventListener('refresh-tab', handleRefresh)
})
</script>
