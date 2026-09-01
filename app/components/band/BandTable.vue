<template>
    <!-- Empty state -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-12 flex flex-col items-center justify-center gap-3 text-center">
        <Icon name="ion:git-branch-outline" class="w-10 h-10 opacity-60" />
        <div>
            <p class="text-white/85 font-medium">No Bands found</p>
            <p class="text-xs text-white/50 mt-1 max-w-xs mx-auto">
                {{ searched
                    ? 'Try changing your search.'
                    : 'Create your first band to group designations by job/career level.' }}
            </p>
        </div>
        <UiButton v-if="canCreate && !searched" size="sm" color="#4aff7a" text="Add Band"
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
                        <th class="th">Order</th>
                        <th class="th">Description</th>
                        <th class="th">Designations</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- Skeleton loader -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td"><div class="skeleton w-16" /></td>
                            <td class="td"><div class="skeleton w-8" /></td>
                            <td class="td"><div class="skeleton w-48" /></td>
                            <td class="td"><div class="skeleton w-10" /></td>
                            <td class="td text-right"><div class="skeleton w-16 ml-auto" /></td>
                        </tr>
                    </template>

                    <!-- Data rows -->
                    <tr v-else v-for="band in items" :key="band.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="td align-top">
                            <span class="font-semibold text-white">{{ band.name }}</span>
                        </td>
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1 text-white/80">
                                <Icon name="lucide:list-ordered" class="w-3.5 h-3.5 opacity-70" />
                                {{ band.order ?? 0 }}
                            </span>
                        </td>
                        <td class="td align-top max-w-[300px]">
                            <p class="whitespace-pre-line text-white/90 leading-snug line-clamp-3">
                                {{ band.description || '—' }}
                            </p>
                        </td>
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1 text-white/90">
                                <Icon name="lucide:briefcase" class="w-4 h-4 opacity-80" />
                                {{ band.designation_count || 0 }}
                            </span>
                        </td>
                        <td class="td align-top text-right">
                            <div class="inline-flex items-center justify-end gap-1.5">
                                <button v-if="canEdit" class="btn-icon" title="Edit" @click="$emit('edit', band)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>
                                <button v-if="canDelete" class="btn-icon-danger" title="Delete" @click="$emit('delete', band)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
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
const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    searched: { type: Boolean, default: false },
    canCreate: { type: Boolean, default: true },
    canEdit: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: true },
})

defineEmits(['refresh', 'edit', 'delete', 'create'])
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