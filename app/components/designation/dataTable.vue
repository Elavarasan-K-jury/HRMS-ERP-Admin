<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center !w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No designations found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <!-- Header -->
        <!-- <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
            <h3 class="text-white/90 font-semibold tracking-wide">Designations</h3>

            <div class="flex items-center gap-2">
                <slot name="left-actions" />
                <button class="px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 transition text-white"
                    @click="$emit('refresh')" :disabled="loading" title="Refresh">
                    <Icon :name="loading ? 'ion:sync-outline' : 'lucide:refresh-ccw'"
                        :class="loading ? 'animate-spin' : ''" class="w-4 h-4 inline-block align-[-2px]" />
                    <span class="ml-1 hidden sm:inline">Refresh</span>
                </button>
            </div>
        </div> -->

        <!-- Table Wrapper -->
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Designation / Level</th>
                        <th class="th">Organization</th>
                        <th class="th">Department</th>
                        <th class="th">Employees</th>
                        <th class="th">Description</th>
                        <th class="th">Created</th>
                        <th class="th">Updated</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- 🔄 Skeleton Loader -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-32" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-12" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-56" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Data Rows -->
                    <tr v-else v-for="desig in items" :key="desig.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <!-- Designation -->
                        <td class="td align-top">
                            <div class="font-semibold text-white">{{ desig.name }}</div>
                            <div class="text-xs text-white/70">Level: {{ desig.level || '—' }}</div>
                        </td>

                        <!-- Organization -->
                        <td class="td align-top">
                            <div class="font-semibold text-white/90">
                                {{ desig.organization?.name || '—' }}
                            </div>
                            <a v-if="desig.organization?.domain" :href="desig.organization.domain" target="_blank"
                                rel="noopener noreferrer" class="text-xs text-white/70 hover:text-white break-all">
                                {{ desig.organization.domain }}
                            </a>
                            <div class="text-xs flex items-center text-white/70 mt-1">
                                <Icon name="lucide:mail" class="w-3.5 h-3.5 inline-block mr-1 opacity-80" />
                                {{ desig.organization?.email || '—' }}
                            </div>
                        </td>

                        <!-- Department -->
                        <td class="td align-top">
                            <span class="inline-flex flex-col">
                                <span class="font-medium">{{ desig.department?.name || '—' }}</span>
                                <span class="text-xs text-white/70">Code: {{ desig.department?.code || '—' }}</span>
                            </span>
                        </td>

                        <!-- Employees -->
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1 text-white/90">
                                <Icon name="lucide:users" class="w-4 h-4 opacity-80" />
                                {{ desig.employee_count || 0 }}
                            </span>
                        </td>

                        <!-- Description -->
                        <td class="td align-top max-w-[300px]">
                            <p class="whitespace-pre-line text-white/90 leading-snug line-clamp-4 truncate">
                                {{ desig.description || '—' }}
                            </p>
                        </td>

                        <!-- Created -->
                        <td class="td align-top">
                            <span class="text-white/80">{{ formatDate(desig.created_at) }}</span>
                        </td>

                        <!-- Updated -->
                        <td class="td align-top">
                            <span class="text-white/80">{{ formatDate(desig.updated_at) }}</span>
                        </td>

                        <!-- Actions -->
                        <td class="td align-top text-center">
                            <div class="inline-flex flex-col items-center gap-1.5">
                                <button class="btn-icon" title="View" @click="$emit('view', desig)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon" title="Edit" @click="$emit('edit', desig)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon-danger" title="Delete" @click="$emit('delete', desig)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 📄 Pagination -->
        <div v-if="showPagination"
            class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10 bg-white/5">
            <div class="text-xs text-white/70">
                Page <span class="text-white">{{ page }}</span> of
                <span class="text-white">{{ totalPages }}</span> —
                <span class="text-white">{{ total }}</span> results
            </div>

            <div class="flex items-center gap-1.5">
                <button class="btn-lite" :disabled="page <= 1 || loading" @click="$emit('prev')">
                    <Icon name="lucide:chevron-left" class="w-4 h-4" /> Prev
                </button>
                <button class="btn-lite" :disabled="page >= totalPages || loading" @click="$emit('next')">
                    Next
                    <Icon name="lucide:chevron-right" class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
})

defineEmits(['refresh', 'view', 'edit', 'delete', 'prev', 'next'])
const showPagination = computed(() => props.totalPages > 1)

/** 🕒 Format date safely */
function formatDate(date) {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    } catch {
        return date
    }
}
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 align-middle text-white/90;
}

/* Buttons */
.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}

.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}

.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}

/* Skeleton shimmer */
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
</style>
