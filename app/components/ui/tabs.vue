<template>
    <div class="w-full">
        <!-- Tab Navigation -->
        <div class="flex gap-2 p-2 rounded-lg backdrop-blur-md bg-white/10 border border-white/10">
            <button v-for="(tab, index) in tabs" :key="index" :disabled="tab.disabled" :style="getTabStyle(index)"
                class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg
                       transition-all duration-300 select-none whitespace-nowrap
                       active:scale-[.98]
                       disabled:opacity-50 disabled:cursor-not-allowed" :class="getTabClasses(index)"
                @click="selectTab(index)">
                <Icon v-if="tab.icon" :name="tab.icon" class="text-lg" />
                <span class="font-semibold">{{ tab.label }}</span>
                <span v-if="tab.badge" :style="badgeStyle"
                    class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold rounded-full">
                    {{ tab.badge }}
                </span>
            </button>
        </div>

        <!-- Tab Panels -->
        <div class="mt-2">
            <slot />
        </div>
    </div>
</template>

<script setup>
import { computed, provide } from 'vue'

const props = defineProps({
    modelValue: { type: Number, default: 0 },
    tabs: {
        type: Array,
        required: true,
        // Expected: [{ label: 'Tab 1', icon: 'icon-name', disabled: false, badge: '3' }]
    },
    /* 🌿 Updated default color to match Jury-HRMS green theme */
    color: { type: String, default: '#4AFF7A' },
    fillOpacity: { type: Number, default: 0.14 },
    frostOpacity: { type: Number, default: 0.06 },
    blur: { type: Number, default: 16 },
    borderOpacity: { type: Number, default: 0.75 },
    glow: { type: Number, default: 0.45 },
})

const emit = defineEmits(['update:modelValue'])

provide('activeTab', computed(() => props.modelValue))

function selectTab(index) {
    if (props.tabs[index]?.disabled) return
    emit('update:modelValue', index)
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

function getTabClasses(index) {
    const isActive = props.modelValue === index
    const isDisabled = props.tabs[index]?.disabled

    if (isDisabled) return ''

    return isActive ? '' : 'hover:bg-white/5 hover:-translate-y-0.5'
}

function getTabStyle(index) {
    const { r, g, b } = toRGB(props.color)
    const isActive = props.modelValue === index
    const isDisabled = props.tabs[index]?.disabled

    if (isDisabled) {
        return {
            color: 'rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
        }
    }

    if (isActive) {
        const fill = `rgba(${r}, ${g}, ${b}, ${props.fillOpacity})`
        const frost = `rgba(255,255,255,${props.frostOpacity})`
        const border = `rgba(${r}, ${g}, ${b}, ${props.borderOpacity})`
        const glow = `rgba(${r}, ${g}, ${b}, ${props.glow})`

        return {
            '--tab-color': `${r}, ${g}, ${b}`,
            color: `rgba(${r}, ${g}, ${b}, 0.95)`,
            background: `linear-gradient(to bottom right, ${frost}, transparent), ${fill}`,
            backdropFilter: `blur(${props.blur}px)`,
            WebkitBackdropFilter: `blur(${props.blur}px)`,
            border: `1px solid ${border}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 6px 25px -10px ${glow}`,
            textShadow: '0 1px 0 rgba(0,0,0,0.2)',
            filter: 'saturate(1.1) brightness(1.08)',
        }
    }

    return {
        '--tab-color': `${r}, ${g}, ${b}`,
        color: 'rgba(255, 255, 255, 0.7)',
        background: 'transparent',
        border: '1px solid transparent',
    }
}

const badgeStyle = computed(() => {
    const { r, g, b } = toRGB(props.color)
    return {
        background: `rgba(${r}, ${g}, ${b}, 0.25)`,
        color: `rgba(${r}, ${g}, ${b}, 0.95)`,
        border: `1px solid rgba(${r}, ${g}, ${b}, 0.35)`,
    }
});
</script>

<style scoped>
button:not(:disabled):hover {
    border-color: rgba(var(--tab-color), 0.25) !important;
}

button:active:not(:disabled) {
    transform: translateY(0) scale(0.98) !important;
}
</style>
