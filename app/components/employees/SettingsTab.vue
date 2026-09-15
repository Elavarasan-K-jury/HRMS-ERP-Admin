<template>
    <div class="flex flex-col gap-3">
        <div class="settings-nav" role="tablist" aria-label="Employee settings">
            <button v-for="(tab, index) in tabs" :key="tab.label" type="button" role="tab"
                :aria-selected="activeTab === index" class="settings-nav-item"
                :class="{ 'settings-nav-item-active': activeTab === index }" @click="activeTab = index">
                <Icon :name="tab.icon" class="text-lg" />
                <span>{{ tab.label }}</span>
            </button>
        </div>

        <section v-show="activeTab === 0" class="settings-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Job Titles</p>
                    <h3>Designations</h3>
                    <p>View all designations with assigned employees.</p>
                </div>
                <UiButton @click="fetchDesignations" color="#fff" text="Reload" prepend-icon="ion:refresh"
                    :disabled="loadingDesignations" />
            </div>
            <div v-if="loadingDesignations" class="py-10 text-center text-sm text-white/50">Loading designations…</div>
            <div v-else-if="!designations.length" class="py-10 text-center text-sm text-white/50">
                No designations found. Create designations from the Designations page.
            </div>
            <div v-else class="overflow-x-auto">
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-gradient-to-r from-emerald-900/30 via-slate-900/50 to-slate-900/50 border-b border-white/10 sticky top-0 z-10">
                        <tr>
                            <th class="th px-6 py-4 text-left font-semibold uppercase tracking-wider text-emerald-300/80">Designation Name</th>
                            <th class="th px-6 py-4 text-left font-semibold uppercase tracking-wider text-emerald-300/80">Assigned To</th>
                            <th class="th px-6 py-4 text-right font-semibold uppercase tracking-wider text-emerald-300/80">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="desig in designations" :key="desig.id" class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td class="td py-5 px-6">
                                <div class="font-semibold text-white">{{ desig.name }}</div>
                                <div class="text-xs text-white/70 mt-1">{{ desig.department?.name || '—' }}</div>
                            </td>
                            <td class="td py-5 px-6">
                                <span v-if="desig.employee_count > 0" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-medium">
                                    <Icon name="lucide:users" class="w-4 h-4" />
                                    <span>{{ desig.employee_count }} Employee{{ desig.employee_count !== 1 ? 's' : '' }}</span>
                                </span>
                                <span v-else class="text-white/40 text-sm">—</span>
                            </td>
                            <td class="td py-5 px-6 text-right">
                                <UiButton size="xs" color="#4aff7a" text="View" prepend-icon="ion:eye-outline" @click="viewDesignation(desig)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>
        </section>

        <section v-show="activeTab === 1" class="settings-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Unique identity</p>
                    <h3>Employee Number</h3>
                    <p>Choose the format used when assigning employee numbers.</p>
                </div>
                <div class="flex items-center gap-2">
                    <UiButton color="#4aff7a" text="Add New Series" prepend-icon="ion:add-circle-outline" @click="openSeriesModal" />
                    <span class="panel-icon"><Icon name="ion:key-outline" /></span>
                </div>
            </div>
            <div v-if="loadingSeries" class="py-10 text-center text-sm text-white/50">Loading employee number series…</div>
            <div v-else-if="!series.length" class="py-10 text-center text-sm text-white/50">No series created yet. Add a series to start generating employee codes.</div>
            <div v-else class="series-grid">
                <article v-for="item in series" :key="item.id" class="series-card" :class="{ 'series-card-inactive': !item.is_active }">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <p class="truncate text-sm font-semibold text-white/90">{{ item.name }}</p>
                                <span class="series-type-badge shrink-0">{{ item.policy_type || 'PROBATION' }}</span>
                            </div>
                            <p class="mt-1 text-xs text-white/45">Prefix {{ item.prefix || '—' }} · {{ item.digits }} digits · Suffix {{ item.suffix || '—' }}</p>
                        </div>
                        <span class="status-badge shrink-0" :class="item.is_active ? 'status-active' : 'status-inactive'">
                            {{ item.is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <span class="number-preview">{{ item.preview }}</span>
                        <p class="text-xs text-white/45">Next code: {{ item.next_number }}</p>
                    </div>
                    <div class="mt-1 flex items-center gap-2">
                        <UiButton size="xs" color="#fff" text="Edit" prepend-icon="ion:create-outline" @click="openEditSeries(item)" />
                        <UiButton size="xs" :color="item.is_active ? '#750d0d' : '#4aff7a'"
                            :text="item.is_active ? 'Make Inactive' : 'Make Active'"
                            :prepend-icon="item.is_active ? 'ion:close-circle' : 'ion:checkmark-circle'"
                            @click="toggleSeriesActive(item)" />
                    </div>
                </article>
            </div>
        </section>

        <section v-show="activeTab === 2" class="settings-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Employee categories</p>
                    <h3>Employee Categories</h3>
                    <p>Manage the categories used to group employees.</p>
                </div>
                <div class="flex items-center gap-2">
                    <UiButton color="#4aff7a" text="Add Employee Category" prepend-icon="ion:add-circle-outline" @click="openAddCategoryModal" />
                    <UiButton color="#fff" text="Reload" prepend-icon="ion:refresh" @click="fetchCategories" :disabled="categoryLoading" />
                </div>
            </div>
            <div class="mt-6">
                <EmployeeCategoryDataTable :items="empCategories" :loading="categoryLoading" :total="categoryTotal"
                    :page="categoryPage" :total-pages="categoryTotalPages" @refresh="fetchCategories" @view="viewCategory"
                    @edit="editCategory" @delete="deleteCategory" @next="changeCategoryPage('+')"
                    @prev="changeCategoryPage('-')" />
            </div>
        </section>

        <UiSidebarModal width="980px" v-model="categoryModal" :title="categoryFormTitle">
            <EmployeeCategoryForm :show="categoryModal" />
            <template #footer>
                <UiButton :disabled="categorySaving" @click="closeCategoryModal" color="#fff" text="Cancel"
                    prepend-icon="ion:close-circle" />
                <UiButton :disabled="categorySaving" @click="saveCategory" color="#4aff7a"
                    :text="!categorySaving ? 'Save Employee Category' : 'Saving please wait...'" prepend-icon="ion:save-outline" />
            </template>
        </UiSidebarModal>
        <UiModal v-model="categoryDeleteModal" title="Are you sure?" size="sm">
            <template #default>
                <span>Are you sure you want to delete {{ categoryDeleteData?.name }}?</span>
            </template>
            <template #footer>
                <UiButton @click="categoryDeleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="confirmDeleteCategory" color="#750d0d" text="Delete Employee Category" prepend-icon="ion:trash" />
            </template>
        </UiModal>

        <section v-show="activeTab === 3" class="settings-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">Employee identity card</p>
                    <h3>ID Card</h3>
                    <p>Choose the fields and visual style shown on generated employee ID cards.</p>
                </div>
                <span class="panel-icon"><Icon name="ion:card-outline" /></span>
            </div>
            <div class="id-card-layout">
                <div class="id-card-preview">
                    <div class="id-card-brand"><span class="brand-mark">J</span><span>JURY HRMS</span></div>
                    <div class="id-card-person"><div class="avatar-placeholder"><Icon name="ion:person" /></div><div><strong>Employee Name</strong><small>EMP-1001 · Engineering</small></div></div>
                    <div class="id-card-footer"><span>Valid employee ID</span><Icon name="ion:qr-code-outline" class="text-2xl" /></div>
                </div>
                <div class="field-options">
                    <p class="eyebrow">Visible fields</p>
                    <label v-for="field in idFields" :key="field.label" class="check-row"><input v-model="field.enabled" type="checkbox" /><span>{{ field.label }}</span></label>
                </div>
            </div>
        </section>

        <UiModal v-model="viewModal" :title="viewData?.name ? 'View Designation - ' + viewData.name : 'View Designation'" size="lg">
            <div class="space-y-5">
                <!-- Header Card -->
                <div class="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 via-slate-900/50 to-slate-900/50 p-5">
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <Icon name="lucide:briefcase" class="w-6 h-6 text-emerald-300" />
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-white truncate">{{ viewData?.name || '—' }}</h3>
                                    <div class="flex items-center gap-2 mt-1 text-sm text-white/60">
                                        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">{{ viewData?.level || 'No Level' }}</span>
                                        <span class="px-2 py-0.5 rounded-full bg-white/10 text-white/50">{{ viewData?.department?.name || 'No Department' }}</span>
                                    </div>
                                </div>
                            </div>
                            <p v-if="viewData?.description" class="mt-3 text-white/70 text-sm whitespace-pre-line">{{ viewData?.description }}</p>
                        </div>
                        <div class="flex-shrink-0 text-right">
                            <div class="text-3xl font-bold text-emerald-300">{{ viewData?.employee_count || 0 }}</div>
                            <div class="text-xs text-white/50 mt-0.5">Employee{{ viewData?.employee_count !== 1 ? 's' : '' }}</div>
                        </div>
                    </div>
                </div>

                <!-- Assigned Employees -->
                <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-semibold text-white flex items-center gap-2">
                            <Icon name="lucide:users" class="w-5 h-5 text-emerald-300" />
                            Assigned Employees ({{ viewData?.employee_count || 0 }})
                        </h4>
                    </div>
                    <div v-if="viewData?.employees?.length" class="space-y-3 max-h-80 overflow-y-auto pr-2">
                        <div v-for="emp in viewData.employees" :key="emp.id" class="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <Icon name="lucide:user" class="w-5 h-5 text-emerald-300" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-medium text-white">{{ emp.full_name }}</div>
                                <div class="flex items-center gap-2 mt-1 text-xs text-white/60">
                                    <span class="font-mono px-2 py-0.5 rounded bg-white/10">{{ emp.employee_code || '—' }}</span>
                                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{{ emp.email || 'No Email' }}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 text-white/40">
                                <Icon name="lucide:mail" class="w-4 h-4" />
                                <span class="text-xs">{{ emp.phone || '—' }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-else class="text-center py-10">
                        <Icon name="lucide:users" class="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p class="text-white/40">No employees assigned to this designation</p>
                    </div>
                </div>

                <!-- Meta Info -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">Created</div>
                        <div class="text-sm text-white/90">{{ formatDate(viewData?.created_at) }}</div>
                    </div>
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-1">Updated</div>
                        <div class="text-sm text-white/90">{{ formatDate(viewData?.updated_at) }}</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <UiButton color="#fff" text="Close" @click="viewModal = false" />
            </template>
        </UiModal>

        <UiModal v-model="seriesModal" :title="editingSeries ? 'Edit Employee Number Series' : 'Create Employee Number Series'" size="md">
            <div class="grid gap-4 sm:grid-cols-2">
                <label class="field sm:col-span-2"><span>Series name</span><input v-model.trim="seriesForm.name" placeholder="e.g. Full-time Employees" /></label>
                <label class="field sm:col-span-2"><span>Policy Type</span>
                    <select v-model="seriesForm.policy_type">
                        <option v-for="t in seriesTypeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
                    </select>
                </label>
                <label class="field"><span>Prefix</span><input v-model="seriesForm.prefix" placeholder="e.g. EMP-" /></label>
                <label class="field"><span>Suffix</span><input v-model="seriesForm.suffix" placeholder="e.g. -IN" /></label>
                <label class="field"><span>Digits in number</span><select v-model.number="seriesForm.digits"><option v-for="digit in digitOptions" :key="digit" :value="digit">{{ digit }} digits</option></select></label>
                <label class="field"><span>Next number</span><input v-model.number="seriesForm.next_number" min="1" type="number" /></label>
            </div>
            <div class="preview-strip"><span class="preview-label">Number preview</span><span class="number-preview">{{ seriesPreview }}</span></div>
            <template #footer>
                <UiButton color="#fff" text="Cancel" @click="seriesModal = false" />
                <UiButton :disabled="savingSeries || !seriesForm.name" color="#4aff7a" :text="savingSeries ? 'Saving…' : (editingSeries ? 'Update Series' : 'Create Series')" @click="saveSeries" />
            </template>
        </UiModal>
    </div>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDesignationStore } from '../../stores/organization/designation.store'
import { useEmpCategoryStore } from '../../stores/organization/empCategory.store'
import { storeToRefs } from 'pinia'

const activeTab = ref(0)
const route = useRoute()
const series = ref([])
const loadingSeries = ref(false)
const savingSeries = ref(false)
const seriesModal = ref(false)
const editingSeries = ref(false)
const digitOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10]
const seriesTypeOptions = [
    { value: 'PROBATION', label: 'Probation' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'TRAINEE', label: 'Trainee' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'PERMANENT', label: 'Permanent' },
]
const seriesForm = reactive({ id: null, name: '', prefix: 'EMP-', digits: 4, suffix: '', next_number: 1, policy_type: 'PROBATION' })

const designationStore = useDesignationStore()
const designations = ref([])
const loadingDesignations = ref(false)
const viewModal = ref(false)
const viewData = ref(null)

const empCategoryStore = useEmpCategoryStore()
const categoryModal = ref(false)
const categoryFormTitle = ref(null)
const categorySaving = ref(false)
const categoryDeleteModal = ref(false)
const categoryDeleteData = ref(null)
const {
    categories: empCategories,
    total: categoryTotal,
    page: categoryPage,
    totalPages: categoryTotalPages,
    loading: categoryLoading,
    empCategoryId,
    name: categoryName,
    description: categoryDescription,
    is_active: categoryIsActive,
    employment_type: categoryEmploymentType,
} = storeToRefs(empCategoryStore)

const tabs = [
    { label: 'Job Titles', icon: 'ion:briefcase-outline' },
    { label: 'Employee Number', icon: 'ion:key-outline' },
    { label: 'Employee Categories', icon: 'ion:albums-outline' },
    { label: 'ID Card', icon: 'ion:card-outline' },
]

const idFields = ref([
    { label: 'Employee photo', enabled: true },
    { label: 'Employee number', enabled: true },
    { label: 'Department and title', enabled: true },
    { label: 'QR code', enabled: true },
])

const seriesPreview = computed(() => `${seriesForm.prefix || ''}${String(seriesForm.next_number || 1).padStart(seriesForm.digits || 1, '0')}${seriesForm.suffix || ''}`)

const resetSeriesForm = () => Object.assign(seriesForm, { id: null, name: '', prefix: 'EMP-', digits: 4, suffix: '', next_number: 1, policy_type: 'PROBATION' })
const openSeriesModal = () => { resetSeriesForm(); editingSeries.value = false; seriesModal.value = true }

const openEditSeries = (item) => {
    Object.assign(seriesForm, {
        id: item.id,
        name: item.name,
        prefix: item.prefix || '',
        digits: item.digits || 4,
        suffix: item.suffix || '',
        next_number: item.next_number || 1,
        policy_type: item.policy_type || 'PROBATION',
    })
    editingSeries.value = true
    seriesModal.value = true
}

const loadSeries = async () => {
    loadingSeries.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get(`/organizations/${route.params.organization}/employee-number-series`)
        series.value = data.series || []
    } finally {
        loadingSeries.value = false
    }
}

