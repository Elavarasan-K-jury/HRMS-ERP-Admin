<template>
    <UiSidebarModal v-model="open" title="Assign Asset to Request" width="600px">
        <template #default>
            <div v-if="request" class="assign-body">
                <!-- Request Summary (read-only) -->
                <div class="request-summary">
                    <div class="summary-row">
                        <span class="summary-label">Employee</span>
                        <span class="summary-value">{{ request.employee?.full_name || '—' }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Category</span>
                        <span class="summary-value">{{ request.category?.name || '—' }}</span>
                    </div>
                    <div class="summary-row" v-if="request.model">
                        <span class="summary-label">Model</span>
                        <span class="summary-value">{{ request.model.brand }} {{ request.model.model_name }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Priority</span>
                        <span class="badge" :class="priorityClass(request.priority)">{{ request.priority }}</span>
                    </div>
                </div>

                <!-- Asset Selection -->
                <div class="form-field">
                    <label class="form-label">Select Available Asset <span class="text-red-400">*</span></label>
                    <FormSelect
                        v-model="selectedAsset"
                        :options="filteredAssetOptions"
                        placeholder="Search and select an available asset"
                        searchable
                        color="#fff"
                        size="md"
                        rounded="lg"
                        :loading="assetsLoading"
                    />
                    <p v-if="!filteredAssetOptions.length && !assetsLoading" class="text-xs text-amber-400 mt-1">
                        No available assets match this request's category{{ request.model ? ' and model' : '' }}.
                    </p>
                </div>

                <!-- Asset Preview -->
                <div v-if="selectedAsset && assetPreview" class="asset-preview">
                    <div class="preview-row">
                        <span class="preview-label">Asset Tag</span>
                        <span class="preview-value">{{ assetPreview.asset_tag || '—' }}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Serial Number</span>
                        <span class="preview-value">{{ assetPreview.serial_number || '—' }}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Model</span>
                        <span class="preview-value">{{ assetPreview.model?.model_name || '—' }}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Category</span>
                        <span class="preview-value">{{ assetPreview.category?.name || '—' }}</span>
                    </div>
                    <div class="preview-row">
                        <span class="preview-label">Status</span>
                        <span class="badge bg-green-500/20 text-green-300">{{ assetPreview.status }}</span>
                    </div>
                </div>

                <!-- Assignment Date -->
                <div class="form-field">
                    <label class="form-label">Assigned Date</label>
                    <FormInput
                        type="date"
                        v-model="assignedDate"
                        color="#fff"
                        size="md"
                        rounded="lg"
                    />
                </div>

                <!-- Condition -->
                <div class="form-field">
                    <label class="form-label">Asset Condition</label>
                    <FormSelect
                        v-model="condition"
                        :options="conditionOptions"
                        placeholder="Select condition"
                        color="#fff"
                        size="md"
                        rounded="lg"
                    />
                </div>

                <!-- Notes -->
                <div class="form-field">
                    <label class="form-label">Notes</label>
                    <InputArea
                        v-model="notes"
                        color="#fff"
                        placeholder="Add notes about this assignment"
                        rows="2"
                    />
                </div>
            </div>
        </template>

        <template #footer>
            <div class="w-full flex justify-end gap-3">
                <UiButton :disabled="submitting" color="#fff" text="Cancel" @click="close" />
                <UiButton
                    :disabled="submitting || !selectedAsset"
                    color="#4aff7a"
                    :text="submitting ? 'Assigning...' : 'Assign Asset'"
                    prepend-icon="ion:checkmark-circle"
                    @click="submit"
                />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetRequestsStore } from '../../stores/organization/assetRequest.store'
import { useAssetsStore } from '../../stores/organization/assets.store'

const emit = defineEmits(['assigned'])

const store = useAssetRequestsStore()
const assetStore = useAssetsStore()

const { assignModal, selectedRequest: request } = storeToRefs(store)

const open = computed({
    get: () => assignModal.value,
    set: (val) => { assignModal.value = val },
})

const selectedAsset = ref(null)
const assignedDate = ref(new Date().toISOString().split('T')[0])
const condition = ref('GOOD')
const notes = ref('')
const submitting = ref(false)
const assetsLoading = computed(() => assetStore.loading)

const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
    { value: 'DAMAGED', label: 'Damaged' },
]

const filteredAssetOptions = computed(() => {
    let assets = (assetStore.assets || []).filter(a => a.status === 'AVAILABLE')

    if (request.value?.category_id) {
        assets = assets.filter(a => {
            const catId = a.categories_id || a.category_id || a.category?.id
            return catId === request.value.category_id
        })
    }

    if (request.value?.model_id) {
        assets = assets.filter(a => {
            const modelId = a.model_id || a.model?.id
            return modelId === request.value.model_id
        })
    }

    return assets.map(a => ({
        value: a.id,
        label: `${a.asset_tag || '—'} | ${a.serial_number || '—'} | ${a.model?.model_name || '—'}`,
    }))
})

const assetPreview = computed(() => {
    if (!selectedAsset.value) return null
    return (assetStore.assets || []).find(a => a.id === selectedAsset.value) || null
})

watch(open, async (val) => {
    if (val) {
        selectedAsset.value = null
        assignedDate.value = new Date().toISOString().split('T')[0]
        condition.value = 'GOOD'
        notes.value = ''
        await assetStore.fetchAssets()
    }
})

function close() {
    store.assignModal = false
    store.selectedRequest = null
}

async function submit() {
    if (submitting.value || !selectedAsset.value) return
    submitting.value = true
    const success = await store.assignAssetToRequest(
        selectedAsset.value,
        assignedDate.value,
        condition.value,
        notes.value
    )
    submitting.value = false
    if (success) emit('assigned')
}

function priorityClass(p) {
    return {
        CRITICAL: 'bg-red-600/20 text-red-400',
        URGENT: 'bg-red-500/20 text-red-300',
        HIGH: 'bg-orange-500/20 text-orange-300',
        MEDIUM: 'bg-yellow-500/20 text-yellow-300',
        LOW: 'bg-sky-500/20 text-sky-300',
    }[p] || 'bg-white/10 text-white/70'
}
</script>

<style scoped>
.assign-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px 0;
}

.request-summary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
}

.summary-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
}

.summary-value {
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
}

.asset-preview {
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 10px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.preview-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
}

.preview-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
}

.preview-value {
    color: rgba(255, 255, 255, 0.85);
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.65);
    letter-spacing: 0.02em;
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
}
</style>
