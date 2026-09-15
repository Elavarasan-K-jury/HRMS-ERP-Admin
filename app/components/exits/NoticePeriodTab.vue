<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Page header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Notice period policies</h2>
                <p class="text-xs text-white/55 max-w-xl mt-1 leading-relaxed">Manage notice period policies from here</p>
            </div>
            <div class="flex items-center gap-2">
                <UiButton @click="openCreate" color="#4aff7a" text="Create notice period policy" prepend-icon="ion:add-circle" :disabled="store.saving" />
                <UiButton @click="refresh" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="store.loading" />
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="!store.policies?.length && !store.loading"
            class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
            <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
            <span>No policies found.</span>
        </div>

        <!-- List + Detail -->
        <div v-else class="grid grid-cols-12 gap-3 flex-1 min-h-0">
            <!-- Sidebar list -->
            <div class="col-span-12 lg:col-span-4 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
                <div class="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Policies ({{ store.policies?.length || 0 }})</p>
                    <UiSearch v-model="searchQuery" placeholder="Search policies..." class="w-40" color="#fff" @search="onSearch" @clear="onSearch('')" />
                </div>
                <div class="max-h-[560px] overflow-y-auto p-1.5">
                    <template v-if="store.loading">
                        <div v-for="i in 4" :key="i" class="animate-pulse p-3">
                            <div class="skeleton w-40 mb-2" />
                            <div class="skeleton w-24" />
                        </div>
                    </template>

                    <button v-for="(p, i) in filteredPolicies" :key="p.id" type="button"
                        class="w-full text-left flex items-center justify-between gap-2 rounded-lg px-3 py-3 transition-colors group"
                        :class="selectedIndex === i
                            ? 'bg-emerald-500/15 border border-emerald-400/40'
                            : 'border border-transparent hover:bg-white/5'"
                        @click="select(i)">
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-1.5 min-w-0">
                                <span class="text-sm font-semibold truncate"
                                    :class="selectedIndex === i ? 'text-emerald-200' : 'text-white/90'">
                                    {{ p.title }}
                                </span>
                                <Icon v-if="p.is_default" name="lucide:star" class="w-3.5 h-3.5 text-amber-300 shrink-0"
                                    title="Default policy" />
                            </div>
                            <p v-if="p.description" class="text-xs text-white/50 mt-0.5 truncate">{{ p.description }}</p>
                            <div class="flex items-center gap-2 mt-1.5">
                                <button type="button"
                                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-colors hover:bg-white/15"
                                    :class="selectedIndex === i ? 'text-emerald-200' : 'text-white/60'"
                                    @click.stop="openAssignees(p)">
                                    <Icon name="lucide:users" class="w-3 h-3" />
                                    {{ p.employee_count }} assigned
                                </button>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Detail panel -->
            <div class="col-span-12 lg:col-span-8 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
                <template v-if="selected">
                    <div class="px-5 py-4 border-b border-white/10 bg-white/5 flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <h3 class="text-lg font-semibold text-white/90 truncate">{{ selected.title }}</h3>
                                <span v-if="selected.is_default"
                                    class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                                    <Icon name="lucide:star" class="w-3 h-3" /> Default
                                </span>
                            </div>
                            <button type="button" @click.stop="openAssignees(selected)"
                                class="inline-flex items-center gap-1.5 mt-1 text-xs font-medium text-emerald-300/90 hover:text-emerald-200 hover:underline transition-colors">
                                <Icon name="lucide:users" class="w-3.5 h-3.5" />
                                {{ selected.employee_count }} employee(s) assigned
                            </button>
                            <p v-if="selected.description" class="text-sm text-white/50 mt-0.5">{{ selected.description }}</p>
                        </div>

                        <!-- 3-dot menu -->
                        <span class="relative shrink-0">
                            <button type="button" class="p-1.5 rounded-lg transition-colors"
                                :class="menuOpen ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'"
                                @click.stop="menuOpen = !menuOpen">
                                <Icon name="lucide:more-horizontal" class="w-5 h-5" />
                            </button>

                            <div v-if="menuOpen"
                                class="absolute right-0 top-full z-40 mt-1 w-44 rounded-lg border border-white/10 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl p-1 animate-fade-in">
                                <button type="button" class="menu-item" @click="doEdit(selected)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" /> Edit
                                </button>
                                <button type="button" class="menu-item" :disabled="selected.is_default" @click="doSetDefault(selected)">
                                    <Icon name="lucide:star" class="w-4 h-4" />
                                    {{ selected.is_default ? 'Default policy' : 'Set as default' }}
                                </button>
                                <button type="button" class="menu-item" @click="openAssignees(selected)">
                                    <Icon name="lucide:users" class="w-4 h-4" /> Manage Employees
                                </button>
                                <div class="my-1 border-t border-white/10" />
                                <button type="button" class="menu-item-danger" @click="doDelete(selected)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </span>
                    </div>

                    <div class="p-5">
                        <div class="grid grid-cols-2 gap-4 animate-fade-in">
                            <PolicyItem label="Notice Period Duration" icon="lucide:hourglass">
                                {{ selected.duration_value }} {{ selected.duration_unit === 'MONTHS' ? 'Month(s)' : 'Day(s)' }}
                            </PolicyItem>
                            <PolicyItem label="Default Policy" icon="lucide:star">
                                <span :class="selected.is_default ? 'text-amber-300' : 'text-white/40'">
                                    {{ selected.is_default ? 'Yes' : 'No' }}
                                </span>
                            </PolicyItem>
                            <PolicyItem label="Assigned Employees" icon="lucide:users">
                                {{ selected.employee_count }} employee(s)
                            </PolicyItem>
                            <PolicyItem label="Created" icon="lucide:calendar-plus">
                                {{ formatDate(selected.created_at) }}
                            </PolicyItem>
                        </div>

                        <div class="mt-4 flex items-center gap-2">
                            <UiButton @click="doEdit(selected)" color="#fff" text="Edit" prepend-icon="lucide:pencil" size="sm" />
                            <UiButton @click="doSetDefault(selected)" :color="selected.is_default ? '#fff' : '#4aff7a'" :text="selected.is_default ? 'Unset Default' : 'Set as Default'" :prepend-icon="selected.is_default ? 'lucide:x' : 'lucide:star'" size="sm" :disabled="store.saving" />
                            <UiButton @click="openAssignees(selected)" color="#4aff7a" text="Manage Employees" prepend-icon="lucide:users" size="sm" />
                        </div>
                    </div>
                </template>

                <div v-else class="py-20 text-center text-sm text-white/50">
                    Select a policy from the list to view its configuration.
                </div>
            </div>
        </div>

        <!-- Create / Edit drawer -->
        <UiSidebarModal v-model="formModal" :title="isEditing ? 'Edit Notice Period Policy' : 'Create Notice Period Policy'">
            <template #default>
                <form @submit.prevent="submitForm" class="flex flex-col gap-5">
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Notice period title <span class="text-rose-400">*</span></p>
                        <FormInput v-model="form.title" class="w-full" prepend-icon="ion:document-text-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. Jurysoft Notice Period" />
                        <p v-if="formErrors.title" class="mt-1 text-xs text-rose-400">{{ formErrors.title }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Description</p>
                        <textarea v-model="form.description" rows="3" maxlength="500" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 transition-colors resize-none" placeholder="Standard employee notice period"></textarea>
                        <p class="mt-1 text-xs text-white/40 text-right">{{ (form.description || '').length }}/500</p>
                        <p v-if="formErrors.description" class="mt-1 text-xs text-rose-400">{{ formErrors.description }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-white/85 mb-1.5">Duration value <span class="text-rose-400">*</span></p>
                            <FormInput v-model.number="form.duration_value" type="number" class="w-full" prepend-icon="ion:time-outline" color="#4aff7a" size="md" rounded="lg" placeholder="2" />
                            <p v-if="formErrors.duration_value" class="mt-1 text-xs text-rose-400">{{ formErrors.duration_value }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-white/85 mb-1.5">Duration unit <span class="text-rose-400">*</span></p>
                            <select v-model="form.duration_unit" class="w-full h-[44px] bg-white/[0.06] border border-white/15 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-300/50">
                                <option value="DAYS" class="text-black">Days</option>
                                <option value="MONTHS" class="text-black">Months</option>
                            </select>
                            <p v-if="formErrors.duration_unit" class="mt-1 text-xs text-rose-400">{{ formErrors.duration_unit }}</p>
                        </div>
                    </div>
                    <label class="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" v-model="form.is_default" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500/30" />
                        <span class="text-sm text-white/80">Set as default policy</span>
                    </label>
                    <p class="text-xs text-white/40">Only one default policy is allowed per organization. Setting this will unset the current default.</p>
                </form>
            </template>
            <template #footer>
                <UiButton @click="formModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="store.saving" />
                <UiButton @click="submitForm" color="#4aff7a" :text="store.saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')" prepend-icon="ion:save-outline" :disabled="store.saving" />
            </template>
        </UiSidebarModal>

        <!-- Delete confirmation -->
        <UiModal v-model="deleteModal" title="Delete Notice Period Policy?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm leading-relaxed">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteTarget?.title }}"</span>?</p>
                <p v-if="deleteTarget?.employee_count > 0" class="mt-3 text-amber-300/90 text-xs leading-relaxed">This policy is assigned to {{ deleteTarget.employee_count }} employee(s). Please remove employees before deleting.</p>
                <p v-else class="mt-3 text-white/50 text-xs">This action cannot be undone. The policy will be soft-deleted and title will be freed for reuse.</p>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="deleting" />
                <UiButton @click="confirmDelete" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleting || (deleteTarget?.employee_count || 0) > 0" />
            </template>
        </UiModal>

        <!-- Assigned Employees side modal -->
        <UiSidebarModal v-model="assigneeModalOpen" :width="'960px'" :show-footer="false" opaque>
            <template #title>Assigned Employees</template>
            <template #subtitle>
                <span v-if="assigneePolicy" class="inline-flex items-center gap-1.5">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {{ assigneePolicy.title }} · {{ filteredAssignees.length }} of {{ assignees.length }} shown
                </span>
            </template>
            <template #default>
                <div class="flex flex-col gap-3">
                    <div class="relative">
                        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input v-model="assigneeSearch" type="text" placeholder="Search by employee name or code..."
                            class="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-emerald-400/50 transition-colors" />
                    </div>

                    <div v-if="assigneeLoading" class="py-16 flex flex-col items-center gap-3 text-white/50">
                        <Icon name="lucide:loader-circle" class="w-7 h-7 animate-spin text-emerald-400" />
                        <span class="text-sm">Loading employees...</span>
                    </div>
                    <div v-else-if="filteredAssignees.length"
                        class="overflow-x-auto glass-scroll rounded-xl border border-white/10">
                        <table class="min-w-full text-sm text-white/90">
                            <thead class="sticky top-0 z-10 bg-[#14161c]/95 border-b border-white/10">
                                <tr>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Employee</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Email</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Designation</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Department</th>
                                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Sub Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="e in filteredAssignees" :key="e.id"
                                    class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td class="px-4 py-3">
                                        <div class="font-semibold text-white">{{ e.full_name || '—' }}</div>
                                        <div class="text-xs text-white/50">{{ e.employee_code || '—' }}</div>
                                    </td>
                                    <td class="px-4 py-3 text-white/70">{{ e.email || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ e.designation || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ e.department || '—' }}</td>
                                    <td class="px-4 py-3 text-white/70">{{ e.sub_department || '—' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="py-16 flex flex-col items-center gap-2 text-white/50">
                        <Icon name="lucide:users" class="w-7 h-7 opacity-60" />
                        <span class="text-sm">{{ assigneeSearch ? 'No employees match your search.' : 'No active employees assigned to this policy.' }}</span>
                    </div>
                </div>
            </template>
        </UiSidebarModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useNoticePeriodStore } from '~/stores/organization/noticePeriod.store'
import PolicyItem from '../policies/item.vue'

const props = defineProps({
    organizationId: { type: String, required: true }
})

const store = useNoticePeriodStore()

const selectedIndex = ref(0)
const menuOpen = ref(false)
const searchQuery = ref('')
const formModal = ref(false)
const isEditing = ref(false)
const deleteModal = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const form = ref({
    title: '',
    description: '',
    duration_value: 30,
    duration_unit: 'DAYS',
    is_default: false,
})
const formErrors = ref({})

// Assigned Employees side modal
const assigneeModalOpen = ref(false)
const assigneeLoading = ref(false)
const assigneeSearch = ref('')
const assignees = ref([])
const assigneePolicy = ref(null)

const selected = computed(() => store.policies?.[selectedIndex.value] || null)

const filteredPolicies = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return store.policies || []
    return (store.policies || []).filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    )
})

