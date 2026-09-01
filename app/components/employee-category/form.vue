<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>
    <div v-if="!loading" class="grid grid-cols-12 gap-2">
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Name">
                Category Name:
            </label>
            <FormInput class="w-full" v-model="name" prepend-icon="lucide:git-fork" color="#fff" size="lg" rounded="lg"
                placeholder="Category Name" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">Description: (Optional)</label>
            <FormTextArea v-model="description" placeholder="Write a description..." color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Employment Type">Employment Type</label>
            <FormSelect class="w-full" color="#fff" size="lg" rounded="lg" v-model="employment_type"
                :options="employmentTypeOptions" placeholder="Select employment type" />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-center justify-evenly">
            <label class="text-md text-white/80" for="Designation Level">
                Active:
            </label>
            <UiSwitch v-model="is_active" color="#fff" />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useEmpCategoryStore } from '../../stores/empCategory.store';
import { useAuthStore } from '../../stores/auth.store';
import { storeToRefs } from 'pinia';

const props = defineProps({
    show: { type: Boolean, default: false },
})

const empCategoryStore = useEmpCategoryStore();
const authStore = useAuthStore();

const loading = ref(false);

const employmentTypeOptions = [
    { value: 'PROBATION', label: 'Probation' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'TRAINEE', label: 'Trainee' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'PERMANENT', label: 'Permanent' },
]

const {
    name,
    description,
    is_active,
    employment_type,
    empCategoryId,
} = storeToRefs(empCategoryStore);

onMounted(async () => {
    loading.value = true
    empCategoryStore.organization_id = authStore.organization
    setTimeout(() => {
        loading.value = false
    }, 1000);
});

const saveCategory = async () => {
    loading.value = true
    try {
        if (!name.value || !name.value.trim()) {
            return
        }
        const { $api } = useNuxtApp()
        if (empCategoryId.value) {
            await $api.put(`/employee-categories/${empCategoryId.value}`, {
                name: name.value.trim(),
                description: description.value,
                is_active: is_active.value,
                employment_type: employment_type.value,
            })
        } else {
            await $api.post('/employee-categories', {
                organization_id: empCategoryStore.organization_id,
                name: name.value.trim(),
                description: description.value,
                is_active: is_active.value,
                employment_type: employment_type.value,
            })
        }
    } catch (err) {
        console.error('Failed to save category:', err)
    } finally {
        loading.value = false
    }
}

const closeForm = () => {
    name.value = null
    description.value = null
    is_active.value = true
    employment_type.value = 'PROBATION'
    empCategoryId.value = null
}

watch(() => props.show, (val) => {
    if (!val) {
        closeForm()
    }
})
</script>