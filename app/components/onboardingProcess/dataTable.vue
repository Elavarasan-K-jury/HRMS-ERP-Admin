<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center !w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No onboarding processes found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <!-- Table Wrapper -->
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Process Name</th>
                        <th class="th">Description</th>
                        <th class="th">Steps</th>
                        <th class="th">Estimated Days</th>
                        <th class="th">Organization</th>
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
                                <div class="skeleton w-48" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-64" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-10" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-16" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-40" />
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
                    <tr v-else v-for="process in items" :key="process.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <!-- Name -->
                        <td class="td align-top font-semibold text-white">
                            {{ process.name }}
                            <div class="text-xs text-white/70 mt-1 uppercase">
                                ID: {{ process.id.slice(-6) }}
                            </div>
                        </td>

                        <!-- Description -->
                        <td class="td align-top max-w-[320px]">
                            <p class="whitespace-pre-line leading-snug text-white/90 line-clamp-4 truncate">
                                {{ process.description || '—' }}
                            </p>
                        </td>

                        <!-- Steps -->
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1">
                                <Icon name="lucide:list" class="w-4 h-4 opacity-80" />
                                {{ process.steps_list?.length || process.steps || 0 }}
                            </span>
                        </td>

                        <!-- Estimated Days -->
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1">
                                <Icon name="lucide:calendar-clock" class="w-4 h-4 opacity-80" />
                                {{ process.estimated_days || '—' }}
                            </span>
                        </td>

                        <!-- Organization -->
                        <td class="td align-top">
                            <span class="inline-flex flex-col">
                                <span class="font-medium">{{ process.organization?.name || '—' }}</span>
                                <span class="text-xs text-white/70 uppercase">
                                    ID: {{ process.organization_id?.slice(-6) || '—' }}
                                </span>
                            </span>
                        </td>

                        <!-- Created -->
                        <td class="td align-top">
                            <span class="text-white/80">{{ process.created_at }}</span>
                        </td>

                        <!-- Updated -->
                        <td class="td align-top">
                            <span class="text-white/80">{{ process.updated_at }}</span>
                        </td>

                        <!-- Actions -->
                        <td class="td align-top text-right">
                            <div class="inline-flex flex-col items-center gap-1.5">
                                <button class="btn-icon" title="View" @click="downloadFile(process)">
                                    <Icon name="lucide:download" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon" title="View" @click="$emit('view', process)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon" title="Edit" @click="$emit('edit', process)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon-danger" title="Delete" @click="$emit('delete', process)">
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
import { downloadEncrypted } from "../../utils/encrypt-download";
import { computed } from 'vue'

const config = useRuntimeConfig()

const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
})

defineEmits(['view', 'edit', 'delete', 'prev', 'next'])

const showPagination = computed(() => props.totalPages > 1);

const downloadFile = (data) => {
    downloadEncrypted(data, config.public.encSecret, `onboarding-process-${data.id}`);
};
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
    background: linear-gradient(90deg,
            rgba(255, 255, 255, 0.12),
            rgba(255, 255, 255, 0.22),
            rgba(255, 255, 255, 0.12));
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