const filteredAssignees = computed(() => {
    const q = assigneeSearch.value.trim().toLowerCase()
    if (!q) return assignees.value
    return assignees.value.filter(e =>
        (e.full_name || '').toLowerCase().includes(q) ||
        (e.employee_code || '').toLowerCase().includes(q)
    )
})

function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function select(i) {
    selectedIndex.value = i
    menuOpen.value = false
}

function closeMenu() { menuOpen.value = false }

const onSearch = (term) => { searchQuery.value = term }

const refresh = async () => {
    await store.fetchPolicies(props.organizationId)
}

const fetchPolicies = async () => {
    await store.fetchPolicies(props.organizationId)
    if (selected.value) {
        const fresh = store.policies.find(p => p.id === selected.value.id)
        if (fresh) selectedIndex.value = store.policies.indexOf(fresh)
        else selectedIndex.value = 0
    }
}

// Create
const openCreate = () => {
    isEditing.value = false
    form.value = { title: '', description: '', duration_value: 30, duration_unit: 'DAYS', is_default: false }
    formErrors.value = {}
    store.policy_id = null
    formModal.value = true
}

// Edit
const doEdit = (p) => {
    closeMenu()
    isEditing.value = true
    form.value = { title: p.title, description: p.description || '', duration_value: p.duration_value, duration_unit: p.duration_unit, is_default: !!p.is_default }
    formErrors.value = {}
    store.policy_id = p.id
    formModal.value = true
}

