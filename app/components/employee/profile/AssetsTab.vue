<template>
    <div class="assets-tab">
        <!-- My Assigned Assets -->
        <section class="card">
            <div class="flex items-center justify-between mb-4">
                <h2 class="hdr"><Icon name="lucide:package" class="ic" /> My Assets</h2>
                <button v-if="assignments.length" class="lnk-btn" @click="fetchMyAssets">
                    <Icon name="lucide:refresh-cw" class="h-4 w-4" /> Refresh
                </button>
            </div>

            <div v-if="loadingAssets" class="center"><UiLoader /></div>

            <div v-else-if="assetError" class="empty-state">
                <Icon name="lucide:triangle-alert" class="h-10 w-10 text-red-400/50 mb-3" />
                <p class="text-sm text-white/50 mb-3">Failed to load assets.</p>
                <UiButton size="xs" color="#4aff7a" text="Retry" prepend-icon="ion:refresh" @click="fetchMyAssets" />
            </div>

            <div v-else-if="assignments.length" class="table-wrap">
                <table class="tbl">
                    <thead>
                        <tr>
                            <th>Asset Name</th>
                            <th>Asset Tag</th>
                            <th>Category</th>
                            <th>Model</th>
                            <th>Assigned Date</th>
                            <th>Return Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in assetRows" :key="row.id">
                            <td class="doc-name">
                                <span class="doc-icon"><Icon name="lucide:laptop" class="h-4 w-4" /></span>
                                {{ row.name }}
                            </td>
                            <td>{{ row.asset_tag }}</td>
                            <td>{{ row.category }}</td>
                            <td>{{ row.model }}</td>
                            <td>{{ row.assigned_date }}</td>
                            <td>{{ row.return_date || '—' }}</td>
                            <td>
                                <span class="chip" :class="row.status === 'ASSIGNED' ? 'chip-green' : 'chip-soft'">
                                    {{ row.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="empty-state">
                <Icon name="lucide:package-open" class="h-10 w-10 text-white/25 mb-3" />
                <p class="text-sm text-white/50">No assets assigned to you</p>
            </div>
        </section>

        <!-- My Asset Requests -->
        <section class="card">
            <div class="flex items-center justify-between mb-4">
                <h2 class="hdr"><Icon name="lucide:file-text" class="ic" /> Asset Requests</h2>
                <div class="flex items-center gap-3">
                    <button v-if="requests.length" class="lnk-btn" @click="fetchMyRequests">
                        <Icon name="lucide:refresh-cw" class="h-4 w-4" /> Refresh
                    </button>
                    <UiButton size="xs" color="#4aff7a" text="Request Asset" prepend-icon="lucide:plus" @click="showRequestModal = true" />
                </div>
            </div>

            <div v-if="loadingRequests" class="center"><UiLoader /></div>

            <div v-else-if="requestError" class="empty-state">
                <Icon name="lucide:triangle-alert" class="h-10 w-10 text-red-400/50 mb-3" />
                <p class="text-sm text-white/50 mb-3">Failed to load requests.</p>
                <UiButton size="xs" color="#4aff7a" text="Retry" prepend-icon="ion:refresh" @click="fetchMyRequests" />
            </div>

            <div v-else-if="requests.length" class="table-wrap">
                <table class="tbl">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Model</th>
                            <th>Priority</th>
                            <th>Reason</th>
                            <th>Requested Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in requestRows" :key="row.id">
                            <td>{{ row.category }}</td>
                            <td>{{ row.model }}</td>
                            <td>
                                <span class="chip" :class="priorityClass(row.priority)">{{ row.priority }}</span>
                            </td>
                            <td class="max-w-[200px] truncate">{{ row.reason || '—' }}</td>
                            <td>{{ row.created_date }}</td>
                            <td>
                                <span class="chip" :class="statusClass(row.status)">{{ row.status }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="empty-state">
                <Icon name="lucide:file-plus" class="h-10 w-10 text-white/25 mb-3" />
                <p class="text-sm text-white/50">No asset requests yet</p>
            </div>
        </section>

        <RequestAssetModal v-model="showRequestModal" :employee="employee" @submitted="onRequestSubmitted" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import RequestAssetModal from './RequestAssetModal.vue'

const props = defineProps({
    employee: { type: Object, required: true },
})

// --- Assigned Assets ---
const loadingAssets = ref(true)
const assetError = ref(null)
const assignments = ref([])

const assetRows = computed(() =>
    assignments.value.map((a) => ({
        id: a.id,
        name: [a.asset?.model?.brand, a.asset?.model?.model_name].filter(Boolean).join(' ').trim() || a.asset?.asset_tag || 'Asset',
        asset_tag: a.asset?.asset_tag || '—',
        category: a.asset?.category?.name || '—',
        model: [a.asset?.model?.brand, a.asset?.model?.model_name].filter(Boolean).join(' ') || '—',
        assigned_date: formatDate(a.assigned_date),
        return_date: formatDate(a.return_date),
        status: a.status || 'ASSIGNED',
    }))
)

async function fetchMyAssets() {
    loadingAssets.value = true
    assetError.value = null
    const { $api } = useNuxtApp()
    try {
        const res = await $api.get('/employee-assets/my-assigned', {
            params: { organization_id: props.employee?.organization_id },
        })
        assignments.value = res.data?.assignments || []
    } catch (err) {
        console.error('[AssetsTab] Failed to load my assets:', err)
        assetError.value = err
    } finally {
        loadingAssets.value = false
    }
}

// --- My Requests ---
const loadingRequests = ref(true)
const requestError = ref(null)
const requests = ref([])
const showRequestModal = ref(false)

const requestRows = computed(() =>
    requests.value.map((r) => ({
        id: r.id,
        category: r.category?.name || '—',
        model: r.model ? `${r.model.brand} ${r.model.model_name}` : '—',
        priority: r.priority || 'MEDIUM',
        reason: r.reason || '',
        created_date: formatDate(r.created_at),
        status: r.status || 'PENDING',
    }))
)

async function fetchMyRequests() {
    loadingRequests.value = true
    requestError.value = null
    const { $api } = useNuxtApp()
    try {
        const res = await $api.get('/employee-assets/my-requests', {
            params: { organization_id: props.employee?.organization_id },
        })
        requests.value = res.data?.requests || []
    } catch (err) {
        console.error('[AssetsTab] Failed to load my requests:', err)
        requestError.value = err
    } finally {
        loadingRequests.value = false
    }
}

function onRequestSubmitted() {
    fetchMyRequests()
}

function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusClass(status) {
    switch (status) {
        case 'APPROVED': return 'chip-green'
        case 'REJECTED': return 'chip-red'
        case 'PENDING': return 'chip-amber'
        default: return 'chip-soft'
    }
}

function priorityClass(priority) {
    switch (priority) {
        case 'CRITICAL': return 'chip-red'
        case 'URGENT': return 'chip-red'
        case 'HIGH': return 'chip-amber'
        case 'MEDIUM': return 'chip-soft'
        case 'LOW': return 'chip-soft'
        default: return 'chip-soft'
    }
}

onMounted(() => {
    fetchMyAssets()
    fetchMyRequests()
})
</script>

<style scoped>
.assets-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card {
    padding: 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin-bottom: 0;
    width: 100%;
}

.ic { width: 16px; height: 16px; opacity: 0.85; }

.lnk-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #7dd3fc;
    font-size: 12.5px;
}
.lnk-btn:hover { text-decoration: underline; text-underline-offset: 2px; }

.table-wrap { overflow-x: auto; }

.tbl {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.tbl th {
    text-align: left;
    font-size: 10.5px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    padding: 8px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tbl td {
    padding: 10px;
    color: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.doc-name {
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
}

.doc-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
}

.chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: rgba(148, 163, 184, 0.18);
}

.chip-green {
    border-color: rgba(34, 197, 94, 0.7);
    background: rgba(34, 197, 94, 0.18);
    color: #bbf7d0;
}

.chip-red {
    border-color: rgba(239, 68, 68, 0.7);
    background: rgba(239, 68, 68, 0.18);
    color: #fca5a5;
}

.chip-amber {
    border-color: rgba(245, 158, 11, 0.7);
    background: rgba(245, 158, 11, 0.18);
    color: #fcd34d;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
}

.center {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: rgba(255, 255, 255, 0.7);
}
</style>
