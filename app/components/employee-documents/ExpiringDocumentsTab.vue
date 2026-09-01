<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Expiring Documents</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents that are approaching their expiry date.</p>
                <p v-if="!loading && !error && store.expiringTotal > 0" class="text-xs text-amber-300/80 mt-2">
                    {{ store.expiringTotal }} document{{ store.expiringTotal === 1 ? '' : 's' }} within {{ store.expiringDays }} days
                </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <label class="text-xs text-white/50">Window</label>
                <select v-model="windowDays" class="bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none" @change="onWindowChange">
                    <option :value="7" class="bg-[#14161c]">7 days</option>
                    <option :value="15" class="bg-[#14161c]">15 days</option>
                    <option :value="30" class="bg-[#14161c]">30 days</option>
                    <option :value="60" class="bg-[#14161c]">60 days</option>
                    <option :value="90" class="bg-[#14161c]">90 days</option>
                </select>
                <UiSearch v-model="search" placeholder="Search employee or document..." class="w-56" color="#fff" @search="onSearch" @clear="onSearch('')" />
                <UiButton @click="load(store.expiringPage, search.value, windowDays.value)" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="loading" />
            </div>
        </div>

        <!-- Detail drawer (reuses verified detail for read-only view) -->
        <VerifiedDocumentDetail v-model="detailOpen" :pending="detailTarget" />
        <RenewDocumentDrawer v-model="renewOpen" :pending="renewTarget" @renewed="onRenewed" />

        <!-- Loading -->
        <div v-if="store.expiringLoading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-4 space-y-2">
            <div v-for="i in 4" :key="i" class="animate-pulse p-3">
                <div class="skeleton w-40 h-4 mb-2" />
                <div class="skeleton w-24 h-3" />
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="store.expiringError" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Could not load expiring documents.</p>
            <UiButton @click="load" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <!-- Empty -->
        <div v-else-if="!store.expiringDocuments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:time-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">{{ search ? 'No expiring documents match your search.' : 'No expiring documents' }}</p>
            <p v-if="!search" class="text-xs text-white/50 text-center max-w-md">Verified documents approaching expiry will appear here.</p>
        </div>

        <!-- Grouped list -->
        <div v-else class="space-y-3">
            <div v-for="group in groupedExpiring" :key="group.employee_id" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
                <div class="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center gap-3">
                    <span class="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-sm font-semibold text-white/85 shrink-0">{{ initials(group.employee_name) }}</span>
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-white/90 truncate">{{ group.employee_name }}</p>
                        <p class="text-xs text-white/45 truncate">{{ group.employee_code || '' }}{{ group.designation ? ' • ' + group.designation : '' }}</p>
                    </div>
                    <span class="ml-auto inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/20">{{ group.documents.length }} expiring</span>
                </div>
                <table class="min-w-full text-sm text-white/90">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Document</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Folder</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Expiry Date</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Days Left</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Verified On</th>
                            <th class="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Status</th>
                            <th class="px-5 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in group.documents" :key="d.submission_id" class="border-b border-white/5 hover:bg-white/5">
                            <td class="px-5 py-2.5">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="text-sm text-white/85 truncate">{{ d.document_type_name }}</span>
                                    <span v-if="d.is_current" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 shrink-0">Current</span>
                                    <span v-if="d.is_na" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 shrink-0">N/A</span>
                                    <span v-if="d.document_is_multiple" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-violet-500/15 text-violet-300 shrink-0">Multi</span>
                                </div>
                            </td>
                            <td class="px-5 py-2.5 text-xs text-white/50">{{ d.folder_name || '—' }}</td>
                            <td class="px-5 py-2.5 text-xs text-white/70">{{ formatDate(d.expiry_date) }}</td>
                            <td class="px-5 py-2.5 text-xs">
                                <span class="font-semibold" :class="daysLeftClass(d)">{{ daysLeftLabel(d) }}</span>
                            </td>
                            <td class="px-5 py-2.5 text-xs text-white/50">{{ formatDate(d.verified_at) }}</td>
                            <td class="px-5 py-2.5">
                                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300">Verified</span>
                            </td>
                            <td class="px-5 py-2.5 text-right">
                                <div class="flex items-center justify-end gap-1.5">
                                    <UiButton @click="openDetail(d)" color="#fff" text="View" prepend-icon="ion:eye-outline" size="sm" />
                                    <UiButton @click="openRenew(d)" color="#4aff7a" text="Renew" prepend-icon="ion:refresh" size="sm" />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="store.expiringTotalPages > 1" class="flex items-center justify-between">
                <p class="text-xs text-white/40">Page {{ store.expiringPage }} of {{ store.expiringTotalPages }} ({{ store.expiringTotal }} total)</p>
                <div class="flex items-center gap-1">
                    <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="store.expiringPage <= 1" @click="pagePrev">Prev</button>
                    <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="store.expiringPage >= store.expiringTotalPages" @click="pageNext">Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/employeeDocument.store'
import VerifiedDocumentDetail from './VerifiedDocumentDetail.vue'
import RenewDocumentDrawer from './RenewDocumentDrawer.vue'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()
const search = ref('')
const windowDays = ref(30)
const detailOpen = ref(false)
const detailTarget = ref(null)
const renewOpen = ref(false)
const renewTarget = ref(null)

const loading = computed(() => store.expiringLoading)
const error = computed(() => store.expiringError)

const groupedExpiring = computed(() => {
    const map = {}
    for (const d of store.expiringDocuments) {
        const key = d.employee_id
        if (!map[key]) { map[key] = { employee_id: d.employee_id, employee_name: d.employee_name, employee_code: d.employee_code, designation: d.designation, documents: [] } }
        map[key].documents.push(d)
    }
    return Object.values(map)
})

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() }
function daysLeftLabel(d) {
    if (d.days_left === null || d.days_left === undefined) return '—'
    if (d.days_left < 0) return 'Expired'
    if (d.days_left === 0) return 'Expires today'
    return `${d.days_left} day${d.days_left === 1 ? '' : 's'} left`
}
function daysLeftClass(d) {
    if (d.days_left < 0) return 'text-rose-300'
    if (d.days_left === 0) return 'text-amber-300'
    if (d.days_left <= 7) return 'text-amber-300'
    return 'text-white/70'
}

async function load(page, term, days) {
    try {
        await store.fetchExpiringDocuments({ page, search: term, days })
    } catch (e) { /* store sets error */ }
}
function onSearch(value) { search.value = value; load(1, value, windowDays.value) }
function onWindowChange() { load(1, search.value, windowDays.value) }
function pagePrev() { if (store.expiringPage > 1) load(store.expiringPage - 1, search.value, windowDays.value) }
function pageNext() { if (store.expiringPage < store.expiringTotalPages) load(store.expiringPage + 1, search.value, windowDays.value) }
function openDetail(d) { detailTarget.value = d; detailOpen.value = true }
function openRenew(d) { renewTarget.value = d; renewOpen.value = true }
function onRenewed() { renewOpen.value = false; load(store.expiringPage, search.value, windowDays.value) }

watch(() => props.organizationId, (v) => { if (v) load(1, '', windowDays.value) })
onMounted(() => { if (props.organizationId) load(1, '', windowDays.value) })
</script>
