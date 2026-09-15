<template>
    <div class="flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }} Employee<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiButton @click="openAddModal" color="#4aff7a" text="Add Employee" prepend-icon="ion:add-circle" />
            </div>
        </div>

        <div class="relative z-20 flex flex-wrap items-center gap-2 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg px-4 py-3">
            <div class="relative min-w-[220px] flex-1">
                <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
                <input v-model="search" type="text" placeholder="Search name, code, email, mobile..."
                    class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60" />
            </div>
            <EmployeesFilterDropdown v-model="selectedBranches" :options="branchOptions" title="Business Unit" />
            <EmployeesFilterDropdown v-model="selectedDepartments" :options="deptOptions" title="Department" />
            <EmployeesFilterDropdown v-model="selectedSubDepartments" :options="subDeptOptions" title="Sub Department" />
            <EmployeesFilterDropdown v-model="selectedCategories" :options="categoryOptions" title="Category" />
            <UiButton size="xs" color="#4aff7a" text="Reset" prepend-icon="ion:close-circle-outline"
                @click="resetFilters" :disabled="!hasActiveFilters" />
        </div>

        <EmployeeDataTable :items="employees" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            :limit="limit" @limit-change="changeLimit" @refresh="fetchEmployees" @view="view" @edit="editEmployee"
            @delete="deleteEmployee" @prev="prevPage" @next="nextPage" />
    </div>

    <UiSidebarModal width="980px" v-model="addUpdateModal" :title="formTitle">
        <EmployeeForm />
        <template #footer>
            <UiButton :disabled="loading" @click="closeModal" color="#fff" text="Cancel"
                prepend-icon="ion:close-circle" />
            <UiButton :disabled="loading" @click="saveEmployee" color="#4aff7a"
                :text="!loading ? 'Save Employee' : 'Saving please wait...'" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <EmployeeDetailedView v-model="preview" :id="emp_id" />

    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData?.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Employee" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEmpCategoryStore } from '~/stores/organization/empCategory.store'
import { useEmployeesStore } from '~/stores/organization/employee.store'
import { useDesignationStore } from '~/stores/organization/designation.store'
import { useAuthStore } from '~/stores/shared/auth.store'
import { useDepartmentStore } from '~/stores/organization/department.store'
import { useBranchStore } from '~/stores/organization/branch.store'
import { useLocationStore } from '~/stores/organization/location.store'
import { useProbationPolicyStore } from '~/stores/organization/probationPolicy.store'
import EmployeeDataTable from '~/components/employee/dataTable.vue'
import EmployeeDetailedView from '~/components/employee/detailedView.vue'
import EmployeeForm from '~/components/employee/form.vue'
import { apiAddressToStore } from '~/utils/employeeProfile'

const route = useRoute()
const router = useRouter()

const preview = computed(() => route.query.preview)
const emp_id = computed(() => route.query.employee_id)

const empCategoryStore = useEmpCategoryStore()
const departmentStore = useDepartmentStore()
const designationStore = useDesignationStore()
const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const branchStore = useBranchStore()
const locationStore = useLocationStore()
const probationPolicyStore = useProbationPolicyStore()

const deleteModal = ref(false)
const deleteData = ref(null)
const formTitle = ref(null)
const addUpdateModal = ref(false)

const {
    total,
    search,
    loading,
    employees,
    page,
    limit,
    totalPages,
    organization_id,
    category_id,
    department_id,
    branch_filter,
    type,
    is_active,
    first_name,
    last_name,
    email,
    phone,
    alt_phone,
    gender,
    dateOfBirth,
    joining_date,
    display_name,
    marital_status,
    blood_group,
    physically_handicapped,
    nationality,
    personal_email,
    professional_summary,
    current_address,
    permanent_address,
    same_as_current_address,
    employee_category,
    employee_designation,
    probation_policy_id,
    probation_start_date,
    probation_end_date,
    is_permanent,
    manager_id,
    branch_id,
    location_id,
    employee_department,
    employee_id,
    number_series_id,
    employee_code,
    series_preset_id,
    profile_image,
    profile_image_file_id,
    cost_center_id,
    pay_grade_id,
    notice_period_policy_id,
    relationships,
} = storeToRefs(employeesStore)

