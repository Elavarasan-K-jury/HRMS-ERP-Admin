<template>
    <UiSidebarModal v-model="open" :title="`Submit ${pending?.document_type_name || 'Document'}`" width="720px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Submitting on behalf of {{ pending?.employee_name }}</span>
        </template>
        <template #default>
            <div v-if="loading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                <span class="text-xs">Loading document configuration...</span>
            </div>
            <form v-else @submit.prevent="submit" class="flex flex-col gap-5">
                <!-- Summary -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-semibold text-white/85">{{ initials(pending?.employee_name) }}</span>
                        <div class="min-w-0">
                            <p class="text-sm font-medium text-white/90 truncate">{{ pending?.employee_name }}</p>
                            <p class="text-xs text-white/45 truncate">{{ pending?.employee_code || '' }}</p>
                        </div>
                    </div>
                    <p class="text-xs text-white/50 mt-1">{{ pending?.folder_name }} • {{ pending?.document_type_name }}</p>
                </div>

                <!-- Not Applicable toggle -->
                <label v-if="docConfig?.is_appliable_na" class="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" v-model="form.is_na" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" @change="onNAToggle" />
                    <span class="text-sm text-white/80">Not Applicable — I do not have this document</span>
                </label>

                <!-- Dynamic fields -->
                <template v-if="!form.is_na && docConfig?.fields?.length">
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-3">Document Details</p>
                        <div class="flex flex-col gap-4">
                            <div v-for="f in docConfig.fields" :key="f.id || f.key" class="flex flex-col gap-1.5">
                                <p class="text-sm text-white/80">{{ f.label }} <span v-if="f.is_mandatory" class="text-rose-400">*</span></p>
                                <template v-if="f.field_type === 'DROPDOWN'">
                                    <FormSelect v-model="fieldValues[f.key]" :options="dropdownOptions(f)" class="w-full" color="#4aff7a" size="md" rounded="lg" searchable placeholder="Select..." />
                                </template>
                                <template v-else-if="f.field_type === 'MULTI_SELECT'">
                                    <FormSelect v-model="fieldValues[f.key]" :options="dropdownOptions(f)" class="w-full" color="#4aff7a" size="md" rounded="lg" multiple searchable placeholder="Select..." />
                                </template>
                                <template v-else-if="f.field_type === 'DATE'">
                                    <input v-model="fieldValues[f.key]" type="date" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                                </template>
                                <template v-else-if="f.field_type === 'NUMBER'">
                                    <input v-model="fieldValues[f.key]" type="number" placeholder="Enter value" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50" />
                                </template>
                                <template v-else-if="f.field_type === 'TEXTAREA'">
                                    <textarea v-model="fieldValues[f.key]" rows="2" placeholder="Enter details" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 resize-none"></textarea>
                                </template>
                                <template v-else-if="f.field_type === 'FILE'">
                                    <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" class="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border file:border-emerald-400/30 file:bg-emerald-500/10 file:px-3 file:py-1.5 file:text-emerald-300" @change="onFieldFileChange(f, $event)" />
                                </template>
                                <template v-else>
                                    <input v-model="fieldValues[f.key]" type="text" :placeholder="f.label" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50" />
                                </template>
                                <p v-if="fieldErrors[f.key]" class="text-xs text-rose-400">{{ fieldErrors[f.key] }}</p>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- File upload (document file) -->
                <div v-if="!form.is_na && docConfig?.is_file_upload_enabled" class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label class="block">
                        <span class="text-sm text-white/85 block mb-2">Upload Document <span v-if="docConfig.is_file_upload_enabled" class="text-white/40">({{ file ? 'selected' : 'optional' }})</span></span>
                        <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" class="w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border file:border-emerald-400/30 file:bg-emerald-500/10 file:px-3 file:py-1.5 file:text-emerald-300" @change="onFileChange" />
                        <p class="text-[11px] text-white/35 mt-1">Accepted formats: JPG, PNG, WebP, PDF (max 10MB)</p>
                        <div v-if="file" class="mt-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20 px-3 py-2">
                            <Icon name="ion:document-attach-outline" class="w-4 h-4 text-emerald-300" />
                            <span class="text-xs text-white/80 truncate flex-1">{{ file.name }}</span>
                            <span class="text-xs text-white/40">{{ formatSize(file.size) }}</span>
                            <button type="button" class="text-rose-300 hover:text-rose-200" @click="file = null"><Icon name="lucide:x" class="w-4 h-4" /></button>
                        </div>
                    </label>
                </div>

                <!-- Expiry date -->
                <div v-if="!form.is_na && docConfig?.ask_expiry_date" class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <label class="block">
                        <span class="text-sm text-white/85 block mb-2">Expiry Date <span class="text-rose-400">*</span></span>
                        <input v-model="form.expiry_date" type="date" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-300/50 [color-scheme:dark]" />
                    </label>
                </div>
            </form>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="saving" />
            <UiButton @click="submit" color="#4aff7a" :text="saving ? 'Submitting...' : 'Submit Document'" prepend-icon="ion:checkmark-circle" :disabled="saving || loading" :loading="saving" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    pending: { type: Object, default: null },
    organizationId: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'submitted'])

