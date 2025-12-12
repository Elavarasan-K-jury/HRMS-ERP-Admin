<template id="PanelRow">
    <div class="col-span-2 flex flex-col">
        <span class="text-white/60 text-xs">{{ label }}</span>
        <span class="text-white/90 text-sm font-medium">{{ value }}</span>
    </div>
</template>

<!-- Row Component -->
<script setup>
const props = defineProps({
    label: String,
    value: null
});
</script>
