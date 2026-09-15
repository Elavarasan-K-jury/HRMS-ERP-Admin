<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- HEADER -->
        <div class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">Asset Settings</h2>
        </div>

        <!-- SUB-TABS -->
        <div class="rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
            <div class="flex border-b border-white/10">
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    @click="activeTab = tab.key"
                    class="px-5 py-3 text-sm font-medium transition-colors"
                    :class="activeTab === tab.key
                        ? 'text-[#4aff7a] border-b-2 border-[#4aff7a]'
                        : 'text-white/60 hover:text-white/80'"
                >
                    {{ tab.label }}
                </button>
            </div>

            <!-- TAB: Asset ID Series -->
            <div v-if="activeTab === 'id-series'" class="p-5">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-white font-semibold">Asset ID Series</h3>
                        <p class="text-xs text-white/50 mt-1">Configure automatic asset ID generation</p>
                    </div>
                    <UiButton @click="openAddSeriesModal" color="#4aff7a" text="Add Series" prepend-icon="ion:add-circle" />
                </div>

                <!-- Series Table -->
                <div v-if="seriesLoading" class="text-center py-10 text-white/50">Loading...</div>
                <div v-else-if="!seriesList.length" class="text-center py-10 text-white/50">
                    <Icon name="lucide:inbox" class="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No ID series configured. Create one to enable automatic asset ID generation.</span>
                </div>
                <table v-else class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/10 border-b border-white/10">
                        <tr>
                            <th class="th">Name</th>
                            <th class="th">Prefix</th>
                            <th class="th">Digits</th>
                            <th class="th">Suffix</th>
                            <th class="th">Next #</th>
                            <th class="th">Status</th>
                            <th class="th text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="s in seriesList" :key="s.id" class="border-b border-white/5 hover:bg-white/5">
                            <td class="td font-semibold">{{ s.name }}</td>
                            <td class="td font-mono">{{ s.prefix || '—' }}</td>
                            <td class="td">{{ s.digits }}</td>
                            <td class="td font-mono">{{ s.suffix || '—' }}</td>
                            <td class="td font-mono">{{ String(s.next_number).padStart(s.digits, '0') }}</td>
                            <td class="td">
                                <span :class="s.is_active ? 'badge-green' : 'badge-gray'">
                                    {{ s.is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="td text-right">
                                <div class="inline-flex gap-1">
                                    <UiButton color="#fff" class="btn-icon" title="Edit" @click="editSeries(s)">
                                        <Icon name="lucide:pencil" class="w-4 h-4" />
                                    </UiButton>
                                    <UiButton color="#ff0000" class="btn-icon-danger" title="Delete" @click="confirmDeleteSeries(s)">
                                        <Icon name="lucide:trash-2" class="w-4 h-4" />
                                    </UiButton>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- TAB: Unavailable Status -->
            <div v-if="activeTab === 'unavailable'" class="p-5">
                <div class="mb-4">
                    <h3 class="text-white font-semibold">Unavailable Status</h3>
                    <p class="text-xs text-white/50 mt-1">Asset statuses that prevent assignment. Currently derived from lifecycle status — any status other than AVAILABLE means the asset cannot be assigned.</p>
                </div>
                <div class="rounded-lg bg-white/5 border border-white/10 p-4">
                    <p class="text-white/70 text-sm mb-3">The following statuses make an asset <span class="text-red-400 font-semibold">unavailable</span> for assignment:</p>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="s in unavailableStatuses" :key="s" class="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-300">
                            {{ s }}
                        </span>
                    </div>
                    <p class="text-white/40 text-xs mt-4">Only <span class="text-emerald-400 font-semibold">AVAILABLE</span> assets can be assigned to employees.</p>
                </div>
            </div>

            <!-- TAB: Asset Conditions -->
            <div v-if="activeTab === 'conditions'" class="p-5">
                <div class="mb-4">
                    <h3 class="text-white font-semibold">Asset Conditions</h3>
                    <p class="text-xs text-white/50 mt-1">Configure the condition ratings used when creating or inspecting assets</p>
                </div>
                <div class="rounded-lg bg-white/5 border border-white/10 p-4">
                    <div class="flex flex-wrap gap-2">
                        <span v-for="c in conditionOptions" :key="c" class="px-3 py-1 rounded-lg text-xs font-medium"
                            :class="conditionBadgeClass(c)">
                            {{ c }}
                        </span>
                    </div>
                    <p class="text-white/40 text-xs mt-4">These values are used in asset creation and condition reporting forms.</p>
                </div>
            </div>

            <!-- TAB: Request Settings -->
            <div v-if="activeTab === 'request-settings'" class="p-5">
                <div class="mb-4">
                    <h3 class="text-white font-semibold">Asset Request Settings</h3>
                    <p class="text-xs text-white/50 mt-1">Configure what employees can request and how requests are handled</p>
                </div>
                <div class="rounded-lg bg-white/5 border border-white/10 p-4 space-y-3">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-white text-sm font-medium">Enable Asset Requests</p>
                            <p class="text-white/50 text-xs">Allow employees to submit asset requests</p>
                        </div>
                        <span class="badge-green">Enabled</span>
                    </div>
                    <div class="border-t border-white/10 pt-3">
                        <p class="text-white text-sm font-medium">Requestable Categories</p>
                        <p class="text-white/50 text-xs">All categories are requestable by default</p>
                    </div>
                    <div class="border-t border-white/10 pt-3">
                        <p class="text-white text-sm font-medium">Approval Workflow</p>
                        <p class="text-white/50 text-xs">Requests require admin approval before assignment</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ADD/EDIT SERIES MODAL -->
        <UiSidebarModal width="500px" v-model="seriesStore.addModal" :title="seriesStore.selectedSeries ? 'Edit Asset ID Series' : 'Create Asset ID Series'">
            <div class="space-y-4 p-2">
                <div class="flex flex-col gap-1">
                    <label class="text-white/70 text-sm font-medium">Series Name <span class="text-red-500">*</span></label>
                    <FormInput rounded="lg" color="#fff" v-model="seriesStore.name" placeholder="e.g., Laptop Series" />
                </div>
                <div class="grid grid-cols-3 gap-3">
                    <div class="flex flex-col gap-1">
                        <label class="text-white/70 text-sm font-medium">Prefix</label>
                        <FormInput rounded="lg" color="#fff" v-model="seriesStore.prefix" placeholder="e.g., LAP" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-white/70 text-sm font-medium">Digits</label>
                        <FormInput type="number" rounded="lg" color="#fff" v-model.number="seriesStore.digits" placeholder="6" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-white/70 text-sm font-medium">Suffix</label>
                        <FormInput rounded="lg" color="#fff" v-model="seriesStore.suffix" placeholder="e.g., -" />
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <label class="text-white/70 text-sm font-medium">Active</label>
                    <input type="checkbox" v-model="seriesStore.isActive" class="rounded" />
                </div>
                <div v-if="seriesStore.prefix || seriesStore.suffix" class="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p class="text-white/50 text-xs mb-1">Preview (first ID):</p>
                    <p class="text-white font-mono text-sm">{{ seriesStore.prefix || '' }}{{ String(1).padStart(seriesStore.digits || 6, '0') }}{{ seriesStore.suffix || '' }}</p>
                </div>
            </div>
            <template #footer>
                <UiButton @click="closeSeriesModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton :disabled="seriesStore.loading" @click="saveSeries" color="#4aff7a"
                    :text="seriesStore.loading ? 'Saving...' : (seriesStore.selectedSeries ? 'Update Series' : 'Create Series')" prepend-icon="ion:save-outline" />
            </template>
        </UiSidebarModal>

        <!-- DELETE CONFIRMATION -->
        <UiModal v-model="deleteModal" title="Delete Series?" size="sm">
            <template #default>
                <span>Are you sure you want to delete <strong>{{ seriesStore.selectedSeries?.name }}</strong>?</span>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="confirmDelete" color="#750d0d" text="Delete" prepend-icon="ion:trash" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetIdSeriesStore } from '../../../../stores/organization/assetIdSeries.store'
import { useAuthStore } from '../../../../stores/shared/auth.store'

definePageMeta({ layout: 'organization' })

const seriesStore = useAssetIdSeriesStore()
const authStore = useAuthStore()

const { seriesList, loading: seriesLoading, total, page, totalPages, search } = storeToRefs(seriesStore)

const activeTab = ref('id-series')
const deleteModal = ref(false)

const tabs = [
    { key: 'id-series', label: 'Asset ID Series' },
    { key: 'unavailable', label: 'Unavailable Status' },
    { key: 'conditions', label: 'Asset Conditions' },
    { key: 'request-settings', label: 'Request Settings' },
]

const unavailableStatuses = ['ASSIGNED', 'IN_REPAIR', 'DAMAGED', 'LOST', 'RETIRED', 'DISPOSED']
const conditionOptions = ['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED', 'OBSOLETE', 'END_OF_LIFE', 'SCRAPPED']

function conditionBadgeClass(c) {
    const map = {
        EXCELLENT: 'bg-emerald-500/20 text-emerald-300',
        GOOD: 'bg-green-500/20 text-green-300',
        FAIR: 'bg-yellow-500/20 text-yellow-300',
        NEEDS_REPAIR: 'bg-orange-500/20 text-orange-300',
        DAMAGED: 'bg-red-500/20 text-red-300',
        OBSOLETE: 'bg-gray-500/20 text-gray-300',
        END_OF_LIFE: 'bg-purple-500/20 text-purple-300',
        SCRAPPED: 'bg-zinc-500/20 text-zinc-300',
    }
    return map[c] || 'bg-white/10 text-white/70'
}

function openAddSeriesModal() {
    seriesStore.resetForm()
    seriesStore.addModal = true
}

function editSeries(s) {
    seriesStore.selectedSeries = s
    seriesStore.name = s.name
    seriesStore.prefix = s.prefix
    seriesStore.digits = s.digits
    seriesStore.suffix = s.suffix
    seriesStore.isActive = s.is_active
    seriesStore.addModal = true
}

function closeSeriesModal() {
    seriesStore.addModal = false
    seriesStore.resetForm()
}

async function saveSeries() {
    if (seriesStore.selectedSeries) {
        await seriesStore.updateSeries()
    } else {
        await seriesStore.createSeries()
    }
}

function confirmDeleteSeries(s) {
    seriesStore.selectedSeries = s
    deleteModal.value = true
}

async function confirmDelete() {
    await seriesStore.deleteSeries()
    deleteModal.value = false
}

onMounted(async () => {
    await seriesStore.fetchSeries()
})
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}
.td {
    @apply px-4 py-3 align-middle text-white/90;
}
.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}
.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}
.badge-green {
    @apply inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300;
}
.badge-gray {
    @apply inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/60;
}
</style>