const empCategories = computed(() => empCategoryStore.category_list)
const categoryOptions = computed(() => empCategories.value.map(c => ({ value: c.value, label: c.label })))
const designations = computed(() => designationStore.designation_list)

const orgName = ref('')

const departments = computed(() => departmentStore.department_select.filter(d => !d.parent_id))
const subDepartments = computed(() => {
    const selected = selectedDepartments.value
    if (!selected.length) return []
    return departmentStore.department_select.filter(d => selected.includes(d.parent_id))
})

const deptOptions = computed(() => departments.value.map(d => ({ value: d.value, label: d.label })))
const subDeptOptions = computed(() => subDepartments.value.map(d => ({ value: d.value, label: d.label })))
const branchOptions = computed(() => {
    const opts = branchStore.branch_select.map(b => ({ value: b.value, label: b.label }))
    if (orgName.value) opts.unshift({ value: '__org__', label: orgName.value })
    return opts
})

const locationOptions = computed(() => {
    const branchesById = {}
    branchStore.branch_select.forEach(b => { branchesById[b.value] = b.label })
    return (locationStore.locations || []).map(loc => {
        let label = loc.formatted_address || 'Location'
        if (loc.entity_type === 'branch' && branchesById[loc.entity_id]) {
            label = `${branchesById[loc.entity_id]} — ${label}`
        } else if (loc.entity_type === 'organization') {
            label = `Organization${loc.is_headquarters ? ' (HQ)' : ''} — ${label}`
        }
        return { value: loc.id, label }
    })
})

const selectedDepartments = ref([])
const selectedSubDepartments = ref([])
const selectedBranches = ref([])
const selectedCategories = ref([])

watch(selectedCategories, async () => {
    category_id.value = selectedCategories.value.length ? selectedCategories.value.join(',') : null
    await fetchEmployees()
})

watch(selectedDepartments, async () => {
    selectedSubDepartments.value = []
    department_id.value = selectedDepartments.value.length ? selectedDepartments.value.join(',') : null
    await fetchEmployees()
})

watch(selectedSubDepartments, async () => {
    department_id.value = selectedSubDepartments.value.length
        ? selectedSubDepartments.value.join(',')
        : selectedDepartments.value.length
            ? selectedDepartments.value.join(',')
            : null
    await fetchEmployees()
})

watch(selectedBranches, async () => {
    if (selectedBranches.value.includes('__org__')) {
        branch_filter.value = null
    } else {
        branch_filter.value = selectedBranches.value.length ? selectedBranches.value.join(',') : null
    }
    await fetchEmployees()
})

const hasActiveFilters = computed(() =>
    !!search.value ||
    selectedDepartments.value.length > 0 ||
    selectedSubDepartments.value.length > 0 ||
    selectedBranches.value.length > 0 ||
    selectedCategories.value.length > 0)

const resetFilters = () => {
    search.value = null
    selectedDepartments.value = []
    selectedSubDepartments.value = []
    selectedBranches.value = []
    selectedCategories.value = []
    fetchEmployees()
}

let searchTimer = null
watch(search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => fetchEmployees(), 400)
})

const view = (emp) => {
    router.push({ query: { preview: 1, employee_id: emp.id } })
}

const deleteEmployee = (emp) => {
    deleteData.value = emp
    employee_id.value = emp.id
    deleteModal.value = true
}

const cancelDelete = () => {
    employee_id.value = null
    deleteData.value = null
    deleteModal.value = false
}

const confirmDelete = async () => {
    await employeesStore.deleteEmployee()
    employee_id.value = null
    deleteData.value = null
    deleteModal.value = false
}

const openAddModal = () => {
    employeesStore.series_preset_id = null
    profile_image.value = null
    profile_image_file_id.value = null
    cost_center_id.value = null
    pay_grade_id.value = null
    notice_period_policy_id.value = null
    is_permanent.value = false
    employeesStore.worker_type = 'FULL_TIME'
    probation_policy_id.value = null
    relationships.value = []
    formTitle.value = 'Add New Employee'
    addUpdateModal.value = true
}

