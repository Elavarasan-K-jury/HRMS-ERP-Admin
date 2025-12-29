<template>
    <div class="summary-box group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
        :class="[
            highlight ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/40' : 'bg-white/5 border border-white/10',
            colorClass
        ]">
        <!-- Shimmer effect on hover -->
        <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700">
        </div>

        <div class="relative z-10">
            <!-- Icon -->
            <div class="flex justify-between items-start mb-2">
                <span class="text-2xl">{{ icon }}</span>
                <div v-if="highlight"
                    class="px-2 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    NET
                </div>
            </div>

            <!-- Label -->
            <div class="text-xs font-medium mb-1 transition-colors"
                :class="highlight ? 'text-white/90' : 'text-white/60'">
                {{ label }}
            </div>

            <!-- Value -->
            <div class="text-lg font-bold transition-all duration-300 group-hover:scale-105"
                :class="highlight ? 'text-white' : 'text-white/90'">
                {{ value }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: { type: String, required: true },
    value: { type: String, required: true },
    icon: { type: String, default: '💰' },
    highlight: { type: Boolean, default: false },
    color: { type: String, default: 'slate' }
});

const colorClass = computed(() => {
    if (props.highlight) return '';

    const colors = {
        emerald: 'hover:bg-emerald-500/10 hover:border-emerald-500/30',
        blue: 'hover:bg-blue-500/10 hover:border-blue-500/30',
        rose: 'hover:bg-rose-500/10 hover:border-rose-500/30',
        purple: 'hover:bg-purple-500/10 hover:border-purple-500/30',
        pink: 'hover:bg-pink-500/10 hover:border-pink-500/30',
        slate: 'hover:bg-slate-500/10 hover:border-slate-500/30'
    };

    return colors[props.color] || colors.slate;
});
</script>

<style scoped>
.summary-box {
    backdrop-filter: blur(10px);
}
</style>