<template>
    <div class="text-white/90 space-y-6">

        <!-- Header -->
        <div>
            <h2 class="text-2xl font-semibold flex items-center gap-2">
                {{ model.model_name }}
                <span class="px-2 py-0.5 text-xs rounded-md bg-white/10 text-white/70">
                    {{ model.brand }}
                </span>
            </h2>
        </div>

        <!-- Quick Meta Info -->
        <div class="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg border border-white/10">

            <MetaRow label="Category" icon="lucide:folder">
                {{ model.category?.name || '—' }}
            </MetaRow>
            <MetaRow label="Status" icon="lucide:circle">
                <span :class="model.is_active ? 'text-emerald-400' : 'text-red-400'">
                    ●
                </span>
                {{ model.is_active ? 'Active' : 'Inactive' }}
            </MetaRow>

            <MetaRow class="col-span-2" label="Code" icon="lucide:barcode">
                {{ model.code || '—' }}
            </MetaRow>


            <MetaRow label="Created" icon="lucide:calendar-plus">
                {{ format(model.created_at) }}
            </MetaRow>

            <MetaRow label="Updated" icon="lucide:calendar-check">
                {{ format(model.updated_at) }}
            </MetaRow>

        </div>

        <!-- Description -->
        <div class="space-y-2">
            <h3 class="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Icon name="lucide:file-text" class="w-4 h-4" />
                Description
            </h3>
            <div class="p-3 rounded-lg bg-white/5 border border-white/10 text-white/80 prose prose-invert max-w-none"
                v-html="model.description || '<i>No description available.</i>'">
            </div>
        </div>

        <!-- Specs -->
        <div class="space-y-2">
            <h3 class="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Icon name="lucide:settings" class="w-4 h-4" />
                Specifications
            </h3>

            <div v-if="parsedSpecs && Object.keys(parsedSpecs).length"
                class="bg-white/5 border border-white/10 rounded-lg divide-y divide-white/10">
                <div v-for="(value, key) in parsedSpecs" :key="key"
                    class="flex items-center justify-between px-4 py-2 text-sm">
                    <span class="text-white/70">{{ key }}</span>
                    <span class="text-white font-medium">{{ value }}</span>
                </div>
            </div>

            <div v-else class="text-white/50 text-sm italic">
                No specifications available.
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed } from "vue";
import MetaRow from "./MetaRow.vue";

const props = defineProps({
    model: { type: Object, required: true }
});

// Pretty Date
const format = (dt) => (dt ? new Date(dt).toLocaleString() : "—");

// Parse JSON specs safely
const parsedSpecs = computed(() => {
    if (!props.model.specs) return null;

    try {
        return JSON.parse(props.model.specs);
    } catch (e) {
        return null;
    }
});
</script>

<style scoped>
.prose :is(p, li) {
    margin: 0;
}
</style>
