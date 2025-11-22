<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-sm bg-white/10 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
            <div>
                <h2 class="text-lg font-semibold text-white">
                    Subscription & Churn Risk
                </h2>
                <p class="text-xs text-white/50">
                    Expiring soon and low-usage organizations
                </p>
            </div>
            <span class="text-[11px] text-white/60">
                Next 30 days
            </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
            <!-- Expiring soon -->
            <div class="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <p class="text-xs font-semibold text-white/75">
                        Expiring Subscriptions
                    </p>
                    <span class="text-[11px] text-white/60">
                        {{ expiring.length }} orgs
                    </span>
                </div>
                <ul class="space-y-1.5 max-h-40 overflow-y-auto text-[11px] text-white/70">
                    <li v-for="org in expiring" :key="org.name" class="flex items-center justify-between">
                        <span class="truncate">{{ org.name }}</span>
                        <span class="text-white/50">
                            {{ org.daysLeft }} days
                        </span>
                    </li>
                </ul>
            </div>

            <!-- Low usage / churn risk -->
            <div class="rounded-xl bg-white/5 border border-white/10 p-3 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <p class="text-xs font-semibold text-white/75">
                        Low Usage / Churn Risk
                    </p>
                    <span class="text-[11px] text-white/60">
                        {{ lowUsage.length }} orgs
                    </span>
                </div>
                <ul class="space-y-1.5 max-h-40 overflow-y-auto text-[11px] text-white/70">
                    <li v-for="org in lowUsage" :key="org.name" class="flex items-center justify-between">
                        <span class="truncate">{{ org.name }}</span>
                        <span class="px-1.5 py-0.5 rounded-full text-[10px]"
                            :class="org.risk === 'High' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'">
                            {{ org.risk }} risk
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
const expiring = [
    { name: 'Wayne Logistics', daysLeft: 5 },
    { name: 'Umbrella Retail', daysLeft: 9 },
    { name: 'Acme FinServ', daysLeft: 13 },
    { name: 'Nova Labs', daysLeft: 18 },
];

const lowUsage = [
    { name: 'Umbrella Retail', risk: 'High' },
    { name: 'Quantum Foods', risk: 'High' },
    { name: 'Eastbridge Trading', risk: 'Medium' },
];
</script>