// Delete
const doDelete = (p) => {
    closeMenu()
    deleteTarget.value = p
    deleteModal.value = true
}

const confirmDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try {
        await store.deletePolicy(deleteTarget.value.id)
        if (selected.value?.id === deleteTarget.value.id) selectedIndex.value = 0
        deleteModal.value = false
        deleteTarget.value = null
        await fetchPolicies()
    } catch {} finally { deleting.value = false }
}

// Default
const doSetDefault = async (p) => {
    closeMenu()
    await store.setDefaultPolicy(p.id, !p.is_default)
    await fetchPolicies()
}

// Validate
const validate = () => {
    const e = {}
    const t = (form.value.title || '').trim()
    if (!t) e.title = 'Title is required'
    else if (t.length > 100) e.title = 'Title must be at most 100 characters'
    if ((form.value.description || '').trim().length > 500) e.description = 'Description must be at most 500 characters'
    const dv = Number(form.value.duration_value)
    if (!form.value.duration_value || isNaN(dv) || dv <= 0) e.duration_value = 'Duration must be a positive number'
    if (!['DAYS', 'MONTHS'].includes(form.value.duration_unit)) e.duration_unit = 'Unit must be DAYS or MONTHS'
    formErrors.value = e
    return Object.keys(e).length === 0
}

