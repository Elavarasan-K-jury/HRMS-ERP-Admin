<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-sm bg-white/10 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
            <div>
                <h2 class="text-lg font-semibold text-white/80">
                    Revenue Trends
                </h2>
                <p class="text-xs text-white/50">
                    MRR across the platform
                </p>
            </div>
            <span class="text-[11px] text-white/60">USD · Last 12 months</span>
        </div>

        <!-- Simple trend line placeholder -->
        <div class="flex-1 flex items-center justify-center">
            <div class="w-full h-40 relative">
                <svg viewBox="0 0 100 40" class="w-full h-full">
                    <defs>
                        <linearGradient id="rev-line" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
                            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.1" />
                        </linearGradient>
                    </defs>
                    <path :d="pathD" fill="url(#rev-line)" stroke="#e5e7eb" stroke-width="0.6" />
                </svg>
            </div>
        </div>

        <div class="mt-2 grid grid-cols-3 gap-2 text-[11px] text-white/60">
            <div>
                <p class="text-white">Current MRR</p>
                <p class="text-sm text-white font-semibold">$13.2k</p>
            </div>
            <div>
                <p class="text-white">Growth vs last month</p>
                <p class="text-sm text-emerald-300 font-semibold">+11.4%</p>
            </div>
            <div>
                <p class="text-white">Churned MRR</p>
                <p class="text-sm text-rose-300 font-semibold">$420</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

// Simple normalized points [0, 1] to build SVG path
const values = [0.3, 0.4, 0.5, 0.55, 0.52, 0.6, 0.7, 0.68, 0.75, 0.8, 0.78, 0.85];

const pathD = computed(() => {
    if (!values.length) return '';
    const stepX = 100 / (values.length - 1);

    const points = values.map((v, idx) => {
        const x = idx * stepX;
        const y = 40 - v * 30 - 5; // padding
        return { x, y };
    });

    let d = `M 0 40 L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
    }
    d += ' L 100 40 Z';
    return d;
});
</script>
