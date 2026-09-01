<template>
    <section class="card">
        <div class="flex items-center justify-between mb-4">
            <h2 class="hdr"><Icon name="lucide:package" class="ic" /> Assets</h2>
            <button v-if="assets.length" class="lnk-btn" @click="fetchAssets">
                <Icon name="lucide:refresh-cw" class="h-4 w-4" /> Refresh
            </button>
        </div>

        <div v-if="loading" class="center"><UiLoader /></div>

        <div v-else-if="error" class="empty-state">
            <Icon name="lucide:triangle-alert" class="h-10 w-10 text-red-400/50 mb-3" />
            <p class="text-sm text-white/50 mb-3">Failed to load assets.</p>
            <UiButton size="xs" color="#4aff7a" text="Retry" prepend-icon="ion:refresh" @click="fetchAssets" />
        </div>

        <div v-else-if="assets.length" class="table-wrap">
            <table class="tbl">
                <thead>
                    <tr>
                        <th>Asset Name</th>
                        <th>Asset ID</th>
                        <th>Category</th>
                        <th>Assigned Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in rows" :key="row.id">
                        <td class="doc-name">
                            <span class="doc-icon"><Icon name="lucide:laptop" class="h-4 w-4" /></span>
                            {{ row.name }}
                        </td>
                        <td>{{ row.asset_id }}</td>
                        <td>{{ row.category }}</td>
                        <td>{{ row.assigned_date }}</td>
                        <td>{{ row.return_date || '—' }}</td>
                        <td>
                            <span class="chip" :class="row.status === 'Active' || row.status === 'Assigned' ? 'chip-green' : 'chip-soft'">
                                {{ row.status }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="empty-state">
            <Icon name="lucide:package-open" class="h-10 w-10 text-white/25 mb-3" />
            <p class="text-sm text-white/50">No assets assigned</p>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
    employee: { type: Object, required: true },
})

const loading = ref(true)
const error = ref(null)
const assets = ref([])

const rows = computed(() => {
    const empId = props.employee?.id
    const list = []
    for (const asset of assets.value) {
        const assignments = (asset.assignments || []).filter(a => a.employee_id === empId)
        const assignment = assignments[assignments.length - 1]
        if (!assignment) continue
        list.push({
            id: asset.id,
            name: [asset.model?.brand, asset.model?.model_name].filter(Boolean).join(' ').trim() || asset.asset_tag || 'Asset',
            asset_id: asset.asset_tag || asset.id,
            category: asset.category?.name || '—',
            assigned_date: formatDate(assignment.assigned_at),
            return_date: formatDate(assignment.returned_at),
            status: assignment.status || asset.status || 'Assigned',
        })
    }
    return list
})

async function fetchAssets() {
    loading.value = true
    error.value = null
    const { $api } = useNuxtApp()
    try {
        const res = await $api.get('/assets', {
            params: {
                organization_id: props.employee?.organization_id,
                page: 1,
                limit: 100,
            },
        })
        assets.value = res.data?.assets || []
    } catch (err) {
        console.error('[AssetsTab] Failed to load assets:', err)
        error.value = err
    } finally {
        loading.value = false
    }
}

function formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(fetchAssets)
</script>

<style scoped>
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