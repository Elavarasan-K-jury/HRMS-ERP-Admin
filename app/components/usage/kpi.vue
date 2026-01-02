<template>
    <div class="p-4 rounded-xl bg-white/10 border border-white/10">
        <div class="text-xs text-slate-400">{{ title }}</div>
        <div class="text-2xl font-bold text-white">{{ value }}</div>
    </div>
</template>


<!-- SIMPLE LOCAL KPI COMPONENT -->
<script setup>
const props = defineProps({
    title: String,
    value: String || Number
});
</script>