const submitForm = async () => {
    if (!validate()) return
    store.title = form.value.title.trim()
    store.description = form.value.description?.trim() || null
    store.duration_value = Number(form.value.duration_value)
    store.duration_unit = form.value.duration_unit
    store.is_default = !!form.value.is_default
    store.organizationId = props.organizationId
    try {
        if (isEditing.value) await store.updatePolicy()
        else await store.createPolicy()
        formModal.value = false
        store.resetForm()
        await fetchPolicies()
    } catch {}
}

// Assignees
async function openAssignees(policy) {
    closeMenu()
    if (!policy) return
    assigneePolicy.value = policy
    assigneeModalOpen.value = true
    assigneeLoading.value = true
    assigneeSearch.value = ''
    assignees.value = []
    try {
        assignees.value = await store.fetchPolicyEmployees(policy.id) || []
    } catch (err) {
        console.error('Failed to load policy assignees:', err)
        assignees.value = []
    } finally {
        assigneeLoading.value = false
    }
}

watch(() => props.organizationId, (v) => {
    if (v) fetchPolicies()
})

onMounted(async () => {
    store.organizationId = props.organizationId
    await fetchPolicies()
})
</script>

<style scoped>
.menu-item {
    @apply w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed;
}

.menu-item-danger {
    @apply w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-red-400/90 hover:bg-red-500/20 hover:text-red-300 transition-colors;
}

.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    animation: shimmer 1.2s infinite;
}

.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
</style>
