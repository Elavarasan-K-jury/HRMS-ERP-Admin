<template>
    <div v-if="!preloader" class="min-h-screen p-2">
        <div class="bg-white/10 border border-white/20 rounded-lg p-2">

            <!-- HEADER -->
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white">Traffic Analytics</h1>
                    <p class="text-slate-400 text-sm">
                        {{ granularity === 'hourly'
                            ? 'Hourly (last 24h)'
                            : `Daily (last ${trafficStore.days} days)` }}
                    </p>
                </div>

                <div class="flex gap-2">
                    <button @click="setHourly" :class="btnClass(granularity === 'hourly')">Hourly</button>
                    <!-- <button @click="setDaily(7)"
                        :class="btnClass(granularity === 'daily' && trafficStore.days === 7)">7d</button> -->
                    <button @click="setDaily(30)"
                        :class="btnClass(granularity === 'daily' && trafficStore.days === 30)">30d</button>
                </div>
            </div>

            <!-- KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 mb-2">
                <TrafficKpi title="Requests" icon="mdi:chart-line" color="blue">
                    {{ trafficStore.overview.totals.requests.toLocaleString() }}
                </TrafficKpi>

                <TrafficKpi title="Errors" icon="mdi:alert-circle-outline" color="red">
                    {{ trafficStore.overview.totals.errors.toLocaleString() }}
                </TrafficKpi>

                <TrafficKpi title="Error Rate" icon="mdi:percent-outline" color="amber">
                    {{ trafficStore.overview.totals.errorRate.toFixed(2) }}%
                </TrafficKpi>

                <TrafficKpi title="Avg Latency" icon="mdi:timer-outline" color="emerald">
                    {{ trafficStore.latency.avgLatencyMs }} ms
                </TrafficKpi>
            </div>

            <!-- MAIN GRID -->
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-2">

                <!-- LEFT -->
                <div class="xl:col-span-2 space-y-2">

                    <!-- TREND -->
                    <div class="card">
                        <h2 class="card-title">Traffic Trend</h2>
                        <apexchart type="area" height="300" :options="trendOptions" :series="trendSeries" />
                    </div>

                    <!-- LATENCY -->
                    <div class="card">
                        <h2 class="card-title">Latency</h2>
                        <apexchart type="line" height="280" :options="latencyOptions" :series="latencySeries" />
                    </div>

                    <!-- ROUTES -->
                    <div class="card">
                        <h2 class="card-title">Top Routes</h2>
                        <apexchart type="bar" height="300" :options="routesOptions" :series="routesSeries" />
                    </div>
                </div>

                <!-- RIGHT -->
                <div class="space-y-2">

                    <!-- SERVICES -->
                    <div class="card">
                        <h2 class="card-title">Service Health</h2>
                        <div v-for="s in trafficStore.serviceHealth" :key="s.name" class="row">
                            <span>{{ s.name }}</span>
                            <span :class="statusClass(s.status)">{{ s.status }}</span>
                        </div>
                    </div>

                    <!-- ERRORS -->
                    <div class="card">
                        <h2 class="card-title">Errors</h2>
                        <apexchart type="radialBar" height="240" :options="errorOptions" :series="errorSeries" />
                    </div>

                    <!-- ALERTS -->
                    <div class="card h-[445px] overflow-hidden overflow-y-scroll">
                        <h2 class="card-title">Alerts</h2>
                        <div v-if="alerts.length === 0" class="text-slate-400 text-sm">No alerts</div>
                        <div v-for="a in alerts" :key="a.id" class="alert">
                            <p class="text-white text-sm">{{ a.message }}</p>
                            <span class="text-xs text-slate-400">{{ a.time }}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- LOADER -->
    <div v-else class="h-screen flex items-center justify-center bg-slate-950">
        <div class="loader"></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/shared/theme.store'
import { useTrafficReportsStore } from '@/stores/super-admin/trafficReports.store'

