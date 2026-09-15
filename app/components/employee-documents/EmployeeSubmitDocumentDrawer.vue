<template>
    <UiSidebarModal v-model="open" :title="isUpdate ? 'Update Document' : 'Add Details'" :size="560" :show-footer="false" @close="$emit('update:modelValue', false)">
        <div v-if="loading" class="flex items-center justify-center py-12">
            <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
        </div>

        <div v-else-if="error" class="text-center py-12">
            <Icon name="lucide:alert-circle" class="h-10 w-10 text-red-400/70 mx-auto mb-3" />
            <p class="text-sm text-white/60 mb-3">{{ error }}</p>
            <button class="retry-btn" @click="loadConfig">
                <Icon name="lucide:refresh-cw" class="h-4 w-4" /> Retry
            </button>
        </div>

        <form v-else-if="docConfig" class="submit-form" @submit.prevent="handleSubmit">
            <div class="form-header">
                <h3 class="text-sm font-semibold text-white/80">{{ docConfig.document_type?.name }}</h3>
                <p class="text-xs text-white/40 mt-1">{{ docConfig.document_type?.folder_name }}</p>
            </div>

            <div v-if="docConfig.document_type?.is_appliable_na" class="form-row">
                <label class="form-checkbox-label">
                    <input type="checkbox" v-model="form.is_na" class="form-checkbox" />
                    <span class="text-sm text-white/70">Not Applicable</span>
                </label>
            </div>

            <template v-if="!form.is_na">
                <div v-for="field in docConfig.fields" :key="field.key" class="form-row">
                    <label class="form-label">
                        {{ field.label }}
                        <span v-if="field.is_mandatory" class="text-red-400">*</span>
                    </label>

                    <input v-if="field.field_type === 'TEXTBOX' || field.field_type === 'TEXT'"
                        v-model="form.field_values[field.key]" type="text" class="form-input"
                        :placeholder="field.label" />

                    <input v-else-if="field.field_type === 'NUMBER'"
                        v-model.number="form.field_values[field.key]" type="number" class="form-input"
                        :placeholder="field.label" />

                    <input v-else-if="field.field_type === 'DATE'"
                        v-model="form.field_values[field.key]" type="date" class="form-input" />

                    <textarea v-else-if="field.field_type === 'TEXTAREA'"
                        v-model="form.field_values[field.key]" class="form-input form-textarea"
                        :placeholder="field.label" rows="3"></textarea>

                    <select v-else-if="field.field_type === 'DROPDOWN' || field.field_type === 'SELECT'"
                        v-model="form.field_values[field.key]" class="form-input">
                        <option value="">Select...</option>
                        <option v-for="opt in (field.options || [])" :key="opt" :value="opt">{{ opt }}</option>
                    </select>

                    <label v-else-if="field.field_type === 'CHECKBOX'" class="form-checkbox-label">
                        <input type="checkbox" v-model="form.field_values[field.key]" class="form-checkbox" />
                        <span class="text-sm text-white/70">{{ field.label }}</span>
                    </label>

                    <input v-else v-model="form.field_values[field.key]" type="text" class="form-input"
                        :placeholder="field.label" />

                    <p v-if="errors[field.key]" class="form-error">{{ errors[field.key] }}</p>
                </div>

                <div v-if="docConfig.document_type?.is_file_upload_enabled" class="form-row">
                    <label class="form-label">Attachment</label>

                    <div v-if="existingFileName && !form.file" class="existing-attachment">
                        <div class="flex items-center gap-3">
                            <Icon name="lucide:file-text" class="h-5 w-5 text-emerald-400/70 shrink-0" />
                            <div class="min-w-0 flex-1">
                                <p class="text-sm text-white/80 truncate">{{ existingFileName }}</p>
                            </div>
                            <a v-if="existingFileUrl" :href="existingFileUrl" target="_blank"
                                class="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2 shrink-0">
                                Download
                            </a>
                        </div>
                        <button type="button" class="replace-btn" @click="triggerFileInput">
                            <Icon name="lucide:replace" class="h-3.5 w-3.5" /> Replace Attachment
                        </button>
                    </div>

                    <div v-else class="file-upload" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                        <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                        <Icon name="lucide:upload-cloud" class="h-8 w-8 text-white/30 mx-auto mb-2" />
                        <p v-if="!form.file" class="text-sm text-white/50">Click to upload or drag and drop</p>
                        <p v-else class="text-sm text-emerald-400">{{ form.file.name }}</p>
                        <p class="text-xs text-white/30 mt-1">PDF, JPG, PNG, DOC (max 10MB)</p>
                    </div>
                </div>

                <div v-if="docConfig.document_type?.ask_expiry_date" class="form-row">
                    <label class="form-label">Expiry Date</label>
                    <input v-model="form.expiry_date" type="date" class="form-input" />
                </div>
            </template>

            <div class="form-actions">
                <button type="button" class="btn-cancel" @click="$emit('update:modelValue', false)">Cancel</button>
                <button type="submit" class="btn-submit" :disabled="saving">
                    <Icon v-if="saving" name="lucide:loader-circle" class="h-4 w-4 animate-spin" />
                    {{ saving ? 'Submitting...' : (isUpdate ? 'Save' : 'Submit') }}
                </button>
            </div>
        </form>
    </UiSidebarModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import { resolveMediaUrl } from '~/utils/media'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    documentTypeId: { type: String, default: '' },
    assignmentId: { type: String, default: '' },
    existingSubmission: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const docStore = useEmployeeDocumentStore()
