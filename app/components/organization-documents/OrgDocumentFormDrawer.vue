<template>
    <UiSidebarModal v-model="open" :title="isEditing ? 'Edit Document' : 'Add new document'" width="640px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Upload an organization document and configure its settings.</span>
        </template>
        <template #default>
            <form @submit.prevent="submit" class="flex flex-col gap-5">
                <div>
                    <p class="text-sm text-white/85 mb-1.5">Document Name <span class="text-rose-400">*</span></p>
                    <FormInput v-model="form.name" class="w-full" prepend-icon="ion:document-text-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. Employee Handbook 2025" :disabled="saving" />
                    <p v-if="errors.name" class="mt-1 text-xs text-rose-400">{{ errors.name }}</p>
                </div>

                <div>
                    <p class="text-sm text-white/85 mb-1.5">Short Description</p>
                    <textarea v-model="form.description" rows="2" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 resize-none" placeholder="Optional description" :disabled="saving"></textarea>
                </div>

                <div>
                    <p class="text-sm text-white/85 mb-1.5">Attachment</p>
                    <label class="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer"
                        :class="form.file ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-white/15 bg-white/[0.03] hover:border-white/25'"
                        @dragover.prevent @drop.prevent="onDrop">
                        <input type="file" class="hidden" @change="onFileSelect" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.ppt,.pptx" />
                        <template v-if="form.file">
                            <Icon name="ion:document" class="w-8 h-8 text-emerald-300" />
                            <p class="text-sm text-white/80 font-medium">{{ form.file.name }}</p>
                            <p class="text-xs text-white/45">{{ formatSize(form.file.size) }}</p>
                            <button type="button" class="text-xs text-rose-300 hover:text-rose-200 mt-1" @click.stop="clearFile">Remove file</button>
                        </template>
                        <template v-else>
                            <Icon name="ion:cloud-upload-outline" class="w-8 h-8 text-white/35" />
                            <p class="text-sm text-white/60">Click or drag file to upload</p>
                            <p class="text-xs text-white/35">PDF, Word, Excel, PowerPoint, Images, CSV</p>
                        </template>
                    </label>
                    <p v-if="errors.file" class="mt-1 text-xs text-rose-400">{{ errors.file }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors">
                        <input type="checkbox" v-model="form.allow_download" class="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" :disabled="saving" />
                        <div>
                            <span class="text-sm text-white/80">Allow Download</span>
                            <p class="text-xs text-white/40 mt-0.5">Employees can download this file</p>
                        </div>
                    </label>
                    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors">
                        <input type="checkbox" v-model="form.acknowledgement_required" class="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" :disabled="saving" />
                        <div>
                            <span class="text-sm text-white/80">Acknowledgement Required</span>
                            <p class="text-xs text-white/40 mt-0.5">Employees must acknowledge this document</p>
                        </div>
                    </label>
                    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors">
                        <input type="checkbox" v-model="form.block_until_acknowledged" class="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" :disabled="saving" />
                        <div>
                            <span class="text-sm text-white/80">Block Until Acknowledged</span>
                            <p class="text-xs text-white/40 mt-0.5">Block employee actions until acknowledged</p>
                        </div>
                    </label>
                    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-colors">
                        <input type="checkbox" v-model="form.ask_expiry_date" class="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" :disabled="saving" />
                        <div>
                            <span class="text-sm text-white/80">Has Expiry Date</span>
                            <p class="text-xs text-white/40 mt-0.5">Document expires on a specific date</p>
                        </div>
                    </label>
                </div>

                <div v-if="form.ask_expiry_date">
                    <p class="text-sm text-white/85 mb-1.5">Expiry Date <span class="text-rose-400">*</span></p>
                    <FormInput v-model="form.expiry_date" type="date" class="w-full" prepend-icon="ion:calendar-outline" color="#4aff7a" size="md" rounded="lg" :disabled="saving" />
                    <p v-if="errors.expiry_date" class="mt-1 text-xs text-rose-400">{{ errors.expiry_date }}</p>
                </div>
            </form>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="saving" />
            <UiButton @click="submit" color="#4aff7a" :text="saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Document')" prepend-icon="ion:save-outline" :disabled="saving" :loading="saving" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useOrganizationDocumentStore } from '~/stores/organization/organizationDocument.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    document: { type: Object, default: null },
    folderId: { type: String, required: true },
    organizationId: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const store = useOrganizationDocumentStore()
const saving = ref(false)
const errors = ref({})

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})
const isEditing = computed(() => !!props.document?.id)

const form = ref({
    name: '',
    description: '',
    file: null,
    allow_download: true,
    acknowledgement_required: false,
    block_until_acknowledged: false,
    ask_expiry_date: false,
    expiry_date: '',
})

watch(() => props.modelValue, (v) => {
    if (v) {
        errors.value = {}
        if (props.document?.id) {
            form.value = {
                name: props.document.name || '',
                description: props.document.description || '',
                file: null,
                allow_download: props.document.allow_download ?? true,
                acknowledgement_required: props.document.acknowledgement_required ?? false,
                block_until_acknowledged: props.document.block_until_acknowledged ?? false,
                ask_expiry_date: props.document.ask_expiry_date ?? false,
                expiry_date: props.document.expiry_date || '',
            }
        } else {
            form.value = {
                name: '',
                description: '',
                file: null,
                allow_download: true,
                acknowledgement_required: false,
                block_until_acknowledged: false,
                ask_expiry_date: false,
                expiry_date: '',
            }
        }
    }
})

function onFileSelect(e) {
    const file = e.target.files?.[0]
    if (file) {
        form.value.file = file
        errors.value.file = ''
    }
}

function onDrop(e) {
    const file = e.dataTransfer.files?.[0]
    if (file) {
        form.value.file = file
        errors.value.file = ''
    }
}

function clearFile() {
    form.value.file = null
}

function formatSize(bytes) {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let size = bytes
    while (size >= 1024 && i < units.length - 1) { size /= 1024; i++ }
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function validate() {
    errors.value = {}
    if (!form.value.name?.trim()) errors.value.name = 'Document name is required'
    if (form.value.ask_expiry_date && !form.value.expiry_date) errors.value.expiry_date = 'Expiry date is required'
    if (!isEditing.value && !form.value.file) errors.value.file = 'Please select a file to upload'
    return !Object.keys(errors.value).length
}

async function submit() {
    if (!validate() || saving.value) return
    saving.value = true
    try {
        if (isEditing.value) {
            await store.updateDocument(props.organizationId, props.document.id, { ...form.value })
        } else {
            await store.createDocument(props.organizationId, props.folderId, { ...form.value })
        }
        open.value = false
        emit('saved')
    } catch (e) {
        // error toast handled in store
    } finally {
        saving.value = false
    }
}
</script>
