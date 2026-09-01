<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Expense & Travel Categories</h2>
                <p class="text-xs text-white/55 max-w-xl mt-1">Create and manage expense categories linked to usage types</p>
            </div>
            <div class="flex items-center gap-2">
                <UiButton @click="openCreate" color="#4aff7a" text="Add Expense Category" prepend-icon="ion:add-circle" :disabled="store.saving" />
                <UiButton @click="refresh" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="store.loading" />
            </div>
        </div>

        <!-- Search -->
        <div class="flex items-center gap-3">
            <UiSearch v-model="searchQuery" placeholder="Search categories..." class="w-64" color="#fff" @search="onSearch" @clear="onSearch('')" />
        </div>

        <!-- Table -->
        <div class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex-1 flex flex-col min-h-[300px]">
            <div v-if="store.loading" class="p-6 space-y-3">
                <div v-for="i in 4" :key="i" class="animate-pulse flex gap-4">
                    <div class="skeleton w-8 h-8 rounded-lg" />
                    <div class="skeleton w-32 h-4" />
                    <div class="skeleton w-24 h-4" />
                    <div class="skeleton w-20 h-4" />
                </div>
            </div>

            <div v-else-if="!store.categories?.length" class="flex-1 flex flex-col items-center justify-center py-16 gap-3 text-white/50">
                <Icon name="ion:pricetags-outline" class="w-10 h-10 opacity-40" />
                <p class="text-sm">{{ searchQuery ? 'No categories match your search.' : 'No expense categories yet.' }}</p>
                <p v-if="!searchQuery" class="text-xs text-white/30">Create your first category to get started.</p>
                <UiButton v-if="!searchQuery" @click="openCreate" color="#4aff7a" text="Add Expense Category" prepend-icon="ion:add-circle" size="sm" class="mt-2" />
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60">Category</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60">Expense Code</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60">Usage Type</th>
                            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/60">Status</th>
                            <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-white/60">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="c in store.categories" :key="c.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <span class="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                                        <Icon :name="c.icon || 'ion:pricetag-outline'" class="w-4 h-4 text-white/70" />
                                    </span>
                                    <div>
                                        <div class="font-medium text-white/90">{{ c.name }}</div>
                                        <div v-if="c.description" class="text-xs text-white/45 truncate max-w-[200px]">{{ c.description }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-4 py-3 font-mono text-xs text-white/70">{{ c.expense_code }}</td>
                            <td class="px-4 py-3">
                                <span class="inline-flex px-2 py-0.5 rounded-full text-xs bg-white/10 border border-white/10 text-white/70">{{ c.usage_type_name || '—' }}</span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                    :class="c.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20' : 'bg-white/10 text-white/50 border border-white/10'">
                                    {{ c.is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center justify-end gap-1">
                                    <button @click="openEdit(c)" class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white" title="Edit">
                                        <Icon name="lucide:pencil" class="w-4 h-4" />
                                    </button>
                                    <button @click="toggleStatus(c)" class="p-1.5 rounded-lg hover:bg-white/10" :class="c.is_active ? 'text-amber-300' : 'text-emerald-300'" :title="c.is_active ? 'Deactivate' : 'Activate'">
                                        <Icon :name="c.is_active ? 'lucide:pause-circle' : 'lucide:play-circle'" class="w-4 h-4" />
                                    </button>
                                    <button @click="confirmDelete(c)" class="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-300" title="Delete">
                                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="store.totalPages > 1" class="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                <span>Page {{ store.page }} of {{ store.totalPages }} · {{ store.total }} total</span>
                <div class="flex gap-2">
                    <UiButton @click="prevPage" color="#fff" text="Previous" size="sm" :disabled="store.page <= 1" />
                    <UiButton @click="nextPage" color="#fff" text="Next" size="sm" :disabled="store.page >= store.totalPages" />
                </div>
            </div>
        </div>

        <!-- Create / Edit drawer -->
        <UiSidebarModal v-model="formModal" :title="isEditing ? 'Edit Expense Category' : 'Add Expense Category'" width="560px">
            <template #default>
                <form @submit.prevent="submitForm" class="flex flex-col gap-5">
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Name of the Expense Category <span class="text-rose-400">*</span></p>
                        <FormInput v-model="form.name" class="w-full" prepend-icon="ion:pricetag-outline" color="#4aff7a" size="md" rounded="lg" placeholder="Ex: Air Travel, Late Night Dinner, Fuel" />
                        <p v-if="formErrors.name" class="mt-1 text-xs text-rose-400">{{ formErrors.name }}</p>
                    </div>

                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Select Icon</p>
                        <FormSelect v-model="form.icon" :options="iconOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" placeholder="Select icon" clearable searchable />
                    </div>

                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Expense Code <span class="text-rose-400">*</span></p>
                        <FormInput v-model="form.expense_code" class="w-full" prepend-icon="ion:barcode-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. AIR-TRV-001" />
                        <p class="text-xs text-white/40 mt-1">Used for accounting purposes</p>
                        <p v-if="formErrors.expense_code" class="mt-1 text-xs text-rose-400">{{ formErrors.expense_code }}</p>
                    </div>

                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Usage Type <span class="text-rose-400">*</span></p>
                        <FormSelect v-model="form.usage_type_id" :options="usageTypeOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" placeholder="Select Usage Type" searchable clearable :disabled="usageTypeLoading" />
                        <p v-if="usageTypeOptions.length === 0 && !form.usage_type_id" class="mt-1 text-xs text-amber-300">No active Usage Types available. Create a Usage Type first.</p>
                        <p v-if="formErrors.usage_type_id" class="mt-1 text-xs text-rose-400">{{ formErrors.usage_type_id }}</p>
                        <p v-if="usageTypeLoading" class="mt-1 text-xs text-white/40">Loading usage types...</p>
                    </div>

                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Short Description</p>
                        <textarea v-model="form.description" rows="3" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 transition-colors resize-none" placeholder="Description shown to employee"></textarea>
                    </div>

                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Status</p>
                        <FormSelect v-model="form.is_active" :options="statusOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" />
                    </div>
                </form>
            </template>
            <template #footer>
                <UiButton @click="formModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="store.saving" />
                <UiButton @click="submitForm" color="#4aff7a" :text="store.saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create')" prepend-icon="ion:save-outline" :disabled="store.saving" />
            </template>
        </UiSidebarModal>

        <!-- Delete confirmation -->
        <UiModal v-model="deleteModal" title="Delete Expense Category?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteTarget?.name }}"</span>?</p>
                <p class="mt-2 text-xs text-white/45">This will soft-delete the category.</p>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doDelete" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleting" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useExpenseCategoryStore } from '~/stores/expenseCategory.store'
import { useUsageTypeStore } from '~/stores/usageType.store'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useExpenseCategoryStore()
const usageTypeStore = useUsageTypeStore()

const searchQuery = ref('')
const formModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteModal = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)
const usageTypeLoading = ref(false)

const form = ref({ name: '', expense_code: '', icon: null, usage_type_id: null, description: '', is_active: { value: true, label: 'Active' } })
const formErrors = ref({})

const iconOptions = [
    { value: 'ion:airplane-outline', label: 'Airplane' },
    { value: 'ion:car-outline', label: 'Car' },
    { value: 'ion:restaurant-outline', label: 'Restaurant' },
    { value: 'ion:bed-outline', label: 'Hotel' },
    { value: 'ion:receipt-outline', label: 'Receipt' },
    { value: 'ion:card-outline', label: 'Card' },
    { value: 'ion:pricetag-outline', label: 'Price Tag' },
    { value: 'ion:briefcase-outline', label: 'Briefcase' },
    { value: 'heroicons:currency-dollar', label: 'Currency' },
]

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
]

