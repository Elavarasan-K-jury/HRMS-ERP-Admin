<template>
    <UiSidebarModal v-model="open" :title="document?.name || 'Document Details'" width="720px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">{{ document?.folder_name || '' }}</span>
        </template>
        <template #default>
            <div v-if="loading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                <span class="text-xs">Loading...</span>
            </div>
            <div v-else-if="loadError" class="py-10 flex flex-col items-center gap-2 text-white/50">
                <Icon name="ion:alert-circle-outline" class="w-8 h-8 text-rose-400" />
                <p class="text-sm text-rose-300">Failed to load document details.</p>
                <button class="text-xs text-emerald-300 hover:text-emerald-200 underline" @click="load">Retry</button>
            </div>
            <template v-else-if="document">
                <div class="flex flex-col gap-5">
                    <!-- Stats row -->
                    <div class="grid grid-cols-4 gap-3">
                        <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p class="text-lg font-semibold text-emerald-300">{{ stats?.applicable_employee_count ?? '—' }}</p>
                            <p class="text-[11px] text-white/45 mt-0.5">Applicable</p>
                        </div>
                        <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p class="text-lg font-semibold text-sky-300">{{ stats?.viewed_count ?? '—' }}</p>
                            <p class="text-[11px] text-white/45 mt-0.5">Viewed</p>
                        </div>
                        <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p class="text-lg font-semibold text-violet-300">{{ stats?.acknowledged_count ?? '—' }}</p>
                            <p class="text-[11px] text-white/45 mt-0.5">Acknowledged</p>
                        </div>
                        <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                            <p class="text-lg font-semibold text-amber-300">{{ pendingCount }}</p>
                            <p class="text-[11px] text-white/45 mt-0.5">Pending</p>
                        </div>
                    </div>

                    <!-- Monitoring actions -->
                    <div class="flex items-center gap-2">
                        <button type="button" class="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors" @click="$emit('view-applicable')">
                            <Icon name="ion:people-outline" class="w-4 h-4 text-emerald-300" />
                            View Applicable Employees
                        </button>
                        <button type="button" class="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors" @click="$emit('view-monitoring')">
                            <Icon name="ion:pulse-outline" class="w-4 h-4 text-sky-300" />
                            View Monitoring
                        </button>
                    </div>

                    <!-- Targeting summary -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-3">Folder Targeting</p>
                        <div v-if="hasAnyTargeting" class="flex flex-col gap-2.5">
                            <div v-if="folder?.legal_entity_names?.length" class="flex items-start gap-2">
                                <span class="text-[11px] uppercase tracking-wider text-white/40 w-28 shrink-0 pt-0.5">Legal Entity</span>
                                <span class="text-sm text-white/80">{{ folder.legal_entity_names.join(', ') }}</span>
                            </div>
                            <div v-if="folder?.branch_names?.length" class="flex items-start gap-2">
                                <span class="text-[11px] uppercase tracking-wider text-white/40 w-28 shrink-0 pt-0.5">Business Units</span>
                                <span class="text-sm text-white/80">{{ folder.branch_names.join(', ') }}</span>
                            </div>
                            <div v-if="folder?.location_names?.length" class="flex items-start gap-2">
                                <span class="text-[11px] uppercase tracking-wider text-white/40 w-28 shrink-0 pt-0.5">Locations</span>
                                <span class="text-sm text-white/80">{{ folder.location_names.join(', ') }}</span>
                            </div>
                            <div v-if="folder?.department_names?.length || folder?.sub_department_names?.length" class="flex items-start gap-2">
                                <span class="text-[11px] uppercase tracking-wider text-white/40 w-28 shrink-0 pt-0.5">Departments</span>
                                <span class="text-sm text-white/80">{{ [...(folder.department_names || []), ...(folder.sub_department_names || [])].join(', ') }}</span>
                            </div>
                            <div v-if="folder?.worker_types?.length" class="flex items-start gap-2">
                                <span class="text-[11px] uppercase tracking-wider text-white/40 w-28 shrink-0 pt-0.5">Worker Types</span>
                                <span class="text-sm text-white/80">{{ folder.worker_types.join(', ') }}</span>
                            </div>
                        </div>
                        <p v-else class="text-sm text-white/50">Applies to all employees</p>
                    </div>

                    <!-- Description -->
                    <div v-if="document.description" class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-[11px] uppercase tracking-wider text-white/40 mb-1">Description</p>
                        <p class="text-sm text-white/85">{{ document.description }}</p>
                    </div>

                    <!-- Configuration -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-3">Configuration</p>
                        <div class="flex flex-wrap gap-2">
                            <span v-if="document.allow_download" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
                                <Icon name="ion:download-outline" class="w-3.5 h-3.5" /> Download Allowed
                            </span>
                            <span v-if="document.acknowledgement_required" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-sky-500/15 text-sky-300 border border-sky-400/20">
                                <Icon name="ion:checkmark-circle-outline" class="w-3.5 h-3.5" /> Acknowledgement Required
                            </span>
                            <span v-if="document.block_until_acknowledged" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-amber-500/15 text-amber-300 border border-amber-400/20">
                                <Icon name="ion:lock-closed-outline" class="w-3.5 h-3.5" /> Portal Block Enabled
                            </span>
                            <span v-if="document.ask_expiry_date" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-orange-500/15 text-orange-300 border border-orange-400/20">
                                <Icon name="ion:time-outline" class="w-3.5 h-3.5" /> Expiry Enabled
                            </span>
                        </div>
                    </div>

                    <!-- Expiry -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-[11px] uppercase tracking-wider text-white/40 mb-1">Expiration</p>
                        <template v-if="document.ask_expiry_date && document.expiry_date">
                            <div class="flex items-center gap-2">
                                <p class="text-sm text-white/85">{{ formatDate(document.expiry_date) }}</p>
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border" :class="lifecycleBadgeClass(document.expiry_status)">
                                    <Icon :name="lifecycleBadgeIcon(document.expiry_status)" class="w-3 h-3" />
                                    {{ lifecycleLabel(document.expiry_status) }}
                                </span>
                            </div>
                            <p v-if="daysRemaining !== null" class="text-xs text-white/50 mt-1">{{ daysRemainingText }}</p>
                        </template>
                        <p v-else class="text-sm text-white/50">No expiration</p>
                    </div>

                    <!-- File -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-3">Attachment</p>
                        <template v-if="document.file_name">
                            <!-- Image preview -->
                            <div v-if="isImage(document.file_type)" class="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <img :src="resolveMediaUrl(document.file_url)" :alt="document.file_name || 'Document'" class="max-w-full max-h-80 object-contain mx-auto" @error="imgError = true" />
                                <p v-if="imgError" class="text-xs text-rose-400 text-center py-3">Failed to load image.</p>
                            </div>
                            <!-- PDF preview -->
                            <div v-else-if="isPdf(document.file_type)" class="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <iframe :src="resolveMediaUrl(document.file_url)" class="w-full h-96" frameborder="0"></iframe>
                            </div>
                            <!-- Other file -->
                            <div v-else class="flex items-center gap-3">
                                <Icon name="ion:document-attach-outline" class="w-6 h-6 text-emerald-300" />
                                <div class="min-w-0 flex-1">
                                    <p class="text-sm text-white/85 truncate">{{ document.file_name }}</p>
                                    <p class="text-xs text-white/45">{{ document.file_type || 'Unknown type' }}{{ document.file_size ? ' · ' + formatFileSize(document.file_size) : '' }}</p>
                                </div>
                                <a :href="resolveMediaUrl(document.file_url)" target="_blank" class="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">View / Download</a>
                            </div>
                        </template>
                        <p v-else class="text-xs text-white/40">No file attached.</p>
                    </div>

                    <!-- Metadata -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div class="min-w-0">
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Created</p>
                            <p class="text-white/85">{{ formatDate(document.created_at) }}</p>
                            <p v-if="document.created_by_name" class="text-xs text-white/50">{{ document.created_by_name }}</p>
                        </div>
                        <div class="min-w-0">
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Last Updated</p>
                            <p class="text-white/85">{{ formatDate(document.updated_at) }}</p>
                            <p v-if="document.updated_by_name" class="text-xs text-white/50">{{ document.updated_by_name }}</p>
                        </div>
                    </div>
                </div>
            </template>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Close" prepend-icon="ion:close-circle" />
            <UiButton v-if="document" @click="editDocument" color="#4aff7a" text="Edit" prepend-icon="ion:create-outline" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useOrganizationDocumentStore } from '~/stores/organization/organizationDocument.store'
