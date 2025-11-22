<template>
    <div v-show="isActive" class="animate-fadeIn" :style="panelStyle">
        <slot />
    </div>
</template>

<script setup>
import { inject, computed } from 'vue'

const props = defineProps({
    index: { type: Number, required: true },
    color: { type: String, default: '' }, // Custom color for this panel
    fillOpacity: { type: Number, default: 0.05 },
    frostOpacity: { type: Number, default: 0.03 },
    blur: { type: Number, default: 12 },
    borderOpacity: { type: Number, default: 0.10 },
    rounded: { type: String, default: '2xl' }, // md | lg | xl | 2xl | 3xl
    padding: { type: String, default: 'lg' }, // sm | md | lg | xl
})

const activeTab = inject('activeTab')
const isActive = computed(() => activeTab.value === props.index)

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
    return { r: 255, g: 255, b: 255 } // fallback white
}

const roundedMap = {
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
}

const paddingMap = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
}

const panelStyle = computed(() => {
    if (!props.color) {
        // Default glass panel
        return {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: roundedMap[props.rounded] || '1rem',
            padding: paddingMap[props.padding] || '1.5rem',
        }
    }

    // Custom colored glass panel
    const { r, g, b } = toRGB(props.color)
    const fill = `rgba(${r}, ${g}, ${b}, ${props.fillOpacity})`
    const frost = `rgba(255,255,255,${props.frostOpacity})`
    const border = `rgba(${r}, ${g}, ${b}, ${props.borderOpacity})`

    return {
        background: `linear-gradient(135deg, ${frost}, transparent), ${fill}`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        border: `1px solid ${border}`,
        borderRadius: roundedMap[props.rounded] || '1rem',
        padding: paddingMap[props.padding] || '1.5rem',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.15)`,
    }
});
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
}
</style>