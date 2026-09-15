<template>
    <div v-if="loading" class="flex items-center justify-center w-full h-full">
        <UiLoader />
    </div>
    <div v-else class="grid grid-cols-12 gap-2">
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80">
                Salary Template:
            </p>
            <FormSelect class="w-full" color="#fff" prepend-icon="bx:bx-user" v-model="template" :options="templates"
                searchable size="md" rounded="lg" placeholder="Salary Template" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80">
                Gross Salary:
            </p>
            <FormInput v-model="grossAmount" class="w-full" prepend-icon="bx:rupee" color="#fff" size="md" rounded="lg"
                placeholder="Gross Salary" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80">
                Effective From:
            </p>
            <FormInput v-model="effectiveFrom" class="w-full" prepend-icon="bx:calendar" color="#fff" size="md"
                rounded="lg" type="date" placeholder="Effective Date" />
        </div>
        <div class="col-span-4 w-full flex flex-col items-start">
            <p class="text-md text-white/80">
                Status:
            </p>
            <FormSelect class="w-full" color="#fff" prepend-icon="bx:bx-user" v-model="status" :options="statusOptions"
                searchable size="md" rounded="lg" placeholder="Status" />
        </div>
        <div class="col-span-2 w-full flex flex-col items-end justify-center">
            <p class="text-md text-white/80">
                Is Current:
            </p>
            <UiSwitch v-model="isCurrentActive" />
        </div>
        <!-- <div class="col-span-3 w-full flex flex-col items-end justify-center">
            <p class="text-md text-white/80">
                Deduct In-Hand:
            </p>
            <UiSwitch v-model="deductFromInHand" />
        </div> -->
        <div v-if="salloading && salaryCalculated"
            class="col-span-12 h-[300px] bg-white/10 rounded-lg border border-white/30 flex justify-center items-center">
            <UiLoader />
        </div>
        <div v-else-if="salaryCalculated" class="col-span-12">
            <SalaryPreview :data="salaryCalculated" />
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useSalaryTemplateStore } from '../../../stores/organization/salaryTemplate.store';
import { useSalaryStore } from '../../../stores/employee/salary.store';
import SalaryPreview from './SalaryPreview.vue';
import { storeToRefs } from 'pinia';
const salaryTemplateStore = useSalaryTemplateStore()
const salaryStore = useSalaryStore()
const loading = ref(true)
const salloading = ref(true)

const {
    template,
    grossAmount,
    effectiveFrom,
    status,
    statusOptions,
    isCurrentActive,
    // deductFromInHand,
    salaryCalculated
} = storeToRefs(salaryStore)

const templates = computed(() => salaryTemplateStore.templatesSelect)

const fetchSalaryTemplates = async () => {
    loading.value = true
    await salaryTemplateStore.fetchTemplatesForSelect()
    setTimeout(() => {
        loading.value = false
        salloading.value = false
    }, 1000);
}

const previewSalary = async () => {
    salloading.value = true
    await salaryStore.previewSalaryStructure()
    setTimeout(() => {
        salloading.value = false
    }, 1000);
};

const editTimer = ref(null)

watch(
    [template, grossAmount],
    ([newTemplate, newGross]) => {
        const hasTemplate = newTemplate !== null && newTemplate !== undefined && newTemplate !== "";
        const hasGross =
            newGross !== null &&
            newGross !== undefined &&
            Number(newGross) !== 0;

        if (hasTemplate && hasGross) {
            clearTimeout(editTimer.value)
            editTimer.value = setTimeout(() => {
                previewSalary();
            }, 300);
        }
    }
);

onMounted(async () => {
    await fetchSalaryTemplates()
});
</script>