<template>
    <UiSidebarModal v-model="open" :title="isEditing ? 'Edit Folder' : 'Add new folder'" width="680px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Configure folder details and set access for specific employee groups.</span>
        </template>
        <template #default>
            <form @submit.prevent="submit" class="flex flex-col gap-5">
                <div>
                    <p class="text-sm text-white/85 mb-1.5">Name of the Folder <span class="text-rose-400">*</span></p>
                    <FormInput v-model="form.name" class="w-full" prepend-icon="ion:folder-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. Company Policies" :disabled="saving" />
                    <p v-if="errors.name" class="mt-1 text-xs text-rose-400">{{ errors.name }}</p>
                </div>

                <div>
                    <p class="text-sm text-white/85 mb-1.5">Short Description</p>
                    <textarea v-model="form.description" rows="2" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 resize-none" placeholder="Optional description" :disabled="saving"></textarea>
                </div>

                <label class="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" v-model="form.is_confidential" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" :disabled="saving" />
                    <div>
                        <span class="text-sm text-white/80">Make this folder private</span>
                        <p class="text-xs text-white/45 mt-0.5">Private folders are marked as confidential.</p>
                    </div>
                </label>

                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-1">Set folder access</p>
                    <p class="text-xs text-white/45 mb-4">Leave all fields empty to make the document applicable to all employees.</p>

                    <div class="grid grid-cols-2 gap-4">
                        <TargetingMultiSelect
                            v-model="form.legal_entity_ids"
                            :options="store.targetingOptions?.legal_entities || []"
                            label="Legal entities"
                            placeholder="All legal entities"
                        />
                        <TargetingMultiSelect
                            v-model="form.branch_ids"
                            :options="store.targetingOptions?.branches || []"
                            label="Business Units"
                            placeholder="All business units"
                        />
                        <TargetingMultiSelect
                            v-model="form.location_ids"
                            :options="store.targetingOptions?.locations || []"
                            label="Locations"
                            placeholder="All locations"
                        />
                        <DepartmentMultiSelect
                            v-model="form.department_ids"
                            :departments="store.targetingOptions?.departments || []"
                            label="Departments"
                            placeholder="All departments"
                        />
                    </div>

                    <div class="mt-4">
                        <TargetingMultiSelect
                            v-model="form.worker_types"
                            :options="store.targetingOptions?.worker_types || []"
                            label="Worker types"
                            placeholder="All worker types"
                        />
                    </div>
                </div>
            </form>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="saving" />
            <UiButton @click="submit" color="#4aff7a" :text="saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Folder')" prepend-icon="ion:save-outline" :disabled="saving" :loading="saving" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useOrganizationDocumentStore } from '~/stores/organization/organizationDocument.store'
import TargetingMultiSelect from '~/components/organization-documents/TargetingMultiSelect.vue'
import DepartmentMultiSelect from '~/components/organization-documents/DepartmentMultiSelect.vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    folder: { type: Object, default: null },
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
const isEditing = computed(() => !!props.folder?.id)

const form = ref({
    name: '',
    description: '',
    is_confidential: false,
    legal_entity_ids: [],
    branch_ids: [],
    location_ids: [],
    department_ids: [],
    sub_department_ids: [],
    worker_types: [],
})

watch(() => props.modelValue, (v) => {
    if (v) {
        errors.value = {}
        if (props.folder?.id) {
            form.value = {
                name: props.folder.name || '',
                description: props.folder.description || '',
                is_confidential: !!props.folder.is_confidential,
                legal_entity_ids: [...(props.folder.legal_entity_ids || [])],
                branch_ids: [...(props.folder.branch_ids || [])],
                location_ids: [...(props.folder.location_ids || [])],
                department_ids: [...(props.folder.department_ids || [])],
                sub_department_ids: [...(props.folder.sub_department_ids || [])],
                worker_types: [...(props.folder.worker_types || [])],
            }
        } else {
            form.value = {
                name: '',
                description: '',
                is_confidential: false,
                legal_entity_ids: [],
                branch_ids: [],
                location_ids: [],
                department_ids: [],
                sub_department_ids: [],
                worker_types: [],
            }
        }
    }
})

onMounted(() => {
    if (!store.targetingOptions) {
        store.fetchTargetingOptions(props.organizationId)
    }
})

function validate() {
    errors.value = {}
    if (!form.value.name?.trim()) errors.value.name = 'Folder name is required'
    return !Object.keys(errors.value).length
}

async function submit() {
    if (!validate() || saving.value) return
    saving.value = true
    try {
        const payload = {
            name: form.value.name.trim(),
            description: form.value.description?.trim() || null,
            is_confidential: !!form.value.is_confidential,
            legal_entity_ids: form.value.legal_entity_ids,
            branch_ids: form.value.branch_ids,
            location_ids: form.value.location_ids,
            department_ids: form.value.department_ids,
            sub_department_ids: form.value.sub_department_ids,
            worker_types: form.value.worker_types,
        }
        if (isEditing.value) {
            await store.updateFolder(props.organizationId, props.folder.id, payload)
        } else {
            await store.createFolder(props.organizationId, payload)
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
