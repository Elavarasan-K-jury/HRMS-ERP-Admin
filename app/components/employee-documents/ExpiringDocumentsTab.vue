<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Expiring Documents</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents that are approaching their expiry date.</p>
                <p v-if="!loading && !error && store.expiringTotal > 0" class="text-xs text-amber-300/80 mt-2">
                    {{ store.expiringTotal }} document{{ store.expiringTotal === 1 ? '' : 's' }} within {{ windowDays }} days
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
                <UiButton @click="load(store.expiringPage, search.value, windowDays)" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="loading" />
            </div>
        </div>

        <!-- Detail drawer (reuses verified detail for read-only view) -->
        <VerifiedDocumentDetail v-model="detailOpen" :pending="detailTarget" :organization-id="props.organizationId" />
        <RenewDocumentDrawer v-model="renewOpen" :pending="renewTarget" :organization-id="props.organizationId" @renewed="onRenewed" />

        <!-- Loading -->
        <div v-if="store.expiringLoading && !store.expiringDocuments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-white/10 bg-white/5">
                <div class="skeleton w-40 h-4" />
            </div>
            <div v-for="i in 4" :key="i" class="p-4 border-b border-white/5 animate-pulse">
                <div class="flex items-center gap-3">
                    <div class="skeleton w-10 h-10 rounded-full" />
                    <div class="flex-1 space-y-2">
                        <div class="skeleton w-48 h-4" />
                        <div class="skeleton w-36 h-3" />
                    </div>
                    <div class="skeleton w-20 h-4" />
                    <div class="skeleton w-5 h-5 rounded" />
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="store.expiringError" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Could not load expiring documents.</p>
            <UiButton @click="load" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <!-- Empty -->
        <div v-else-if="!store.expiringDocuments.length && !store.expiringLoading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:time-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">{{ search ? 'No expiring documents match your search.' : 'No expiring documents' }}</p>
            <p v-if="!search" class="text-xs text-white/50 text-center max-w-md">Verified documents with an expiry date within {{ windowDays }} days will appear here.</p>
            <UiButton v-if="search" @click="onSearch('')" color="#fff" text="Clear Search" size="sm" class="mt-1" />
        </div>

        <!-- Main list -->
        <div v-else class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
            <!-- Sub-header -->
            <div class="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Expiring ({{ groupedExpiring.length }} Employee{{ groupedExpiring.length === 1 ? '' : 's' }})</p>
            </div>

            <!-- Employee groups -->
            <div class="flex flex-col">
                <div v-for="group in groupedExpiring" :key="group.employee_id" class="border-b border-white/5 last:border-b-0">
                    <!-- Employee row -->
                    <button
                        type="button"
                        class="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                        @click="toggleEmployee(group.employee_id)"
                    >
                        <span class="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-xs font-semibold text-white/80 shrink-0">{{ initials(group.employee_name) }}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white/90 truncate">{{ group.employee_name || '—' }}</p>
                            <p class="text-xs text-white/40 truncate">
                                <template v-if="group.employee_code">{{ group.employee_code }}</template>
                                <template v-if="group.designation"> · {{ group.designation }}</template>
                            </p>
                        </div>
                        <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0" :class="group.hasExpired ? 'bg-rose-500/15 text-rose-300 border border-rose-400/20' : 'bg-amber-500/15 text-amber-300 border border-amber-400/20'">
                            {{ group.documents.length }} expiring{{ group.hasExpired ? ' (incl. expired)' : '' }}
                        </span>
                        <Icon
                            :name="expanded.has(group.employee_id) ? 'ion:chevron-down' : 'ion:chevron-forward'"
                            class="w-4 h-4 text-white/40 shrink-0 transition-transform"
                        />
                    </button>

                    <!-- Expanded document list -->
                    <Transition name="accordion">
                        <div v-if="expanded.has(group.employee_id)" class="bg-white/[0.02]">
                            <table class="min-w-full text-sm text-white/90">
                                <thead class="bg-white/5 border-y border-white/10">
                                    <tr>
                                        <th class="px-4 pl-16 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Document</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Folder</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Expiry Date</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Days Left</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Status</th>
                                        <th class="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-white/45">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="d in group.documents" :key="d.submission_id" class="border-b border-white/5 hover:bg-white/5">
                                        <td class="px-4 pl-16 py-2.5">
                                            <div class="flex items-center gap-2 min-w-0">
                                                <span class="text-sm text-white/85 truncate">{{ d.document_type_name }}</span>
                                                <span v-if="d.is_current" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 shrink-0">Current</span>
                                                <span v-if="d.is_na" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 shrink-0">N/A</span>
                                                <span v-if="d.document_is_multiple" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-violet-500/15 text-violet-300 shrink-0">Multi</span>
                                            </div>
                                        </td>
                                        <td class="px-4 py-2.5 text-xs text-white/50">{{ d.folder_name || '—' }}</td>
                                        <td class="px-4 py-2.5 text-xs text-white/70">{{ formatDate(d.expiry_date) }}</td>
                                        <td class="px-4 py-2.5 text-xs">
                                            <span class="font-semibold" :class="daysLeftClass(d)">{{ daysLeftLabel(d) }}</span>
                                        </td>
                                        <td class="px-4 py-2.5">
                                            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="d.expiry_state === 'EXPIRED' ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'">
                                                {{ d.expiry_state === 'EXPIRED' ? 'Expired' : 'Verified' }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-2.5 text-right">
                                            <div class="flex items-center justify-end gap-1.5">
                                                <UiButton @click="openDetail(d)" color="#fff" text="View" prepend-icon="ion:eye-outline" size="sm" />
                                                <UiButton @click="openRenew(d)" color="#4aff7a" text="Renew" prepend-icon="ion:refresh" size="sm" />
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="store.expiringTotalPages > 1" class="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <p class="text-xs text-white/45">
                    Page {{ store.expiringPage }} of {{ store.expiringTotalPages }} ({{ store.expiringTotal }} total)
                </p>
                <div class="flex items-center gap-1">
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.expiringPage <= 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.expiringPage <= 1"
                        @click="pagePrev"
                    >Previous</button>
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.expiringPage >= store.expiringTotalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.expiringPage >= store.expiringTotalPages"
                        @click="pageNext"
                    >Next</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
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
const expanded = ref(new Set())

const loading = computed(() => store.expiringLoading)
const error = computed(() => store.expiringError)

const groupedExpiring = computed(() => {
    const map = {}
    for (const d of store.expiringDocuments) {
        const key = d.employee_id
        if (!map[key]) {
            map[key] = { employee_id: d.employee_id, employee_name: d.employee_name, employee_code: d.employee_code, designation: d.designation, documents: [], hasExpired: false }
        }
        map[key].documents.push(d)
        if (d.expiry_state === 'EXPIRED') map[key].hasExpired = true
    }
    return Object.values(map)
})

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() }
function daysLeftLabel(d) {
    if (d.days_left === null || d.days_left === undefined) return '—'
    if (d.days_left < 0) return `${Math.abs(d.days_left)}d overdue`
    if (d.days_left === 0) return 'Expires today'
    return `${d.days_left}d left`
}
function daysLeftClass(d) {
    if (d.days_left < 0) return 'text-rose-300'
    if (d.days_left === 0) return 'text-amber-300'
    if (d.days_left <= 7) return 'text-amber-300'
    return 'text-white/70'
}

function toggleEmployee(empId) {
    const next = new Set(expanded.value)
    if (next.has(empId)) next.delete(empId)
    else next.add(empId)
    expanded.value = next
}

async function load(page, term, days) {
    try {
        await store.fetchExpiringDocuments({ organization_id: props.organizationId, page, search: term, days })
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

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
    max-height: 0;
    opacity: 0;
}
.accordion-enter-to,
.accordion-leave-from {
    max-height: 2000px;
    opacity: 1;
}
</style>
