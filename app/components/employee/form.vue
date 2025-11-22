<template>
    <div class="w-full h-full flex items-center justify-center" v-if="loader">
        <Loader />
    </div>
    <div v-else class="grid grid-cols-12 gap-2">
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Employee Details
        </span>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                First Name:
            </p>
            <FormInput v-model="first_name" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md" rounded="lg"
                placeholder="First Name" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Last Name:
            </p>
            <FormInput v-model="last_name" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md" rounded="lg"
                placeholder="Last Name" />
        </div>
        <div class="col-span-12 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Email ID:
            </p>
            <FormInput v-model="email" class="w-full" prepend-icon="heroicons:envelope" color="#fff" size="md"
                rounded="lg" placeholder="Email ID" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Phone Number:
            </p>
            <FormInput v-model="phone" class="w-full" prepend-icon="heroicons:phone" color="#fff" size="md" rounded="lg"
                placeholder="Phone Number" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Alternate Phone Number:
            </p>
            <FormInput v-model="alt_phone" class="w-full" prepend-icon="heroicons:phone" color="#fff" size="md"
                rounded="lg" placeholder="Alternate Phone Number" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Gender:
            </p>
            <FormSelect id="gender" class="w-full" color="#fff" prepend-icon="bx:bx-user" v-model="gender"
                :options="['MALE', 'FEMALE', 'OTHER']" searchable size="md" rounded="lg" placeholder="Gender" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Date of Birth:
            </p>
            <FormInput v-model="dateOfBirth" type="date" class="w-full" prepend-icon="bx:bx-calendar" color="#fff"
                size="md" rounded="lg" placeholder="Date of Birth" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Employee Category:
            </p>
            <FormSelect id="emp_category" class="w-full" color="#fff" prepend-icon="bx:bx-buildings"
                v-model="employee_category" :options="empCategories" searchable size="md" rounded="lg"
                placeholder="Employee Category" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Designation:
            </p>
            <FormSelect id="designation" class="w-full" color="#fff" prepend-icon="bx:bx-buildings"
                v-model="employee_designation" :options="designations" searchable size="md" rounded="lg"
                placeholder="Designation" />
        </div>
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Department Details
        </span>
        <div class="col-span-12">
            <div
                class="grid p-2 rounded-lg grid-cols-12 gap-2 bg-white/10 border border-white backdrop-blur-xl shadow-lg">
                <template v-for="(department, index) in employee_department" @key="index">
                    <!-- <pre>{{ departments }}</pre> -->
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80" for="Department Name">
                            Department:
                        </label>
                        <FormSelect @select="getEmployeeListFOrDepartment(index)" id="department" class="w-full"
                            color="#fff" prepend-icon="ion:git-branch-outline" v-model="department.department"
                            :options="departments" searchable size="md" rounded="lg" placeholder="Department" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80" for="Department Code">
                            Reporting To:
                        </label>
                        <FormSelect id="reporting_to" class="w-full" color="#fff" prepend-icon="lucide:user"
                            v-model="department.reporting_to" :options="department.employees_list" searchable size="md"
                            rounded="lg" placeholder="Reporting To" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <p class="text-md text-white/80" for="Department Name">
                            Start Date:
                        </p>
                        <FormInput v-model="department.start_date" type="date" class="w-full"
                            prepend-icon="bx:bx-calendar" color="#fff" size="md" rounded="lg"
                            placeholder="Start Date" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <p class="text-md text-white/80" for="Department Name">
                            End Date:
                        </p>
                        <FormInput v-model="department.end_date" type="date" class="w-full"
                            prepend-icon="bx:bx-calendar" color="#fff" size="md" rounded="lg" placeholder="End Date" />
                    </div>
                    <div class="col-span-12 flex flex-row justify-end items-center">
                        <span v-if="employee_department.length > 1" @click="employeesStore.removeDepartment(index)"
                            class="text-red-500 cursor-pointer rounded-lg font-bold hover:underline px-3 py-1 hover:bg-white/10">Remove</span>
                        <span @click="employeesStore.addNewDepartment()"
                            class="text-green-500 cursor-pointer rounded-lg font-bold hover:underline px-3 py-1 hover:bg-white/10">
                            Add Another
                        </span>
                    </div>
                    <div v-if="index !== employee_department.length - 1 && employee_department.length > 1"
                        class="col-span-12 h-[1px] bg-white/70"></div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useEmpCategoryStore } from '../../stores/empCategory.store';
import { useDesignationStore } from '../../stores/designation.store';
import { useDepartmentStore } from '../../stores/department.store';
import { useEmployeesStore } from '../../stores/employee.store';
import Loader from '../ui/loader.vue'
import { storeToRefs } from 'pinia';
const empCategoryStore = useEmpCategoryStore()
const designationStore = useDesignationStore()
const employeesStore = useEmployeesStore()
const departmentStore = useDepartmentStore()

const loader = ref(false)

const {
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

const organization_id = computed(() => employeesStore.organization_id)
const empCategories = computed(() => empCategoryStore.category_list)
const designations = computed(() => designationStore.designation_list)

// FIXED: Now properly compares department values instead of object references
const departments = computed(() => {
    // Get all currently selected department values
    const selectedDepartmentValues = employee_department.value
        .map(d => d.department?.value)
        .filter(Boolean) // Remove null/undefined values

    return departmentStore.department_select.map(e => ({
        value: e.value,
        label: e.label,
        // Check if this department's value exists in the selected departments
        disabled: selectedDepartmentValues.includes(e.value)
    }))
})

const getEmployeeListFOrDepartment = async (index) => {
    const department = employee_department.value[index]
    const data = await departmentStore.fetchDepartmentEmployees(organization_id.value, department.department.value)
    employee_department.value[index].employees_list = data.employees.map(e => ({
        value: e.id,
        label: `${e.full_name} ${e.isHead ? '(Head)' : ''}`
    }))
    if (department.reporting_to) {
        employee_department.value[index].reporting_to = employee_department.value[index].employees_list.find(e => e.value == department.reporting_to)
    }
}

onMounted(async () => {
    loader.value = true
    await empCategoryStore.fetchAllEmployeeCategories()
    await designationStore.fetchDesignationList()
    await departmentStore.fetchAllDepartments()
    if (employee_department.value.length > 0) {
        employee_department.value.forEach(async (d, index) => {
            console.log('form.vue @ Line 195:', d);
            console.log('form.vue @ Line 196:', departments.value);
            const foundDept = departments.value.find(dept => dept.value == d.department)
            console.log('form.vue @ Line 199:', foundDept);
            if (foundDept) {
                employee_department.value[index].department = foundDept
            }
            await getEmployeeListFOrDepartment(index)
        })
    }
    setTimeout(() => {
        loader.value = false
    }, 1000)
});
</script>