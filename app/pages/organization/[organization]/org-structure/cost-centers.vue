<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold uppercase text-white/90">Cost Center</h2>
                <p class="text-xs text-white/55">Manage cost centers and link employees to them.</p>
            </div>
            <div class="flex items-center gap-2">
                <UiButton @click="openAdd" color="#4aff7a" text="Add Cost Center" prepend-icon="ion:add-circle" />
                <UiButton @click="loadAll" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <div class="grid grid-cols-12 gap-2 flex-1 min-h-0">
            <aside class="col-span-12 md:col-span-3 flex flex-col min-h-0">
                <CostCenterSidebar :items="store.costCenters" :selected-id="store.selectedId"
                    :loading="store.loading" v-model="searchQuery" @select="select" @add="openAdd" />
            </aside>

            <section class="col-span-12 md:col-span-9 flex flex-col gap-2 min-h-0">
                <CostCenterHeader :cost-center="store.selectedCostCenter" @edit="openEdit" @delete="openDelete" />

                <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-2 flex-1 min-h-0 flex flex-col overflow-hidden">
                    <UiTabs v-model="activeTab" :tabs="tabs">
                        <SummaryTab v-if="activeTab === 0" :cost-center="store.selectedCostCenter" />
                        <EmployeesTab v-else :cost-center="store.selectedCostCenter" :employees="store.employees"
                            :total="store.employeesTotal" :loading="store.employeesLoading" @assign="openAssign"
                            @remove="removeEmployee" @load-more="loadMoreEmployees" @search="onEmployeesSearch" />
                    </UiTabs>
                </div>
            </section>
        </div>
    </div>

    <!-- Add / Edit Cost Center -->
    <UiSidebarModal v-model="formModal" :title="editing ? 'Edit Cost Center' : 'Add Cost Center'" width="560px">
        <template #default>
            <CostCenterForm ref="formRef" :initial="editing" @submit="save" />
        </template>
        <template #footer>
            <UiButton @click="formModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="submitForm" color="#4aff7a" :text="editing ? 'Save Changes' : 'Add Cost Center'"
                :prepend-icon="editing ? 'ion:save-outline' : 'ion:add-circle'" />
        </template>
    </UiSidebarModal>

    <!-- Delete confirmation -->
    <UiModal v-model="deleteModal" title="Delete Cost Center" width="480px">
        <template #title>
            <div class="flex items-center gap-2 text-rose-300">
                <Icon name="lucide:trash-2" class="w-5 h-5" /> Delete Cost Center
            </div>
        </template>
        <div class="flex flex-col gap-3">
            <p class="text-sm text-white/80">
                Are you sure you want to delete
                <span class="font-semibold text-white">{{ store.selectedCostCenter?.name }}</span>
                (<span class="font-mono">{{ store.selectedCostCenter?.code }}</span>)?
            </p>
            <p v-if="store.selectedCostCenter?.employee_count" class="text-xs text-amber-300">
                This cost center has {{ store.selectedCostCenter.employee_count }} employee(s) assigned. You must reassign
                or remove them before deleting.
            </p>
            <p v-else class="text-xs text-white/45">This action cannot be undone.</p>
        </div>
        <template #footer>
            <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton color="#f87171" text="Delete" prepend-icon="lucide:trash-2" :loading="deleting"
                :disabled="!!store.selectedCostCenter?.employee_count" @click="confirmDelete" />
        </template>
    </UiModal>

    <!-- Assign employees -->
    <AssignEmployeesModal v-model="assignModal" :cost-center="store.selectedCostCenter" :org-id="orgId"
        :assigned-ids="store.employees.map(e => e.id)" @assign="assignEmployees" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCostCenterStore } from '~/stores/organization/costCenter.store'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const orgId = route.params.organization

const store = useCostCenterStore()

const activeTab = ref(0)
const searchQuery = ref('')
const formModal = ref(false)
const deleteModal = ref(false)
const assignModal = ref(false)
const editing = ref(null)
const deleting = ref(false)
const formRef = ref(null)

let searchTimer = null

const tabs = computed(() => {
    const cc = store.selectedCostCenter
    return [
        { label: 'Summary', icon: 'lucide:file-text' },
        { label: 'Employees', icon: 'lucide:users', badge: cc?.employee_count || 0 },
    ]
})

