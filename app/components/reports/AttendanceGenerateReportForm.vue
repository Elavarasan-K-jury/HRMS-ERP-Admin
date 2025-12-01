<template>
    <div v-if="loader" class="h-full w-full flex items-center justify-center">
        <UiLoader />
    </div>
    <div v-else class="space-y-4">
        <!-- Department -->
        <div class="flex flex-col gap-2 items-start">
            <label>Select Department (Optional)</label>
            <FormSelect color="#fff" label="Department" placeholder="Select Department" v-model="store.department_id"
                :options="departments" />
        </div>

        <!-- Designation -->
        <div class="flex flex-col gap-2 items-start">
            <label>Select Designation (Optional)</label>
            <FormSelect color="#fff" label="Designation" placeholder="Select Designation" v-model="store.designation_id"
                :options="designations" />
        </div>

        <!-- Employee -->
        <div class="flex flex-col gap-2 items-start">
            <label>Select Employee (Optional)</label>
            <FormSelect color="#fff" label="Employee" placeholder="Select Employee" v-model="store.employee_id"
                :options="employees" />
        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-2 items-start">
                <label>Select Start Date (Optional)</label>
                <FormInput color="#fff" label="Start Date" type="date" v-model="store.start_date" />
            </div>
            <div class="flex flex-col gap-2 items-start">
                <label>Select End Date (Optional)</label>
                <FormInput color="#fff" label="End Date" type="date" v-model="store.end_date" />
            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import { useAttendanceReportsStore } from "../../stores/attendanceReport.store"
import { useDepartmentStore } from "../../stores/department.store"
import { useDesignationStore } from "../../stores/designation.store"
import { useEmployeesStore } from "../../stores/employee.store"
import { useAuthStore } from "../../stores/auth.store";

const store = useAttendanceReportsStore()
const departmentStore = useDepartmentStore()
const designationStore = useDesignationStore()
const employeeStore = useEmployeesStore()
const authStore = useAuthStore()

const loadDepartments = async () => {
    await departmentStore.fetchAllDepartments();
};

const loadDesignations = async () => {
    await designationStore.fetchDesignationList();
};

const loadEmployees = async () => {
    await employeeStore.fetchAllEmployees();
};

// Sample options — replace these with APIs if needed
const departments = computed(() => departmentStore.department_select)
const designations = computed(() => designationStore.designation_list)
const employees = computed(() => employeeStore.all_employees.map(e => ({
    value: e.id,
    label: e.full_name
})))

const loader = ref(false)
onMounted(async () => {
    loader.value = true
    departmentStore.organization_id = authStore.organization
    await loadDepartments()
    designationStore.organization_id = authStore.organization
    await loadDesignations()
    employeeStore.organization_id = authStore.organization
    await loadEmployees()
    setTimeout(() => {
        loader.value = false
    }, 1000)
});
</script>
