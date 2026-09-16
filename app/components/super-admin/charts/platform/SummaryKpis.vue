<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-sm bg-white/10 p-4 flex flex-col gap-4">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold text-white">
                    Platform Overview
                </h2>
                <p class="text-xs text-white/50">
                    Snapshot across all organizations
                </p>
            </div>
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                Last 30 days
            </span>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-2">
            <div v-for="card in cards" :key="card.label"
                class="rounded-xl bg-white/10 border border-white/20 px-3 py-3 flex flex-col justify-between">
                <p class="text-[14px] text-white">
                    {{ card.label }}
                </p>
                <div class="mt-1 flex items-baseline justify-between gap-2">
                    <p class="text-xl font-semibold text-white">
                        {{ card.value }}
                    </p>
                    <span class="text-[11px] px-1.5 py-0.5 rounded-full"
                        :class="card.trend >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'">
                        <span v-if="card.trend >= 0">▲</span>
                        <span v-else>▼</span>
                        {{ Math.abs(card.trend) }}%
                    </span>
                </div>
                <p class="text-[12px] text-white/75 mt-1">
                    {{ card.subLabel }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
const cards = [
    {
        label: 'Total Organizations',
        value: '146',
        trend: 8,
        subLabel: 'New orgs onboarded this month',
    },
    {
        label: 'Total Employees',
        value: '32,410',
        trend: 5,
        subLabel: 'Employees managed across all orgs',
    },
    {
        label: 'Active Employees',
        value: '28,150',
        trend: 4,
        subLabel: 'Employees with active status',
    },
    {
        label: 'Attendance Rate',
        value: '94.2%',
        trend: 2,
        subLabel: 'Average attendance across orgs',
    },
];
</script>
