<template>
    <div class="flex flex-col">
        <div class="text-xs text-white/60 flex items-center gap-1">
            <Icon :name="icon" class="w-3 h-3" /> {{ label }}
        </div>
        <div class="font-medium text-white mt-0.5">
            <slot />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
});
</script>