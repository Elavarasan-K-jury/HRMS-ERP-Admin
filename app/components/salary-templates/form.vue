<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>

    <div v-else class="grid grid-cols-12 gap-2">

        <!-- ============================= -->
        <!-- 🎯 TEMPLATE BASIC DETAILS -->
        <!-- ============================= -->

        <!-- NAME -->
        <div class="col-span-12 flex flex-col gap-1">
            <label class="text-md text-white/80">Template Name:</label>
            <FormInput v-model="form.name" prepend-icon="lucide:folder-kanban"
                placeholder="Ex: IT Staff Salary Template" color="#fff" size="lg" rounded="lg" />
        </div>

        <!-- DEPARTMENTS -->
        <div class="col-span-6 flex flex-col gap-1">
            <label class="text-md text-white/80">Applicable Departments:</label>
            <FormSelect v-model="form.departments" :options="departmentOptions" color="#fff" multiple searchable
                rounded="lg" />
        </div>

        <!-- DESIGNATIONS -->
        <div class="col-span-6 flex flex-col gap-1">
            <label class="text-md text-white/80">Applicable Designations:</label>
            <FormSelect v-model="form.designations" :options="designationOptions" color="#fff" multiple searchable
                rounded="lg" />
        </div>


        <!-- DESCRIPTION -->
        <div class="col-span-12 flex flex-col gap-1">
            <label class="text-md text-white/80">Description:</label>
            <FormTextArea v-model="form.description" placeholder="Short description about this salary template..." />
        </div>

        <!-- DEFAULT TOGGLE -->
        <div class="col-span-6 flex flex-col items-start md:items-end justify-between px-3 py-2">
            <label class="text-white text-sm">Default Template</label>
            <UiSwitch v-model="form.isDefault" color="#4aff7a" />
        </div>

        <!-- ACTIVE TOGGLE -->
        <div class="col-span-6 flex flex-col items-start md:items-end justify-between px-3 py-2">
            <label class="text-white text-sm">Active</label>
            <UiSwitch v-model="form.isActive" color="#4aff7a" />
        </div>
        <!-- ========================================================== -->
        <!-- 🔧 TEMPLATE COMPONENT MAPPER (Responsive Layout) -->
        <!-- ========================================================== -->

        <!--=<div class="col-span-12 rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl p-2 mt-4">
            <label class="text-lg text-white font-semibold">Template Components</label>

            <div class="grid grid-cols-2 gap-2">
                <div v-for="(tc, index) in form.components" :key="tc._localId"
                    class="border grid grid-cols-2 border-white/20 p-2 bg-white/10 rounded-lg gap-3">

                    <template v-if="!tc.loading">

                        <div class="flex flex-col">
                            <div>
                                <label class="text-white/70 text-xs">Component</label>
                                <FormSelect @select="chooseComponent(index)" v-model="tc.componentId"
                                    :options="componentOptions" placeholder="Choose Component" searchable color="#fff"
                                    rounded="lg" size="md" />
                            </div>

                            <div>
                                <label class="text-white/70 text-xs">Fixed Value</label>
                                <FormInput v-model="tc.value" placeholder="1000" type="number" size="md" rounded="lg"
                                    prepend-icon="lucide:calculator" color="#fff" />
                            </div>
                            <div>
                                <label class="text-white/70 text-xs">Order</label>
                                <FormInput v-model="tc.priority" type="number" size="md" rounded="lg" color="#fff" />
                            </div>

                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-white/70">Min Value</label>
                                <FormInput v-model="tc.minValue" type="number" placeholder="100" color="#fff"
                                    rounded="lg" />
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-xs text-white/70">Max Value</label>
                                <FormInput v-model="tc.maxValue" type="number" placeholder="1000" color="#fff"
                                    rounded="lg" />
                            </div>

                        </div>

                        <div>
                            <label class="text-white/70 text-xs">Formula (optional)</label>
                            <FormFormulaBuilder v-model="tc.formula" :components="componentDefinitionList" />
                        </div>


                        <div class="flex col-span-3 justify-end pt-1">
                            <UiButton size="xs" color="#ff502e" text="Remove Component" prepend-icon="lucide:trash"
                                @click="removeTemplateComponent(index)" />
                        </div>

                    </template>

<template v-else>
                        <UiLoader />
                    </template>

</div>
</div>

<div class="flex justify-end mt-2">
    <UiButton size="xs" color="#4aff7a" text="Add Component" prepend-icon="ion:add-circle"
        @click="addTemplateComponent" />
</div>
</div> -->

    </div>
</template>



<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";

import { useSalaryTemplateStore } from "../../stores/organization/salaryTemplate.store";
import { useComponentDefinitionStore } from "../../stores/organization/componentDefinition.store";
import { useDepartmentStore } from "../../stores/organization/department.store";
import { useDesignationStore } from "../../stores/organization/designation.store";

const templateStore = useSalaryTemplateStore();
const componentStore = useComponentDefinitionStore();
const departmentStore = useDepartmentStore();
const designationStore = useDesignationStore();

const { form, loading } = storeToRefs(templateStore);

// Options
const departmentOptions = computed(() => departmentStore.department_select);
const designationOptions = computed(() => designationStore.designation_list);

const componentDefinitionList = computed(() =>
    componentStore.components.map(c => ({ key: c.key, name: c.name }))
);

const componentOptions = computed(() =>
    componentStore.components.map(c => ({ value: c.id, label: c.name }))
);

// Add Component Row
function addTemplateComponent() {
    form.value.components.push({
        _localId: form.value.components.length,
        componentId: "",
        formula: "",
        value: null,
        priority: 0,
        minValue: null,
        maxValue: null,
        condition: "",
    });
}

const chooseComponent = (index) => {
    const current = form.value.components[index];
    if (!current) return;

    const selectedId = current.componentId?.value ?? current.componentId;
    const componentSelected = componentStore.components.find(e => e.id === selectedId);
    if (!componentSelected) return;

    current.formula = componentSelected.defaultFormula;
    current.priority = componentSelected.displayOrder;
};

// Remove Row
function removeTemplateComponent(index) {
    form.value.components.splice(index, 1);
}

onMounted(async () => {
    loading.value = true;
    await componentStore.fetchComponents();
    await departmentStore.fetchAllDepartments();
    await designationStore.fetchDesignationList();
    setTimeout(() => (loading.value = false), 600);
});
</script>


<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}
</style>
