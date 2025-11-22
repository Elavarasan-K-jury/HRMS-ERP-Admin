<template>
    <div class="rounded-lg p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg" :style="containerStyle">
        <h3 v-if="title" class="text-white/90 font-medium mb-3">{{ title }}</h3>
        <slot />

        <ClientOnly>
            <!-- Use a stable key (route) OR remove key entirely -->
            <apexchart v-if="isReady" ref="chartRef" :key="routeKey" :type="type" :series="stableSeries"
                :options="mergedOptions" :height="heightPx" class="w-full" />
            <template #fallback>
                <div class="h-32 flex items-center justify-center text-white/60 text-sm">
                    Loading chart…
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
    title: String,
    type: { type: String, default: '' },
    series: { type: Array, default: () => [] },
    options: { type: Object, default: () => ({}) },
    height: { type: [String, Number], default: 230 }, // ← make height explicit
})

/* ---------------- Ready gate ---------------- */
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const hasData = computed(() => Array.isArray(props.series) && props.series.length > 0)
const hasOptions = computed(() => props.options && Object.keys(props.options).length > 0)
const isReady = computed(() => mounted.value && !!props.type && hasData.value && hasOptions.value)

/* ---------------- Stable inputs (block updates during teardown) ---------------- */
const tearingDown = ref(false)
const stableSeries = ref(props.series ?? [])
watch(() => props.series, (v) => { if (!tearingDown.value) stableSeries.value = v ?? [] }, { deep: true })

// Merge in safe defaults to avoid DOM-heavy behavior during layout switches
const mergedOptions = computed(() => {
    const base = props.options ?? {}
    const chart = base.chart ?? {}
    return {
        ...base,
        chart: {
            animations: { enabled: false },
            toolbar: { show: false },
            parentHeightOffset: 0,
            ...chart,
        },
    }
})

/* ---------------- Height / container sizing ---------------- */
const heightPx = computed(() => {
    const h = props.height
    return typeof h === 'number' ? h : parseInt(h || 230, 10)
})

const containerStyle = computed(() => ({
    minHeight: `${heightPx.value}px`,
}))

/* ---------------- Keying strategy ---------------- */
// Using route-based key ensures a clean re-mount on navigation/layout change without
// thrashing on every reactive series/options update.
const route = useRoute()
const routeKey = computed(() => route.fullPath)

/* ---------------- Safe destroy on unmount ---------------- */
const chartRef = ref(null)
onBeforeUnmount(() => {
    tearingDown.value = true
    try {
        // vue3-apexcharts exposes inner ApexCharts instance
        chartRef.value?.chart?.destroy?.()
    } catch { }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
