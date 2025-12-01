<template>
    <div
        class="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-4 shadow-sm hover:bg-white/15 transition">
        <!-- Icon -->
        <div v-if="icon" class="text-2xl text-primary-300">
            <i :class="icon"></i>
        </div>

        <!-- Content -->
        <div class="flex flex-col">
            <span class="text-xs text-white/60">{{ label }}</span>
            <span class="text-xl font-semibold text-white">{{ value }}</span>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    label: { type: String, default: "" },
    value: { type: String, default: "-" },
    icon: { type: String, default: "" }, // example: "i-mdi-clock-outline"
});
</script>

<style scoped>
.text-primary-300 {
    color: #4aff7a;
    /* customize if needed */
}
</style>
