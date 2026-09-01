<template>
    <div class="flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ changes.length }} Pending Change<span>(s)</span>
            </h2>
            <div class="flex items-center gap-2">
                <FormSelect v-model="statusFilter" :options="statusOptions" placeholder="Status"
                    prepend-icon="lucide:filter" color="#fff" size="md" rounded="full" />
                <UiButton color="#fff" text="Reload" prepend-icon="ion:refresh" @click="fetchChanges" />
            </div>
        </div>

        <div v-if="!filteredChanges.length && !loading"
            class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center justify-center gap-2 text-white/70">
            <Icon name="ion:swap-horizontal-outline" class="text-4xl opacity-60" />
            <span>No pending profile changes.</span>
        </div>

        <div v-else
            class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10">
                    <tr>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Employee</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Field</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Old Value</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">New Value</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Requested</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Status</th>
                        <th class="px-4 py-3 text-right font-semibold uppercase text-[11px] tracking-wider text-white/60">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="loading">
                        <tr v-for="i in 4" :key="i" class="border-b border-white/5 animate-pulse">
                            <td v-for="j in 7" :key="j" class="px-4 py-3">
                                <div class="h-4 rounded bg-white/10 w-3/4" />
                            </td>
                        </tr>
                    </template>
                    <tr v-for="change in filteredChanges" :key="change.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Icon name="ion:person" class="text-sm" />
                                </div>
                                <span class="font-medium">{{ change.employee }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded-full text-xs bg-white/10">{{ change.field }}</span>
                        </td>
                        <td class="px-4 py-3 text-white/60">{{ change.old_value }}</td>
                        <td class="px-4 py-3 text-white/90">{{ change.new_value }}</td>
                        <td class="px-4 py-3 text-white/60 text-xs">{{ change.requested_at }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                :class="statusClass(change.status)">
                                {{ change.status }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <div class="flex items-center justify-end gap-1">
                                <button @click="approveChange(change)"
                                    class="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                    title="Approve">
                                    <Icon name="ion:checkmark-circle-outline" class="text-lg" />
                                </button>
                                <button @click="rejectChange(change)"
                                    class="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                    title="Reject">
                                    <Icon name="ion:close-circle-outline" class="text-lg" />
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const statusFilter = ref(null)
const loading = ref(false)
const changes = ref([])

const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
]

const filteredChanges = computed(() => {
    if (!statusFilter.value) return changes.value
    return changes.value.filter(c => c.status === statusFilter.value)
})

const statusClass = (status) => {
    switch (status) {
        case 'Pending': return 'bg-amber-500/20 text-amber-300'
        case 'Approved': return 'bg-emerald-500/20 text-emerald-300'
        case 'Rejected': return 'bg-red-500/20 text-red-300'
        default: return 'bg-white/10 text-white/60'
    }
}

const fetchChanges = async () => {
    loading.value = true
    try {
        // TODO: Replace with actual API call
        // const { $api } = useNuxtApp()
        // const { data } = await $api.get('/profile-changes', { params: { organization_id } })
        // changes.value = data.changes
        await new Promise(r => setTimeout(r, 500))
        changes.value = sampleChanges
    } catch (err) {
        console.error('Failed to fetch profile changes:', err)
    } finally {
        loading.value = false
    }
}

const approveChange = (change) => {
    change.status = 'Approved'
}

const rejectChange = (change) => {
    change.status = 'Rejected'
}

const handleRefresh = (e) => {
    if (e.detail.tab === 2) fetchChanges()
}

onMounted(() => {
    fetchChanges()
    window.addEventListener('refresh-tab', handleRefresh)
})

onBeforeUnmount(() => {
    window.removeEventListener('refresh-tab', handleRefresh)
})

const sampleChanges = [
    { id: 1, employee: 'Rahul Sharma', field: 'Phone', old_value: '9876543210', new_value: '9988776655', requested_at: '2026-07-20 10:30 AM', status: 'Pending' },
    { id: 2, employee: 'Priya Patel', field: 'Address', old_value: '123, MG Road', new_value: '456, Brigade Road', requested_at: '2026-07-19 02:15 PM', status: 'Pending' },
    { id: 3, employee: 'Amit Singh', field: 'Email', old_value: 'amit.singh@old.com', new_value: 'amit.singh@new.com', requested_at: '2026-07-18 11:00 AM', status: 'Approved' },
    { id: 4, employee: 'Sneha Reddy', field: 'Bank Account', old_value: 'XXXX1234', new_value: 'XXXX5678', requested_at: '2026-07-17 09:45 AM', status: 'Rejected' },
    { id: 5, employee: 'Vikram Joshi', field: 'Emergency Contact', old_value: '9999999999', new_value: '8888888888', requested_at: '2026-07-16 04:20 PM', status: 'Pending' },
]
</script>