const loadAll = async () => {
    try {
        await store.fetchCostCenters(orgId)
        if (store.selectedCostCenter) {
            await store.fetchEmployees(store.selectedCostCenter.id)
        }
    } catch (err) {
        useToast().error({ title: 'Failed', message: 'Could not load cost centers.', timeout: 3000 })
    }
}

const select = async (id) => {
    store.selectCostCenter(id)
    activeTab.value = 0
    store.employees = []
    store.employeesTotal = 0
    if (id) {
        try {
            await store.fetchEmployees(id)
        } catch (err) {
            console.error('[cost-centers] load employees error:', err)
        }
    }
}

watch(searchQuery, (v) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        store.fetchCostCenters(orgId, { search: v }).catch(() => {})
    }, 350)
})

const openAdd = () => {
    editing.value = null
    formModal.value = true
}

const openEdit = () => {
    if (!store.selectedCostCenter) return
    editing.value = store.selectedCostCenter
    formModal.value = true
}

const submitForm = async () => {
    await formRef.value?.submit()
}

const save = async (payload) => {
    try {
        if (editing.value) {
            await store.updateCostCenter(editing.value.id, payload)
            useToast().success({ title: 'Success!', message: 'Cost center updated.', timeout: 1500 })
        } else {
            await store.createCostCenter(payload)
            useToast().success({ title: 'Success!', message: 'Cost center added.', timeout: 1500 })
        }
        formModal.value = false
        editing.value = null
    } catch (err) {
        const msg = typeof err?.response?.data?.error === 'string'
            ? err.response.data.error.replace(/^\d+ [A-Z_]+:\s*/, '')
            : 'Could not save cost center.'
        useToast().error({ title: 'Failed', message: msg, timeout: 3000 })
    }
}

const openDelete = () => {
    deleteModal.value = true
}

const confirmDelete = async () => {
    if (!store.selectedCostCenter) return
    deleting.value = true
    try {
        await store.deleteCostCenter(store.selectedCostCenter.id)
        useToast().success({ title: 'Success!', message: 'Cost center deleted.', timeout: 1500 })
        deleteModal.value = false
        if (store.selectedCostCenter) await store.fetchEmployees(store.selectedCostCenter.id)
    } catch (err) {
        const msg = typeof err?.response?.data?.error === 'string'
            ? err.response.data.error.replace(/^\d+ [A-Z_]+:\s*/, '')
            : 'Could not delete cost center.'
        useToast().error({ title: 'Failed', message: msg, timeout: 3000 })
    } finally {
        deleting.value = false
    }
}

const openAssign = () => {
    assignModal.value = true
}

const assignEmployees = async (employeeIds) => {
    const cc = store.selectedCostCenter
    if (!cc) return
    try {
        const res = await store.assignEmployees(cc.id, employeeIds)
        await store.fetchEmployees(cc.id)
        await store.refreshCounts()
        useToast().success({ title: 'Success!', message: res?.message || 'Employees assigned.', timeout: 2000 })
    } catch (err) {
        const msg = typeof err?.response?.data?.error === 'string'
            ? err.response.data.error.replace(/^\d+ [A-Z_]+:\s*/, '')
            : 'Could not assign employees.'
        useToast().error({ title: 'Failed', message: msg, timeout: 3000 })
    }
}

const removeEmployee = async (employee) => {
    const cc = store.selectedCostCenter
    if (!cc) return
    try {
        await store.removeEmployee(cc.id, employee.id)
        await store.refreshCounts()
        useToast().success({ title: 'Success!', message: `${employee.full_name} removed from cost center.`, timeout: 2000 })
    } catch (err) {
        const msg = typeof err?.response?.data?.error === 'string'
            ? err.response.data.error.replace(/^\d+ [A-Z_]+:\s*/, '')
            : 'Could not remove employee.'
        useToast().error({ title: 'Failed', message: msg, timeout: 3000 })
    }
}

const onEmployeesSearch = (q) => {
    const cc = store.selectedCostCenter
    if (!cc) return
    store.employeesSearch = q
    store.fetchEmployees(cc.id).catch(() => {})
}

const loadMoreEmployees = () => {
    const cc = store.selectedCostCenter
    if (!cc) return
    store.employeesPage += 1
    store.fetchEmployees(cc.id).catch(() => {})
}

onMounted(loadAll)
</script>