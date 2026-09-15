<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-3">
        <!-- 🏔️ Header Section -->
        <div
            class="rounded-xl p-6 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-4">
                <div
                    class="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 shadow-inner">
                    <Icon name="ion:cash-outline" class="w-8 h-8 text-white shadow-sm" />
                </div>
                <div>
                    <h1 class="text-2xl font-black tracking-tight text-white uppercase">
                        Reimbursements
                    </h1>
                    <p class="text-sm text-white/50 font-medium">
                        Manage and track employee expense requests
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <div class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
                    <span class="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Requests</span>
                    <span class="text-lg font-black text-white">{{ totalExpenses }}</span>
                </div>
                <UiButton color="#4aff7a" text="Reload" prepend-icon="ion:refresh" :loading="loadingExpenses"
                    @click="fetchExpenses" />
            </div>
        </div>

        <!-- 🔍 Advanced Filters Section -->
        <div class="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-xl overflow-hidden">
            <!-- Main Filter Bar -->
            <div class="p-4 flex flex-wrap items-center gap-4">
                <!-- Search Group -->
                <div class="flex-1 min-w-[300px] relative group">
                    <UiSearch v-model="search" placeholder="Search by employee name or email..." color="#fff"
                        :loading="loadingExpenses" rounded="xl" />
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                    <button @click="showAdvancedFilters = !showAdvancedFilters"
                        class="px-4 py-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold"
                        :class="showAdvancedFilters || hasActiveCriteria ? 'bg-white/20 border-white/30 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'">
                        <Icon :name="hasActiveCriteria ? 'lucide:filter-check' : 'lucide:filter'" class="w-4 h-4" />
                        Filters
                        <span v-if="activeFilterCount > 0"
                            class="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-[10px] text-white animate-pulse">
                            {{ activeFilterCount }}
                        </span>
                        <Icon :name="showAdvancedFilters ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                            class="w-4 h-4 opacity-50" />
                    </button>

                    <UiButton v-if="hasActiveFilters" color="#ff4a4a" text="Reset" prepend-icon="lucide:rotate-ccw"
                        size="md" rounded="xl" @click="clearFilters" />
                </div>
            </div>

            <!-- Expandable Filter Details -->
            <transition enter-active-class="transition-all duration-300 ease-out"
                leave-active-class="transition-all duration-200 ease-in" enter-from-class="max-h-0 opacity-0"
                enter-to-class="max-h-[500px] opacity-100" leave-from-class="max-h-[500px] opacity-100"
                leave-to-class="max-h-0 opacity-0">
                <div v-if="showAdvancedFilters" class="border-t border-white/10 bg-white/5 p-5">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- Category Filter -->
                        <div class="space-y-2">
                            <label class="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Expense
                                Category</label>
                            <FormSelect v-model="type" placeholder="All Categories" :options="typeList" color="#fff"
                                prepend-icon="lucide:tag" rounded="xl" />
                        </div>

                        <!-- Status Filter -->
                        <div class="space-y-2">
                            <label class="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Request
                                Status</label>
                            <FormSelect v-model="status" placeholder="All Status" :options="statusList" color="#fff"
                                prepend-icon="lucide:activity" rounded="xl" />
                        </div>

                        <!-- Date Range Group -->
                        <div class="lg:col-span-2 space-y-2">
                            <label class="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Date
                                Range (Request Period)</label>
                            <div class="flex items-center gap-3">
                                <div class="flex-1">
                                    <FormInput type="date" v-model="fromDate" color="#fff" size="md" rounded="xl"
                                        prepend-icon="lucide:calendar" />
                                </div>
                                <Icon name="lucide:minus" class="w-4 h-4 text-white/20" />
                                <div class="flex-1">
                                    <FormInput type="date" v-model="toDate" color="#fff" size="md" rounded="xl"
                                        prepend-icon="lucide:calendar" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Tags / Status Summary -->
                    <div class="mt-6 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                        <span class="text-[10px] uppercase tracking-widest text-white/30 font-bold mr-2">Quick
                            Filter:</span>
                        <button v-for="s in statusList.filter(opt => opt.value !== null)" :key="s.value"
                            @click="status = s"
                            class="px-3 py-1 rounded-full text-[10px] font-bold transition-all border"
                            :class="status?.value === s.value ? 'bg-white/20 border-white/30 text-white shadow-md' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'">
                            {{ s.label }}
                        </button>
                    </div>
                </div>
            </transition>
        </div>

        <!-- 📊 Table Section -->
        <div class="flex-1 min-h-0">
            <ExpenseReimbursementTable :items="expenses" :loading="loadingExpenses" :total="totalExpenses" :page="page"
                :total-pages="totalPages" :has-filters="hasActiveFilters" @prev="prevPage" @next="nextPage"
                @clear-filters="clearFilters" @view="viewRequest" @approve="openApproveModal"
                @reject="openRejectModal" />
        </div>

        <!-- 👁️ View Request Sidebar -->
        <UiSidebarModal v-model="viewOpen" title="Reimbursement Details" width="600px">
            <template #default>
                <div v-if="selectedRequest" class="space-y-6">
                    <!-- Status Header -->
                    <div class="flex items-center justify-between p-4 rounded-2xl border bg-white/5"
                        :class="statusBorderClass(selectedRequest.status)">
                        <div class="flex items-center gap-3">
                            <div class="p-2 rounded-xl bg-white/10">
                                <Icon :name="statusIcon(selectedRequest.status)" class="w-6 h-6"
                                    :class="statusTextClass(selectedRequest.status)" />
                            </div>
                            <div>
                                <p class="text-[10px] uppercase tracking-widest text-white/40 font-black">Current Status
                                </p>
                                <p class="text-sm font-bold uppercase tracking-wider"
                                    :class="statusTextClass(selectedRequest.status)">
                                    {{ selectedRequest.status }}
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] uppercase tracking-widest text-white/40 font-black">Requested Amount
                            </p>
                            <p class="text-xl font-black text-white">₹{{ formatCurrency(selectedRequest.amount) }}</p>
                        </div>
                    </div>

                    <!-- Details Grid -->
                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p class="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Employee</p>
                            <p class="text-sm font-bold text-white">{{ getEmployeeName(selectedRequest) }}</p>
                            <p class="text-xs text-white/50">{{ selectedRequest.employee?.email || selectedRequest.email
                                }}</p>
                        </div>
                        <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
                            <p class="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Expense Type
                            </p>
                            <p class="text-sm font-bold text-white capitalize">{{ selectedRequest.type?.toLowerCase() }}
                            </p>
                        </div>
                        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 col-span-2">
                            <p class="text-[10px] uppercase tracking-widest text-white/40 font-black mb-1">Requested On
                            </p>
                            <p class="text-sm font-bold text-white">{{ formatDate(selectedRequest.created_at ||
                                selectedRequest.createdAt, true) }}</p>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p class="text-[10px] uppercase tracking-widest text-white/40 font-black mb-2">Description /
                            Notes</p>
                        <p class="text-sm text-white/80 leading-relaxed">
                            {{ selectedRequest.description || 'No description provided.' }}
                        </p>
                    </div>

                    <!-- Rejection Reason if any -->
                    <div v-if="selectedRequest.status === 'REJECTED' && selectedRequest.rejection_reason"
                        class="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                        <p class="text-[10px] uppercase tracking-widest text-red-400 font-black mb-2">Rejection Reason
                        </p>
                        <p class="text-sm text-red-200/80 leading-relaxed">
                            {{ selectedRequest.rejection_reason }}
                        </p>
                    </div>

                    <!-- Attachment -->
                    <div v-if="selectedRequest.attachment_url" class="space-y-2">
                        <p class="text-[10px] uppercase tracking-widest text-white/40 font-black ml-1">Attachment</p>
                        <div
                            class="group relative rounded-2xl overflow-hidden border border-white/15 bg-black/20 aspect-video flex items-center justify-center">
                            <img v-if="isImage(selectedRequest.attachment_url)" :src="selectedRequest.attachment_url"
                                class="w-full h-full object-contain" />
                            <div v-else class="flex flex-col items-center gap-2">
                                <Icon name="lucide:file-text" class="w-12 h-12 text-white/20" />
                                <span class="text-xs text-white/40 font-medium">Document Attachment</span>
                            </div>

                            <div
                                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <a :href="selectedRequest.attachment_url" target="_blank"
                                    class="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                                    <Icon name="lucide:external-link" class="w-6 h-6" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <div v-if="selectedRequest?.status === 'PENDING'" class="flex items-center gap-3 w-full">
                    <UiButton class="flex-1" color="#ff4a4a" text="Reject" prepend-icon="lucide:x-circle"
                        @click="openRejectModal(selectedRequest)" />
                    <UiButton class="flex-1" color="#4aff7a" text="Approve" prepend-icon="lucide:check-circle"
                        @click="openApproveModal(selectedRequest)" />
                </div>
                <UiButton v-else class="w-full" color="#fff" text="Close" @click="viewOpen = false" />
            </template>
        </UiSidebarModal>

        <!-- ✅ Approve Modal -->
        <UiModal v-model="approveOpen" title="Approve Request" size="sm">
            <template #default>
                <div class="text-center space-y-4 py-4">
                    <div
                        class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                        <Icon name="lucide:check-circle" class="w-10 h-10" />
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">Confirm Approval</h3>
                        <p class="text-sm text-white/60">
                            Are you sure you want to approve the reimbursement of <span class="text-white font-bold">₹{{
                                formatCurrency(selectedRequest?.amount) }}</span> for
                            <span class="text-white font-bold">{{ getEmployeeName(selectedRequest) }}</span>?
                        </p>
                    </div>
                </div>
            </template>
            <template #footer>
                <UiButton color="#fff" text="Cancel" @click="approveOpen = false" />
                <UiButton color="#4aff7a" text="Confirm Approval" :loading="loadingExpenses" @click="handleApprove" />
            </template>
        </UiModal>

        <!-- ❌ Reject Modal -->
        <UiModal v-model="rejectOpen" title="Reject Request" size="sm">
            <template #default>
                <div class="text-center space-y-4 py-4">
                    <div
                        class="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                        <Icon name="lucide:x-circle" class="w-10 h-10" />
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">Confirm Rejection</h3>
                        <p class="text-sm text-white/60">
                            Are you sure you want to reject the reimbursement of <span class="text-white font-bold">₹{{
                                formatCurrency(selectedRequest?.amount) }}</span> for
                            <span class="text-white font-bold">{{ getEmployeeName(selectedRequest) }}</span>?
                        </p>
                    </div>
                </div>
            </template>
            <template #footer>
                <UiButton color="#fff" text="Cancel" @click="rejectOpen = false" />
                <UiButton color="#ff4a4a" text="Confirm Rejection" :loading="loadingExpenses" @click="handleReject" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { onMounted, computed, watch, ref } from 'vue';
