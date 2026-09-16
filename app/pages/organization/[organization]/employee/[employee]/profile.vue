<template>
    <div class="h-[calc(100vh-4rem)] overflow-y-auto px-2 py-3">
        <!-- 🕒 Loading -->
        <div v-if="loading" class="space-y-4">
            <div class="skeleton-banner" />
            <div class="skeleton-strip" />
            <div class="skeleton-strip" />
        </div>

        <!-- ⚠️ Error -->
        <div v-else-if="error" class="flex flex-col items-center justify-center gap-4 py-20">
            <Icon name="lucide:triangle-alert" class="h-12 w-12 text-red-400/60" />
            <p class="text-sm text-white/60">Failed to load employee profile.</p>
            <UiButton color="#4aff7a" text="Retry" prepend-icon="ion:refresh" @click="loadEmployee" />
        </div>

        <!-- ✅ Profile -->
        <div v-else-if="employee" class="space-y-4">
            <EmployeeProfileHeader :employee="employee" @edit="openEditModal" @updated="loadEmployee" />
            <EmployeeContactInfo :employee="employee" />
            <EmployeeOrganizationInfo :employee="employee" />
            <ProfileTabs :active="activeTab" @change="setTab" />

            <div class="tab-content">
                <AboutTab v-if="activeTab === 'about'" :employee="employee" />
                <ProfileTab v-else-if="activeTab === 'profile'" :employee="employee" @updated="loadEmployee" />
                <JobTab v-else-if="activeTab === 'job'" :employee="employee" />
                <DocumentsTab v-else-if="activeTab === 'documents'" :employee="employee" />
            </div>
        </div>
    </div>

    <!-- ✏️ Edit Employee Modal -->
    <UiSidebarModal width="980px" v-model="editModal" :title="formTitle">
        <EmployeeForm />
        <template #footer>
            <UiButton @click="closeEditModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton :disabled="loading" @click="saveEmployee" color="#4aff7a" text="Save Employee"
                prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEmployeesStore } from '../../../../../stores/organization/employee.store'
import { useEmpCategoryStore } from '../../../../../stores/organization/empCategory.store'
import { useDesignationStore } from '../../../../../stores/organization/designation.store'
import { useDepartmentStore } from '../../../../../stores/organization/department.store'
import { useBranchStore } from '../../../../../stores/organization/branch.store'
import { useLocationStore } from '../../../../../stores/organization/location.store'
import { useProbationPolicyStore } from '../../../../../stores/organization/probationPolicy.store'

import EmployeeProfileHeader from '../../../../../components/employee/profile/EmployeeProfileHeader.vue'
import EmployeeContactInfo from '../../../../../components/employee/profile/EmployeeContactInfo.vue'
import EmployeeOrganizationInfo from '../../../../../components/employee/profile/EmployeeOrganizationInfo.vue'
import ProfileTabs from '../../../../../components/employee/profile/ProfileTabs.vue'
import AboutTab from '../../../../../components/employee/profile/AboutTab.vue'
import ProfileTab from '../../../../../components/employee/profile/ProfileTab.vue'
import JobTab from '../../../../../components/employee/profile/JobTab.vue'
import DocumentsTab from '../../../../../components/employee/profile/DocumentsTab.vue'
import EmployeeForm from '../../../../../components/employee/form.vue'
import { apiAddressToStore } from '../../../../../utils/employeeProfile'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const router = useRouter()

const employeesStore = useEmployeesStore()
const empCategoryStore = useEmpCategoryStore()
const designationStore = useDesignationStore()
const departmentStore = useDepartmentStore()
const branchStore = useBranchStore()
const locationStore = useLocationStore()

const {
    employee_id,
    first_name,
    last_name,
    email,
    phone,
    alt_phone,
    gender,
    type,
    is_active,
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
    employee_code,
    number_series_id,
    employee_department,
    manager_id,
    branch_id,
    location_id,
    profile_image,
    profile_image_file_id,
    cost_center_id,
    pay_grade_id,
    notice_period_policy_id,
    relationships,
} = storeToRefs(employeesStore)

const employee = ref(null)
const loading = ref(true)
const error = ref(null)
const editModal = ref(false)
const formTitle = ref('Update Employee')
const probationPolicyStore = useProbationPolicyStore()

const VALID_TABS = ['about', 'profile', 'job', 'documents']
const activeTab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'about')

const setTab = (tab) => {
    if (!VALID_TABS.includes(tab)) return
    activeTab.value = tab
    router.replace({ query: { ...route.query, tab } })
}

