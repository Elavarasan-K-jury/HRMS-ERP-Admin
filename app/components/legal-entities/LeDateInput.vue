<template>
    <div class="relative">
        <input :value="modelValue" type="date" v-bind="$attrs"
            @input="$emit('update:modelValue', $event.target.value)"
            class="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 pr-9 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent transition-all [color-scheme:dark]" />
        <Icon name="ion:calendar-outline" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
    </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
    modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>