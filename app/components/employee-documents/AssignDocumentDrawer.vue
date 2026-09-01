<template>
    <UiSidebarModal v-model="open" title="Assign Documents" width="680px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Select employees and the document types to assign.</span>
        </template>
        <template #default>
            <form @submit.prevent="submit" class="flex flex-col gap-5">
                <!-- Employees -->
                <div>
                    <p class="text-sm text-white/85 mb-1.5">Employees <span class="text-rose-400">*</span></p>
                    <UiSearch
                        v-model="employeeSearch"
                        placeholder="Search employees by name, code or email..."
                        :suggestions="employeeOptions"
                        color="#4aff7a" size="md" rounded="lg"
                        @search="onEmployeeSearch"
                        @focus="onEmployeeFocus"
                        @select="onEmployeeSelect"
                    />
                    <div v-if="employeesLoading" class="mt-2 flex items-center gap-2 text-xs text-white/40">
                        <Icon name="lucide:loader-circle" class="w-3.5 h-3.5 animate-spin" />
                        Searching...
                    </div>
                    <div v-if="selectedEmployees.length" class="mt-2 flex flex-wrap gap-1.5">
                        <span v-for="emp in selectedEmployees" :key="emp.id"
                            class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-400/20 px-2.5 py-1.5 text-sm text-white/90">
                            <span class="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-semibold text-white/70 shrink-0">{{ initials(emp.full_name) }}</span>
                            <span class="truncate max-w-[140px]">{{ emp.full_name }}</span>
                            <button type="button" @click="removeEmployee(emp.id)" class="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-red-300 transition-colors shrink-0" title="Remove">
                                <Icon name="lucide:x" class="w-3 h-3" />
                            </button>
                        </span>
                    </div>
                    <p v-else-if="employeeSearch && !employeesLoading && !employeeOptions.length" class="mt-2 text-xs text-white/40">No employees found.</p>
                </div>

                <!-- Document Types -->
                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <p class="text-sm text-white/85">Document Types <span class="text-rose-400">*</span></p>
                        <span class="text-xs text-white/40">{{ selectedTypeIds.length }} selected</span>
                    </div>
                    <div class="relative mb-2">
                        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input v-model="typeSearch" type="text" placeholder="Search document types..."
                            class="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-emerald-400/50" />
                    </div>

                    <!-- Global Select All -->
                    <div v-if="!documentTypesLoading && allGroupedTypes.length" class="flex items-center justify-between mb-2 px-1">
                        <button type="button" @click="toggleGlobalSelectAll" class="flex items-center gap-2 text-xs text-white/70 hover:text-white/90 transition-colors">
                            <span class="w-4 h-4 rounded border border-white/20 bg-white/10 flex items-center justify-center shrink-0"
                                :class="globalSelectAllState === 'all' ? 'bg-emerald-500/30 border-emerald-400/50' : globalSelectAllState === 'some' ? 'bg-emerald-500/15 border-emerald-400/30' : ''">
                                <Icon v-if="globalSelectAllState === 'all'" name="lucide:check" class="w-2.5 h-2.5 text-emerald-300" />
                                <Icon v-else-if="globalSelectAllState === 'some'" name="lucide:minus" class="w-2.5 h-2.5 text-emerald-300" />
                            </span>
                            {{ globalSelectAllState === 'all' ? 'Deselect All' : 'Select All' }}
                        </button>
                        <span class="text-xs text-white/40">{{ selectedTypeIds.length }} / {{ allActiveTypeIds.length }}</span>
                    </div>

                    <div v-if="documentTypesLoading" class="py-8 flex flex-col items-center gap-2 text-white/50">
                        <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                        <span class="text-xs">Loading document types...</span>
                    </div>
                    <div v-else-if="!allGroupedTypes.length" class="py-8 flex flex-col items-center gap-2 text-white/40">
                        <Icon name="ion:document-text-outline" class="w-8 h-8 opacity-40" />
                        <p class="text-sm">{{ typeSearch ? 'No document types match your search.' : 'No document types found. Create them in Settings first.' }}</p>
                    </div>
                    <div v-else class="space-y-1.5">
                        <div v-for="group in allGroupedTypes" :key="group.folder_id" class="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                            <!-- Folder header -->
                            <button type="button" @click="toggleFolder(group.folder_id)"
                                class="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-white/5 transition-colors">
                                <Icon :name="expandedFolders[group.folder_id] ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="w-4 h-4 text-white/40 shrink-0" />
                                <Icon name="ion:folder" class="w-4 h-4 text-emerald-300 shrink-0" />
                                <span class="text-xs font-semibold text-white/70 text-left flex-1">{{ group.folder_name }}</span>
                                <button type="button" @click.stop="toggleFolderSelectAll(group)"
                                    class="text-[11px] text-white/40 hover:text-white/70 transition-colors px-1.5 py-0.5 rounded hover:bg-white/10">
                                    {{ folderSelectedCount(group) }}/{{ folderActiveCount(group) }}
                                </button>
                            </button>
                            <!-- Document types -->
                            <div v-if="expandedFolders[group.folder_id]" class="border-t border-white/5">
                                <label v-for="t in group.types" :key="t.id"
                                    class="flex items-center gap-3 px-3 py-2.5 transition-colors"
                                    :class="selectedTypeIds.includes(String(t.id)) ? 'bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/15' : t.is_active ? 'cursor-pointer hover:bg-white/5' : 'opacity-40'">
                                    <input type="checkbox" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500"
                                        :checked="selectedTypeIds.includes(String(t.id))" :disabled="!t.is_active" @change="toggleType(t.id)" />
                                    <span class="flex-1 min-w-0">
                                        <span class="block text-sm text-white/85 truncate">{{ t.name }}</span>
                                        <span class="block text-[11px] text-white/45">
                                            <template v-if="t.is_mandatory">Mandatory</template>
                                            <template v-if="t.is_mandatory && t.is_verification_required"> &middot; </template>
                                            <template v-if="t.is_verification_required">Verification</template>
                                            <template v-if="(t.is_mandatory || t.is_verification_required) && t.is_multiple"> &middot; </template>
                                            <template v-if="t.is_multiple">Multiple Documents</template>
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </template>
        <template #footer>
            <div class="flex items-center justify-between w-full">
                <div class="text-xs text-white/40">
                    <span v-if="selectedEmployees.length && selectedTypeIds.length">
                        Employees: {{ selectedEmployees.length }} &middot; Documents: {{ selectedTypeIds.length }} &middot;
                        <span class="text-white/70 font-medium">Assignments: {{ selectedEmployees.length * selectedTypeIds.length }}</span>
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <UiButton @click="open = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="saving" />
                    <UiButton @click="submit" color="#4aff7a"
                        :text="saving ? 'Assigning...' : `Assign Documents (${selectedEmployees.length * selectedTypeIds.length})`"
                        prepend-icon="ion:checkmark-circle" :disabled="saving || !selectedEmployees.length || !selectedTypeIds.length" :loading="saving" />
                </div>
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/employeeDocument.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'assigned'])