const fetchDesignations = async () => {
    loadingDesignations.value = true
    try {
        designationStore.organization_id = route.params.organization
        await designationStore.fetchDesignations()
        designations.value = designationStore.designations || []
    } finally {
        loadingDesignations.value = false
    }
}

const saveSeries = async () => {
    savingSeries.value = true
    try {
        const { $api } = useNuxtApp()
        const baseUrl = `/organizations/${route.params.organization}/employee-number-series`
        const payload = {
            name: seriesForm.name,
            prefix: seriesForm.prefix,
            digits: seriesForm.digits,
            suffix: seriesForm.suffix,
            next_number: seriesForm.next_number,
            policy_type: seriesForm.policy_type,
        }
        if (editingSeries.value) {
            const { data } = await $api.put(`${baseUrl}/${seriesForm.id}`, payload)
            const idx = series.value.findIndex(s => s.id === seriesForm.id)
            if (idx !== -1) series.value[idx] = data.series
        } else {
            const { data } = await $api.post(baseUrl, payload)
            series.value.push(data.series)
        }
        seriesModal.value = false
    } catch (error) {
        useToast().error({ title: editingSeries.value ? 'Unable to update series' : 'Unable to create series', message: error.response?.data?.error || error.message, timeout: 2000 })
    } finally {
        savingSeries.value = false
    }
}

