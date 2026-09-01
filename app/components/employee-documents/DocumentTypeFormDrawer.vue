<template>
    <UiSidebarModal v-model="open" :title="isEditing ? 'Manage a Document Type' : 'Add a Document Type'" width="820px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Configure document type rules, countries and form fields.</span>
        </template>
        <template #default>
            <div v-if="loading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                <span class="text-xs">Loading...</span>
            </div>
            <form v-else @submit.prevent="submit" class="flex flex-col gap-5">
                <!-- Name + description -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Name of the document <span class="text-rose-400">*</span></p>
                        <FormInput v-model="form.name" class="w-full" prepend-icon="ion:document-text-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. Aadhaar Card" :disabled="saving" />
                        <p v-if="errors.name" class="mt-1 text-xs text-rose-400">{{ errors.name }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Description</p>
                        <FormInput v-model="form.description" class="w-full" prepend-icon="ion:document-outline" color="#4aff7a" size="md" rounded="lg" placeholder="Optional" :disabled="saving" />
                    </div>
                </div>

                <!-- Single / Multiple -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-3">Multiple documents of this same type allowed for an employee?</p>
                    <div class="flex flex-col gap-2">
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="radio" value="false" v-model="form.is_multiple" class="mt-1" />
                            <span class="text-sm text-white/70">Employee can have only single document of this type <span class="text-white/40 text-xs">(e.g. Aadhaar, PAN)</span></span>
                        </label>
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="radio" value="true" v-model="form.is_multiple" class="mt-1" />
                            <span class="text-sm text-white/70">Employee can have multiple documents of this type <span class="text-white/40 text-xs">(e.g. certificates, letters)</span></span>
                        </label>
                    </div>
                </div>

                <!-- Configuration checkboxes -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                    <p class="text-sm font-semibold text-white/85">Document Configuration</p>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.is_mandatory" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">This document is mandatory</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.is_appliable_na" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Employee can mark as not applicable</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.is_file_upload_enabled" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">File upload is enabled</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.is_verification_required" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Document Verification Required</span>
                    </label>
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.ask_expiry_date" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Ask employee for document expiry date</span>
                    </label>
                    <p v-if="form.ask_expiry_date" class="ml-7 text-xs text-white/45">An expiry date field will be added to the employee submission form automatically.</p>
                </div>

                <!-- Country access -->
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85">Country Access</p>
                    <p class="text-xs text-white/45 mb-3">Configure which employees can access this document type (configuration only).</p>
                    <label class="flex items-start gap-3 cursor-pointer mb-3">
                        <input type="radio" :value="true" v-model="form.all_countries" class="mt-1" />
                        <span class="text-sm text-white/70">Give access to employees of all countries</span>
                    </label>
                    <div v-if="!form.all_countries">
                        <p class="text-xs text-white/60 mb-1.5">Selected countries</p>
                        <FormSelect v-model="countryValues" :options="countryOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" multiple searchable placeholder="Select countries" />
                    </div>
                </div>

                <!-- Dynamic fields -->
                <DynamicFieldsEditor :fields="form.fields" />
            </form>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="saving" />
            <UiButton @click="submit" color="#4aff7a" :text="saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Document Type')" prepend-icon="ion:save-outline" :disabled="saving" :loading="saving" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/employeeDocument.store'
import { countries } from '~/constants/countries'
import DynamicFieldsEditor from './DynamicFieldsEditor.vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    folderId: { type: String, default: '' },
    documentType: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const store = useEmployeeDocumentStore()
const loading = ref(false)
const saving = ref(false)
const errors = ref({})

const countryOptions = countries

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})
const isEditing = computed(() => !!props.documentType?.id)

const form = ref(initialForm())
const countryValues = ref([])

function initialForm() {
    return {
        name: '',
        description: '',
        is_multiple: false,
        is_mandatory: false,
        is_appliable_na: false,
        is_file_upload_enabled: true,
        is_verification_required: false,
        ask_expiry_date: false,
        expiry_days: null,
        expiry_period: null,
        all_countries: true,
        allowed_countries: [],
        fields: [],
    }
}

// countries -> {value,label} objects for FormSelect multiple
function toCountryValues(list = []) {
    return (list || []).map(code => {
        const c = countryOptions.find(x => x.value === code)
        return c ? { value: c.value, label: c.label } : { value: code, label: code }
    })
}

watch(() => props.modelValue, async (v) => {
    if (!v) return
    errors.value = {}
    // Reset the form to pass a fresh fields array to DynamicFieldsEditor keyed by localId
    form.value = initialForm()
    countryValues.value = []
    if (isEditing.value) {
        await loadExisting()
    }
})

