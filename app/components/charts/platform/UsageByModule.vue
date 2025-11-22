<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-sm bg-white/10 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
            <div>
                <h2 class="text-lg font-semibold text-white">
                    Feature Usage by Module
                </h2>
                <p class="text-xs text-white/50">
                    Requests and activity across major modules
                </p>
            </div>
            <span class="text-[11px] text-white/60">Last 7 days</span>
        </div>

        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div v-for="item in modules" :key="item.name"
                class="rounded-xl border border-white/20 bg-white/10 px-3 py-2 flex flex-col gap-1">
                <div class="flex items-center justify-between">
                    <p class="text-xs text-white">{{ item.name }}</p>
                    <span class="text-[11px] text-white/50">
                        {{ item.percent }}%
                    </span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                        :style="{ width: `${item.percent}%` }" />
                </div>
                <p class="text-[10px] text-white">
                    {{ item.requests.toLocaleString() }} requests
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
const modules = [
    { name: 'Employee & Org Management', percent: 34, requests: 43210 },
    { name: 'Attendance & Leave', percent: 26, requests: 32980 },
    { name: 'Payroll', percent: 18, requests: 20134 },
    { name: 'Recruitment', percent: 12, requests: 15432 },
    { name: 'Performance', percent: 6, requests: 8123 },
    { name: 'Assets & IT', percent: 4, requests: 5630 },
];
</script>
