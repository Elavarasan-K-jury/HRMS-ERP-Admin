<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>

    <div v-if="!loading" class="grid grid-cols-12 gap-2">

        <!-- NAME -->
        <div class="col-span-12 flex flex-col gap-1">
            <label class="text-md text-white/80">Salary Component Name:</label>
            <FormInput v-model="form.name" prepend-icon="lucide:badge-percent" color="#fff" size="lg" rounded="lg"
                placeholder="Enter Salary Structure Name" />
        </div>

        <div class="col-span-6 flex flex-col gap-1">
            <label class="text-md text-white/80">Salary Component Type:</label>
            <FormSelect :disabled="form.isDefault" class="w-full" color="#fff" v-model="form.type" :options="types"
                searchable size="md" rounded="lg" placeholder="Type" />
        </div>

        <div class="col-span-6 flex flex-col gap-1">
            <label class="text-md text-white/80">Salary Component Category:</label>
            <FormSelect :disabled="form.isDefault || !componentId" class="w-full" color="#fff" v-model="form.category"
                :options="categories" searchable size="md" rounded="lg" placeholder="Category" />
        </div>

        <div class="col-span-12 flex flex-col gap-1">
            <label class="text-md text-white/80">Salary Component Formula:</label>
            <FormFormulaBuilder :disabled="form.isDefault" v-model="form.defaultFormula" :components="components" />
        </div>

        <div class="col-span-12 flex flex-col gap-1">
            <label class="text-md text-white/80">Description:</label>
            <FormTextArea :disabled="form.isDefault" v-model="form.description" />
        </div>
        <!-- ACTIVE SWITCH -->
        <div class="col-span-4 w-full items-center justify-between flex flex-row gap-1">
            <label class="text-md text-white/80">Taxable:</label>
            <UiSwitch :disabled="form.isDefault" v-model="form.isTaxable" color="#4aff7a" />
        </div>
        <div class="col-span-4 w-full items-center justify-between flex flex-row gap-1">
            <label class="text-md text-white/80">Is Variable:</label>
            <UiSwitch :disabled="form.isDefault" v-model="form.isVariable" color="#4aff7a" />
        </div>
        <div class="col-span-4 w-full items-center justify-between flex flex-row gap-1">
            <label class="text-md text-white/80">Statutory:</label>
            <UiSwitch :disabled="form.isDefault" v-model="form.isStatutory" color="#4aff7a" />
        </div>
        <div class="col-span-4 w-full items-center justify-between flex flex-row gap-1">
            <label class="text-md text-white/80">Include In CTC:</label>
            <UiSwitch :disabled="form.isDefault" v-model="form.includeInCTC" color="#4aff7a" />
        </div>
        <div class="col-span-4 w-full items-center justify-between flex flex-row gap-1">
            <label class="text-md text-white/80">Include In Gross:</label>
            <UiSwitch :disabled="form.isDefault" v-model="form.includeInGross" color="#4aff7a" />
        </div>
        <div class="col-span-4 w-full items-center justify-between flex flex-row gap-1">
            <label class="text-md text-white/80">Active:</label>
            <UiSwitch :disabled="form.isDefault" v-model="form.isActive" color="#4aff7a" />
        </div>

        <div class="col-span-12 flex flex-col gap-1">
            <label class="text-md text-white/80">Salary Component Order:</label>
            <FormSelect :disabled="form.isDefault" class="w-full" color="#fff" v-model="form.displayOrder"
                :options="Array.from({ length: components.length + 10 }, (_, i) => (i + 1).toString())" searchable
                size="md" rounded="lg" placeholder="Category" />
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { ref, watch, onMounted } from "vue";
import { useComponentDefinitionStore } from "../../stores/componentDefinition.store";

const componentDefinitionStore = useComponentDefinitionStore()
const loading = ref(true)
const types = [
    { value: "earning", label: "Earning" },
    { value: "deduction", label: "Deduction" },
    { value: "reimbursement", label: "Reimbursement" },
    { value: "benefit", label: "Benefit" },
    { value: "tax", label: "Tax" }
]
const {
    form,
    activeTab,
    componentId
    // : {
    //         organization_id: null,

    //         key: "",
    //         name: "",
    //         type: "earning",
    //         category: "standard",

    //         defaultFormula: "",
    //         description: "",

    //         isTaxable: true,
    //         isVariable: false,
    //         isStatutory: false,
    //         includeInCTC: true,
    //         includeInGross: true,

    //         displayOrder: 999,
    //         isActive: true,
    //     },
} = storeToRefs(componentDefinitionStore)
const components = computed(() => componentDefinitionStore.components.map(e => ({
    key: e.key,
    name: e.name,
})))

watch(form.value, () => {
    if (form.value.name) {
        form.value.key = form.value.name.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    }
}, {
    deep: true
})

const categories = [
    {
        value: 'recurring',
        label: 'Recurring'
    },
    {
        value: 'adhoc',
        label: 'Adhoc'
    },
    {
        value: 'allowance',
        label: 'Allowance'
    },
    {
        value: 'custom',
        label: 'Custom'
    },
]



onMounted(async () => {
    loading.value = true;
    await componentDefinitionStore.fetchComponents()
    form.value.category = categories.find((e, i) => i == activeTab.value)
    setTimeout(() => {
        loading.value = false;
    }, 800);
});
</script>