import { useExpenseStore } from '../../../stores/shared/expense.store';
import { storeToRefs } from 'pinia';

const expenseStore = useExpenseStore()

const {
    type,
    typeList,
    status,
    statusList,
    fromDate,
    toDate,
    search,
    page,
    totalPages,
    total: totalExpenses
} = storeToRefs(expenseStore)

const loadingExpenses = computed(() => expenseStore.loading)
const expenses = computed(() => expenseStore.expenses)

const showAdvancedFilters = ref(false)
const viewOpen = ref(false)
const approveOpen = ref(false)
const rejectOpen = ref(false)
const selectedRequest = ref(null)
const rejectionReason = ref('')

const hasActiveCriteria = computed(() => {
    return (type.value && type.value.value !== 'ALL') ||
        (status.value && status.value.value !== 'PENDING') ||
        fromDate.value ||
        toDate.value
})

const hasActiveFilters = computed(() => {
    return search.value || hasActiveCriteria.value
})

const activeFilterCount = computed(() => {
    let count = 0
    if (type.value && type.value.value !== 'ALL') count++
    if (status.value && status.value.value !== 'PENDING') count++
    if (fromDate.value) count++
    if (toDate.value) count++
    return count
})

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const fetchExpenses = async () => {
    await expenseStore.fetchExpenseRequests()
}