const toggleSeriesActive = async (item) => {
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.put(`/organizations/${route.params.organization}/employee-number-series/${item.id}`, {
            name: item.name,
            prefix: item.prefix,
            digits: item.digits,
            suffix: item.suffix,
            next_number: item.next_number,
            is_active: !item.is_active,
        })
        const idx = series.value.findIndex(s => s.id === item.id)
        if (idx !== -1) series.value[idx] = data.series
        useToast().success({ title: 'Success!', message: data.message || 'Series updated', timeout: 1500 })
    } catch (error) {
        useToast().error({ title: 'Unable to update series', message: error.response?.data?.error || error.message, timeout: 2000 })
    }
}

const viewDesignation = (desig) => {
    viewData.value = desig
    viewModal.value = true
}

const fetchCategories = async () => {
    empCategoryStore.organization_id = route.params.organization
    await empCategoryStore.fetchEmployeeCategories()
}

const openAddCategoryModal = () => {
    empCategoryId.value = null
    categoryName.value = null
    categoryDescription.value = null
    categoryIsActive.value = true
    categoryEmploymentType.value = 'PROBATION'
    categoryFormTitle.value = 'Add New Employee Category'
    categoryModal.value = true
}

const closeCategoryModal = () => {
    empCategoryId.value = null
    categoryName.value = null
    categoryDescription.value = null
    categoryIsActive.value = true
    categoryEmploymentType.value = 'PROBATION'
    categoryFormTitle.value = null
    categoryModal.value = false
}

