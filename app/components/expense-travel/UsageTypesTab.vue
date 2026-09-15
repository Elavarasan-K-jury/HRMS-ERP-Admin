<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Usage Types</h2>
                <p class="text-xs text-white/55 max-w-xl mt-1">Manage usage types required by expense categories — e.g., Travel, Mileage, General Expense</p>
            </div>
            <div class="flex items-center gap-2">
                <UiButton @click="openCreate" color="#4aff7a" text="Add Usage Type" prepend-icon="ion:add-circle" :disabled="store.saving" />
                <UiButton @click="refresh" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="store.loading" />
            </div>
        </div>

        <!-- Search + status filter -->
        <div class="flex items-center gap-3">
            <UiSearch v-model="searchQuery" placeholder="Search usage types..." class="w-64" color="#fff" @search="onSearch" @clear="onSearch('')" />
            <FormSelect v-model="statusFilter" :options="statusOptions" placeholder="All Status" class="w-40" color="#fff" size="md" rounded="lg" clearable @update:model-value="onStatusFilter" />
        </div>

        <!-- Table -->
        <div class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex-1 flex flex-col min-h-[300px]">
            <div v-if="store.loading" class="p-6 space-y-3">
                <div v-for="i in 4" :key="i" class="animate-pulse flex gap-4">
                    <div class="skeleton w-32 h-4" />
                    <div class="skeleton w-48 h-4" />
                    <div class="skeleton w-16 h-4" />
                </div>
            </div>

            <div v-else-if="!store.usageTypes?.length" class="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-white/50">
                <Icon name="ion:list-outline" class="w-10 h-10 opacity-40" />
                <p class="text-sm">{{ searchQuery ? 'No usage types match your search.' : 'No usage types yet.' }}</p>
                <p v-if="!searchQuery" class="text-xs text-white/30">Create your first usage type to get started.</p>
                <UiButton v-if="!searchQuery" @click="openCreate" color="#4aff7a" text="Add Usage Type" prepend-icon="ion:add-circle" size="sm" class="mt-2" />
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60">Type Name</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60">Description</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60">Status</th>
                            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-white/60">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in store.usageTypes" :key="u.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="px-4 py-3 font-medium text-white/90">{{ u.name }}</td>
                            <td class="px-4 py-3 text-white/60 max-w-xs truncate">{{ u.description || '—' }}</td>
                            <td class="px-4 py-3">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                    :class="u.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20' : 'bg-white/10 text-white/50 border border-white/10'">
                                    {{ u.is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center justify-end gap-1">
                                    <button @click="openEdit(u)" class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Edit">
                                        <Icon name="lucide:pencil" class="w-4 h-4" />
                                    </button>
                                    <button @click="toggleStatus(u)" class="p-1.5 rounded-lg hover:bg-white/10 transition-colors" :class="u.is_active ? 'text-amber-300 hover:text-amber-200' : 'text-emerald-300 hover:text-emerald-200'" :title="u.is_active ? 'Deactivate' : 'Activate'">
                                        <Icon :name="u.is_active ? 'lucide:pause-circle' : 'lucide:play-circle'" class="w-4 h-4" />
                                    </button>
                                    <button @click="confirmDelete(u)" class="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-300 transition-colors" title="Delete">
                                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="store.totalPages > 1" class="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span>Page {{ store.page }} of {{ store.totalPages }} · {{ store.total }} total</span>
                <div class="flex gap-2">
                    <UiButton @click="prevPage" color="#fff" text="Previous" size="sm" :disabled="store.page <= 1" />
                    <UiButton @click="nextPage" color="#fff" text="Next" size="sm" :disabled="store.page >= store.totalPages" />
                </div>
            </div>
        </div>

        <!-- Create / Edit drawer -->
        <UiSidebarModal v-model="formModal" :title="isEditing ? 'Edit Usage Type' : 'Add Usage Type'">
            <template #default>
                <form @submit.prevent="submitForm" class="flex flex-col gap-5">
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Type Name <span class="text-rose-400">*</span></p>
                        <FormInput v-model="form.name" class="w-full" prepend-icon="ion:pricetag-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. Travel, Mileage" />
                        <p v-if="formErrors.name" class="mt-1 text-xs text-rose-400">{{ formErrors.name }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Description</p>
                        <textarea v-model="form.description" rows="3" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 transition-colors resize-none" placeholder="Optional description"></textarea>
                    </div>
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Status <span class="text-rose-400">*</span></p>
                        <FormSelect v-model="form.is_active" :options="formStatusOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" placeholder="Select status" />
                    </div>
                </form>
            </template>
            <template #footer>
                <UiButton @click="formModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="store.saving" />
                <UiButton @click="submitForm" color="#4aff7a" :text="store.saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create')" prepend-icon="ion:save-outline" :disabled="store.saving" />
            </template>
        </UiSidebarModal>

        <!-- Delete confirmation -->
        <UiModal v-model="deleteModal" title="Delete Usage Type?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteTarget?.name }}"</span>?</p>
                <p class="mt-2 text-xs text-white/45">This will soft-delete the usage type. If it is referenced by an expense category, deletion will be blocked — deactivate it instead.</p>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doDelete" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleting" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUsageTypeStore } from '~/stores/organization/usageType.store'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useUsageTypeStore()

const searchQuery = ref('')
const statusFilter = ref(null)
const formModal = ref(false)
const isEditing = ref(false)
const deleteModal = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const editingId = ref(null)

const form = ref({ name: '', description: '', is_active: true })
const formErrors = ref({})

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
]
const formStatusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
]

