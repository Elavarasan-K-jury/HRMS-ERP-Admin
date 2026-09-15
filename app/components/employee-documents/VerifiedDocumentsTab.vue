<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Verified Documents</h2>
                <p class="text-xs text-white/55 max-w-2xl mt-1">Documents that have been reviewed and verified.</p>
                <p v-if="!loading && !error && store.verifiedTotal > 0" class="text-xs text-emerald-300/80 mt-2">
                    {{ store.verifiedTotal }} verified document{{ store.verifiedTotal === 1 ? '' : 's' }}
                </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <UiSearch v-model="search" placeholder="Search employee or document..." class="w-64" color="#fff" @search="onSearch" @clear="onSearch('')" />
                <UiButton @click="load(store.verifiedPage, search.value)" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="loading" />
            </div>
        </div>

        <!-- Detail drawer -->
        <VerifiedDocumentDetail v-model="detailOpen" :pending="detailTarget" :organization-id="props.organizationId" />

        <!-- Loading -->
        <div v-if="store.verifiedLoading && !store.verifiedDocuments.length" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
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
        <div v-else-if="store.verifiedError" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center gap-2 text-white/50">
            <Icon name="ion:alert-circle-outline" class="w-8 h-8 opacity-50" />
            <p class="text-sm">Could not load verified documents.</p>
            <UiButton @click="load" color="#4aff7a" text="Retry" size="sm" />
        </div>

        <!-- Empty -->
        <div v-else-if="!store.verifiedDocuments.length && !store.verifiedLoading" class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-16 flex flex-col items-center justify-center gap-3 text-white/70">
            <Icon name="ion:shield-checkmark-outline" class="w-10 h-10 opacity-50" />
            <p class="text-sm font-medium text-white/85">{{ search ? 'No verified documents match your search.' : 'No verified documents found.' }}</p>
            <p v-if="!search" class="text-xs text-white/50 text-center max-w-md">Documents will appear here after they are reviewed and verified.</p>
            <UiButton v-if="search" @click="onSearch('')" color="#fff" text="Clear Search" size="sm" class="mt-1" />
        </div>

        <!-- Main list -->
        <div v-else class="rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
            <!-- Sub-header -->
            <div class="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Verified ({{ groupedVerified.length }} Employee{{ groupedVerified.length === 1 ? '' : 's' }})</p>
            </div>

            <!-- Employee groups -->
            <div class="flex flex-col">
                <div v-for="group in groupedVerified" :key="group.employee_id" class="border-b border-white/5 last:border-b-0">
                    <!-- Employee row -->
                    <button
                        type="button"
                        class="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                        @click="toggleEmployee(group.employee_id)"
                    >
                        <span class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-semibold text-white/80 shrink-0">{{ initials(group.employee_name) }}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-white/90 truncate">{{ group.employee_name || '—' }}</p>
                            <p class="text-xs text-white/40 truncate">
                                <template v-if="group.employee_code">{{ group.employee_code }}</template>
                                <template v-if="group.designation"> · {{ group.designation }}</template>
                            </p>
                        </div>
                        <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/20 shrink-0">{{ group.documents.length }} verified</span>
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
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Submitted On</th>
                                        <th class="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">Verified On</th>
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
                                        <td class="px-4 py-2.5 text-xs text-white/50">{{ formatDate(d.submitted_at) }}</td>
                                        <td class="px-4 py-2.5 text-xs text-white/50">{{ formatDate(d.verified_at) }}</td>
                                        <td class="px-4 py-2.5">
                                            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300">Verified</span>
                                        </td>
                                        <td class="px-4 py-2.5 text-right">
                                            <UiButton @click="openDetail(d)" color="#fff" text="View" prepend-icon="ion:eye-outline" size="sm" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Transition>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="store.verifiedTotalPages > 1" class="px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
                <p class="text-xs text-white/45">
                    Page {{ store.verifiedPage }} of {{ store.verifiedTotalPages }} ({{ store.verifiedTotal }} total)
                </p>
                <div class="flex items-center gap-1">
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.verifiedPage <= 1 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.verifiedPage <= 1"
                        @click="pagePrev"
                    >Previous</button>
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        :class="store.verifiedPage >= store.verifiedTotalPages ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white hover:bg-white/10'"
                        :disabled="store.verifiedPage >= store.verifiedTotalPages"
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

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useEmployeeDocumentStore()
const search = ref('')
const detailOpen = ref(false)
const detailTarget = ref(null)
const expanded = ref(new Set())

const loading = computed(() => store.verifiedLoading)
const error = computed(() => store.verifiedError)

const groupedVerified = computed(() => {
    const map = {}
    for (const d of store.verifiedDocuments) {
        const key = d.employee_id
        if (!map[key]) {
            map[key] = { employee_id: d.employee_id, employee_name: d.employee_name, employee_code: d.employee_code, designation: d.designation, documents: [] }
        }
        map[key].documents.push(d)
    }
    return Object.values(map)
})

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() }

function toggleEmployee(empId) {
    const next = new Set(expanded.value)
    if (next.has(empId)) next.delete(empId)
    else next.add(empId)
    expanded.value = next
}

async function load(page, term) {
    try {
        await store.fetchVerifiedDocuments({ organization_id: props.organizationId, page, search: term })
    } catch (e) { /* store sets error */ }
}
function onSearch(value) { search.value = value; load(1, value) }
function pagePrev() { if (store.verifiedPage > 1) load(store.verifiedPage - 1, search.value) }
function pageNext() { if (store.verifiedPage < store.verifiedTotalPages) load(store.verifiedPage + 1, search.value) }
function openDetail(d) { detailTarget.value = d; detailOpen.value = true }

watch(() => props.organizationId, (v) => { if (v) load(1, '') })
onMounted(() => { if (props.organizationId) load(1, '') })
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
