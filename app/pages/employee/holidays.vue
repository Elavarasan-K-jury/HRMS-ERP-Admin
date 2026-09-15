<template>
    <div class="min-h-screen text-white p-2">
        <div class="max-w-full px-4 py-3 rounded-lg backdrop-blur-2xl border border-white/30 mx-auto space-y-6">

            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p class="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                        HRMS SYSTEM
                    </p>

                    <h1
                        class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Holiday Calendar {{ year }}
                    </h1>

                    <p class="text-sm text-slate-400 mt-2">
                        Company holidays, restricted holidays, and optional events for the year.
                    </p>
                </div>

                <!-- Year Navigation -->
                <div class="flex items-center gap-3">

                    <button @click="prevYear"
                        class="group rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm flex items-center gap-2">
                        <span class="group-hover:-translate-x-1 transition">←</span>
                        {{ year - 1 }}
                    </button>

                    <div class="rounded-lg bg-white px-5 py-2 text-base text-slate-900 font-bold shadow-xl">
                        {{ year }}
                    </div>

                    <button @click="nextYear"
                        class="group rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm flex items-center gap-2">
                        {{ year + 1 }}
                        <span class="group-hover:translate-x-1 transition">→</span>
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    class="card-green bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                    <p class="label">Holidays</p>
                    <p class="value">{{ stats.holiday }}</p>
                </div>
                <div class="card-amber bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                    <p class="label">Restricted</p>
                    <p class="value">{{ stats.restricted }}</p>
                </div>
                <div class="card-sky bg-gradient-to-br from-sky-500/10 to-sky-600/5 border border-sky-500/20">
                    <p class="label">Optional</p>
                    <p class="value">{{ stats.optional }}</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex flex-wrap gap-2">
                    <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value"
                        :class="buttonFilterClass(f.value === activeFilter)">
                        {{ f.label }}
                    </button>
                </div>
            </div>

            <!-- Table -->
            <div class="rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">

                <div class="table-header">
                    <div class="grid grid-cols-11 gap-4 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                        <div class="col-span-2">Date</div>
                        <div class="col-span-4">Holiday</div>
                        <div class="col-span-4 text-end">Region</div>
                        <div class="col-span-1 text-center">Type</div>
                    </div>
                </div>

                <div v-if="groupedHolidays.length" class="divide-y divide-white/5">
                    <div v-for="month in groupedHolidays" :key="month.month">
                        <div class="month-title">{{ month.month }}</div>

                        <div v-for="h in month.items" :key="h.id" class="holiday-row">
                            <div class="col-span-2">
                                <div class="date-text">{{ h.dateDisplay }}</div>
                                <div class="weekday">{{ h.weekday }}</div>
                            </div>

                            <div class="col-span-4">
                                <div class="name">{{ h.name }}</div>
                                <div class="desc" v-if="h.description">{{ h.description }}</div>
                            </div>

                            <div class="col-span-4 text-end region">
                                {{ h.region || 'All Locations' }}
                            </div>

                            <div class="col-span-1 flex items-center justify-center">
                                <span class="badge" :class="badgeClass(h.type)">
                                    <span class="dot" :class="dotClass(h.type)"></span>
                                    {{ typeLabel(h.type) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="px-6 py-12 text-center text-slate-400 text-sm">
                    No holidays found for this filter.
                </div>

            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useHolidayOrgStore } from '../../stores/organization/holidayOrg.store'

definePageMeta({ layout: 'auth' })

const store = useHolidayOrgStore()
const { holidays, loading, filter_year } = storeToRefs(store)

const year = computed({
    get: () => filter_year.value,
    set: (v) => filter_year.value = v
})

const activeFilter = ref('all')

/* ---- Fetch on Mount ---- */
onMounted(() => {
    store.fetchAllHolidays()
})

/* ---- Filter by active filter + year ---- */
const filtered = computed(() => {
    return store.getHolidaysByYear()
        .filter(h => activeFilter.value === 'all' || h.type === activeFilter.value)
        .map(h => {
            const d = new Date(h.date)
            return {
                ...h,
                month: d.toLocaleString('en-US', { month: 'long' }),
                dateDisplay: d.toLocaleString('en-US', { day: '2-digit', month: 'short' }),
                weekday: d.toLocaleString('en-US', { weekday: 'short' })
            }
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
})

/* ---- Group by month ---- */
const groupedHolidays = computed(() => {
    const groups = {}
    filtered.value.forEach(h => {
        if (!groups[h.month]) groups[h.month] = []
        groups[h.month].push(h)
    })
    return Object.entries(groups).map(([month, items]) => ({ month, items }))
})

/* ---- Stats ---- */
const stats = computed(() => {
    const list = store.getHolidaysByYear()
    return {
        holiday: list.filter(h => h.type === 'PUBLIC').length,
        restricted: list.filter(h => h.type === 'RESTRICTED').length,
        optional: list.filter(h => h.type === 'OPTIONAL').length
    }
})

/* ---- UI Helpers ---- */
const typeLabel = t => ({
    holiday: 'Holiday',
    restricted: 'Restricted',
    optional: 'Optional'
}[t] || t)

const badgeClass = t => ({
    holiday: 'badge-green',
    restricted: 'badge-amber',
    optional: 'badge-sky'
}[t] || '')


/* ---- Year Navigation ---- */
const prevYear = () => year.value--
const nextYear = () => year.value++
const dotClass = t => ({
    public: 'dot-green',
    restricted: 'dot-amber',
    optional: 'dot-sky'
}[t.toLowerCase()] || '');
</script>

<style scoped>
.card-green {
    @apply rounded-lg p-6 bg-emerald-500/10 border border-emerald-500/20;
}

.card-amber {
    @apply rounded-lg p-6 bg-amber-500/10 border border-amber-500/20;
}

.card-sky {
    @apply rounded-lg p-6 bg-sky-500/10 border border-sky-500/20;
}

.label {
    @apply text-xs uppercase tracking-widest opacity-70 mb-2;
}

.value {
    @apply text-4xl font-bold text-white;
}

.table-header {
    @apply bg-white/5 border-b border-white/10 px-6 py-4;
}

.month-title {
    @apply px-6 py-4 text-xs uppercase tracking-widest text-slate-300 font-bold bg-white/5;
}

.holiday-row {
    @apply grid grid-cols-11 gap-4 px-6 py-4 hover:bg-white/5 transition;
}

.date-text {
    @apply font-mono text-sm font-semibold;
}

.weekday {
    @apply text-xs text-slate-400;
}

.name {
    @apply font-semibold text-white;
}

.desc {
    @apply text-xs text-slate-400 mt-1;
}

.region {
    @apply text-sm text-slate-300;
}

.badge {
    @apply inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border;
}

.badge-green {
    @apply border-emerald-400/40 bg-emerald-500/10 text-emerald-300;
}

.badge-amber {
    @apply border-amber-400/40 bg-amber-500/10 text-amber-300;
}

.badge-sky {
    @apply border-sky-400/40 bg-sky-500/10 text-sky-300;
}

.dot {
    @apply h-1.5 w-1.5 rounded-full;
}

.dot-green {
    @apply bg-emerald-400;
}

.dot-amber {
    @apply bg-amber-400;
}

.dot-sky {
    @apply bg-sky-400;
}
</style>
