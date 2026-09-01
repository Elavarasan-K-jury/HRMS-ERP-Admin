<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">Audit Logs</h2>
            <div class="flex items-center gap-2">
                <FormInput v-model="filters.action" color="#fff" size="sm" rounded="lg" placeholder="Action" class="w-28" />
                <FormInput v-model="filters.entity_type" color="#fff" size="sm" rounded="lg" placeholder="Entity" class="w-28" />
                <FormInput v-model="filters.admin_id" color="#fff" size="sm" rounded="lg" placeholder="Admin ID" class="w-32" />
                <UiButton @click="fetchLogs" color="#fff" text="Search" prepend-icon="ion:search" />
                <UiButton @click="resetFilters" color="#fff" text="Reset" />
            </div>
        </div>

        <div v-if="loading" class="text-center text-white/60 py-12">Loading audit logs...</div>

        <div v-else class="rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-white/10 text-white/60 text-xs uppercase">
                        <th class="text-left px-4 py-3">Time</th>
                        <th class="text-left px-4 py-3">Admin</th>
                        <th class="text-left px-4 py-3">Action</th>
                        <th class="text-left px-4 py-3">Entity</th>
                        <th class="text-left px-4 py-3">Entity ID</th>
                        <th class="text-left px-4 py-3">IP</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="log in logs" :key="log.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="px-4 py-3 text-white/70 whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
                        <td class="px-4 py-3 text-white/80">{{ log.admin_id?.slice(-8) }}</td>
                        <td class="px-4 py-3">
                            <span :class="actionBadge(log.action)">{{ log.action }}</span>
                        </td>
                        <td class="px-4 py-3 text-white/70">{{ log.entity_type }}</td>
                        <td class="px-4 py-3 text-white/50 font-mono text-xs">{{ log.entity_id?.slice(-8) || '-' }}</td>
                        <td class="px-4 py-3 text-white/50">{{ log.ip_address || '-' }}</td>
                    </tr>
                    <tr v-if="logs.length === 0">
                        <td colspan="6" class="text-center text-white/40 py-12">No audit logs found</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-2">
            <UiButton @click="prevPage" :disabled="page <= 1" color="#fff" text="Prev" />
            <span class="text-sm text-white/60">Page {{ page }} / {{ totalPages }}</span>
            <UiButton @click="nextPage" :disabled="page >= totalPages" color="#fff" text="Next" />
        </div>
    </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

const { $api } = useNuxtApp()

const logs = ref([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const filters = reactive({
    action: '',
    entity_type: '',
    admin_id: '',
})

async function fetchLogs() {
    loading.value = true
    try {
        const params = { page: page.value, limit: 20 }
        if (filters.action) params.action = filters.action
        if (filters.entity_type) params.entity_type = filters.entity_type
        if (filters.admin_id) params.admin_id = filters.admin_id
        const { data } = await $api.get('/admin/audit-logs', { params })
        if (data?.success) {
            logs.value = data.logs || []
            totalPages.value = data.total_pages || 1
        }
    } catch (err) {
        console.error('Failed to load audit logs:', err)
    } finally {
        loading.value = false
    }
}

function resetFilters() {
    filters.action = ''
    filters.entity_type = ''
    filters.admin_id = ''
    page.value = 1
    fetchLogs()
}

function prevPage() {
    if (page.value > 1) { page.value--; fetchLogs() }
}
function nextPage() {
    if (page.value < totalPages.value) { page.value++; fetchLogs() }
}

function formatDate(iso) {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

function actionBadge(action) {
    const map = {
        CREATE: 'text-green-400',
        UPDATE: 'text-blue-400',
        DELETE: 'text-red-400',
        LOGIN: 'text-purple-400',
    }
    return (map[action] || 'text-white/70') + ' font-medium'
}

onMounted(fetchLogs)
</script>