function validate() {
    const e = {}
    if (!form.value.name?.trim()) e.name = 'Type Name is required'
    formErrors.value = e
    return Object.keys(e).length === 0
}

const refresh = async () => { await store.fetchUsageTypes(props.organizationId) }
const onSearch = (term) => { searchQuery.value = term; store.fetchUsageTypes(props.organizationId, { search: term, page: 1 }) }
const onStatusFilter = (val) => {
    const v = val?.value || val
    if (v === 'active') store.fetchUsageTypes(props.organizationId, { isActiveOnly: true })
    else if (v === 'inactive') store.fetchUsageTypes(props.organizationId, { search: searchQuery.value })
    else store.fetchUsageTypes(props.organizationId)
}

const normalizeIsActive = (v) => {
    if (v && typeof v === 'object' && 'value' in v) return Boolean(v.value)
    return Boolean(v)
}
const toFormStatus = (bool) => bool ? { value: true, label: 'Active' } : { value: false, label: 'Inactive' }

const openCreate = () => {
    isEditing.value = false
    editingId.value = null
    form.value = { name: '', description: '', is_active: toFormStatus(true) }
    formErrors.value = {}
    formModal.value = true
}

const openEdit = (u) => {
    isEditing.value = true
    editingId.value = u.id
    form.value = { name: u.name, description: u.description || '', is_active: toFormStatus(!!u.is_active) }
    formErrors.value = {}
    formModal.value = true
}

const submitForm = async () => {
    if (!validate()) return
    const payload = {
        name: form.value.name?.trim(),
        description: form.value.description?.trim() || null,
        is_active: normalizeIsActive(form.value.is_active),
    }
    try {
        if (isEditing.value) await store.updateUsageType(editingId.value, payload)
        else await store.createUsageType(payload)
        formModal.value = false
    } catch {}
}

const toggleStatus = async (u) => {
    await store.updateStatus(u.id, !u.is_active)
}

const confirmDelete = (u) => { deleteTarget.value = u; deleteModal.value = true }
const doDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await store.deleteUsageType(deleteTarget.value.id)
        deleteModal.value = false
        deleteTarget.value = null
    } catch {} finally { deleting.value = false }
}

const prevPage = () => { if (store.page > 1) store.fetchUsageTypes(props.organizationId, { page: store.page - 1 }) }
const nextPage = () => { if (store.page < store.totalPages) store.fetchUsageTypes(props.organizationId, { page: store.page + 1 }) }

watch(() => props.organizationId, (v) => { if (v) store.fetchUsageTypes(v) })
onMounted(() => { if (props.organizationId) store.fetchUsageTypes(props.organizationId) })
</script>

<style scoped>
.skeleton { height: 0.875rem; border-radius: 9999px; background: linear-gradient(90deg, rgba(255,255,255,.12), rgba(255,255,255,.22), rgba(255,255,255,.12)); animation: shimmer 1.2s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
