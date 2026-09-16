<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>
    <div v-if="!loading" class="grid grid-cols-12 gap-2">
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Designation Details
        </span>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Name">
                Designation Name:
            </label>
            <FormInput class="w-full" v-model="name" prepend-icon="lucide:git-fork" color="#fff" size="lg" rounded="lg"
                placeholder="Designation Name" />
        </div>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Designation Level">
                Designation Level:
            </label>
            <FormSelect id="designation_level" class="w-full" color="#fff" prepend-icon="ion:git-branch-outline"
                v-model="designation_level" :options="designations" searchable size="lg" rounded="lg"
                placeholder="Designation Level" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">
                Department: (Optional)
            </label>
            <FormSelect id="departent_head" class="w-full" color="#fff" prepend-icon="lucide:user"
                v-model="department_id" :options="departments" searchable size="lg" rounded="lg"
                placeholder="Department" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">Description: (Optional)</label>
            <FormTextArea v-model="description" placeholder="Write a description..." color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import designations from '../../constants/designations';
import { useDepartmentStore } from '../../stores/organization/department.store'
import { useDesignationStore } from '../../stores/organization/designation.store'
import { useAuthStore } from '../../stores/shared/auth.store'
import { storeToRefs } from 'pinia';
const departmentStore = useDepartmentStore();
const designationStore = useDesignationStore();
const authStore = useAuthStore();

const {
    name,
    designation_level,
    description,
    department_id,
} = storeToRefs(designationStore);

const loading = ref(false);


const departments = computed(() => departmentStore.department_select);

onMounted(async () => {
    loading.value = true
    departmentStore.organization_id = authStore.organization
    await departmentStore.fetchAllDepartments();
    setTimeout(() => {
        loading.value = false
    }, 1000);
});
</script>