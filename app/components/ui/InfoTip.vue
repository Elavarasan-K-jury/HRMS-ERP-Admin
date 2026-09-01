<template>
    <span class="relative inline-flex items-center group/tooltip align-middle shrink-0" tabindex="0"
        :class="wrapperClass" @focus.prevent>
        <Icon name="lucide:circle-help" class="w-3.5 h-3.5 text-white/40 group-hover/tooltip:text-white/80 transition-colors cursor-help" />
        <span role="tooltip"
            class="pointer-events-none absolute z-50 w-max max-w-[240px] rounded-lg border border-white/10 bg-black/85 backdrop-blur-xl px-2.5 py-2 text-[11px] leading-snug text-white/80 opacity-0 transition-all duration-150 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:opacity-100 shadow-xl"
            :class="positionClass">
            {{ tip }}
        </span>
    </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    tip: { type: String, required: true },
    position: { type: String, default: 'right' },
})

const positions = {
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2.5',
}

const wrapperClass = computed(() => ({
    right: '',
    left: '',
    top: 'flex flex-col items-center',
    bottom: 'flex flex-col items-center',
}[props.position]))

const positionClass = computed(() => positions[props.position] || positions.right)
</script>