<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-sm bg-white/10 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
            <div>
                <h2 class="text-lg font-semibold text-white">
                    Top Organizations
                </h2>
                <p class="text-xs text-white/50">
                    By employee count & activity
                </p>
            </div>
            <span class="text-[11px] text-white/60">Top 5</span>
        </div>

        <div class="flex-1 flex flex-col gap-2 mt-1">
            <div v-for="(org, idx) in orgs" :key="org.name"
                class="rounded-xl bg-white/10 border border-white/20 px-3 py-2 flex items-center gap-3">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
                    :class="idx === 0 ? 'bg-amber-500/80' : idx === 1 ? 'bg-slate-500/80' : 'bg-slate-700/80'">
                    {{ idx + 1 }}
                </div>
                <div class="flex-1">
                    <p class="text-xs text-white/80 truncate">
                        {{ org.name }}
                    </p>
                    <p class="text-[10px] text-white/50">
                        {{ org.employees.toLocaleString() }} employees ·
                        {{ org.activityScore }} activity score
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-white/70">
                        Plan: {{ org.plan }}
                    </p>
                    <p class="text-[10px]"
                        :class="org.risk === 'High' ? 'text-rose-300' : org.risk === 'Medium' ? 'text-amber-300' : 'text-emerald-300'">
                        Risk: {{ org.risk }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const orgs = [
    { name: 'Acme Corp', employees: 2100, activityScore: 94, plan: 'Enterprise', risk: 'Low' },
    { name: 'Globex Industries', employees: 1650, activityScore: 88, plan: 'Enterprise', risk: 'Medium' },
    { name: 'Stark Systems', employees: 1320, activityScore: 81, plan: 'Standard', risk: 'Low' },
    { name: 'Wayne Logistics', employees: 980, activityScore: 76, plan: 'Standard', risk: 'High' },
    { name: 'Umbrella Retail', employees: 860, activityScore: 69, plan: 'Basic', risk: 'Medium' },
];
</script>
