<script>
export default {
    name: "SummaryBox",
    props: ["label", "value", "highlight"]
};
</script>

<template #SummaryBox="{ label, value, highlight }">
    <div :class="['col-span-6 md:col-span-4 lg:col-span-3 rounded-md p-2 border text-center',
        highlight ? 'bg-green-500/20 border-green-500/40' : 'bg-white/5 border-white/10']">
        <p class="text-xs text-white/60">{{ label }}</p>
        <p class="text-lg font-semibold text-white/90">{{ value }}</p>
    </div>
</template>