const store = useEmployeeDocumentStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const employees = ref([])
const employeesLoading = ref(false)
const employeeSearch = ref('')
const selectedEmployees = ref([])
let empDebounce = null

const documentTypes = ref([])
const documentTypesLoading = ref(false)
const typeSearch = ref('')
const selectedTypeIds = ref([])
const expandedFolders = ref({})
const saving = ref(false)

const employeeOptions = computed(() => {
    const selectedIds = new Set(selectedEmployees.value.map(e => e.id))
    return employees.value
        .filter(e => !selectedIds.has(e.id))
        .map(e => ({
            value: e.id,
            label: e.full_name,
            desc: `${e.employeeCode || ''}${e.departmentName ? ' • ' + e.departmentName : ''}${e.designationName ? ' • ' + e.designationName : ''}`,
            ...e,
        }))
})

const allActiveTypeIds = computed(() => documentTypes.value.filter(t => t.is_active).map(t => String(t.id)))

const filteredTypes = computed(() => {
    const q = typeSearch.value.trim().toLowerCase()
    if (!q) return documentTypes.value
    return documentTypes.value.filter(t => (t.name || '').toLowerCase().includes(q))
})

const allGroupedTypes = computed(() => {
    const map = {}
    filteredTypes.value.forEach(t => {
        const key = t.folder_id || 'uncat'
        if (!map[key]) map[key] = { folder_id: key, folder_name: t.folder_name || 'Documents', types: [] }
        map[key].types.push(t)
    })
    return Object.values(map)
})

const globalSelectAllState = computed(() => {
    const active = allActiveTypeIds.value
    if (!active.length) return 'none'
    const selected = active.filter(id => selectedTypeIds.value.includes(id))
    if (selected.length === active.length) return 'all'
    if (selected.length > 0) return 'some'
    return 'none'
})

