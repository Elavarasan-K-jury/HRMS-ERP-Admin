<template>
    <div class="relative">
        <select :value="modelValue"
            @change="$emit('update:modelValue', $event.target.value)"
            class="w-full appearance-none rounded-lg border border-white/20 bg-white/10 px-3 py-2 pr-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent transition-all cursor-pointer">
            <option value="" disabled class="text-white/60 bg-[#14161c]">{{ placeholder }}</option>
            <option v-for="o in options" :key="o" :value="o" class="text-white bg-[#14161c]">{{ o }}</option>
        </select>
        <Icon name="ion:chevron-down" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
    </div>
</template>

<script setup>
defineProps({
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: 'Select' },
})

defineEmits(['update:modelValue'])
</script>