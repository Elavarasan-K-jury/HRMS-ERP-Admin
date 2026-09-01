<template>
    <!-- Empty state -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-12 flex flex-col items-center justify-center gap-3 text-center">
        <Icon name="heroicons:currency-dollar" class="w-10 h-10 opacity-60" />
        <div>
            <p class="text-white/85 font-medium">No Pay Grades found</p>
            <p class="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                {{ searched
                    ? 'Try changing your search.'
                    : 'Create your first pay grade to organize employees based on salary grade.' }}
            </p>
        </div>
        <UiButton v-if="canCreate && !searched" size="sm" color="#4aff7a" text="Add Pay Grade"
            prepend-icon="ion:add-circle" @click="$emit('create')" />
    </div>

    <!-- Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Name</th>
                        <th class="th">Description</th>
                        <th class="th">Employees</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- Skeleton loader -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td"><div class="skeleton w-28" /></td>
                            <td class="td"><div class="skeleton w-48" /></td>
                            <td class="td"><div class="skeleton w-10" /></td>
                            <td class="td text-right"><div class="skeleton w-16 ml-auto" /></td>
                        </tr>
                    </template>

                    <!-- Data rows -->
                    <tr v-else v-for="pg in items" :key="pg.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="td align-top">
                            <span class="font-semibold text-white">{{ pg.name }}</span>
                        </td>
                        <td class="td align-top max-w-[300px]">
                            <p class="whitespace-pre-line text-white/90 leading-snug line-clamp-3">
                                {{ pg.description || '—' }}
                            </p>
                        </td>
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1 text-white/90">
                                <Icon name="lucide:users" class="w-4 h-4 opacity-80" />
                                {{ pg.employee_count || 0 }}
                            </span>
                        </td>
                        <td class="td align-top text-right">
                            <div class="inline-flex items-center justify-end gap-1.5">
                                <button v-if="canEdit" class="btn-icon" title="Edit" @click="$emit('edit', pg)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>
                                <button v-if="canDelete" class="btn-icon-danger" title="Delete" @click="$emit('delete', pg)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="showPagination"
            class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10 bg-white/5">
            <div class="text-xs text-white/70">
                <span class="text-white">{{ startIndex }} to {{ endIndex }}</span> of
                <span class="text-white">{{ total }}</span>
                <span class="mx-1 opacity-50">•</span>
                Page <span class="text-white">{{ page }}</span> of
                <span class="text-white">{{ totalPages }}</span>
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
    limit: { type: Number, default: 10 },
    searched: { type: Boolean, default: false },
    canCreate: { type: Boolean, default: true },
    canEdit: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: true },
})

defineEmits(['refresh', 'edit', 'delete', 'prev', 'next', 'create'])

const showPagination = computed(() => props.totalPages > 1)
const startIndex = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.limit + 1))
const endIndex = computed(() => Math.min(props.page * props.limit, props.total))
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 align-middle text-white/90;
}

.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}

.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}

.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}

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