<template>
    <UiSidebarModal v-model="open" :title="isEditing ? 'Edit Document Folder' : 'Add Document Folder'" width="680px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Configure folder details and permissions. Permissions are stored as metadata only for now.</span>
        </template>
        <template #default>
            <form @submit.prevent="submit" class="flex flex-col gap-5">
                <div>
                    <p class="text-sm text-white/85 mb-1.5">Name of the Folder <span class="text-rose-400">*</span></p>
                    <FormInput v-model="form.name" class="w-full" prepend-icon="ion:folder-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. Identity" :disabled="saving" />
                    <p v-if="errors.name" class="mt-1 text-xs text-rose-400">{{ errors.name }}</p>
                </div>

                <div>
                    <p class="text-sm text-white/85 mb-1.5">Description</p>
                    <textarea v-model="form.description" rows="2" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 resize-none" placeholder="Optional description"></textarea>
                </div>

                <label class="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" v-model="form.is_confidential" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                    <span class="text-sm text-white/80">Mark folder as confidential</span>
                </label>

                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p class="text-sm font-semibold text-white/85 mb-1">Folder Permissions</p>
                    <p class="text-xs text-white/45 mb-3">Configuration only — access rules are not enforced yet.</p>
                    <div class="overflow-x-auto rounded-lg border border-white/10">
                        <table class="min-w-full text-sm text-white/90">
                            <thead class="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Role</th>
                                    <th class="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-white/50">View Documents</th>
                                    <th class="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-white/50">Add / Update Documents</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in form.permissions" :key="row.role" class="border-b border-white/5">
                                    <td class="px-3 py-2 font-medium text-white/80">{{ row.role }}</td>
                                    <td class="px-3 py-2 text-center">
                                        <input type="checkbox" v-model="row.canViewDocuments" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                                    </td>
                                    <td class="px-3 py-2 text-center">
                                        <input type="checkbox" v-model="row.canAddUpdateDocuments" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
import { ref, watch, computed } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'

const DEFAULT_ROLES = [
    'Employee - Self',
    'Reporting Manager',
    'Manager of Manager',
    'Business Unit Head',
    'Department Head',
]

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    folder: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const store = useEmployeeDocumentStore()
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
    permissions: [],
})

function buildPermissionRows(existing = []) {
    return DEFAULT_ROLES.map(role => {
        const match = (existing || []).find(p => p.role === role)
        return {
            role,
            canViewDocuments: match?.canViewDocuments ?? false,
            canAddUpdateDocuments: match?.canAddUpdateDocuments ?? false,
        }
    })
}

watch(() => props.modelValue, (v) => {
    if (v) {
        errors.value = {}
        if (props.folder?.id) {
            form.value = {
                name: props.folder.name || '',
                description: props.folder.description || '',
                is_confidential: !!props.folder.is_confidential,
                permissions: buildPermissionRows(props.folder.permissions),
            }
        } else {
            form.value = { name: '', description: '', is_confidential: false, permissions: buildPermissionRows([]) }
        }
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
            permissions: form.value.permissions.map(p => ({
                role: p.role,
                canViewDocuments: !!p.canViewDocuments,
                canAddUpdateDocuments: !!p.canAddUpdateDocuments,
            })),
        }
        if (isEditing.value) {
            await store.updateFolder(props.folder.id, payload)
        } else {
            await store.createFolder(payload)
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
