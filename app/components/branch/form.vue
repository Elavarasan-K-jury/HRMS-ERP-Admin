<template>
    <div class="flex flex-col gap-3">
        <span class="col-span-12 text-xl font-semibold text-white/80">
            Branch Details
        </span>
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Branch Name:</p>
            <FormInput class="w-full" v-model="name" prepend-icon="lucide:building-2" color="#fff" size="md"
                rounded="lg" placeholder="Branch Name" />
        </div>
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Branch Code:</p>
            <FormInput class="w-full" v-model="code" :disabled="true" prepend-icon="lucide:code" color="#fff" size="md"
                rounded="lg" placeholder="Auto-generated" />
        </div>
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Description:</p>
            <textarea v-model="description" rows="3" placeholder="Short description of the branch..."
                class="w-full resize-none rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60"></textarea>
        </div>
        <div class="w-full flex items-center justify-between rounded-lg border border-white/15 bg-black/20 px-3 py-2.5">
            <div>
                <p class="text-sm text-white/90">Active</p>
                <p class="text-xs text-white/50">Enable login and usage for this branch.</p>
            </div>
            <UiSwitch v-model="is_active" color="#4aff7a" size="md" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useBranchStore } from '~/stores/organization/branch.store';
import { storeToRefs } from 'pinia';

const branchStore = useBranchStore();

const {
    name,
    code,
    description,
    is_active,
} = storeToRefs(branchStore);

const loading = ref(false);

watch(name, () => {
    if (name.value) {
        code.value = name.value.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    } else {
        code.value = '';
    }
}, { deep: true });

onMounted(() => {
    loading.value = false
});
</script>