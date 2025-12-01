<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No asset models found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                        <th class="th">Brand</th>
                        <th class="th">Model</th>
                        <th class="th">Code</th>
                        <th class="th">Category</th>
                        <th class="th">Description</th>
                        <th class="th">Status</th>
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
                                <div class="skeleton w-32" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-36" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-60" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-20" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-28" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-28" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Data Rows -->
                    <tr v-else v-for="item in items" :key="item.id"
                        class="border-b border-white/5 hover:bg-white/5 transition">
                        <!-- Brand -->
                        <td class="td font-semibold capitalize">
                            {{ item.brand || '—' }}
                            <div class="text-xs text-white/70 mt-1">
                                ID: {{ item.id.slice(-8) }}
                            </div>
                        </td>

                        <!-- Model Name -->
                        <td class="td">{{ item.model_name || '—' }}</td>

                        <!-- Code -->
                        <td class="td">{{ item.code || '—' }}</td>

                        <!-- Category Name -->
                        <td class="td">
                            {{ item.category?.name || '—' }}
                        </td>

                        <!-- Description -->
                        <td class="td">
                            <div v-html="item.description || '—'"></div>
                        </td>

                        <!-- Status -->
                        <td class="td">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="item.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'">
                                <Icon :name="item.is_active ? 'lucide:check-circle' : 'lucide:x-circle'"
                                    class="w-3.5 h-3.5" />
                                {{ item.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>

                        <!-- Created -->
                        <td class="td">{{ format(item.created_at) }}</td>

                        <!-- Updated -->
                        <td class="td">{{ format(item.updated_at) }}</td>

                        <!-- Actions -->
                        <td class="td text-right">
                            <div class="inline-flex flex-col items-center gap-1.5">
                                <button class="btn-icon" title="View" @click="$emit('view', item)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button>

                                <button class="btn-icon" title="Edit" @click="$emit('edit', item)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>

                                <button class="btn-icon-danger" title="Delete" @click="$emit('delete', item)">
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
import { computed } from "vue";

const props = defineProps({
    items: Array,
    loading: Boolean,
    total: Number,
    page: Number,
    totalPages: Number,
});

defineEmits(["view", "edit", "delete", "prev", "next"]);

const showPagination = computed(() => props.totalPages > 1);

function format(dt) {
    return dt ? new Date(dt).toLocaleString() : "—";
}
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
