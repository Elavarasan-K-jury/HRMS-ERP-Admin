<template>
    <div class="h-full w-full rounded-lg border border-white/20 backdrop-blur-md bg-white/5 p-4 flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
            <div>
                <h2 class="text-lg font-semibold text-white/90">Service Health</h2>
                <p class="text-xs text-white/60">Live metrics for all core services</p>
            </div>

            <div class="flex items-center gap-3">
                <span class="text-[11px] text-white/50">
                    Updated {{ lastUpdated }}
                </span>

                <!-- Reload Button with Countdown -->
                <button @click="manualReload"
                    class="text-[11px] px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 transition">
                    Reload ({{ countdown }})
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="store.service_health.length === 0" class="flex-1 grid place-items-center text-white/50 text-sm">
            No service data yet
        </div>

        <!-- Service Cards -->
        <div v-else class="flex flex-col gap-3 overflow-y-auto pr-1 mt-2">
            <div v-for="svc in mappedServices" :key="svc.service"
                class="rounded-lg max-h-full border border-white/10 bg-white/10 px-4 py-1 flex flex-col hover:bg-white/20 transition">
                <!-- Row 1: Name + Status -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-2.5 h-2.5 rounded-full" :class="statusDot(svc.status)"></div>

                        <p class="text-lg capitalize text-white font-medium truncate">
                            {{ toProperWords(svc.service) }}
                        </p>
                    </div>

                    <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="statusBadge(svc.status)">
                        {{ svc.status }}
                    </span>
                </div>

                <!-- Row 2: Metrics -->
                <div class="flex items-center justify-between gap-3 text-[11px] text-white/70">
                    <p>
                        <span class="text-white mr-2">Latency:</span>
                        <span :class="latencyColor(svc.avgLatencyMs)">
                            {{ svc.avgLatencyMs }} ms
                        </span>
                    </p>

                    <p>
                        <span class="text-white mr-2">Errors:</span>
                        <span :class="svc.errorRate > 10 ? 'text-red-300' : 'text-emerald-300'">
                            {{ svc.errorRate }}%
                        </span>
                    </p>

                    <p>
                        <span class="text-white mr-2">In-flight:</span>
                        {{ svc.inFlight }}
                    </p>
                </div>

                <!-- Row 3: Requests stats -->
                <div class="flex items-center justify-between text-[10px] text-white/60">
                    <p>Total: {{ svc.totalRequests }}</p>
                    <p>Success: {{ svc.successCount }}</p>
                    <p>Errors: {{ svc.errorCount }}</p>
                </div>

                <!-- Usage Bar -->
                <div>
                    <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden mt-1">
                        <div class="h-full rounded-full transition-all duration-500" :style="{
                            width: usagePercent(svc) + '%',
                            background: usageColor(usagePercent(svc)),
                        }"></div>
                    </div>
                    <p class="text-[10px] text-white/50 mt-0.5">
                        Load: {{ usagePercent(svc) }}%
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../../../stores/dashboard.store'

const store = useDashboardStore()
const { service_health } = storeToRefs(store)

const lastUpdated = ref('just now')

const toProperWords = (text) => {
    if (!text) return "";

    return text
        .replace(/[_-]+/g, " ")       // replace _ or - with space
        .toLowerCase()                // convert to lowercase
        .replace(/\b\w/g, char => char.toUpperCase()); // capitalize each word
}

/* ---------------------------------------------------
   Reload Countdown Logic
--------------------------------------------------- */
const countdown = ref(10)
let interval = null

const reloadData = () => {
    store.fetchServicesHealth()
    lastUpdated.value = new Date().toLocaleTimeString()
    countdown.value = 10
}

const startAutoRefresh = () => {
    interval = setInterval(() => {
        countdown.value--

        if (countdown.value <= 0) {
            reloadData()
        }
    }, 1000)
}

const manualReload = () => {
    reloadData()
}

/* ---------------------------------------------------
   Initial Mount
--------------------------------------------------- */
onMounted(() => {
    reloadData()
    startAutoRefresh()
})

/* ---------------------------------------------------
   Mapping + UI Helpers
--------------------------------------------------- */
const mappedServices = computed(() =>
    service_health.value.map(s => ({
        service: s.service,
        status: s.status,
        avgLatencyMs: s.avgLatencyMs ?? 0,
        errorRate: s.errorRate ?? 0,
        inFlight: s.inFlight ?? 0,
        totalRequests: s.totalRequests ?? 0,
        successCount: s.successCount ?? 0,
        errorCount: s.errorCount ?? 0,
    }))
)

const statusDot = s =>
    s === 'UP'
        ? 'bg-emerald-400 animate-pulse'
        : s === 'DEGRADED'
            ? 'bg-yellow-400'
            : 'bg-rose-400'

const statusBadge = s =>
    s === 'UP'
        ? 'bg-emerald-500/15 text-emerald-300'
        : s === 'DEGRADED'
            ? 'bg-yellow-500/15 text-yellow-300'
            : 'bg-rose-500/15 text-rose-300'

const latencyColor = ms =>
    ms < 100
        ? 'text-emerald-300'
        : ms < 300
            ? 'text-yellow-300'
            : 'text-red-300'

/* Load % calculation */
const usagePercent = svc => {
    if (svc.totalRequests === 0) return 0
    const load = Math.min(100, (svc.inFlight / 5) * 100)
    return Math.round(load)
}

const usageColor = load =>
    load < 40
        ? 'linear-gradient(to right, #4ade80, #22d3ee)'
        : load < 70
            ? 'linear-gradient(to right, #fbbf24, #f59e0b)'
            : 'linear-gradient(to right, #f87171, #ef4444)';
</script>