const saveCategory = async () => {
    categorySaving.value = true
    try {
        await empCategoryStore.saveEmpCategory()
    } finally {
        categorySaving.value = false
        closeCategoryModal()
    }
}

const viewCategory = (item) => {
    editCategory(item)
}

const editCategory = (item) => {
    empCategoryId.value = item.id
    categoryName.value = item.name
    categoryDescription.value = item.description
    categoryIsActive.value = item.is_active
    categoryEmploymentType.value = item.employment_type || 'PROBATION'
    categoryFormTitle.value = 'Edit Employee Category'
    categoryModal.value = true
}

const changeCategoryPage = (direction) => {
    if (direction === '+') {
        if (categoryPage.value < categoryTotalPages.value) categoryPage.value += 1
    } else {
        if (categoryPage.value > 1) categoryPage.value -= 1
    }
    fetchCategories()
}

const deleteCategory = (item) => {
    categoryDeleteData.value = item
    empCategoryId.value = item.id
    categoryDeleteModal.value = true
}

const confirmDeleteCategory = async () => {
    await empCategoryStore.deleteEmployeeCategory()
    categoryDeleteData.value = null
    empCategoryId.value = null
    categoryDeleteModal.value = false
}

function formatDate(date) {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    } catch {
        return date
    }
}