function toInputDate(dateString) {
    if (!dateString) return ''
    if (dateString instanceof Date) return dateString.toISOString().slice(0, 10)
    if (typeof dateString === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) return dateString.slice(0, 10)
        const datePart = dateString.split(',')[0].trim()
        const m = datePart.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
        if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
        const parsed = new Date(datePart)
        if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    }
    return ''
}

const editEmployee = async (emp) => {
    await empCategoryStore.fetchAllEmployeeCategories()
    await designationStore.fetchDesignationList()
    await departmentStore.fetchAllDepartments()
    await employeesStore.fetchAllEmployees()
    await employeesStore.fetchNumberSeries()
    await probationPolicyStore.fetchPolicies()
    branchStore.organization_id = organization_id.value
    await branchStore.fetchAllBranches()
    formTitle.value = 'Update Employee'
    employee_id.value = emp.id
    first_name.value = emp.first_name
    last_name.value = emp.last_name
    email.value = emp.email
    phone.value = emp.phone
    alt_phone.value = emp.alt_phone
    type.value = emp.admin_of_organization ? 'ADMIN' : 'EMPLOYEE'
    gender.value = emp.gender
    is_active.value = emp.is_active !== undefined ? emp.is_active : true
    is_permanent.value = emp.is_permanent ?? false
    employeesStore.worker_type = emp.worker_type || (emp.is_permanent ? 'PERMANENT' : 'FULL_TIME')
    const pol = (probationPolicyStore.policies || []).find(p => p.id === emp.probation_policy_id)
    probation_policy_id.value = pol ? { value: pol.id, label: pol.name } : null
    joining_date.value = toInputDate(emp.joining_date) || (emp.probation?.start_date ? toInputDate(emp.probation.start_date) : null)
    probation_start_date.value = toInputDate(emp.probation_start_date) || (emp.probation?.start_date ? toInputDate(emp.probation.start_date) : null)
    probation_end_date.value = toInputDate(emp.probation_end_date) || (emp.probation?.end_date ? toInputDate(emp.probation.end_date) : null)
    const mgr = employeesStore.all_employees.find(e => e.id === emp.manager_id)
    manager_id.value = mgr ? { value: mgr.id, label: `${mgr.full_name}${mgr.designation ? ' — ' + (mgr.designation.name || '') : ''}` } : null
    const br = branchStore.branch_select.find(b => b.value === emp.branch_id)
    branch_id.value = br || null
    const loc = locationOptions.value.find(l => l.value === emp.location_id)
    location_id.value = loc || null
    dateOfBirth.value = emp.date_of_birth ? new Date(emp.date_of_birth).toISOString().split('T')[0] : null
    employee_category.value = empCategories.value.find(c => c.value == emp.category_id) ?? null
    employee_designation.value = designations.value.find(d => d.value == emp.designation_id) ?? null
    employee_code.value = emp.employee_code || null
    display_name.value = emp.display_name || null
    marital_status.value = emp.marital_status || null
    blood_group.value = emp.blood_group || null
    physically_handicapped.value = emp.physically_handicapped || false
    nationality.value = emp.nationality || null
    personal_email.value = emp.personal_email || null
    professional_summary.value = emp.professional_summary || null
    profile_image.value = emp.profile_image || null
    profile_image_file_id.value = emp.profile_image_file_id || null
    cost_center_id.value = emp.cost_center_id ? { value: emp.cost_center_id, label: emp.cost_center_name || 'Cost Center' } : null
    pay_grade_id.value = emp.pay_grade_id ? { value: emp.pay_grade_id, label: emp.pay_grade_name || 'Pay Grade' } : null
    notice_period_policy_id.value = emp.notice_period_policy_id ? { value: emp.notice_period_policy_id, label: emp.notice_period_policy_name || 'Notice Period Policy' } : null
    current_address.value = apiAddressToStore(emp.current_address)
    permanent_address.value = apiAddressToStore(emp.permanent_address)
    same_as_current_address.value = false
    const preselectedSeries = employeesStore.number_series.find(s => {
        const code = emp.employee_code || ''
        const prefix = s.prefix || ''
        const suffix = s.suffix || ''
        if (!prefix && !suffix) return false
        return code.startsWith(prefix) && code.endsWith(suffix) && code.length > prefix.length + suffix.length
    })
    number_series_id.value = preselectedSeries ? { value: preselectedSeries.id, label: `${preselectedSeries.name} (${preselectedSeries.preview})` } : null
    employeesStore.series_preset_id = preselectedSeries?.id || null
    await employeesStore.fetchRelationships(emp.id)
    employee_department.value = emp.departments.length ? await Promise.all(emp.departments.map(async (d) => {
        const isSubDept = d.department?.parent_id
        const parentDept = isSubDept ? departmentStore.department_select.find(ds => ds.value == d.department.parent_id) : null
        const parentChildren = parentDept?.children || []
        const subDeptOpt = isSubDept ? parentChildren.find(c => c.id == d.department_id) : null
        return {
            id: d.id,
            department: parentDept || (d.department_id == '' ? null : d.department_id),
            sub_department: subDeptOpt ? { value: subDeptOpt.id, label: subDeptOpt.name } : null,
            reporting_to: d.reporting_to == '' ? null : d.reporting_to,
            start_date: toInputDate(d.start_date),
            end_date: toInputDate(d.end_date),
            employees_list: []
        }
    })) : [
        {
            id: null,
            department: null,
            sub_department: null,
            reporting_to: null,
            start_date: null,
            end_date: null,
            employees_list: []
        }
    ]
    addUpdateModal.value = true
}

