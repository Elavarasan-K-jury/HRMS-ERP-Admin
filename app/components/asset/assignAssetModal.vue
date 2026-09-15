<template>
    <UiSidebarModal v-model="assignModal" title="Assign Asset" width="600px">
        <template #default>
            <div class="space-y-4 p-2">
                <!-- Employee Selection -->
                <div class="flex flex-col gap-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Icon name="lucide:user" size="16" class="text-purple-400" />
                        Employee <span class="uppercase font-bold text-red-500">*</span>
                    </label>
                    <FormSelect
                        rounded="lg"
                        color="#fff"
                        v-model="selectedEmployee"
                        :options="employeeOptions"
                        placeholder="Search and select employee"
                        :loading="employeesLoading"
                        class="transition-transform hover:scale-[1.01]"
                    />
                </div>

                <!-- Asset Selection -->
                <div class="flex flex-col gap-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Icon name="ion:laptop-outline" size="16" class="text-cyan-400" />
                        Available Asset <span class="uppercase font-bold text-red-500">*</span>
                    </label>
                    <FormSelect
                        rounded="lg"
                        color="#fff"
                        v-model="selectedAsset"
                        :options="availableAssetOptions"
                        placeholder="Select available asset"
                        :loading="assetsLoading"
                        class="transition-transform hover:scale-[1.01]"
                    />
                    <div v-if="selectedAsset" class="text-xs text-white/50 mt-1">
                        {{ selectedAsset.label }}
                    </div>
                </div>

                <!-- Assignment Date -->
                <div class="flex flex-col gap-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Icon name="lucide:calendar" size="16" class="text-green-400" />
                        Assigned On
                    </label>
                    <FormInput
                        type="date"
                        rounded="lg"
                        color="#fff"
                        v-model="assignDate"
                        class="transition-transform hover:scale-[1.01]"
                    />
                </div>

                <!-- Condition -->
                <div class="flex flex-col gap-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Icon name="lucide:activity" size="16" class="text-amber-400" />
                        Asset Condition
                    </label>
                    <FormSelect
                        rounded="lg"
                        color="#fff"
                        v-model="assignCondition"
                        :options="conditionOptions"
                        placeholder="Select condition"
                        class="transition-transform hover:scale-[1.01]"
                    />
                </div>

                <!-- Notes -->
                <div class="flex flex-col gap-2">
                    <label class="text-white/70 text-sm font-medium flex items-center gap-2">
                        <Icon name="lucide:message-square" size="16" class="text-white/50" />
                        Notes
                    </label>
                    <FormTextArea
                        v-model="assignNotes"
                        placeholder="Add any notes about this assignment"
                        color="#fff"
                        rounded="lg"
                        :rows="3"
                        :autoresize="true"
                        clearable
                    />
                </div>
            </div>
        </template>

        <template #footer>
            <UiButton @click="close" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton
                :disabled="loading || !selectedEmployee || !selectedAsset"
                @click="submit"
                color="#4aff7a"
                :text="loading ? 'Assigning...' : 'Assign Asset'"
                prepend-icon="heroicons:check-circle"
            />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetAssignmentStore } from '../../stores/organization/assetAssignment.store'
import { useEmployeesStore } from '../../stores/organization/employee.store'
import { useAssetsStore } from '../../stores/organization/assets.store'

const emit = defineEmits(['assigned'])

const assignmentStore = useAssetAssignmentStore()
const employeeStore = useEmployeesStore()
const assetStore = useAssetsStore()

const {
    assignModal,
    selectedEmployee,
    selectedAsset,
    assignDate,
    assignCondition,
    assignNotes,
    loading,
} = storeToRefs(assignmentStore)

const employeesLoading = computed(() => employeeStore.loading)
const assetsLoading = computed(() => assetStore.loading)

const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
    { value: 'DAMAGED', label: 'Damaged' },
]

// Employee options from store
const employeeOptions = computed(() => {
    return (employeeStore.all_employees || []).map(e => ({
        value: e.id,
        label: `${e.full_name} (${e.employee_code || 'N/A'})`,
    }))
})

// Available assets (status === AVAILABLE)
const availableAssetOptions = computed(() => {
    return (assetStore.assets || [])
        .filter(a => a.status === 'AVAILABLE')
        .map(a => ({
            value: a.id,
            label: `${a.asset_tag || '—'} | ${a.serial_number || '—'} | ${a.model?.model_name || '—'} | ${a.category?.name || '—'}`,
        }))
})

// Load data when modal opens
watch(assignModal, async (val) => {
    if (val) {
        assignmentStore.resetAssignForm()
        await Promise.all([
            employeeStore.fetchAllEmployees(),
            assetStore.fetchAssets(),
        ])
    }
})

const close = () => {
    assignmentStore.assignModal = false
    assignmentStore.resetAssignForm()
}

const submit = async () => {
    await assignmentStore.createAssignment()
    emit('assigned')
}
</script>
