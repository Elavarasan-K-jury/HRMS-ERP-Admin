<template>
    <div class="rounded-lg bg-white/10 border border-white/15 p-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">

        <!-- Loader -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <UiLoader />
        </div>

        <template v-else>
            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead>
                        <tr
                            class="text-left text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
                            <th class="p-3">Report ID</th>
                            <th class="p-3">Status</th>
                            <th class="p-3">Date Range</th>
                            <th class="p-3">Initiated</th>
                            <th class="p-3">Processing</th>
                            <th class="p-3">Completed</th>
                            <th class="p-3">Failed</th>
                            <th class="p-3 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        <!-- Skeleton Loading State -->
                        <tr v-if="loadingRows" v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="p-3">
                                <div class="skeleton w-32" />
                            </td>
                            <td class="p-3">
                                <div class="skeleton w-20" />
                            </td>
                            <td class="p-3">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="p-3">
                                <div class="skeleton w-36" />
                            </td>
                            <td class="p-3">
                                <div class="skeleton w-28" />
                            </td>
                            <td class="p-3">
                                <div class="skeleton w-28" />
                            </td>
                            <td class="p-3">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="p-3 text-right">
                                <div class="skeleton w-20 ml-auto" />
                            </td>
                        </tr>

                        <!-- Real Data Rows -->
                        <tr v-for="item in items" :key="item.id"
                            class="border-b border-white/5 hover:bg-white/5 transition-colors">

                            <!-- Report ID -->
                            <td class="p-3 font-mono uppercase text-xs">
                                ATT-REP-{{ item.id.slice(-8) }}
                            </td>

                            <!-- Status Chip -->
                            <td class="p-3">
                                <span class="px-2 py-1 rounded-full text-[11px] font-medium border"
                                    :class="statusClass(item.status)">
                                    {{ item.status }}
                                </span>
                            </td>

                            <!-- Date Range -->
                            <td class="p-3 text-xs">
                                <div>
                                    <span class="text-white/60">From:</span> {{ item.start_date || '—' }}
                                </div>
                                <div>
                                    <span class="text-white/60">To:</span> {{ item.end_date || '—' }}
                                </div>
                            </td>

                            <!-- Initiated -->
                            <td class="p-3 text-xs">
                                {{ formatDate(item.initiated_at) }}
                            </td>

                            <!-- Processing -->
                            <td class="p-3 text-xs">
                                {{ formatDate(item.started_at) }}
                            </td>

                            <!-- Completed -->
                            <td class="p-3 text-xs">
                                {{ formatDate(item.completed_at) }}
                            </td>

                            <!-- Failed -->
                            <td class="p-3 text-xs">
                                <div>{{ formatDate(item.failed_at) }}</div>
                                <div class="text-red-300/70 text-[11px]">{{ item.failed_reason || '—' }}</div>
                            </td>

                            <!-- Actions -->
                            <td class="p-3 text-right">
                                <UiButton color="#fff" text="View" size="xs" prepend-icon="ion:eye"
                                    @click="$emit('view', item)" />
                            </td>

                        </tr>

                        <!-- Empty -->
                        <tr v-if="!items.length">
                            <td colspan="8" class="p-6 text-center text-white/50">
                                No reports found.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="flex justify-between items-center mt-4">

                <!-- Count -->
                <p class="text-xs text-white/60">
                    Showing page <span class="text-white">{{ page }}</span>
                    of <span class="text-white">{{ totalPages }}</span>
                    • Total: <span class="text-white">{{ total }}</span> reports
                </p>

                <!-- Buttons -->
                <div class="flex items-center gap-2">
                    <button class="btn-lite" :disabled="page <= 1" @click="changePage(page - 1)">
                        <Icon name="lucide:chevron-left" class="w-4 h-4" />
                        Prev
                    </button>

                    <button class="btn-lite" :disabled="page >= totalPages" @click="changePage(page + 1)">
                        Next
                        <Icon name="lucide:chevron-right" class="w-4 h-4" />
                    </button>
                </div>

            </div>
        </template>

    </div>
</template>

<script setup>
const props = defineProps({
    items: Array,
    loading: Boolean,
    page: Number,
    limit: Number,
    total: Number,
})

const emit = defineEmits(["view", "page-change"])

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(props.total / props.limit))
})

const loadingRows = computed(() => props.loading && !props.items?.length)

function changePage(newPage) {
    emit("page-change", newPage)
}

const formatDate = (iso) => iso ? new Date(iso).toLocaleString() : "—"

const statusClass = (status) => {
    switch (status) {
        case "COMPLETED": return "border-emerald-400/50 text-emerald-200 bg-emerald-500/20"
        case "PROCESSING": return "border-sky-400/50 text-sky-200 bg-sky-500/20"
        case "FAILED": return "border-red-400/50 text-red-200 bg-red-500/20"
        default: return "border-white/40 text-white bg-white/10"
    }
};
</script>

<style scoped>
.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.btn-lite {
    @apply px-3 py-2 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1;
}
</style>
