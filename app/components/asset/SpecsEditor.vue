<template>
    <div class="bg-white/5 p-3 rounded-lg border border-white/10">

        <label class="text-white/70 text-sm font-medium">Specifications</label>

        <div class="flex flex-col gap-3 mt-2">

            <!-- SPEC ROWS -->
            <div v-for="(row, i) in specRows" :key="i" class="flex gap-2 items-center">
                <FormInput rounded="lg" class="flex-1" placeholder="Key (e.g. CPU)" v-model="row.key" color="#fff" />

                <FormInput rounded="lg" class="flex-1" placeholder="Value (e.g. i7 12th Gen)" v-model="row.value"
                    color="#fff" />

                <UiButton color="#750d0d" iconOnly @click="removeRow(i)">
                    <Icon name="lucide:trash" class="w-4 h-4"></Icon>
                </UiButton>
            </div>

            <!-- ADD ROW BUTTON -->
            <UiButton color="#4aff7a" text="Add Specification" prepend-icon="lucide:plus" @click="addRow" />

        </div>

    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useAssetsModelStore } from "../../stores/assetModel.store";

const store = useAssetsModelStore();
const { specs } = storeToRefs(store);

// Convert incoming JSON → array rows
const specRows = ref([]);

const parseSpecs = () => {
    try {
        const parsed = specs.value ? JSON.parse(specs.value) : {};
        specRows.value = Object.entries(parsed).map(([key, value]) => ({
            key,
            value
        }));
    } catch {
        specRows.value = [{
            key: "",
            value: ""
        }];
    }
};


// Add spec row
const addRow = () => {
    specRows.value.push({ key: "", value: "" });
};

// Remove row
const removeRow = (idx) => {
    specRows.value.splice(idx, 1);
};

// Convert array → JSON string for backend
watch(specRows, () => {
    const obj = {};
    specRows.value.forEach((r) => {
        if (r.key.trim()) obj[r.key.trim()] = r.value.trim();
    });
    specs.value = JSON.stringify(obj);
}, { deep: true });


// Initialize
onMounted(() => {
    parseSpecs();
});
</script>