const closeModal = () => {
    formTitle.value = null
    first_name.value = null
    last_name.value = null
    email.value = null
    phone.value = null
    alt_phone.value = null
    gender.value = null
    dateOfBirth.value = null
    joining_date.value = null
    display_name.value = null
    marital_status.value = null
    blood_group.value = null
    physically_handicapped.value = false
    nationality.value = null
    personal_email.value = null
    professional_summary.value = null
    current_address.value = { address_line1: null, address_line2: null, city: null, state: null, country: null, postal_code: null }
    permanent_address.value = { address_line1: null, address_line2: null, city: null, state: null, country: null, postal_code: null }
    same_as_current_address.value = false
    employee_category.value = null
    employee_designation.value = null
    probation_policy_id.value = null
    probation_start_date.value = null
    probation_end_date.value = null
    is_permanent.value = false
    employeesStore.worker_type = 'FULL_TIME'
    manager_id.value = null
    branch_id.value = null
    location_id.value = null
    number_series_id.value = null
    employee_code.value = null
    employeesStore.series_preset_id = null
    employee_department.value = [
        {
            id: null,
            department: null,
            sub_department: null,
            reporting_to: null,
            start_date: null,
            end_date: null,
            employees_list: []
        }
    ]
    employee_id.value = null
    profile_image.value = null
    profile_image_file_id.value = null
    cost_center_id.value = null
    pay_grade_id.value = null
    notice_period_policy_id.value = null
    relationships.value = []
    addUpdateModal.value = false
}

const saveEmployee = async () => {
    try {
        await employeesStore.saveEmployee()
        closeModal()
    } catch (e) {
        // keep the modal open so the user can see the error and fix the fields
    }
}

const fetchEmployees = async () => {
    await employeesStore.fetchEmployees()
}

const prevPage = () => {
    if (page.value > 1) {
        page.value -= 1
        fetchEmployees()
    }
}

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value += 1
        fetchEmployees()
    }
}

const changeLimit = (val) => {
    limit.value = Number(val)
    page.value = 1
    fetchEmployees()
}

const handleRefresh = () => {
    fetchEmployees()
}

onMounted(async () => {
    if (authStore.organization) {
        organization_id.value = authStore.organization
        empCategoryStore.organization_id = authStore.organization
    }
    await fetchEmployees()
    await empCategoryStore.fetchAllEmployeeCategories()
    await departmentStore.fetchAllDepartments()
    branchStore.organization_id = authStore.organization
    await branchStore.fetchAllBranches()
    locationStore.organization_id = authStore.organization
    await locationStore.fetchLocations()
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get(`/organizations/${authStore.organization}`)
        orgName.value = data?.name || ''
    } catch (e) {
        console.error('Failed to fetch organization name:', e)
    }
    window.addEventListener('refresh-tab', handleRefresh)
})

onBeforeUnmount(() => {
    window.removeEventListener('refresh-tab', handleRefresh)
})
</script>
