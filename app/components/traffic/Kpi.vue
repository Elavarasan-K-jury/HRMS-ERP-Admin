<template>
    <div :class="cardClass">
        <div :class="iconClass">
            <Icon :name="icon" />
        </div>

        <div class="min-w-0">
            <p class="kpi-label">{{ title }}</p>
            <p class="kpi-value">
                <slot />
            </p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: { type: String, required: true },
    icon: { type: String, required: true },
    color: {
        type: String,
        default: 'blue',
        validator: (v) => ['blue', 'red', 'amber', 'emerald', 'slate'].includes(v)
    }
})

const colorMap = {
    blue: {
        border: 'border-blue-500/30 hover:border-blue-500/50',
        icon: 'bg-blue-500/20 text-blue-400'
    },
    red: {
        border: 'border-red-500/30 hover:border-red-500/50',
        icon: 'bg-red-500/20 text-red-400'
    },
    amber: {
        border: 'border-amber-500/30 hover:border-amber-500/50',
        icon: 'bg-amber-500/20 text-amber-400'
    },
    emerald: {
        border: 'border-emerald-500/30 hover:border-emerald-500/50',
        icon: 'bg-emerald-500/20 text-emerald-400'
    },
    slate: {
        border: 'border-slate-500/30 hover:border-slate-500/50',
        icon: 'bg-slate-500/20 text-slate-200'
    }
}

const cardClass = computed(() =>
    [
        'kpi-card',
        'border',
        colorMap[props.color]?.border ?? colorMap.blue.border
    ].join(' ')
)

const iconClass = computed(() =>
    [
        'kpi-icon',
        colorMap[props.color]?.icon ?? colorMap.blue.icon
    ].join(' ')
)
</script>

<style scoped>
.kpi-card {
    @apply flex items-center gap-4 p-4 rounded-lg bg-white/5 backdrop-blur transition-all duration-200;
}

.kpi-icon {
    @apply w-11 h-11 rounded-lg flex items-center justify-center text-xl;
}

.kpi-label {
    @apply text-slate-400 text-sm;
}

.kpi-value {
    @apply text-white text-2xl font-semibold;
}
</style>