import { resolveMediaUrl } from '~/utils/media'
import { lifecycleLabel, lifecycleBadgeClass, lifecycleBadgeIcon, daysUntilExpiry, formatFileSize } from '~/utils/orgDocument'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    documentId: { type: String, default: null },
    organizationId: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue', 'edit', 'view-applicable', 'view-monitoring'])

const store = useOrganizationDocumentStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const loading = ref(false)
const loadError = ref(false)
const document = ref(null)
const stats = ref(null)
const folder = ref(null)
const imgError = ref(false)

const pendingCount = computed(() => {
    if (!stats.value) return '—'
    const applicable = stats.value.applicable_employee_count || 0
    const acknowledged = stats.value.acknowledged_count || 0
    if (!applicable) return 0
    return Math.max(0, applicable - acknowledged)
})

const hasAnyTargeting = computed(() => {
    if (!folder.value) return false
    const f = folder.value
    return !!(f.legal_entity_names?.length || f.branch_names?.length || f.location_names?.length ||
        f.department_names?.length || f.sub_department_names?.length || f.worker_types?.length)
})

const daysRemaining = computed(() => daysUntilExpiry(document.value?.expiry_date))

const daysRemainingText = computed(() => {
    const days = daysRemaining.value
    if (days === null) return ''
    if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
    if (days === 0) return 'Expires today'
    if (days === 1) return 'Expires tomorrow'
    return `${days} days remaining`
})

function formatDate(d) {
    if (!d) return '—'
    try {
        const dt = new Date(d)
        if (isNaN(dt.getTime())) return '—'
        return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return '—' }
}

function isImage(type) { return /^image\//.test(type || '') }
function isPdf(type) { return /^application\/pdf/.test(type || '') }

async function load() {
    if (!props.documentId || !props.organizationId) return
    loading.value = true
    loadError.value = false
    imgError.value = false
    try {
        const doc = await store.fetchDocument(props.organizationId, props.documentId)
        document.value = doc
        const s = await store.fetchDocumentStats(props.organizationId, props.documentId)
        stats.value = s
        if (doc?.folder_id) {
            const f = await store.fetchFolder(props.organizationId, doc.folder_id)
            folder.value = f
        }
    } catch (e) {
        loadError.value = true
    } finally {
        loading.value = false
    }
}

function editDocument() {
    emit('edit', document.value)
}

watch(() => props.modelValue, (v) => {
    if (v) {
        document.value = null
        stats.value = null
        folder.value = null
        imgError.value = false
        loadError.value = false
        load()
    }
})
</script>