const normalizeIsActive = (v) => {
    if (v && typeof v === 'object' && 'value' in v) return Boolean(v.value)
    return Boolean(v)
}
const toFormStatus = (bool) => bool ? { value: true, label: 'Active' } : { value: false, label: 'Inactive' }

const usageTypeOptions = computed(() => {
    const all = usageTypeStore.usageTypes || []
    // For edit, include inactive current value if needed
    const currentId = form.value.usage_type_id?.value || form.value.usage_type_id
    return all
        .filter(u => u.is_active || String(u.id) === String(currentId))
        .map(u => ({ value: u.id, label: u.name }))
})

const loadUsageTypes = async () => {
    usageTypeLoading.value = true
    try { await usageTypeStore.fetchActiveUsageTypes(props.organizationId) } catch {} finally { usageTypeLoading.value = false }
}

function validate() {
    const e = {}
    if (!form.value.name?.trim()) e.name = 'Name is required'
    if (!form.value.expense_code?.trim()) e.expense_code = 'Expense Code is required'
    const ut = form.value.usage_type_id?.value || form.value.usage_type_id
    if (!ut) e.usage_type_id = 'Usage Type is required'
    formErrors.value = e
    return Object.keys(e).length === 0
}

const refresh = async () => { await store.fetchCategories(props.organizationId) }
const onSearch = (term) => { searchQuery.value = term; store.fetchCategories(props.organizationId, { search: term, page: 1 }) }

