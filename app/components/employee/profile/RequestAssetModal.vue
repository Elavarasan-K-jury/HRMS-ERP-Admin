<template>
    <UiSidebarModal v-model="open" title="Request Asset" width="520px">
        <template #default>
            <div class="request-form">
                <p class="form-note">
                    <Icon name="lucide:info" class="h-4 w-4" />
                    This is a request. The asset will be assigned after admin approval.
                </p>

                <div class="form-field">
                    <label class="form-label">Category <span class="text-red-400">*</span></label>
                    <FormSelect
                        v-model="form.category_id"
                        :options="categoryOptions"
                        placeholder="Select category"
                        searchable
                        clearable
                        color="#fff"
                        size="md"
                        rounded="lg"
                    />
                </div>

                <div class="form-field">
                    <label class="form-label">Model (Optional)</label>
                    <FormSelect
                        v-model="form.model_id"
                        :options="filteredModelOptions"
                        :disabled="!form.category_id"
                        placeholder="Select model"
                        searchable
                        clearable
                        color="#fff"
                        size="md"
                        rounded="lg"
                    />
                </div>

                <div class="form-field">
                    <label class="form-label">Priority</label>
                    <FormSelect
                        v-model="form.priority"
                        :options="priorityOptions"
                        placeholder="Select priority"
                        color="#fff"
                        size="md"
                        rounded="lg"
                    />
                </div>

                <div class="form-field">
                    <label class="form-label">Reason</label>
                    <InputArea
                        v-model="form.reason"
                        color="#fff"
                        placeholder="Why do you need this asset?"
                        rows="3"
                    />
                </div>

                <div v-if="error" class="form-error">
                    <Icon name="lucide:triangle-alert" class="h-4 w-4" />
                    {{ error }}
                </div>
            </div>
        </template>
        <template #footer>
            <div class="w-full flex justify-end gap-3">
                <UiButton :disabled="saving" color="#fff" text="Cancel" @click="close" />
                <UiButton
                    :disabled="saving || !form.category_id"
                    color="#4aff7a"
                    :text="saving ? 'Submitting...' : 'Submit Request'"
                    prepend-icon="ion:send"
                    @click="submit"
                />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    employee: { type: Object, required: true },
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const open = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const saving = ref(false)
const error = ref(null)
const categories = ref([])
const models = ref([])

const form = reactive({
    category_id: null,
    model_id: null,
    priority: 'MEDIUM',
    reason: '',
})

const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
    { value: 'CRITICAL', label: 'Critical' },
]

const categoryOptions = computed(() =>
    categories.value.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))
)

const filteredModelOptions = computed(() => {
    if (!form.category_id) return []
    return models.value
        .filter((m) => m.category_id === form.category_id || m.categories_id === form.category_id)
        .map((m) => ({ value: m.id, label: `${m.brand} ${m.model_name}` }))
})

watch(() => form.category_id, () => {
    form.model_id = null
})

async function loadData() {
    const { $api } = useNuxtApp()
    try {
        const [catRes, modelRes] = await Promise.all([
            $api.get('/asset-categories', { params: { organization_id: props.employee?.organization_id } }),
            $api.get('/asset-models', { params: { organization_id: props.employee?.organization_id } }),
        ])
        categories.value = catRes.data?.categories || []
        models.value = modelRes.data?.models || []
    } catch (err) {
        console.error('[RequestAssetModal] Load data error:', err)
    }
}

watch(open, (val) => {
    if (val) {
        error.value = null
        form.category_id = null
        form.model_id = null
        form.priority = 'MEDIUM'
        form.reason = ''
        loadData()
    }
})

function close() {
    emit('update:modelValue', false)
}

async function submit() {
    if (saving.value) return
    if (!form.category_id) {
        error.value = 'Please select a category'
        return
    }

    saving.value = true
    error.value = null
    const { $api } = useNuxtApp()
    try {
        await $api.post('/employee-assets/request', {
            organization_id: props.employee?.organization_id,
            category_id: form.category_id,
            model_id: form.model_id || undefined,
            priority: form.priority,
            reason: form.reason || undefined,
        })
        emit('submitted')
        close()
        useToast().success({ title: 'Request Submitted', message: 'Your asset request has been submitted for approval.', timeout: 3000 })
    } catch (err) {
        console.error('[RequestAssetModal] Submit error:', err)
        error.value = err?.data?.message || err?.message || 'Failed to submit request'
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.request-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px 0;
}

.form-note {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 10px 12px;
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

.form-error {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    padding: 10px 12px;
}
</style>