function initials(name) {
    return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function toggleFolder(folderId) {
    expandedFolders.value = { ...expandedFolders.value, [folderId]: !expandedFolders.value[folderId] }
}

function folderSelectedCount(group) {
    return group.types.filter(t => t.is_active && selectedTypeIds.value.includes(String(t.id))).length
}

function folderActiveCount(group) {
    return group.types.filter(t => t.is_active).length
}

function toggleFolderSelectAll(group) {
    const typeIds = group.types.filter(t => t.is_active).map(t => String(t.id))
    const allSelected = typeIds.every(id => selectedTypeIds.value.includes(id))
    if (allSelected) {
        selectedTypeIds.value = selectedTypeIds.value.filter(id => !typeIds.includes(id))
    } else {
        const newSet = new Set(selectedTypeIds.value)
        typeIds.forEach(id => newSet.add(id))
        selectedTypeIds.value = [...newSet]
    }
}

function toggleGlobalSelectAll() {
    const active = allActiveTypeIds.value
    if (globalSelectAllState.value === 'all') {
        selectedTypeIds.value = selectedTypeIds.value.filter(id => !active.includes(id))
    } else {
        const newSet = new Set(selectedTypeIds.value)
        active.forEach(id => newSet.add(id))
        selectedTypeIds.value = [...newSet]
    }
}

async function loadDocumentTypes() {
    documentTypesLoading.value = true
    try {
        const folders = await store.fetchFolders(store.organizationId, { limit: 100 })
        const all = []
        for (const f of folders) {
            try {
                const types = await store.fetchDocumentTypes(f.id, { limit: 100 })
                types.forEach(t => {
                    all.push({ ...t, folder_id: t.folder_id || f.id, folder_name: f.name, organization_id: store.organizationId })
                })
            } catch (e) { /* skip */ }
        }
        documentTypes.value = all
        const folderIds = [...new Set(all.map(t => t.folder_id))]
        const expanded = {}
        folderIds.forEach(id => { expanded[id] = true })
        expandedFolders.value = expanded
    } catch (e) {
        documentTypes.value = []
    } finally {
        documentTypesLoading.value = false
    }
}

async function onEmployeeSearch(value) {
    clearTimeout(empDebounce)
    empDebounce = setTimeout(async () => {
        await fetchEmployees(value)
    }, 350)
}

function onEmployeeFocus() {
    if (!employees.value.length) {
        fetchEmployees(employeeSearch.value)
    }
}

async function fetchEmployees(searchTerm) {
    employeesLoading.value = true
    try {
        const { $api } = useNuxtApp()
        const params = { organization_id: store.organizationId, limit: 50, only_active: 'true' }
        const { data } = await $api.get('/employees/all', { params })
        const all = data?.employees || data?.data || []
        const q = (searchTerm || '').toLowerCase()
        employees.value = all.filter(e => {
            const name = (e.full_name || e.fullName || `${e.firstName || ''} ${e.lastName || ''}`).trim().toLowerCase()
            const code = (e.employeeCode || e.employee_code || '').toLowerCase()
            const email = (e.email || '').toLowerCase()
            if (!q) return true
            return name.includes(q) || code.includes(q) || email.includes(q)
        }).map(e => ({
            id: e.id,
            full_name: (e.full_name || e.fullName || `${e.firstName || ''} ${e.lastName || ''}`).trim(),
            employeeCode: e.employeeCode || e.employee_code || '',
            departmentName: e.department_name || e.department || '',
            designationName: e.designation_name || e.designation || '',
        }))
    } catch (e) {
        employees.value = []
    } finally {
        employeesLoading.value = false
    }
}

function onEmployeeSelect(opt) {
    if (!selectedEmployees.value.find(e => e.id === opt.value)) {
        selectedEmployees.value = [...selectedEmployees.value, {
            id: opt.value,
            full_name: opt.label,
            employeeCode: opt.employeeCode || '',
            departmentName: opt.departmentName || '',
            designationName: opt.designationName || '',
        }]
    }
    employeeSearch.value = ''
    employees.value = []
}

function removeEmployee(id) {
    selectedEmployees.value = selectedEmployees.value.filter(e => e.id !== id)
}

function toggleType(id) {
    const s = String(id)
    if (selectedTypeIds.value.includes(s)) selectedTypeIds.value = selectedTypeIds.value.filter(x => x !== s)
    else selectedTypeIds.value = [...selectedTypeIds.value, s]
}

async function submit() {
    if (!selectedEmployees.value.length || !selectedTypeIds.value.length || saving.value) return
    saving.value = true
    try {
        await store.assignDocumentsBulk(
            selectedEmployees.value.map(e => e.id),
            selectedTypeIds.value
        )
        open.value = false
        selectedTypeIds.value = []
        selectedEmployees.value = []
        employeeSearch.value = ''
        employees.value = []
        emit('assigned')
    } catch (e) {
        // store toast handles error
    } finally {
        saving.value = false
    }
}

watch(() => props.modelValue, async (v) => {
    if (v) {
        selectedTypeIds.value = []
        selectedEmployees.value = []
        employeeSearch.value = ''
        employees.value = []
        await loadDocumentTypes()
    }
})
</script>
