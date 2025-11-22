<template>
    <button type="button" role="switch" :aria-checked="modelValue" @click="toggle" @keydown.space.prevent="toggle"
        @keydown.enter.prevent="toggle"
        class="relative inline-flex items-center transition-all duration-300 select-none" :class="[sizeClass]"
        :style="trackStyle">
        <!-- Knob -->
        <span class="absolute rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            :class="[knobClass]" :style="knobStyle"></span>
    </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    color: { type: String, default: '#4AFF7A' },
    blur: { type: Number, default: 14 },
    fillOpacity: { type: Number, default: 0.12 },
    borderOpacity: { type: Number, default: 0.25 },
    glow: { type: Number, default: 0.45 },
    size: { type: String, default: 'md' }, // sm | md | lg
    disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

function toggle() {
    if (props.disabled) return
    emit('update:modelValue', !props.modelValue)
    emit('change', !props.modelValue)
}

function toRGB(color) {
    const c = (color || '').trim().toLowerCase()
    if (c.startsWith('#')) {
        const raw = c.slice(1)
        const full = raw.length === 3 ? raw.split('').map(x => x + x).join('') : raw
        const n = Number.parseInt(full, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) return { r: +m[1], g: +m[2], b: +m[3] }
    return { r: 74, g: 255, b: 122 } // fallback to #4AFF7A
}

const { r, g, b } = toRGB(props.color)

const trackStyle = computed(() => {
    const fill = `rgba(${r}, ${g}, ${b}, ${props.fillOpacity})`
    const border = `rgba(${r}, ${g}, ${b}, ${props.borderOpacity})`
    const glow = `rgba(${r}, ${g}, ${b}, ${props.glow})`

    return {
        width: sizeMap[props.size].w,
        height: sizeMap[props.size].h,
        background: props.modelValue
            ? `linear-gradient(to bottom right, rgba(255,255,255,0.06), transparent), ${fill}`
            : 'rgba(255,255,255,0.03)',
        border: `1px solid ${props.modelValue ? border : 'rgba(255,255,255,0.08)'}`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        boxShadow: props.modelValue
            ? `inset 0 1px 0 rgba(255,255,255,.2), 0 0 15px -4px ${glow}`
            : 'inset 0 1px 0 rgba(255,255,255,.1)',
        borderRadius: '9999px',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    }
})

const knobStyle = computed(() => ({
    width: sizeMap[props.size].knob,
    height: sizeMap[props.size].knob,
    transform: props.modelValue
        ? `translateX(${sizeMap[props.size].translate})`
        : 'translateX(0)',
    background: props.modelValue
        ? `rgba(${r}, ${g}, ${b}, 0.9)`
        : 'rgba(255,255,255,0.15)',
    boxShadow: props.modelValue
        ? `0 0 10px rgba(${r}, ${g}, ${b}, 0.5)`
        : '0 1px 2px rgba(0,0,0,0.4)',
}))

const knobClass = computed(() => 'top-0.7 left-1')

const sizeMap = {
    sm: { w: '2.25rem', h: '1.25rem', knob: '0.8rem', translate: '0.9rem' },
    md: { w: '2.75rem', h: '1.5rem', knob: '1.1rem', translate: '1.17rem' },
    lg: { w: '3.25rem', h: '1.75rem', knob: '1.3rem', translate: '1.4rem' },
}

const sizeClass = computed(() => 'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50');
</script>

<style scoped>
button:focus-visible {
    outline: none;
}
</style>
