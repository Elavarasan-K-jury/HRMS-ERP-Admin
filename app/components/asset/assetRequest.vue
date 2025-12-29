<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl px-4 py-10 flex items-center justify-center gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6" />
        <span>No assignment requests found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 border-b border-white/10">
                    <tr>
                        <th class="th">Request</th>
                        <th class="th">Asset</th>
                        <th class="th">Employee</th>
                        <th class="th">Qty</th>
                        <th class="th">Priority</th>
                        <th class="th">Request Status</th>
                        <th class="th">Assignment Status</th>
                        <th class="th">Dates</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- 🔄 Skeleton -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td v-for="j in 9" :key="j" class="td">
                                <div class="skeleton w-full" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Rows -->
                    <tr v-else v-for="row in items" :key="row.id"
                        class="border-b border-white/5 hover:bg-white/5 transition">
                        <!-- Request -->
                        <td class="td">
                            <div class="font-mono text-xs">
                                #{{ row.id.slice(-8) }}
                            </div>
                            <div class="text-xs text-white/50">
                                {{ format(row.created_at) }}
                            </div>
                        </td>

                        <!-- Asset -->
                        <td class="td">
                            <div class="font-semibold">
                                {{ row.assignment_details.asset.serial_number }}
                            </div>
                            <div class="text-xs text-white/60">
                                {{ row.assignment_details.asset.asset_model.model_name }}
                            </div>
                            <div class="text-xs text-white/40">
                                {{ row.assignment_details.asset.asset_category.name }}
                            </div>
                        </td>

                        <!-- Employee -->
                        <td class="td">
                            <div class="font-semibold">
                                {{ row.assignment_details.employee.full_name }}
                            </div>
                            <div class="text-xs text-white/60">
                                {{ row.assignment_details.employee.employee_code }}
                            </div>
                            <div class="text-xs text-white/40">
                                {{ row.assignment_details.employee.email }}
                            </div>
                        </td>

                        <!-- Quantity -->
                        <td class="td text-center">
                            {{ row.quantity }}
                        </td>

                        <!-- Priority -->
                        <td class="td">
                            <span class="badge" :class="priorityClass(row.priority)">
                                {{ row.priority }}
                            </span>
                        </td>

                        <!-- Request Status -->
                        <td class="td">
                            <span class="badge" :class="requestStatusClass(row.status)">
                                {{ row.status }}
                            </span>
                        </td>

                        <!-- Assignment Status -->
                        <td class="td">
                            <span class="badge" :class="assignmentStatusClass(row.assignment_details.status)">
                                {{ row.assignment_details.status }}
                            </span>
                        </td>

                        <!-- Dates -->
                        <td class="td text-xs">
                            <div>Created: {{ format(row.created_at) }}</div>
                            <div>Updated: {{ format(row.updated_at) }}</div>
                        </td>

                        <!-- Actions -->
                        <td class="td text-right">
                            <div class="inline-flex gap-1">
                                <UiButton v-if="row.status === 'PENDING'" color="#22c55e" class="btn-icon"
                                    title="Approve" @click="$emit('approve', row)">
                                    <Icon name="lucide:check" />
                                </UiButton>

                                <UiButton v-if="row.status === 'PENDING'" color="#ef4444" class="btn-icon"
                                    title="Reject" @click="$emit('reject', row)">
                                    <Icon name="lucide:x" />
                                </UiButton>

                                <!-- <UiButton color="#fff" class="btn-icon" title="View" @click="$emit('view', row)">
                                    <Icon name="lucide:eye" />
                                </UiButton> -->
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script setup>
defineProps({
    items: Array,
    loading: Boolean,
})

defineEmits(['approve', 'reject', 'view'])

const format = (dt) =>
    dt
        ? new Date(dt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
        : '—'

const priorityClass = (p) => ({
    URGENT: 'bg-red-600/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-300',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300',
    LOW: 'bg-sky-500/20 text-sky-300',
    NEGLIGABLE: 'bg-slate-500/20 text-slate-300',
}[p] || 'bg-white/10 text-white/70')

const requestStatusClass = (s) => ({
    PENDING: 'bg-amber-500/20 text-amber-300',
    APPROVED: 'bg-emerald-500/20 text-emerald-300',
    REJECTED: 'bg-red-500/20 text-red-300',
}[s] || 'bg-white/10 text-white/70')

const assignmentStatusClass = (s) => ({
    REQUESTED: 'bg-blue-500/20 text-blue-300',
    ASSIGNED: 'bg-green-500/20 text-green-300',
    RETURNED: 'bg-slate-500/20 text-slate-300',
}[s] || 'bg-white/10 text-white/70');
</script>


<style scoped>
.th {
    @apply px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/60;
}

.td {
    @apply px-4 py-3 align-middle;
}

.badge {
    @apply inline-flex px-2 py-1 rounded-lg text-xs font-medium;
}

.btn-icon {
    @apply p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white;
}

.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
    from {
        background-position: 200% 0
    }

    to {
        background-position: -200% 0
    }
}
</style>