const store = useEmployeeDocumentStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const loading = ref(false)
const saving = ref(false)
const docConfig = ref(null)
const fieldValues = ref({})
const fieldErrors = ref({})
const file = ref(null)
const fieldFiles = ref({})

const form = ref({ is_na: false, expiry_date: '' })

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function dropdownOptions(f) {
    return (f.options || []).map(o => ({ value: o, label: o }))
}
function formatSize(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
}

async function loadConfig() {
    loading.value = true
    try {
        const t = await store.getDocumentType(props.pending.folder_id, props.pending.document_type_id)
        docConfig.value = { is_appliable_na: t.is_appliable_na, is_file_upload_enabled: t.is_file_upload_enabled, ask_expiry_date: t.ask_expiry_date, fields: t.fields || [] }
        fieldValues.value = {}
        fieldErrors.value = {}
        fieldFiles.value = {}
        form.value = { is_na: false, expiry_date: '' }
        file.value = null
    } catch (e) {
        console.error('[submit] load config error:', e)
    } finally {
        loading.value = false
    }
}

function onNAToggle() {
    if (form.value.is_na) {
        file.value = null
        fieldValues.value = {}
    }
}

function onFileChange(e) { file.value = e.target.files?.[0] || null }
function onFieldFileChange(f, e) { fieldFiles.value[f.key] = e.target.files?.[0] || null }

function validate() {
    fieldErrors.value = {}
    if (!form.value.is_na && docConfig.value) {
        for (const f of docConfig.value.fields) {
            if (f.is_mandatory) {
                if (f.field_type === 'FILE') {
                    if (!fieldFiles.value[f.key]) fieldErrors.value[f.key] = 'File is required'
                } else if (!fieldValues.value[f.key] && fieldValues.value[f.key] !== 0) {
                    fieldErrors.value[f.key] = 'This field is required'
                }
            }
        }
        if (docConfig.value.ask_expiry_date && !form.value.expiry_date) {
            fieldErrors.value.expiry_date = 'Expiry date is required'
        }
    }
    return !Object.keys(fieldErrors.value).length
}

async function submit() {
    if (!props.pending || saving.value) return
    if (!validate()) return
    saving.value = true
    try {
        const payload = {
            organization_id: props.organizationId,
            assignment_id: props.pending.assignment_id,
            employee_id: props.pending.employee_id,
            document_type_id: props.pending.document_type_id,
            is_na: form.value.is_na,
            expiry_date: form.value.expiry_date || null,
            field_values: form.value.is_na ? {} : (Object.keys(fieldValues.value).length ? fieldValues.value : {}),
            file: form.value.is_na ? null : (file.value || null),
        }
        await store.submitDocument(payload)
        open.value = false
        emit('submitted')
    } catch (e) {
        // store handles toast
    } finally {
        saving.value = false
    }
}

watch(() => props.modelValue, async (v) => {
    if (v && props.pending) {
        await loadConfig()
    }
})
</script>