const clearFilters = () => {
    search.value = ''
    type.value = typeList.value[0]
    status.value = statusList.value[1] // PENDING is index 1 usually
    fromDate.value = null
    toDate.value = null
    page.value = 1
    fetchExpenses()
}

const prevPage = () => {
    if (page.value > 1) {
        page.value--
        fetchExpenses()
    }
}

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++
        fetchExpenses()
    }
}

const viewRequest = (request) => {
    selectedRequest.value = request
    viewOpen.value = true
}

const openApproveModal = (request) => {
    selectedRequest.value = request
    approveOpen.value = true
}

const openRejectModal = (request) => {
    selectedRequest.value = request
    rejectionReason.value = ''
    rejectOpen.value = true
}

const handleApprove = async () => {
    if (!selectedRequest.value) return
    const success = await expenseStore.approveExpenseRequest(selectedRequest.value.id)
    if (success) {
        approveOpen.value = false
        viewOpen.value = false
    }
}

const handleReject = async () => {
    if (!selectedRequest.value) return
    const success = await expenseStore.rejectExpenseRequest(selectedRequest.value.id)
    if (success) {
        rejectOpen.value = false
        viewOpen.value = false
    }
}

// Helpers
const getEmployeeName = (item) => {
    if (!item) return ''
    if (item.employee_name) return item.employee_name
    if (item.employee) {
        if (item.employee.full_name) return item.employee.full_name
        return `${item.employee.first_name} ${item.employee.last_name || ''}`.trim()
    }
    return 'Unknown Employee'
}

const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "0.00";
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

const formatDate = (date, includeTime = false) => {
    if (!date) return "—";
    const options = { month: "short", day: "numeric", year: "numeric" };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(date).toLocaleDateString("en-IN", options);
}

const isImage = (url) => {
    if (!url) return false
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url)
}

const statusIcon = (status) => {
    switch (status?.toUpperCase()) {
        case 'APPROVED': return 'lucide:check-circle'
        case 'REJECTED': return 'lucide:x-circle'
        case 'PENDING': return 'lucide:clock'
        default: return 'lucide:help-circle'
    }
}

const statusTextClass = (status) => {
    switch (status?.toUpperCase()) {
        case 'APPROVED': return 'text-emerald-400'
        case 'REJECTED': return 'text-red-400'
        case 'PENDING': return 'text-amber-400'
        default: return 'text-white/60'
    }
}

const statusBorderClass = (status) => {
    switch (status?.toUpperCase()) {
        case 'APPROVED': return 'border-emerald-500/20'
        case 'REJECTED': return 'border-red-500/20'
        case 'PENDING': return 'border-amber-500/20'
        default: return 'border-white/10'
    }
}

// Watchers for immediate filtering
watch([type, status, fromDate, toDate], () => {
    page.value = 1
    fetchExpenses()
})

// Debounced search
let searchTimeout;
watch(search, (val) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        page.value = 1
        fetchExpenses()
    }, 500)
})

onMounted(async () => {
    await fetchExpenses()
});
</script>