watch(() => route.query.tab, (tab) => {
    if (VALID_TABS.includes(tab)) activeTab.value = tab
})

const loadEmployee = async () => {
    loading.value = true
    error.value = null
    try {
        const data = await employeesStore.fetchEmployee(route.params.employee)
        employee.value = data?.employee || null
        if (!employee.value) error.value = new Error('Employee not found')
    } catch (err) {
        console.error('[Profile] Load employee failed:', err)
        error.value = err
    } finally {
        loading.value = false
    }
}

onMounted(loadEmployee)

/* ------------------------------------------------------------
 * Edit flow (reuses the same store-driven EmployeeForm used on
 * the employee list page)
 * ---------------------------------------------------------- */
function toInputDate(dateString) {
    if (!dateString) return ''
    const datePart = dateString.split(',')[0]
    const [day, month, year] = datePart.split('/')
    return `${year}-${month}-${day}`
}

const openEditModal = async () => {
    const emp = employee.value
    if (!emp) return
    await empCategoryStore.fetchAllEmployeeCategories()
    await designationStore.fetchDesignationList()
    await departmentStore.fetchAllDepartments()
    await employeesStore.fetchAllEmployees()
    await employeesStore.fetchNumberSeries()
    branchStore.organization_id = emp.organization_id
    await branchStore.fetchAllBranches()
    locationStore.organization_id = emp.organization_id
    await locationStore.fetchLocations()
    await probationPolicyStore.fetchPolicies()

    employee_id.value = emp.id
    first_name.value = emp.first_name
    last_name.value = emp.last_name
    email.value = emp.email
    phone.value = emp.phone
    alt_phone.value = emp.alt_phone
    type.value = emp.admin_of_organization ? 'ADMIN' : 'EMPLOYEE'
    is_active.value = emp.is_active !== undefined ? emp.is_active : true
    gender.value = emp.gender
    const mgr = employeesStore.all_employees.find(e => e.id === emp.manager_id)
    manager_id.value = mgr ? { value: mgr.id, label: `${mgr.full_name}${mgr.designation ? ' — ' + (mgr.designation.name || '') : ''}` } : null
    const br = branchStore.branch_select.find(b => b.value === emp.branch_id)
    branch_id.value = br || null
    const loc = (locationStore.locations || []).find(l => l.id === emp.location_id)
    location_id.value = loc ? { value: loc.id, label: loc.formatted_address || 'Location' } : null
    dateOfBirth.value = emp.date_of_birth ? new Date(emp.date_of_birth).toISOString().split('T')[0] : null
    joining_date.value = emp.joining_date ? new Date(emp.joining_date).toISOString().split('T')[0] : null
    employee_category.value = empCategoryStore.category_list.find(c => c.value == emp.category_id) ?? null
    employee_designation.value = designationStore.designation_list.find(d => d.value == emp.designation_id) ?? null
    const pol = (probationPolicyStore.policies || []).find(p => p.id === emp.probation_policy_id)
    probation_policy_id.value = pol ? { value: pol.id, label: pol.name } : null
    probation_start_date.value = toInputDate(emp.probation_start_date) || (emp.probation?.start_date ? toInputDate(emp.probation.start_date) : null)
    probation_end_date.value = toInputDate(emp.probation_end_date) || (emp.probation?.end_date ? toInputDate(emp.probation.end_date) : null)
    is_permanent.value = emp.is_permanent ?? false
    employeesStore.worker_type = emp.worker_type || (emp.is_permanent ? 'PERMANENT' : 'FULL_TIME')
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
    editModal.value = true
}

const closeEditModal = () => {
    editModal.value = false
    formTitle.value = null
    first_name.value = null
    last_name.value = null
    email.value = null
    phone.value = null
    alt_phone.value = null
    gender.value = null
    is_active.value = true
    dateOfBirth.value = null
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
    employee_id.value = null
    employeesStore.series_preset_id = null
    profile_image.value = null
    profile_image_file_id.value = null
    cost_center_id.value = null
    pay_grade_id.value = null
    notice_period_policy_id.value = null
    relationships.value = []
}

const saveEmployee = async () => {
    loading.value = true
    try {
        await employeesStore.saveEmployee()
        closeEditModal()
        await loadEmployee()
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.tab-content {
    animation: fade-in .2s ease;
}

@keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

.skeleton-banner {
    height: 180px;
    border-radius: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.16), rgba(255,255,255,.08));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-strip {
    height: 88px;
    border-radius: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.16), rgba(255,255,255,.08));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

@keyframes shimmer {
    to { background-position: -200% 0; }
}
</style>