async function loadExisting() {
    loading.value = true
    try {
        const t = await store.getDocumentType(props.folderId, props.documentType.id)
        const cfg = t || props.documentType
        form.value = {
            name: cfg.name || '',
            description: cfg.description || '',
            is_multiple: !!cfg.is_multiple,
            is_mandatory: !!cfg.is_mandatory,
            is_appliable_na: !!cfg.is_appliable_na,
            is_file_upload_enabled: !!cfg.is_file_upload_enabled,
            is_verification_required: !!cfg.is_verification_required,
            ask_expiry_date: !!cfg.ask_expiry_date,
            expiry_days: cfg.expiry_days || null,
            expiry_period: cfg.expiry_period || null,
            all_countries: cfg.all_countries ?? true,
            allowed_countries: cfg.allowed_countries || [],
            fields: (cfg.fields || []).map((f, i) => ({
                _localId: 'lf_' + Date.now() + '_' + i,
                id: f.id || '',
                label: f.label || '',
                key: f.key || '',
                field_type: f.field_type || 'TEXTBOX',
                options: Array.isArray(f.options) ? [...f.options] : (f.options ? [f.options] : []),
                is_mandatory: !!f.is_mandatory,
                display_order: f.display_order ?? i,
            })),
        }
        countryValues.value = toCountryValues(cfg.allowed_countries)
    } catch (e) {
        console.error('[docType] load error:', e)
    } finally {
        loading.value = false
    }
}

function validate() {
    errors.value = {}
    if (!form.value.name?.trim()) errors.value.name = 'Document type name is required'
    return !Object.keys(errors.value).length
}

function slugify(label) {
    return String(label || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
}

function basePayload() {
    return {
        name: form.value.name.trim(),
        description: form.value.description?.trim() || null,
        is_multiple: !!form.value.is_multiple,
        is_mandatory: !!form.value.is_mandatory,
        is_appliable_na: !!form.value.is_appliable_na,
        is_file_upload_enabled: !!form.value.is_file_upload_enabled,
        is_verification_required: !!form.value.is_verification_required,
        ask_expiry_date: !!form.value.ask_expiry_date,
        all_countries: form.value.all_countries ?? true,
        allowed_countries: form.value.all_countries ? [] : countryValues.value.map(c => c?.value ?? c),
    }
}

async function submit() {
    if (!validate() || saving.value) return
    saving.value = true
    try {
        if (isEditing.value) {
            await saveExisting()
        } else {
            await saveNew()
        }
        open.value = false
        emit('saved')
    } catch (e) {
        // store shows error toast
    } finally {
        saving.value = false
    }
}

async function saveNew() {
    const created = await store.createDocumentType({ folder_id: props.folderId, ...basePayload() })
    if (created?.id && form.value.fields.length) {
        await createFields(created.id, form.value.fields)
    }
}

async function saveExisting() {
    await store.updateDocumentType(props.folderId, props.documentType.id, basePayload())
    await syncFields(props.documentType.id, form.value.fields)
}

// Create fields sequentially (safe; stable per-field create)
const HAS_OPTIONS = ['DROPDOWN', 'MULTI_SELECT']
function fieldOptions(f) { return HAS_OPTIONS.includes(f.field_type) ? (f.options || []).filter(o => o !== '') : [] }

async function createFields(typeId, fields) {
    const ordered = fields.map((f, i) => ({ ...f, display_order: i }))
    const createdIds = []
    for (const f of ordered) {
        try {
            const created = await store.createDocumentField(typeId, {
                label: f.label,
                key: slugify(f.key || f.label),
                field_type: f.field_type,
                options: fieldOptions(f),
                is_mandatory: !!f.is_mandatory,
                display_order: f.display_order,
            })
            if (created?.id) createdIds.push(created.id)
        } catch (e) {
            console.error('[createFields] field creation failed:', f.label, e)
        }
    }
    const toast = useToast()
    if (createdIds.length < ordered.length) {
        toast.error({ title: 'Partial save', message: `${createdIds.length}/${ordered.length} fields created.`, timeout: 3000 })
    }
}

// Diff existing vs current: PATCH existing, POST new, DELETE removed. Preserves stable IDs/keys.
async function syncFields(typeId, current) {
    const existing = await store.listDocumentFields(typeId)
    const existingIds = new Set(existing.map(e => e.id))
    const currentIds = new Set(current.map(c => c.id).filter(Boolean))

    // DELETE removed
    for (const exc of existing) {
        if (!currentIds.has(exc.id)) {
            try { await store.deleteDocumentField(typeId, exc.id) } catch (e) { console.error('[syncFields] delete failed:', exc.id, e) }
        }
    }
    // PATCH existing / POST new
    let order = 0
    for (const c of current) {
        c.display_order = order
        const payload = {
            label: c.label,
            field_type: c.field_type,
            options: fieldOptions(c),
            is_mandatory: !!c.is_mandatory,
            display_order: order,
        }
        try {
            if (c.id && existingIds.has(c.id)) {
                await store.updateDocumentField(typeId, c.id, payload)
            } else {
                await store.createDocumentField(typeId, { ...payload, key: slugify(c.key || c.label) })
            }
        } catch (e) {
            console.error('[syncFields] save failed:', c.label, e)
        }
        order++
    }
}
</script>