const open = ref(props.modelValue)
const loading = ref(false)
const error = ref(null)
const saving = ref(false)
const docConfig = ref(null)
const fileInput = ref(null)
const errors = reactive({})

const isUpdate = ref(false)
const existingFileName = ref('')
const existingFileUrl = ref('')

const form = reactive({
    field_values: {},
    file: null,
    is_na: false,
    expiry_date: '',
})

watch(() => props.modelValue, (val) => {
    open.value = val
    if (val && props.documentTypeId) loadConfig()
})

watch(open, (val) => emit('update:modelValue', val))

async function loadConfig() {
    loading.value = true
    error.value = null
    try {
        const data = await docStore.fetchDocumentTypeFields(props.documentTypeId)
        docConfig.value = data

        const fieldValues = {}
        for (const field of (data.fields || [])) {
            fieldValues[field.key] = ''
        }
        form.field_values = fieldValues
        form.file = null
        form.is_na = false
        form.expiry_date = ''
        existingFileName.value = ''
        existingFileUrl.value = ''

        if (props.existingSubmission) {
            isUpdate.value = true
            const sub = props.existingSubmission

            if (sub.field_values) {
                const existing = typeof sub.field_values === 'string'
                    ? JSON.parse(sub.field_values)
                    : sub.field_values
                for (const key of Object.keys(fieldValues)) {
                    if (existing[key] !== undefined) {
                        form.field_values[key] = existing[key]
                    }
                }
            }

            if (sub.expiry_date) {
                const d = new Date(sub.expiry_date)
                if (!isNaN(d.getTime())) {
                    form.expiry_date = d.toISOString().split('T')[0]
                }
            }

            if (sub.file_name && sub.file_id) {
                existingFileName.value = sub.file_name
                existingFileUrl.value = resolveMediaUrl(sub.file_url || `/file/${sub.file_id}`)
            }
        } else {
            isUpdate.value = false
        }
    } catch (e) {
        error.value = e?.message || 'Failed to load document configuration'
    } finally {
        loading.value = false
    }
}

function triggerFileInput() {
    fileInput.value?.click()
}

function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) form.file = file
}

function handleDrop(e) {
    const file = e.dataTransfer.files?.[0]
    if (file) form.file = file
}

function validate() {
    const errs = {}
    if (form.is_na) return true
    for (const field of (docConfig.value?.fields || [])) {
        if (field.is_mandatory && !form.field_values[field.key]) {
            errs[field.key] = `${field.label} is required`
        }
    }
    Object.keys(errors).forEach(k => delete errors[k])
    Object.assign(errors, errs)
    return Object.keys(errs).length === 0
}

async function handleSubmit() {
    if (!validate() || saving.value) return
    saving.value = true
    try {
        await docStore.submitMyDocument({
            assignment_id: props.assignmentId,
            document_type_id: props.documentTypeId,
            field_values: form.field_values,
            is_na: form.is_na,
            expiry_date: form.expiry_date,
            file: form.file,
        })
        emit('submitted')
        emit('update:modelValue', false)
    } catch (e) {
        // error handled by store
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.submit-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-header {
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.form-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.65);
}

.form-input {
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s ease;
}
.form-input:focus {
    border-color: rgba(52, 211, 153, 0.5);
}
.form-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

.form-textarea {
    resize: vertical;
    min-height: 60px;
}

.form-checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.form-checkbox {
    accent-color: #34d399;
}

.form-error {
    font-size: 11px;
    color: #f87171;
}

.existing-attachment {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.replace-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: rgba(251, 191, 36, 0.9);
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    align-self: flex-start;
    transition: background 0.15s ease;
}
.replace-btn:hover { background: rgba(251, 191, 36, 0.18); }

.file-upload {
    border: 2px dashed rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s ease;
}
.file-upload:hover {
    border-color: rgba(52, 211, 153, 0.3);
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-cancel {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer;
}
.btn-cancel:hover { background: rgba(255, 255, 255, 0.1); }

.btn-submit {
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #059669, #10b981);
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}
.btn-submit:hover { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.retry-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    cursor: pointer;
}
</style>