definePageMeta({ layout: 'auth' })

const themeStore = useThemeStore()
const trafficStore = useTrafficReportsStore()
const preloader = computed(() => themeStore.preloader)

const granularity = ref('hourly')
let refreshTimer

/* ---------------- ACTIONS ---------------- */
const setHourly = async () => {
    granularity.value = 'hourly'
    trafficStore.days = 1
    await trafficStore.fetchAll()
}

const setDaily = async (days) => {
    granularity.value = 'daily'
    trafficStore.days = days
    await trafficStore.fetchAll()
}

/* ---------------- AUTO REFRESH ---------------- */
onMounted(async () => {
    await setHourly()
    refreshTimer = setInterval(() => trafficStore.fetchAll(), 2000)
})
onUnmounted(() => clearInterval(refreshTimer))

/* ---------------- DATA ---------------- */
const trendXY = computed(() =>
    trafficStore.overview.trend.map(t => ({
        x: new Date(t.date).getTime(),
        req: t.requests,
        err: t.errors,
        avg: t.avgLatencyMs ?? 0,
        p95: t.p95LatencyMs ?? 0,
        p99: t.p99LatencyMs ?? 0
    }))
)

/* ---------------- CHARTS ---------------- */
const trendSeries = computed(() => [
    { name: 'Requests', data: trendXY.value.map(p => [p.x, p.req]) },
    { name: 'Errors', data: trendXY.value.map(p => [p.x, p.err]) }
])

const trendOptions = {
    theme: { mode: 'dark' },
    chart: { stacked: true, toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
    colors: ['#60a5fa', '#f87171'],
    xaxis: { type: 'datetime' }
}

const latencySeries = computed(() => [
    { name: 'Avg', data: trendXY.value.map(p => [p.x, p.avg]) },
    { name: 'p95', data: trendXY.value.map(p => [p.x, p.p95]) },
    { name: 'p99', data: trendXY.value.map(p => [p.x, p.p99]) }
])

const latencyOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    theme: { mode: 'dark' },
    stroke: { width: [3, 2, 2], dashArray: [0, 6, 10] },
    colors: ['#38bdf8', '#fbbf24', '#ef4444'],
    xaxis: { type: 'datetime' }
}

const routesSeries = computed(() => [{
    name: 'Requests',
    data: trafficStore.topRoutes.map(r => r.requests)
}])

const routesOptions = computed(() => ({
    theme: { mode: 'dark' },
    chart: { background: 'transparent', toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    colors: ['#60a5fa'],
    xaxis: {
        categories: trafficStore.topRoutes.map(r => `${r.method} ${r.path}`)
    }
}))

const errorSeries = computed(() => trafficStore.errorBreakdown)

const errorOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    theme: { mode: 'dark' },
    labels: ['5xx', '4xx', '2xx'],
    colors: ['#ef4444', '#f59e0b', '#22c55e'],
    plotOptions: {
        radialBar: {
            hollow: { size: '55%' }
        }
    }
}

const alerts = computed(() =>
    trafficStore.alerts.map(a => ({
        id: a.id,
        message: a.message,
        time: new Date(a.triggeredAt).toLocaleString()
    }))
)

const statusClass = (s) =>
    s === 'healthy' ? 'text-emerald-400'
        : s === 'degraded' ? 'text-amber-400'
            : 'text-red-400'

const btnClass = (active) =>
    active
        ? 'px-3 py-1 bg-blue-500/20 text-blue-400 rounded'
        : 'px-3 py-1 text-slate-400 hover:bg-slate-800 rounded';
</script>

<style scoped>
.card {
    @apply bg-white/5 border border-slate-800/50 rounded-lg p-4;
}

.card-title {
    @apply text-white font-semibold mb-3;
}

.row {
    @apply flex justify-between text-sm py-1;
}

.alert {
    @apply bg-slate-800/40 rounded p-2 mb-2;
}

.loader {
    @apply w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin;
}
</style>