const openCreate = async () => {
    isEditing.value = false
    editingId.value = null
    form.value = { name: '', expense_code: '', icon: null, usage_type_id: null, description: '', is_active: toFormStatus(true) }
    formErrors.value = {}
    formModal.value = true
    await loadUsageTypes()
}

const openEdit = async (c) => {
    isEditing.value = true
    editingId.value = c.id
    // Load usage types first to ensure dropdown has current value even if inactive
    await loadUsageTypes()
    // If current usageType is inactive and not in active list, add it manually
    const currentId = c.usage_type_id
    const exists = usageTypeStore.usageTypes.find(u => String(u.id) === String(currentId))
    if (currentId && !exists) {
        try {
            const { $api } = useNuxtApp()
            const { data } = await $api.get(`/usage-types/${currentId}`)
            const u = data?.usage_type
            if (u) usageTypeStore.usageTypes.push({ id: u.id, name: u.name, is_active: u.is_active })
        } catch {}
    }
    form.value = {
        name: c.name,
        expense_code: c.expense_code,
        icon: c.icon ? { value: c.icon, label: c.icon } : null,
        usage_type_id: c.usage_type_id ? { value: c.usage_type_id, label: c.usage_type_name } : null,
        description: c.description || '',
        is_active: toFormStatus(!!c.is_active),
    }
    formErrors.value = {}
    formModal.value = true
}

const submitForm = async () => {
    if (!validate()) return
    const payload = {
        name: form.value.name.trim(),
        expense_code: form.value.expense_code.trim(),
        icon: form.value.icon?.value || form.value.icon || null,
        description: form.value.description?.trim() || null,
        usage_type_id: form.value.usage_type_id?.value || form.value.usage_type_id,
        is_active: normalizeIsActive(form.value.is_active),
    }
    try {
        if (isEditing.value) await store.updateCategory(editingId.value, payload)
        else await store.createCategory(payload)
        formModal.value = false
    } catch {}
}

const toggleStatus = async (c) => { await store.updateStatus(c.id, !c.is_active) }
const confirmDelete = (c) => { deleteTarget.value = c; deleteModal.value = true }
const doDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try { await store.deleteCategory(deleteTarget.value.id); deleteModal.value = false } catch {} finally { deleting.value = false }
}
const prevPage = () => { if (store.page > 1) store.fetchCategories(props.organizationId, { page: store.page - 1 }) }
const nextPage = () => { if (store.page < store.totalPages) store.fetchCategories(props.organizationId, { page: store.page + 1 }) }

watch(() => props.organizationId, (v) => { if (v) { store.fetchCategories(v); loadUsageTypes() } })
onMounted(() => { if (props.organizationId) { store.fetchCategories(props.organizationId); loadUsageTypes() } })
</script>

<style scoped>
.skeleton { height: 0.875rem; border-radius: 9999px; background: linear-gradient(90deg, rgba(255,255,255,.12), rgba(255,255,255,.22), rgba(255,255,255,.12)); animation: shimmer 1.2s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
