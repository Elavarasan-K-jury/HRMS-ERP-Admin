<template>
    <input :value="modelValue" v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent transition-all" />
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
    modelValue: { type: [String, Number], default: '' },
})

defineEmits(['update:modelValue'])
</script>