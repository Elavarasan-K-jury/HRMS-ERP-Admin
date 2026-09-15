<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>
    <div v-if="!loading" class="grid grid-cols-12 gap-2">
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Department Details
        </span>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Name">
                Department Name:
            </label>
            <FormInput class="w-full" v-model="name" prepend-icon="lucide:git-branch" color="#fff" size="lg"
                rounded="lg" placeholder="Department Name" />
        </div>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">
                Department Code:
            </label>
            <FormInput class="w-full" v-model="code" :disabled="true" prepend-icon="lucide:code" color="#fff" size="lg"
                rounded="lg" placeholder="Department Code" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Parent Department">
                Parent Department: (Optional)
            </label>
            <FormSelect id="parent_department" class="w-full" color="#fff" prepend-icon="lucide:git-merge"
                v-model="parent_id" :options="parentDeptOptions" searchable size="lg" rounded="lg"
                placeholder="Select Parent Department" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">
                Department Head:
            </label>
            <FormSelect id="departent_head" class="w-full" color="#fff" prepend-icon="lucide:user"
                v-model="department_head_id" :options="employees" searchable size="lg" rounded="lg"
                placeholder="Department Head" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">Description: (Optional)</label>
            <FormTextArea v-model="description" placeholder="Write a description..." color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">Note: (Optional)</label>
            <FormTextArea v-model="note" placeholder="Write a Note..." color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useEmployeesStore } from '../../stores/organization/employee.store'
import { useDepartmentStore } from '../../stores/organization/department.store'
import { useAuthStore } from '../../stores/shared/auth.store'
import { storeToRefs } from 'pinia';
const employeeStore = useEmployeesStore();
const departmentStore = useDepartmentStore();
const authStore = useAuthStore();

const {
    name,
    code,
    description,
    note,
    department_head_id,
    parent_id,
} = storeToRefs(departmentStore);

const loading = ref(false);

const parentDeptOptions = computed(() => {
    const currentId = departmentStore.department_id
    return departmentStore.department_select
        .filter(d => d.value !== currentId)
        .map(d => ({ value: d.value, label: d.label }))
})

const employees = computed(() => employeeStore.all_employees.map(e => ({
    value: e.id,
    label: e.full_name
})));

watch(name, () => {
    if (name.value) {
        code.value = name.value.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    } else {
        code.value = '';
    }
}, { deep: true });

onMounted(async () => {
    loading.value = true
    employeeStore.organization_id = authStore.organization
    departmentStore.organization_id = authStore.organization
    await departmentStore.fetchAllDepartments()
    await employeeStore.fetchAllEmployees();
    if (department_head_id.value) {
        department_head_id.value = employees.value.find(e => e.value == department_head_id.value)
    }
    if (parent_id.value) {
        const found = departmentStore.department_select.find(d => d.value === parent_id.value)
        if (found) parent_id.value = found
    }
    setTimeout(() => {
        loading.value = false
    }, 1000);
});
</script>