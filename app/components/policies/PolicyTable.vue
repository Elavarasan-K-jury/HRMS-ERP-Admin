<template>
    <!-- Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No attendance policies found.</span>
    </div>

    <!-- Table -->
    <div v-else class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Policy Name</th>
                        <th class="th">Grace (min)</th>
                        <th class="th">Half Day (min)</th>
                        <th class="th">Full Day (min)</th>
                        <th class="th">Geo Check-in</th>
                        <th class="th">Auto Absent</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- Skeleton Loader -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-14" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-14" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-14" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-10" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-10" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- Data Rows -->
                    <tr v-else v-for="p in items" :key="p.id"
                        class="border-b border-white/5 hover:bg-white/5 transition">

                        <td class="td">{{ p.name }}</td>
                        <td class="td">{{ p.grace_minutes }}</td>
                        <td class="td">{{ p.half_day_minutes }}</td>
                        <td class="td">{{ p.full_day_minutes }}</td>

                        <td class="td">
                            <span class="px-2 py-1 rounded-lg text-xs"
                                :class="p.allow_geo_checkin ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'">
                                {{ p.allow_geo_checkin ? 'Yes' : 'No' }}
                            </span>
                        </td>

                        <td class="td">
                            <span class="px-2 py-1 rounded-lg text-xs"
                                :class="p.auto_mark_absent ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'">
                                {{ p.auto_mark_absent ? 'Yes' : 'No' }}
                            </span>
                        </td>

                        <td class="td text-right">
                            <div class="inline-flex gap-1.5">
                                <button class="btn-icon" @click="$emit('view', p)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon" @click="$emit('edit', p)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
defineProps({
    items: Array,
    loading: Boolean,
    total: Number
});
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 text-white/90 align-middle;
}

.btn-icon {
    @apply p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}

.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>
