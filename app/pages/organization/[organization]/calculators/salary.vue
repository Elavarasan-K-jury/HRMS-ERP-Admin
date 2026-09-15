<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-hidden">

        <div class="h-full">
            <div v-if="loading" class="h-full flex items-center justify-center">
                <UiLoader />
            </div>

            <div v-else class="grid grid-cols-12 gap-2 h-full">

                <!-- LEFT: INPUT PANEL -->
                <div class="col-span-4 h-full sticky top-0 rounded-lg bg-white/10 border border-white/20 p-2 space-y-5">
                    <div>
                        <h2 class="text-lg font-semibold text-white">
                            Salary Calculator
                        </h2>
                        <p class="text-sm text-white/60 mt-1">
                            Select template and enter gross salary to preview breakdown
                        </p>
                    </div>

                    <!-- TEMPLATE -->
                    <div class="space-y-1">
                        <label class="text-sm text-white/80">
                            Salary Template
                        </label>
                        <FormSelect class="w-full" color="#fff" prepend-icon="bx:bx-layer" v-model="template"
                            :options="templates" searchable size="md" rounded="lg" placeholder="Select template" />
                    </div>

                    <!-- GROSS SALARY -->
                    <div class="space-y-1">
                        <label class="text-sm text-white/80">
                            Gross Annual Salary
                        </label>
                        <FormInput v-model="grossAmount" class="w-full" prepend-icon="bx:rupee" color="#fff" size="md"
                            rounded="lg" placeholder="Enter gross salary" />
                    </div>

                    <!-- HINT / INFO -->
                    <div class="rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-white/70">
                        💡 Salary structure will auto-calculate as you type.
                    </div>
                </div>

                <!-- RIGHT: PREVIEW -->
                <div class="col-span-8 h-full rounded-lg overflow-y-auto">

                    <!-- EMPTY STATE -->
                    <div v-if="!salaryCalculated && !salloading"
                        class="h-full flex flex-col items-center justify-center text-center text-white/60">
                        <div class="text-4xl mb-2">🧮</div>
                        <p class="text-lg font-medium">Preview Salary Breakdown</p>
                        <p class="text-sm mt-1">
                            Select a template and enter gross salary to see details
                        </p>
                    </div>

                    <!-- LOADING -->
                    <div v-else-if="salloading" class="h-full flex items-center justify-center">
                        <UiLoader />
                    </div>

                    <!-- PREVIEW -->
                    <div v-else class="animate-fade-in">
                        <SalaryPreview :data="salaryCalculated" copyAvailable />
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue';
import { useSalaryTemplateStore } from '../../../../stores/organization/salaryTemplate.store';
import { useSalaryStore } from '../../../../stores/employee/salary.store';
import SalaryPreview from '../../../../components/employee/salary/SalaryPreview.vue';
import { storeToRefs } from 'pinia';
const salaryTemplateStore = useSalaryTemplateStore()
const salaryStore = useSalaryStore()
const loading = ref(true)
const salloading = ref(true)

const {
    template,
    grossAmount,
    salaryCalculated
} = storeToRefs(salaryStore)

definePageMeta({
    layout: 'organization',
});

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