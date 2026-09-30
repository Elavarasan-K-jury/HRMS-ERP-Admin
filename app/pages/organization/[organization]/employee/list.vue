<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Employees<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <FormSelect color="#fff" prepend-icon="heroicons:adjustments-vertical" v-model="selectedCategory"
                    :options="empCategories" searchable size="md" rounded="full" placeholder="Category" />
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="openAddModal" color="#4aff7a" text="Add Employee" prepend-icon="ion:add-circle" />
                <UiButton @click="fetchEmployees" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <DataTable :items="employees" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            :limit="limit" @limit-change="changeLimit" @refresh="fetchEmployees" @view="view" @edit="editEmployee"
            @delete="deleteEmployee" />
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
    <DetailedView v-model="preview" :id="emp_id" />
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Employee" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { useEmpCategoryStore } from '../../../../stores/organization/empCategory.store';
import { useEmployeesStore } from '../../../../stores/organization/employee.store';
import { useDesignationStore } from '../../../../stores/organization/designation.store';
import { useDepartmentStore } from '../../../../stores/organization/department.store';
import { useBranchStore } from '../../../../stores/organization/branch.store';
import { useLocationStore } from '../../../../stores/organization/location.store';
import { useProbationPolicyStore } from '../../../../stores/organization/probationPolicy.store';
import { useAuthStore } from '../../../../stores/shared/auth.store';
import DataTable from '../../../../components/employee/dataTable.vue';
import DetailedView from '../../../../components/employee/detailedView.vue';
import EmployeeForm from '../../../../components/employee/form.vue';
import { apiAddressToStore } from '../../../../utils/employeeProfile';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
definePageMeta({
    layout: 'organization',
});

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

const empCategories = computed(() => empCategoryStore.category_list)
const designations = computed(() => designationStore.designation_list)
const departments = computed(() => departmentStore.department_select)
const selectedCategory = ref(null)

const employees = computed(() => employeesStore.employees)
const total = computed(() => employeesStore.total)

const addUpdateModal = ref(false)
const formTitle = ref(null)

const view = (emp) => {
    router.push({ query: { employee_id: emp.id, preview: true } })
}

const {
    loading,
    error,
    page,
    type,
    limit,
    totalPages,
    search,
    category_id,
    employee_id,
    organization_id,
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
    is_active,
    employee_category,
    employee_designation,
    probation_policy_id,
    is_permanent,
    employee_department,
    manager_id,
    branch_id,
    location_id,
    number_series_id,
    employee_code,
    profile_image,
    profile_image_file_id,
    cost_center_id,
    pay_grade_id,
    notice_period_policy_id,
    relationships,
} = storeToRefs(employeesStore)

watch(selectedCategory, async () => {
    if (selectedCategory.value) {
        category_id.value = selectedCategory.value
        await fetchEmployees()
    } else {
        category_id.value = null
        await fetchEmployees()
    }
})

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
    relationships.value = []
    formTitle.value = 'Add New Employee'
    addUpdateModal.value = true
}

function toInputDate(dateString) {
    if (!dateString) return '';

    // Extract "20/11/2025" from "20/11/2025, 05:30 AM"
    const datePart = dateString.split(',')[0];
    const [day, month, year] = datePart.split('/');

    return `${year}-${month}-${day}`;
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
    employee_category.value = empCategories.value.find(c => c.value == emp.category_id) ?? null
    employee_designation.value = designations.value.find(d => d.value == emp.designation_id) ?? null
    probation_policy_id.value = emp.probation_policy_id || null
    const pol = (probationPolicyStore.policies || []).find(p => p.id === emp.probation_policy_id)
    if (pol) probation_policy_id.value = { value: pol.id, label: pol.name }
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
    is_active.value = true
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

const changeLimit = (val) => {
    limit.value = Number(val)
    page.value = 1
    fetchEmployees()
}

onMounted(async () => {
    if (authStore.organization) {
        organization_id.value = authStore.organization
        empCategoryStore.organization_id = authStore.organization
    }
    await fetchEmployees()
    await empCategoryStore.fetchAllEmployeeCategories()
    branchStore.organization_id = organization_id.value
    await branchStore.fetchAllBranches()
    locationStore.organization_id = organization_id.value
    await locationStore.fetchLocations()
});
</script>