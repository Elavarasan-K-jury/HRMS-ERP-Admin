<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No salary templates found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">

        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Template Name</th>
                        <th class="th">Departments</th>
                        <th class="th">Designations</th>
                        <th class="th">Default</th>
                        <th class="th">Status</th>
                        <th class="th">Created</th>
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
                                <div class="skeleton w-32" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-32" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-12" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-16" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Actual Data Rows -->
                    <tr v-else v-for="item in items" :key="item.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">

                        <!-- Template Name -->
                        <td class="td font-semibold text-white">
                            {{ item.name || '—' }}
                            <div v-if="item.description" class="text-xs text-white/70 mt-1 line-clamp-2"
                                v-html="shortDescription(item.description)" />
                        </td>

                        <!-- Departments -->
                        <td class="td align-top">
                            <div class="flex flex-wrap gap-1">
                                <span v-for="d in item.departments?.slice(0, 3)" :key="d" class="tag">{{ d }}</span>
                                <span v-if="item.departments?.length > 3" class="tag">+{{ item.departments.length - 3
                                    }}</span>
                                <span v-if="!item.departments?.length" class="text-white/50 text-xs">—</span>
                            </div>
                        </td>

                        <!-- Designations -->
                        <td class="td align-top">
                            <div class="flex flex-wrap gap-1">
                                <span v-for="des in item.designations?.slice(0, 3)" :key="des" class="tag">{{ des
                                    }}</span>
                                <span v-if="item.designations?.length > 3" class="tag">+{{ item.designations.length - 3
                                    }}</span>
                                <span v-if="!item.designations?.length" class="text-white/50 text-xs">—</span>
                            </div>
                        </td>

                        <!-- Default Flag -->
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="item.isDefault
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-white/10 text-white/80'">
                                <Icon :name="item.isDefault ? 'lucide:star' : 'lucide:minus'" class="w-3.5 h-3.5" />
                                {{ item.isDefault ? 'Default' : '—' }}
                            </span>
                        </td>

                        <!-- Status -->
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="item.isActive
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-red-500/20 text-red-300'">
                                <Icon :name="item.isActive ? 'lucide:check-circle' : 'lucide:x-circle'"
                                    class="w-3.5 h-3.5" />
                                {{ item.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </td>

                        <!-- Created At -->
                        <td class="td align-top text-xs uppercase">
                            {{ formatDate(item.createdAt) }}
                        </td>

                        <!-- Actions -->
                        <td class="td text-right align-top">
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
import { computed } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
})

defineEmits(["view", "edit", "delete", "prev", "next"])

const showPagination = computed(() => props.totalPages > 1)

const formatDate = (date) => {
    if (!date) return "—"
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit"
    })
}

/* Remove HTML and clamp */
function shortDescription(html) {
    if (!html) return ""
    const text = html.replace(/<\/?[^>]+(>|$)/g, "").trim()
    return text.length > 80 ? text.slice(0, 80) + "…" : text
}
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 align-middle text-white/90;
}

.tag {
    @apply inline-flex px-2 py-0.5 rounded-lg bg-white/10 text-white/70 text-xs;
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
    background: linear-gradient(90deg, rgba(255, 255, 255, .12),
            rgba(255, 255, 255, .22),
            rgba(255, 255, 255, .12));
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
