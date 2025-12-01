<template>
    <div class="flex flex-col gap-2 p-2">

        <!-- Category -->
        <div class="flex flex-col">
            <label class="text-white/70 text-sm font-medium">Asset Category</label>
            <FormSelect rounded="lg" color="#fff" v-model="category_id" :options="category_list"
                placeholder="Select category" />
        </div>

        <!-- Brand -->
        <div class="flex flex-col">
            <label class="text-white/70 text-sm font-medium">Brand</label>
            <FormInput rounded="lg" color="#fff" v-model="brand" placeholder="Ex: Apple, Dell" />
        </div>

        <!-- Model Name -->
        <div class="flex flex-col">
            <label class="text-white/70 text-sm font-medium">Model Name</label>
            <FormInput rounded="lg" color="#fff" v-model="model_name" placeholder="Ex: MacBook Pro 16" />
        </div>

        <!-- Code (Auto) -->
        <div class="flex flex-col">
            <label class="text-white/70 text-sm font-medium">Code (Auto-Generated)</label>
            <FormInput rounded="lg" color="#fff" v-model="code" disabled placeholder="Auto-generated" />
        </div>

        <!-- Description -->
        <div class="flex flex-col">
            <label class="text-white/70 text-sm font-medium">Description</label>
            <FormTextArea color="#fff" v-model="description" rows="3" />
        </div>

        <!-- Specs -->
        <div class="flex flex-col">
            <label class="text-white/70 text-sm font-medium">Specs</label>
            <SpecsEditor />
        </div>

        <!-- Status -->
        <div class="flex items-center justify-between mt-2">
            <label class="text-white/70 text-sm font-medium">Active</label>
            <UiSwitch v-model="is_active" />
        </div>

    </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { watch, computed } from "vue";
import { useAssetsModelStore } from "../../stores/assetModel.store";

import SpecsEditor from "./SpecsEditor.vue";

const store = useAssetsModelStore();

const {
    category_id,
    brand,
    model_name,
    code,
    description,
    specs,
    is_active,
    category_list
} = storeToRefs(store);

// Find the selected category
const selectedCategory = computed(() => {
    return category_list.value?.find(c => c.value === category_id.value.value);
});


// 🔥 Auto-generate CODE using a watcher
watch([category_id, brand, model_name], () => {

    const cat = selectedCategory.value?.label
        ?.split("(")[0]
        ?.trim()
        ?.slice(0, 4)
        ?.toUpperCase() || "";

    const br = brand.value
        ? brand.value.slice(0, 3).toUpperCase()
        : "";

    const mdl = model_name.value
        ? model_name.value.replace(/\s+/g, "-").toUpperCase()
        : "";

    if (cat && br && mdl) {
        code.value = `${cat}-${br}-${mdl}`;
    } else {
        code.value = "";
    }
});
</script>