const handleRefresh = (event) => {
    if (event.detail?.tab === 'settings' || event.detail?.tab === 5) {
        loadSeries()
    }
}

onMounted(() => {
    loadSeries()
    window.addEventListener('refresh-tab', handleRefresh)
    // Fetch designations if first tab is active on initial load
    if (activeTab.value === 0) {
        fetchDesignations()
    }
})

watch(activeTab, (newTab) => {
    if (newTab === 0) {
        fetchDesignations()
    }
    if (newTab === 2) {
        fetchCategories()
    }
})

onBeforeUnmount(() => window.removeEventListener('refresh-tab', handleRefresh))
</script>

<style scoped>
.settings-panel { @apply rounded-xl border border-white/15 bg-white/[.07] backdrop-blur-xl shadow-lg; }
.eyebrow { @apply text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300/75; }
.settings-nav { @apply flex items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-black/10 p-1; }
.settings-nav-item { @apply relative inline-flex min-w-max items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white/55 transition-all hover:bg-white/10 hover:text-white/90; }
.settings-nav-item::after { content: ''; @apply absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-transparent transition-all; }
.settings-nav-item-active { @apply bg-emerald-300/10 text-emerald-200; }
.settings-nav-item-active::after { @apply bg-emerald-300 shadow-[0_0_12px_rgba(74,255,122,.8)]; }
.settings-panel { @apply p-6; }
.panel-heading { @apply flex items-start justify-between gap-4 border-b border-white/10 pb-5; }
.panel-heading h3 { @apply mt-1 text-lg font-semibold text-white/90; }
.panel-heading p:not(.eyebrow) { @apply mt-1 text-sm text-white/50; }
.panel-icon { @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl text-emerald-300; }
.form-grid { @apply mt-5 grid gap-4 sm:grid-cols-2; }
.field { @apply flex flex-col gap-2 text-sm text-white/65; }
.field input, .field select { @apply rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-white/90 outline-none transition focus:border-emerald-300/70 focus:ring-1 focus:ring-emerald-300/30; }
.preview-strip { @apply mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-300/15 bg-emerald-300/[.06] px-4 py-3; }
.preview-label { @apply text-xs uppercase tracking-wider text-white/45; }
.preview-value { @apply text-sm font-medium text-white/85; }
.preview-value em { @apply mx-1 not-italic text-emerald-300; }
.number-preview { @apply rounded-md bg-emerald-300/15 px-3 py-1 font-mono text-sm text-emerald-200; }
.series-grid { @apply mt-6 grid gap-3 sm:grid-cols-2; }
.series-card { @apply flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.03] p-4; }
.series-card-inactive { @apply opacity-60; }
.status-badge { @apply inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide; }
.series-type-badge { @apply inline-flex shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-sky-500/20 text-sky-300; }
.status-active { @apply bg-emerald-500/20 text-emerald-300; }
.status-inactive { @apply bg-red-500/20 text-red-300; }
.id-card-layout { @apply mt-5 grid gap-6 lg:grid-cols-[minmax(260px,360px)_1fr]; }
.id-card-preview { @apply rounded-2xl border border-emerald-300/25 bg-gradient-to-br from-emerald-950/80 via-slate-900/80 to-slate-950 p-5 text-white shadow-[0_15px_40px_rgba(0,0,0,.25)]; }
.id-card-brand, .id-card-person, .id-card-footer { @apply flex items-center; }
.id-card-brand { @apply gap-2 text-xs font-semibold tracking-[.18em] text-emerald-200; }
.brand-mark { @apply flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300 font-bold text-slate-900; }
.id-card-person { @apply mt-8 gap-3; }
.avatar-placeholder { @apply flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xl text-white/60; }
.id-card-person strong { @apply block text-sm; }
.id-card-person small { @apply mt-1 block text-xs text-white/50; }
.id-card-footer { @apply mt-8 justify-between border-t border-white/10 pt-3 text-[10px] uppercase tracking-wider text-white/45; }
.field-options { @apply rounded-xl border border-white/10 bg-white/[.03] p-5; }
.check-row { @apply mt-4 flex cursor-pointer items-center gap-3 text-sm text-white/70; }
.check-row input { @apply h-4 w-4 accent-emerald-300; }
</style>
