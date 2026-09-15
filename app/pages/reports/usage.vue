<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRuntimeConfig } from "nuxt/app";
import { useAuthStore } from "@/stores/shared/auth.store";
import { useOrganizationStore } from "@/stores/organization/organization.store";

definePageMeta({ layout: "auth" });

/* ---------------- UTILS ---------------- */
const formatIST = (ms) =>
    new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(new Date(ms));

const extractOrgId = (v) =>
    v && typeof v === "object" && "value" in v ? v.value : v;

/* ---------------- STATE ---------------- */
const runtimeConfig = useRuntimeConfig();
const authStore = useAuthStore();
const organizationStore = useOrganizationStore();

const socket = ref(null);
const connected = ref(false);
const loading = ref(true);

const selectedOrgId = ref(null);
const organizations = computed(() => organizationStore.organizations_select);

/* ---------------- KPI STATE ---------------- */
const metrics = ref({
    rps: 0,
    errors: 0,
    avgLatency: 0,
    p95Latency: 0,
});

/* ---------------- TIMESERIES ---------------- */
const timeseries = ref([]);
const MAX_POINTS = 180;

/* ---------------- SOCKET.IO LOADER ---------------- */
function loadSocketIO() {
    return new Promise((resolve, reject) => {
        if (window.io) return resolve(window.io);
        const s = document.createElement("script");
        s.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
        s.onload = () => resolve(window.io);
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

/* ---------------- UI RESET ---------------- */
function resetUI() {
    metrics.value = {
        rps: 0,
        errors: 0,
        avgLatency: 0,
        p95Latency: 0,
    };
    timeseries.value = [];
}

/* ---------------- SOCKET CONNECT ---------------- */
async function connectSocket(orgId = null) {
    const io = await loadSocketIO();

    socket.value = io(runtimeConfig.public.apiUsageUrl, {
        transports: ["websocket"],
        auth: {
            token: authStore.accessToken,
            organizationId: orgId,
        },
    });

    socket.value.removeAllListeners();

    socket.value.on("connect", () => {
        connected.value = true;
        loading.value = false;
    });

    socket.value.on("disconnect", () => {
        connected.value = false;
    });

    /* -------- INITIAL SNAPSHOT -------- */
    socket.value.on("usage:timeseries", (payload = []) => {
        timeseries.value = payload
            .map(p => ({
                ts: Number(p.ts),
                rps: p.requests ?? p.rps ?? 0,
                errors: p.errors ?? 0,
                latency: p.avgLatency ?? 0,
            }))
            .slice(-MAX_POINTS);
    });

    /* -------- REALTIME METRICS -------- */
    socket.value.on("usage:metrics", (p) => {
        metrics.value = {
            rps: p.rps ?? metrics.value.rps,
            errors: p.errors ?? metrics.value.errors,
            avgLatency: p.avgLatency ?? metrics.value.avgLatency,
            p95Latency: p.p95Latency ?? metrics.value.p95Latency,
        };

        timeseries.value.push({
            ts: p.ts || Date.now(),
            rps: p.rps ?? 0,
            errors: p.errors ?? 0,
            latency: p.avgLatency ?? 0,
        });

        if (timeseries.value.length > MAX_POINTS) {
            timeseries.value.shift();
        }
    });
}

/* ---------------- SOCKET DISCONNECT ---------------- */
function disconnectSocket() {
    if (socket.value) {
        socket.value.disconnect();
        socket.value = null;
    }
}

/* ---------------- ORG SWITCH ---------------- */
watch(selectedOrgId, async (val) => {
    const orgId = extractOrgId(val);

    loading.value = true;
    connected.value = false;

    disconnectSocket();
    resetUI();

    await connectSocket(orgId || null);
});

/* ---------------- LIFECYCLE ---------------- */
onMounted(async () => {
    await organizationStore.fetchOrganizationsForSelect();
    await connectSocket(null); // GLOBAL VIEW
});

onBeforeUnmount(() => {
    disconnectSocket();
});

/* ---------------- CHART SERIES ---------------- */
const trafficSeries = computed(() => [
    {
        name: "Requests/sec",
        data: timeseries.value.map(p => [p.ts, p.rps]),
    },
    {
        name: "Errors",
        data: timeseries.value.map(p => [p.ts, p.errors]),
    },
]);

const latencySeries = computed(() => [
    {
        name: "Avg Latency (ms)",
        data: timeseries.value.map(p => [p.ts, p.latency]),
    },
]);

/* ---------------- CHART OPTIONS ---------------- */
const baseChart = {
    animations: {
        enabled: true,
        easing: "linear",
        dynamicAnimation: { speed: 60 },
    },
    toolbar: { show: false },
    zoom: { enabled: false },
    background: "transparent",
};

const trafficOptions = {
    chart: { ...baseChart, type: "area", stacked: true },
    theme: { mode: "dark" },
    stroke: { curve: "smooth", width: 3 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.5, opacityTo: 0.1 } },
    colors: ["#22d3ee", "#fb7185"],
    xaxis: { type: "datetime", labels: { formatter: formatIST } },
    tooltip: { x: { formatter: formatIST } },
};

const latencyOptions = {
    chart: { ...baseChart, type: "line" },
    theme: { mode: "dark" },
    stroke: { curve: "smooth", width: 4 },
    colors: ["#a78bfa"],
    xaxis: { type: "datetime", labels: { formatter: formatIST } },
    tooltip: { x: { formatter: formatIST } },
};
</script>

<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll">
        <div class="h-full p-4 rounded-lg bg-white/10 border border-white/20 space-y-4">

            <!-- HEADER -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white">Realtime Traffic</h1>
                    <p class="text-slate-400 text-sm">
                        {{ selectedOrgId ? "Organization scoped" : "All organizations" }} • IST
                    </p>
                </div>

                <div class="flex gap-2 items-center">
                    <FormSelect v-model="selectedOrgId" placeholder="All organizations" :options="organizations"
                        color="#fff" />

                    <span class="px-4 py-1 rounded-full text-sm font-medium" :class="connected
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'">
                        {{ connected ? "LIVE" : "OFFLINE" }}
                    </span>
                </div>
            </div>

            <!-- KPIs -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="card">
                    <div class="label">RPS</div>
                    <div class="value">{{ metrics.rps }}</div>
                </div>

                <div class="card">
                    <div class="label">Errors</div>
                    <div class="value text-red-400">{{ metrics.errors }}</div>
                </div>

                <div class="card">
                    <div class="label">Avg Latency</div>
                    <div class="value">{{ metrics.avgLatency }} ms</div>
                </div>

                <div class="card">
                    <div class="label">P95 Latency</div>
                    <div class="value">{{ metrics.p95Latency }} ms</div>
                </div>
            </div>

            <!-- CHARTS -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div class="card">
                    <h2 class="title">Traffic Flow</h2>
                    <apexchart height="320" :options="trafficOptions" :series="trafficSeries" />
                </div>

                <div class="card">
                    <h2 class="title">Latency Movement</h2>
                    <apexchart height="320" :options="latencyOptions" :series="latencySeries" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    @apply bg-white/5 border border-white/10 rounded-lg p-4;
}

.label {
    @apply text-slate-400 text-xs uppercase;
}

.value {
    @apply text-2xl font-bold text-white;
}

.title {
    @apply text-white font-semibold mb-2;
}
</style>
