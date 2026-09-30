<template>
    <div>
    <div class="h-[calc(100vh-4rem)] overflow-y-auto text-white p-4 glass-scroll">
        <div class="max-w-full mx-auto space-y-4 pb-10">

            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="space-y-1">
                    <p class="text-xs uppercase tracking-[0.3em] text-white/40 font-semibold">
                        Financial Management
                    </p>
                    <h1
                        class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                        Expense Requests
                    </h1>
                    <p class="text-sm text-white/60">
                        Manage and track your business-related expenses and reimbursements.
                    </p>
                </div>

                <div class="flex items-center gap-3">
                    <UiButton @click="fetchAllExpenses" color="#fff" text="Reload" prepend-icon="lucide:refresh-cw"
                        variant="ghost" />
                    <UiButton @click="openExpenseModal()" color="#4aff7a" text="Request Expense"
                        prepend-icon="lucide:plus-circle" size="lg" />
                </div>
            </div>

            <!-- Toolbar / Filters -->
            <div
                class="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <div class="flex-1 w-full">
                    <FormInput color="#fff" v-model="fetchExpenseFilter.search" placeholder="Search by description..."
                        prepend-icon="lucide:search" @update:modelValue="debouncedFetch" />
                </div>
                <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div class="w-full sm:w-48">
                        <FormSelect color="#fff" v-model="fetchExpenseFilter.type" :options="typeOptions"
                            placeholder="All Types" @update:modelValue="fetchAllExpenses" />
                    </div>
                    <div class="w-full sm:w-48">
                        <FormSelect color="#fff" v-model="fetchExpenseFilter.status" :options="statusOptions"
                            placeholder="All Status" @update:modelValue="fetchAllExpenses" />
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
                <UiLoader />
                <p class="text-white/40 animate-pulse">Loading expenses...</p>
            </div>

            <div v-else-if="expenses.length === 0"
                class="flex flex-col items-center justify-center py-20 space-y-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                    <Icon name="lucide:receipt" class="text-4xl text-white/20" />
                </div>
                <div class="text-center space-y-1">
                    <p class="text-xl font-medium text-white/80">No expenses found</p>
                    <p class="text-sm text-white/40 max-w-xs mx-auto">
                        You haven't submitted any expense requests yet or no results match your filters.
                    </p>
                </div>
                <UiButton @click="openExpenseModal()" color="#4aff7a" text="Create New Request"
                    prepend-icon="lucide:plus" />
            </div>

            <div v-else
                class="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
                <div class="overflow-x-auto glass-scroll">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white/5 border-b border-white/10">
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Category
                                </th>
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Date
                                </th>
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status
                                </th>
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">
                                    Description</th>
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Amount
                                </th>
                                <th
                                    class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40 text-right">
                                    Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            <tr v-for="expense in expenses" :key="expense.id"
                                class="hover:bg-white/5 transition-colors group">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            <Icon :name="getCategoryIcon(expense.type)" class="text-lg"
                                                :style="{ color: '#4aff7a' }" />
                                        </div>
                                        <span class="font-medium text-white">{{ expense.type.replaceAll("_", " ")
                                            }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-sm text-white/60">
                                    {{ formatDate(expense.created_at) }}
                                </td>
                                <td class="px-6 py-4">
                                    <span
                                        class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm inline-block"
                                        :class="getStatusClasses(expense.status)">
                                        {{ expense.status || 'PENDING' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <p class="text-sm text-white/70 line-clamp-1 max-w-xs italic">
                                        "{{ expense.description || 'No description provided' }}"
                                    </p>
                                </td>
                                <td class="px-6 py-4 font-black text-white">
                                    ₹{{ expense.amount }}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="openExpenseModal(expense, false)"
                                            class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                            title="View Details">
                                            <Icon name="lucide:eye" class="w-4 h-4" />
                                        </button>
                                        <button v-if="expense.status === 'PENDING'"
                                            @click="openExpenseModal(expense, true)"
                                            class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-green-400/60 hover:text-green-400 transition-all"
                                            title="Edit">
                                            <Icon name="lucide:pencil" class="w-4 h-4" />
                                        </button>
                                        <button v-if="expense.status === 'PENDING'" @click="confirmDelete(expense.id)"
                                            class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-red-400/60 hover:text-red-400 transition-all"
                                            title="Delete">
                                            <Icon name="lucide:trash-2" class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pagination (if needed) -->
            <div v-if="expenses.length > 0 && total > expenses.length" class="flex justify-center pt-8">
                <div class="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                    <span class="text-sm text-white/40">Showing {{ expenses.length }} of {{ total }} expenses</span>
                    <!-- Add pagination buttons here if required -->
                </div>
            </div>

        </div>
    </div>

    <!-- Expense Modal -->
    <UiModal :showFooter="false" width="600px" v-model="isExpenseModalOpen"
        :title="isViewing ? 'Expense Details' : (form.id ? 'Edit Expense Request' : 'Request Expense')">
        <div class="space-y-6 py-2">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label for="type" class="text-xs font-bold uppercase tracking-widest text-white/40">Expense
                        Category</label>
                    <FormSelect color="#fff" name="type" id="type" v-model="form.type" :options="typesListOptions"
                        :disabled="isViewing" />
                </div>
                <div class="space-y-2">
                    <label for="amount" class="text-xs font-bold uppercase tracking-widest text-white/40">Amount
                        (₹)</label>
                    <FormInput color="#fff" type="number" name="amount" id="amount" v-model="form.amount"
                        :disabled="isViewing" prepend-icon="lucide:indian-rupee" />
                </div>
            </div>

            <div class="space-y-2">
                <label for="description"
                    class="text-xs font-bold uppercase tracking-widest text-white/40">Description</label>
                <FormInputArea color="#fff" name="description" id="description" v-model="form.description"
                    :disabled="isViewing" placeholder="Explain the purpose of this expense..." />
            </div>

            <div v-if="!isViewing" class="space-y-2">
                <label for="receipt" class="text-xs font-bold uppercase tracking-widest text-white/40">
                    {{ form.id ? 'Change Receipt' : 'Receipt / Evidence' }}
                </label>
                <FormInput @change="handleFile" color="#fff" type="file" accept="image/*" name="receipt" id="receipt"
                    prepend-icon="lucide:paperclip" />
            </div>

            <div v-if="form.preview_url" class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-white/40">Receipt Preview</label>
                <div
                    class="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
                    <img v-if="form.preview_url" :src="form.preview_url" alt="Receipt Preview"
                        class="object-contain w-full h-full p-2" />
                    <div v-else class="flex flex-col items-center gap-2">
                        <Icon name="lucide:file-text" class="text-4xl text-white/20" />
                        <span class="text-xs text-white/40">Document selected</span>
                    </div>
                    <a v-if="form.receipt_url" :href="form.receipt_url" target="_blank"
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <UiButton color="#fff" text="View Original" prepend-icon="lucide:external-link" size="sm" />
                    </a>
                </div>
            </div>

            <div v-else-if="form.receipt_url && isViewing" class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-widest text-white/40">Attached Receipt</label>
                <div
                    class="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
                    <img v-if="isImage(form.receipt_url)" :src="form.receipt_url" alt="Receipt"
                        class="object-contain w-full h-full" />
                    <div v-else class="flex flex-col items-center gap-2">
                        <Icon name="lucide:file-text" class="text-4xl text-white/20" />
                        <span class="text-xs text-white/40">Document attached</span>
                    </div>
                    <a :href="form.receipt_url" target="_blank"
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <UiButton color="#fff" text="Open Receipt" prepend-icon="lucide:external-link" size="sm" />
                    </a>
                </div>
            </div>

            <div class="flex justify-end items-center gap-3 pt-4 border-t border-white/10">
                <UiButton @click="isExpenseModalOpen = false" color="#fff" :text="isViewing ? 'Close' : 'Cancel'"
                    variant="ghost" />
                <UiButton v-if="!isViewing && form.id" @click="updateExpense" color="#4aff7a" text="Update Request"
                    prepend-icon="lucide:save" :loading="loading" />
                <UiButton v-else-if="!isViewing" @click="createExpense" color="#4aff7a" text="Submit Request"
                    prepend-icon="lucide:send" :loading="loading" />
            </div>
        </div>
    </UiModal>
    <!-- Delete Confirmation Modal -->
    <UiModal v-model="isDeleteModalOpen" title="Confirm Deletion" width="400px" :showFooter="false">
        <div class="space-y-6 py-2 text-center">
            <div class="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <Icon name="lucide:trash-2" class="text-4xl text-red-500" />
            </div>
            <div class="space-y-2">
                <h3 class="text-xl font-bold text-white">Are you sure?</h3>
                <p class="text-sm text-white/60">
                    This action cannot be undone. This will permanently delete the expense request.
                </p>
            </div>
            <div class="flex justify-center items-center gap-3 pt-4 border-t border-white/10">
                <UiButton @click="isDeleteModalOpen = false" color="#fff" text="Cancel" variant="ghost" />
                <UiButton @click="handleDelete" color="#ff4a4a" text="Delete Now" prepend-icon="lucide:trash-2"
                    :loading="loading" />
            </div>
        </div>
    </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useExpenseStore } from '../../stores/shared/expense.store'

const config = useRuntimeConfig()

definePageMeta({ layout: 'auth' })

const store = useExpenseStore()
const { fetchExpenseFilter, form, typesList, expenses, total } = storeToRefs(store)
const loading = ref(false)
const isExpenseModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isViewing = ref(false)
const expenseToDelete = ref(null)

/* ---- Options ---- */
const typeOptions = computed(() => [
    { value: 'ALL', label: 'All Types' },
    ...typesList.value.map(t => ({ value: t, label: t.replaceAll("_", " ") }))
])

const typesListOptions = computed(() =>
    typesList.value.map(t => ({ value: t, label: t.replaceAll("_", " ") }))
)

const statusOptions = [
    { value: null, label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
]

/* ---- Methods ---- */
const fetchAllExpenses = async () => {
    loading.value = true
    await store.getAllExpenses()
    setTimeout(() => loading.value = false, 500)
}

let debounceTimer
const debouncedFetch = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fetchAllExpenses, 500)
}

const handleFile = (event) => {
    const file = event.target.files[0]
    if (file) {
        form.value.receipt = file
        if (isImage(file.name)) {
            form.value.preview_url = URL.createObjectURL(file)
        } else {
            form.value.preview_url = null
        }
    }
}

const createExpense = async () => {
    loading.value = true
    await store.requestExpense()
    isExpenseModalOpen.value = false
    loading.value = false
}

const updateExpense = async () => {
    loading.value = true
    await store.updateExpense()
    isExpenseModalOpen.value = false
    loading.value = false
}

const confirmDelete = (id) => {
    expenseToDelete.value = id
    isDeleteModalOpen.value = true
}

const handleDelete = async () => {
    if (expenseToDelete.value) {
        loading.value = true
        await store.deleteExpense(expenseToDelete.value)
        isDeleteModalOpen.value = false
        expenseToDelete.value = null
        loading.value = false
    }
}

const openExpenseModal = (expense = null, edit = false) => {
    store.resetForm()
    if (expense) {
        isViewing.value = !edit
        form.value = {
            id: expense.id,
            type: expense.type,
            amount: expense.amount,
            description: expense.description,
            receipt_url: expense.receipt_url ? `${config.public.apiBase}${expense.receipt_url}` : null,
            preview_url: expense.receipt_url ? `${config.public.apiBase}${expense.receipt_url}` : null,
            status: expense.status
        }
    } else {
        isViewing.value = false
    }
    isExpenseModalOpen.value = true
}

const getCategoryIcon = (type) => {
    const icons = {
        'TRAVEL': 'lucide:plane',
        'FOOD': 'lucide:utensils',
        'ACCOMMODATION': 'lucide:bed',
        'OTHER': 'lucide:wallet',
    }
    return icons[type] || 'lucide:receipt'
}

const getStatusClasses = (status) => {
    switch (status) {
        case 'APPROVED':
            return 'bg-green-500/10 text-green-400 border-green-500/20'
        case 'REJECTED':
            return 'bg-red-500/10 text-red-400 border-red-500/20'
        default:
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const isImage = (url) => {
    return url && /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase())
}

/* ---- Fetch on Mount ---- */
onMounted(async () => {
    await fetchAllExpenses()
});
</script>

<style scoped>
.glass-scroll::-webkit-scrollbar {
    width: 6px;
}

.glass-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

.glass-scroll::-webkit-scrollbar-track {
    background: transparent;
}
</style>