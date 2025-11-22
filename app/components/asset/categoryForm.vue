<template>
    <!-- Loader -->
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>

    <!-- Form -->
    <div v-if="!loading" class="grid grid-cols-12 gap-2">
        <!-- Name -->
        <div class="col-span-12 w-full flex flex-col gap-1">
            <label class="text-md text-white/80">Category Name:</label>
            <FormInput v-model="name" prepend-icon="lucide:folder" class="w-full" color="#fff" size="lg" rounded="lg"
                placeholder="Enter category name" />
        </div>

        <!-- Code -->
        <div class="col-span-10 w-full flex flex-col gap-1">
            <label class="text-md text-white/80">Category Code:</label>
            <FormInput v-model="code" prepend-icon="heroicons:hashtag" class="w-full" color="#fff" size="lg"
                rounded="lg" disabled placeholder="Auto generated…" />
        </div>

        <!-- Active -->
        <div class="col-span-2 w-full flex flex-col justify-evenly items-end gap-1">
            <label class="text-md text-white/80">Active:</label>
            <UiSwitch v-model="is_active" color="#fff" />
        </div>

        <!-- Description -->
        <div class="col-span-12 w-full flex flex-col gap-1">
            <label class="text-md text-white/80">Description (optional):</label>
            <FormTextArea v-model="description" placeholder="Write a description…" color="#fff" rounded="lg" :rows="3"
                :autoresize="true" clearable />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAssetsCategoryStore } from "../../stores/assetsCategory.store"; // <-- your new store
import { useAuthStore } from "../../stores/auth.store";

const assetCategoryStore = useAssetsCategoryStore();
const authStore = useAuthStore();

const { name, code, description, is_active } = storeToRefs(assetCategoryStore);

const loading = ref(false);

// Auto-generate code from name
watch(name, () => {
    if (name.value) {
        code.value = name.value
            .replace(/[^a-zA-Z0-9]/g, "_")
            .toLowerCase();
    } else {
        code.value = "";
    }
});

onMounted(() => {
    loading.value = true;
    assetCategoryStore.organization_id = authStore.organization;

    setTimeout(() => (loading.value = false), 600);
});
</script>
