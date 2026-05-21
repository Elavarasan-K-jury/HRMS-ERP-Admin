<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-6 py-16 flex flex-col items-center justify-center w-full gap-3 text-white/70">
        <div class="p-4 rounded-full bg-white/10 backdrop-blur-sm">
            <Icon name="lucide:receipt" class="w-8 h-8 opacity-80" />
        </div>
        <span class="text-lg font-medium">No reimbursement requests found</span>
        <span class="text-sm text-white/50 mb-2">Try adjusting your filters or search criteria</span>

        <button v-if="hasFilters" @click="$emit('clear-filters')"
            class="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/10 flex items-center gap-2">
            <Icon name="lucide:rotate-ccw" class="w-4 h-4" />
            Clear All Filters
        </button>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] overflow-hidden">
        <!-- Table Wrapper -->
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Employee</th>
                        <th class="th">Type</th>
                        <th class="th">Amount</th>
                        <th class="th">Status</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- 🔄 Skeleton Loader -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-white/10" />
                                    <div class="space-y-2">
                                        <div class="skeleton w-24" />
                                        <div class="skeleton w-32" />
                                    </div>
                                </div>
                            </td>
                            <td class="td">
                                <div class="skeleton w-20" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-16" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-20" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Data Rows -->
                    <tr v-else v-for="item in items" :key="item.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">

                        <!-- Employee Info -->
                        <td class="td">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                                    {{ getEmployeeName(item).charAt(0) || 'E' }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-semibold text-white">{{ getEmployeeName(item) }}</span>
                                </div>
                            </div>
                        </td>

                        <!-- Type -->
                        <td class="td">
                            <span
                                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-white/10 border border-white/10">
                                {{ item.type?.toLowerCase() || 'other' }}
                            </span>
                        </td>

                        <!-- Amount -->
                        <td class="td">
                            <div class="flex flex-col">
                                <span class="text-base font-bold text-white">₹{{ formatCurrency(item.amount) }}</span>
                                <span v-if="item.currency && item.currency !== 'INR'"
                                    class="text-[10px] text-white/40 uppercase tracking-wider">
                                    {{ item.currency }}
                                </span>
                            </div>
                        </td>

                        <!-- Status -->
                        <td class="td">
                            <div class="flex flex-col">
                                <span
                                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-fit"
                                    :class="statusClass(item.status)">
                                    <Icon :name="statusIcon(item.status)" class="w-3.5 h-3.5" />
                                    {{ item.status || 'PENDING' }}
                                </span>
                                <span class="text-[10px] text-white/40 uppercase tracking-wider mt-1 ml-1">Requested {{
                                    formatDate(item.created_at || item.createdAt,
                                        true) }}</span>
                                <span v-if="item.approved_at"
                                    class="text-[10px] text-white/40 uppercase tracking-wider mt-1 ml-1">Approved
                                    {{
                                        formatDate(item.approved_at || item.approvedAt,
                                            true) }}</span>
                            </div>
                        </td>

                        <!-- Actions -->
                        <td class="td text-right">
                            <div class="inline-flex items-center gap-2">
                                <button @click="$emit('view', item)"
                                    class="p-2 flex items-center rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all border border-white/5">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button>
                                <button v-if="item.status === 'PENDING'" @click="$emit('approve', item)"
                                    class="p-2 flex items-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all border border-emerald-500/20">
                                    <Icon name="lucide:check-circle" class="w-4 h-4" />
                                </button>
                                <button v-if="item.status === 'PENDING'" @click="$emit('reject', item)"
                                    class="p-2 flex items-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-500/20">
                                    <Icon name="lucide:x-circle" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 📄 Pagination -->
        <div v-if="showPagination"
            class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-white/5">
            <div class="text-xs text-white/60">
                Showing <span class="text-white font-bold">{{ page }}</span> of
                <span class="text-white font-bold">{{ totalPages }}</span> pages
                <span class="mx-2 opacity-30">|</span>
                <span class="text-white font-bold">{{ total }}</span> total requests
            </div>

            <div class="flex items-center gap-2">
                <button class="btn-nav" :disabled="page <= 1 || loading" @click="$emit('prev')">
                    <Icon name="lucide:chevron-left" class="w-4 h-4" />
                    Previous
                </button>
                <button class="btn-nav" :disabled="page >= totalPages || loading" @click="$emit('next')">
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
    hasFilters: { type: Boolean, default: false },
})

defineEmits(['view', 'approve', 'reject', 'prev', 'next', 'clear-filters'])

const showPagination = computed(() => props.totalPages > 1)

function getEmployeeName(item) {
    if (item.employee_name) return item.employee_name
    if (item.employee) {
        if (item.employee.full_name) return item.employee.full_name
        if (item.employee.first_name) {
            return `${item.employee.first_name} ${item.employee.last_name || ''}`.trim()
        }
    }
    return 'Unknown Employee'
}

function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return "0.00";
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(date, includeTime = false) {
    if (!date) return "—";
    const options = {
        month: "short",
        day: "numeric",
        year: "numeric"
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(date).toLocaleDateString("en-IN", options);
}

function statusClass(status) {
    switch (status?.toUpperCase()) {
        case 'APPROVED':
            return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        case 'REJECTED':
            return 'bg-red-500/20 text-red-400 border border-red-500/30'
        case 'PENDING':
            return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        default:
            return 'bg-white/10 text-white/60 border border-white/20'
    }
}

function statusIcon(status) {
    switch (status?.toUpperCase()) {
        case 'APPROVED':
            return 'lucide:check-circle'
        case 'REJECTED':
            return 'lucide:x-circle'
        case 'PENDING':
            return 'lucide:clock'
        default:
            return 'lucide:help-circle'
    }
}
</script>

<style scoped>
.th {
    @apply text-left text-[11px] font-bold uppercase tracking-widest text-white/40 px-6 py-4;
}

.td {
    @apply px-6 py-4 align-middle;
}

.btn-nav {
    @apply px-4 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/15 text-white font-semibold transition-all border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2;
}

.skeleton {
    @apply rounded-md bg-white/10;
    background: linear-gradient(90deg, rgba(255, 255, 255, .05), rgba(255, 255, 255, .15), rgba(255, 255, 255, .05));
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
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
