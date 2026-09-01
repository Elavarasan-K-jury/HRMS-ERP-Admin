<template>
    <div>
        <label class="block text-xs font-semibold uppercase tracking-wide text-white/70 mb-1.5">
            {{ label }}<span v-if="required" class="text-red-400 ml-0.5">*</span>
        </label>
        <slot />
    </div>
</template>

<script setup>
defineProps({
    label: { type: String, default: '' },
    required: { type: Boolean, default: false },
})
</script>