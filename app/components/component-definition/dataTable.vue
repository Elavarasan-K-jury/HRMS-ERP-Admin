<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No salary components found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <!-- Table Wrapper -->
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Name</th>
                        <th class="th">Type</th>
                        <!-- <th class="th">Category</th> -->
                        <th class="th">Formula</th>
                        <th class="th">Taxable</th>
                        <th class="th">Order</th>
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
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-32" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-20" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-12" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-10" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-16" />
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
                    <tr v-else v-for="item in items" :key="item.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">

                        <!-- Name + Description hint -->
                        <td class="td align-top font-semibold text-white">
                            {{ `${item.name} ${item.key ? `( ${item.key} )` : ''}` || '—' }}
                            <div v-if="item.description" class="text-xs text-white/70 mt-1 line-clamp-2"
                                v-html="shortDescription(item.description)" />
                        </td>

                        <!-- Type -->
                        <td class="td align-top">
                            <span
                                class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium capitalize"
                                :class="typeClass(item.type)">
                                {{ item.type || '—' }}
                            </span>
                        </td>

                        <!-- Category -->
                        <!-- <td class="td align-top capitalize">
                            {{ item.category || 'standard' }}
                        </td> -->

                        <!-- Formula -->
                        <td class="td align-top">
                            <div v-if="item.defaultFormula" class="text-xs text-white/80 truncate max-w-[220px]"
                                :title="item.defaultFormula">
                                {{ item.defaultFormula }}
                            </div>
                            <span v-else class="text-xs text-white/50">—</span>
                        </td>

                        <!-- Taxable -->
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="item.isTaxable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'">
                                <Icon :name="item.isTaxable ? 'lucide:check-circle' : 'lucide:minus-circle'"
                                    class="w-3.5 h-3.5" />
                                {{ item.isTaxable ? 'Taxable' : 'Non-taxable' }}
                            </span>
                        </td>

                        <!-- Display Order -->
                        <td class="td align-top text-center">
                            {{ item.displayOrder ?? '—' }}
                        </td>

                        <!-- Status -->
                        <td class="td align-top">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="item.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'">
                                <Icon :name="item.isActive ? 'lucide:check-circle' : 'lucide:x-circle'"
                                    class="w-3.5 h-3.5" />
                                {{ item.isActive ? 'Active' : 'Inactive' }}
                            </span>
                        </td>

                        <!-- Created -->
                        <td class="td align-top uppercase text-xs">
                            {{ item.createdAt ? formatDate(item.createdAt) : '—' }}
                        </td>


                        <!-- Actions -->
                        <td class="td align-top text-right">
                            <div class="inline-flex items-center gap-1.5">
                                <!-- <button class="btn-icon" title="View" @click="$emit('view', item)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button> -->
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
            class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2 border-t border-white/10 bg-white/5">
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

defineEmits(['view', 'edit', 'delete', 'prev', 'next'])

const showPagination = computed(() => props.totalPages > 1)

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
    })
}

function typeClass(type) {
    switch (type) {
        case 'earning':
            return 'bg-emerald-500/20 text-emerald-300'
        case 'deduction':
            return 'bg-red-500/20 text-red-300'
        case 'reimbursement':
            return 'bg-sky-500/20 text-sky-300'
        case 'benefit':
            return 'bg-purple-500/20 text-purple-300'
        case 'tax':
            return 'bg-amber-500/20 text-amber-300'
        default:
            return 'bg-white/10 text-white/80'
    }
}

/**
 * Strip HTML tags and shorten description
 */
function shortDescription(html) {
    if (!html) return ''
    const text = html.replace(/<\/?[^>]+(>|$)/g, '').trim()
    if (text.length <= 80) return text
    return text.slice(0, 80) + '…'
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

/* 2-line clamp for description */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
