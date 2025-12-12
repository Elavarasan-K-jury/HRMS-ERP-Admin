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
            @refresh="fetchDepartments" @salary="openSalaryPreview" @view="view" @edit="editEmployee"
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
import { useEmpCategoryStore } from '../../../../stores/empCategory.store';
import { useEmployeesStore } from '../../../../stores/employee.store';
import { useDesignationStore } from '../../../../stores/designation.store';
import { useDepartmentStore } from '../../../../stores/department.store';
import { useAuthStore } from '../../../../stores/auth.store';
import DataTable from '../../../../components/employee/dataTable.vue';
import DetailedView from '../../../../components/employee/detailedView.vue';
import EmployeeForm from '../../../../components/employee/form.vue';
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

const openSalaryPreview = (data) => {
    router.push(`/organization/${data.organization_id}/employee/${data.id}/finance/salary`)
}

const {
    loading,
    error,
    page,
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
    employee_category,
    employee_designation,
    employee_department,
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
    formTitle.value = 'Update Employee'
    employee_id.value = emp.id
    first_name.value = emp.first_name
    last_name.value = emp.last_name
    email.value = emp.email
    phone.value = emp.phone
    alt_phone.value = emp.alt_phone
    gender.value = emp.gender
    dateOfBirth.value = emp.date_of_birth
    employee_category.value = empCategories.value.find(c => c.value == emp.category_id) ?? null
    employee_designation.value = designations.value.find(d => d.value == emp.designation_id) ?? null
    employee_department.value = emp.departments.length ? await Promise.all(emp.departments.map(async (d) => {
        return {
            id: d.id,
            department: d.department_id == '' ? null : d.department_id,
            reporting_to: d.reporting_to == '' ? null : d.reporting_to,
            start_date: toInputDate(d.start_date),
            end_date: toInputDate(d.end_date),
            employees_list: []
        }
    })) : [
        {
            id: null,
            department: null,
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
    employee_category.value = null
    employee_designation.value = null
    employee_department.value = [
        {
            id: null,
            department: null,
            reporting_to: null,
            start_date: null,
            end_date: null,
            employees_list: []
        }
    ]
    employee_id.value = null
    addUpdateModal.value = false
}

const saveEmployee = async () => {
    await employeesStore.saveEmployee()
    closeModal()
}

const fetchEmployees = async () => {
    await employeesStore.fetchEmployees()
}

onMounted(async () => {
    if (authStore.organization) {
        organization_id.value = authStore.organization
        empCategoryStore.organization_id = authStore.organization
    }
    await fetchEmployees()
    await empCategoryStore.fetchAllEmployeeCategories()
});
</script>