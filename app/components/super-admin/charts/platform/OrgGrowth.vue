<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-sm bg-white/10 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
            <div>
                <h2 class="text-lg font-semibold text-white/80">
                    Organizations Growth
                </h2>
                <p class="text-xs text-white/50">
                    New organizations added month over month
                </p>
            </div>
            <span class="text-[11px] text-white/60">Last 12 months</span>
        </div>

        <!-- Simple line-like visual placeholder -->
        <div class="flex-1 flex flex-col justify-end">
            <div class="h-40 w-full relative">
                <div class="absolute inset-0 flex items-end gap-2 px-1">
                    <div v-for="(point, idx) in data" :key="point.month"
                        class="flex-1 flex flex-col items-center gap-1">
                        <div class="w-full max-w-[10px] rounded-full bg-gradient-to-t from-sky-500/40 to-sky-300"
                            :style="{ height: `${20 + point.value * 3}px` }" />
                        <span class="text-[10px] text-white">
                            {{ point.month }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-2 flex items-center justify-between text-[11px] text-white">
            <span>Total new orgs: {{ total }}</span>
            <span>Peak month: {{ peakMonth }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const data = [
    { month: 'Jan', value: 4 },
    { month: 'Feb', value: 6 },
    { month: 'Mar', value: 9 },
    { month: 'Apr', value: 11 },
    { month: 'May', value: 8 },
    { month: 'Jun', value: 10 },
    { month: 'Jul', value: 7 },
    { month: 'Aug', value: 5 },
    { month: 'Sep', value: 12 },
    { month: 'Oct', value: 9 },
    { month: 'Nov', value: 10 },
    { month: 'Dec', value: 13 },
];

const total = computed(() => data.reduce((sum, d) => sum + d.value, 0));
const peakMonth = computed(
    () => data.reduce((max, d) => (d.value > max.value ? d : max), data[0]).month,
);
</script>
