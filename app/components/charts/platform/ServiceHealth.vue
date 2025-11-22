<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-sm bg-white/10 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-2">
            <div>
                <h2 class="text-lg font-semibold text-white/80">
                    Service Health
                </h2>
                <p class="text-xs text-white/50">
                    Status of core microservices
                </p>
            </div>
            <span class="text-[11px] text-white/60">
                Updated {{ lastUpdated }}
            </span>
        </div>

        <div class="flex-1 grid grid-cols-1 gap-2 mt-2">
            <div v-for="svc in services" :key="svc.name"
                class="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex flex-col gap-1">
                <div class="flex items-center justify-between">
                    <p class="text-xs text-white truncate">
                        {{ svc.name }}
                    </p>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full"
                        :class="svc.status === 'UP' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'">
                        {{ svc.status }}
                    </span>
                </div>
                <p class="text-[10px] text-white/50">
                    Latency: {{ svc.latency }} ms · Errors: {{ svc.errorRate }}%
                </p>
                <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                        :style="{ width: `${100 - svc.errorRate}%` }" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const lastUpdated = 'just now';

const services = [
    { name: 'Organization Service', status: 'UP', latency: 42, errorRate: 0.4 },
    { name: 'Employee Service', status: 'UP', latency: 55, errorRate: 0.7 },
    { name: 'Attendance Service', status: 'UP', latency: 61, errorRate: 1.2 },
    { name: 'Payroll Service', status: 'UP', latency: 73, errorRate: 0.9 },
    { name: 'Onboarding Service', status: 'UP', latency: 48, errorRate: 0.3 },
    { name: 'Notification Service', status: 'UP', latency: 39, errorRate: 0.2 },
];
</script>
