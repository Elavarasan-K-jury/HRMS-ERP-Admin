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
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Designation Level">
                Category Code:
            </label>
            <FormInput disabled class="w-full" v-model="code" prepend-icon="lucide:git-fork" color="#fff" size="lg"
                rounded="lg" placeholder="Category Code" />
        </div>
        <div class="col-span-6 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Designation Level">
                ID Prefix:
            </label>
            <FormInput class="w-full" v-model="id_prefix" prepend-icon="heroicons:hashtag" color="#fff" size="lg"
                rounded="lg" placeholder="ID Prefix" />
        </div>
        <div class="col-span-12 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Department Code">Description: (Optional)</label>
            <FormTextArea v-model="description" placeholder="Write a description..." color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-center justify-evenly">
            <label class="text-md text-white/80" for="Designation Level">
                Permanent:
            </label>
            <UiSwitch v-model="is_permanent" color="#fff" />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-center justify-evenly">
            <label class="text-md text-white/80" for="Designation Level">
                Active:
            </label>
            <UiSwitch v-model="is_active" color="#fff" />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-center justify-evenly">
            <label class="text-md text-white/80" for="Designation Level">
                Benefits Applicable:
            </label>
            <UiSwitch v-model="benefits_applicable" color="#fff" />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-center justify-evenly">
            <label class="text-md text-white/80" for="Designation Level">
                Training Required:
            </label>
            <UiSwitch v-model="training_required" color="#fff" />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-center justify-evenly">
            <label class="text-md text-white/80" for="Designation Level">
                Probation Required:
            </label>
            <UiSwitch v-model="probation_required" color="#fff" />
        </div>
        <div class="col-span-2 w-full flex gap-1 flex-col items-center justify-evenly">
            <label class="text-md text-white/80" for="Designation Level">
                Notice Required:
            </label>
            <UiSwitch v-model="notice_required" color="#fff" />
        </div>
        <div v-if="training_required" class="col-span-4 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Designation Level">
                Training Months:
            </label>
            <FormInput class="w-full" v-model="training_months" prepend-icon="heroicons:calendar-days" color="#fff"
                size="lg" rounded="lg" placeholder="Training Months" />
        </div>
        <div v-if="probation_required" class="col-span-4 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Designation Level">
                Probation Months:
            </label>
            <FormInput class="w-full" v-model="probation_months" prepend-icon="heroicons:calendar-days" color="#fff"
                size="lg" rounded="lg" placeholder="Probation Months" />
        </div>
        <div v-if="notice_required" class="col-span-4 w-full flex gap-1 flex-col items-start">
            <label class="text-md text-white/80" for="Designation Level">
                Notice Months:
            </label>
            <FormInput class="w-full" v-model="notice_months" prepend-icon="heroicons:calendar-days" color="#fff"
                size="lg" rounded="lg" placeholder="Notice Months" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useEmpCategoryStore } from '../../stores/empCategory.store'
import { useAuthStore } from '../../stores/auth.store'
import { storeToRefs } from 'pinia';
const empCategoryStore = useEmpCategoryStore();
const authStore = useAuthStore();

const {
    name,
    code,
    description,
    id_prefix,
    is_permanent,
    benefits_applicable,
    is_active,
    training_required,
    training_months,
    probation_required,
    probation_months,
    notice_required,
    notice_months,
} = storeToRefs(empCategoryStore);

watch(name, () => {
    if (name.value) {
        code.value = name.value.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    } else {
        code.value = '';
    }
}, { deep: true });

const loading = ref(false);

onMounted(async () => {
    loading.value = true
    empCategoryStore.organization_id = authStore.organization
    setTimeout(() => {
        loading.value = false
    }, 1000);
});
</script>