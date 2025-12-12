<template>
    <button :type="type" :disabled="disabled || loading" class="inline-flex items-center justify-center select-none font-medium
           active:scale-[.98]
           transition-all duration-300
           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
           disabled:opacity-50 disabled:cursor-not-allowed" :class="[roundedClass, sizeClass, layoutClass]"
        :style="btnStyle" @click="$emit('click', $event)" :aria-busy="loading ? 'true' : 'false'">
        <!-- 🌀 Loading -->
        <template v-if="loading">
            <Icon name="lucide:loader-2" class="animate-spin text-lg" />
            <span v-if="text" class="ml-2 truncate">{{ text }}</span>
        </template>

        <!-- 💠 Custom slot content -->
        <slot v-else-if="$slots.default" />

        <!-- 💡 Default content -->
        <template v-else>
            <Icon v-if="prependIcon" :name="prependIcon" class="text-lg" />
            <Icon v-else-if="icon" :name="icon" class="text-lg" />
            <span v-if="text" class="truncate">{{ text }}</span>
            <Icon v-if="appendIcon" :name="appendIcon" class="text-lg" />
        </template>
    </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    text: { type: String, default: '' },
    icon: { type: String, default: '' },
    prependIcon: { type: String, default: '' },
    appendIcon: { type: String, default: '' },

    color: { type: String, default: '#6B7280' }, // accent color
    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    hoverBoost: { type: Number, default: 0.10 },
    blur: { type: Number, default: 16 },
    borderOpacity: { type: Number, default: 0.80 },
    glow: { type: Number, default: 0.55 },

    size: { type: String, default: 'md' },           // sm | md | lg | xl
    rounded: { type: String, default: '2xl' },       // md | lg | xl | 2xl | full
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },

    /* ➕ Added */
    loading: { type: Boolean, default: false },
})

defineEmits(['click'])

// Convert any CSS color to RGB
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
    return { r: 107, g: 114, b: 128 } // fallback
}

const roundedClass = computed(() => ({
    md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl',
    '2xl': 'rounded-2xl', full: 'rounded-full',
}[props.rounded] || 'rounded-2xl'))

const sizeClass = computed(() => ({
    xs: 'text-xs px-2 py-1',
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
    xl: 'text-lg px-6 py-3',
}[props.size] || 'text-sm px-4 py-2'))

const layoutClass = computed(() => {
    const hasText = !!props.text
    const hasIconOnly = !hasText && (props.icon || props.prependIcon || props.appendIcon)
    const hasBothIcons = props.prependIcon && props.appendIcon

    if (hasIconOnly) {
        return props.rounded === 'full'
            ? 'aspect-square justify-center'
            : 'aspect-square justify-center rounded-xl'
    }
    if (hasBothIcons) return 'justify-between gap-2'
    if (props.prependIcon && hasText) return 'flex-row gap-2'
    if (props.appendIcon && hasText) return 'flex-row-reverse gap-2'
    return 'justify-center gap-2'
})

// Glass + color style
const btnStyle = computed(() => {
    const { r, g, b } = toRGB(props.color)
    const fill = `rgba(${r}, ${g}, ${b}, ${props.fillOpacity})`
    const frost = `rgba(255,255,255,${props.frostOpacity})`
    const border = `rgba(${r}, ${g}, ${b}, ${props.borderOpacity})`
    const glow = `rgba(${r}, ${g}, ${b}, ${props.glow})`

    return {
        '--btn-color': `${r}, ${g}, ${b}`,
        color: `rgba(${r}, ${g}, ${b}, 0.96)`,
        background: `linear-gradient(to bottom right, ${frost}, transparent), ${fill}`,
        backdropFilter: `blur(${props.blur}px)`,
        WebkitBackdropFilter: `blur(${props.blur}px)`,
        border: `1px solid ${border}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 6px 25px -10px ${glow}`,
        transition: 'all 0.25s ease',
        textShadow: '0 1px 0 rgba(0,0,0,0.2)',
    }
});
</script>

<style scoped>
button:hover {
    color: rgba(var(--btn-color), 1);
    filter: saturate(1.2) brightness(1.08);
    transform: translateY(-1px);
    scale: 1.02;
    box-shadow:
        0 0 15px rgba(var(--btn-color), 0.35),
        0 10px 28px -12px rgba(var(--btn-color), 0.45),
        inset 0 1px 0 rgba(255, 255, 255, .28);
}

button:active {
    transform: translateY(1px) scale(0.98);
}
</style>
