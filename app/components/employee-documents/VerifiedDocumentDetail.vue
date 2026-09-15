<template>
    <UiSidebarModal v-model="open" :title="`Verified Document`" width="720px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">{{ submission?.document_type_name }}</span>
        </template>
        <template #default>
            <div v-if="loading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                <span class="text-xs">Loading...</span>
            </div>
            <template v-else>
                <div class="flex flex-col gap-5">
                    <!-- Employee + document -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <span class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-sm font-semibold text-white/85">{{ initials(submission?.employee_name) }}</span>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-white/90 truncate">{{ submission?.employee_name }}</p>
                                <p class="text-xs text-white/45 truncate">{{ submission?.employee_code || '' }}</p>
                            </div>
                        </div>
                        <div class="text-sm text-white/80">
                            <p><span class="text-white/45">Folder:</span> {{ submission?.folder_name }}</p>
                            <p><span class="text-white/45">Document:</span> {{ submission?.document_type_name }}</p>
                        </div>
                    </div>

                    <!-- Submission + verification metadata -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div class="min-w-0">
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Submitted By</p>
                            <p class="text-white/85 truncate">{{ submission?.submitted_by_name || submission?.submitted_by_id || '—' }}</p>
                            <p class="text-[11px] uppercase tracking-wider text-white/40 mt-2">Submitted On</p>
                            <p class="text-white/85">{{ formatDateTime(submission?.submitted_at) }}</p>
                        </div>
                        <div class="min-w-0">
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Verified By</p>
                            <p class="text-white/85 truncate">{{ submission?.verified_by_name || submission?.verified_by_id || '—' }}</p>
                            <p class="text-[11px] uppercase tracking-wider text-white/40 mt-2">Verified On</p>
                            <p class="text-white/85">{{ formatDateTime(submission?.verified_at) }}</p>
                        </div>
                    </div>

                    <!-- N/A -->
                    <div v-if="submission?.is_na" class="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                        <p class="text-sm font-semibold text-amber-200">Not Applicable</p>
                        <p class="text-xs text-white/60 mt-1">This document was marked as Not Applicable.</p>
                    </div>

                    <!-- Dynamic field values -->
                    <template v-if="!submission?.is_na && fields.length">
                        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p class="text-sm font-semibold text-white/85 mb-3">Document Details</p>
                            <div class="flex flex-col gap-2.5">
                                <div v-for="f in fields" :key="f.id || f.key" class="flex items-start justify-between gap-3 border-b border-white/5 pb-2">
                                    <span class="text-sm text-white/60">{{ f.label }}</span>
                                    <span class="text-sm text-white/90 text-right max-w-[60%] break-words">{{ displayFieldValue(f) }}</span>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- File -->
                    <div v-if="!submission?.is_na" class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-3">Document File</p>
                        <div v-if="submission?.file_id">
                            <!-- Image preview -->
                            <div v-if="isImage(submission?.file_type)" class="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <img :src="resolveMediaUrl(submission?.file_url)" :alt="submission?.file_name || 'Document'" class="max-w-full max-h-80 object-contain mx-auto" @error="imgError = true" />
                                <p v-if="imgError" class="text-xs text-rose-400 text-center py-3">Failed to load image.</p>
                            </div>
                            <!-- PDF preview -->
                            <div v-else-if="isPdf(submission?.file_type)" class="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <iframe :src="resolveMediaUrl(submission?.file_url)" class="w-full h-96" frameborder="0"></iframe>
                            </div>
                            <!-- Other file -->
                            <div v-else class="flex items-center gap-3">
                                <Icon name="ion:document-attach-outline" class="w-6 h-6 text-emerald-300" />
                                <div class="min-w-0 flex-1">
                                    <p class="text-sm text-white/85 truncate">{{ submission?.file_name || 'Document file' }}</p>
                                    <p class="text-xs text-white/45">{{ submission?.file_type || '' }}</p>
                                </div>
                                <a :href="resolveMediaUrl(submission?.file_url)" class="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">View / Download</a>
                            </div>
                        </div>
                        <p v-else class="text-xs text-white/40">No file attached.</p>
                    </div>

                    <!-- Expiry -->
                    <div v-if="submission?.expiry_date" class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm text-white/80"><span class="text-white/45">Expiry Date:</span> {{ formatDateTime(submission?.expiry_date) }}</p>
                    </div>

                    <!-- Replaced indicator -->
                    <div v-if="!submission?.is_current && submission?.replaced_by_submission_id" class="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                        <p class="text-sm font-semibold text-amber-200">Replaced</p>
                        <p class="text-xs text-white/60 mt-1">This submission has been superseded by a newer document.</p>
                    </div>

                    <!-- History: previous submissions for the same assignment -->
                    <div v-if="historySubmissions.length" class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <button class="flex items-center gap-2 text-sm font-semibold text-white/85" @click="showHistory = !showHistory">
                            <Icon :name="showHistory ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="w-4 h-4" />
                            Previous Submissions ({{ historySubmissions.length }})
                        </button>
                        <div v-if="showHistory" class="mt-3 flex flex-col gap-2">
                            <div v-for="h in historySubmissions" :key="h.id" class="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-white/60">{{ formatDateTime(h.submitted_at) }}</span>
                                        <span :class="['inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium', statusBadgeClass(h.status)]">{{ h.status }}</span>
                                        <span v-if="!h.is_current" class="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/45">Replaced</span>
                                    </div>
                                    <p class="text-xs text-white/50 truncate mt-0.5">{{ h.file_name || 'No file' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </template>
        <template #footer>
            <UiButton @click="open = false" color="#fff" text="Close" prepend-icon="ion:close-circle" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import { resolveMediaUrl } from '~/utils/media'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    pending: { type: Object, default: null },
    organizationId: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const store = useEmployeeDocumentStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const loading = ref(false)
const submission = ref(null)
const fields = ref([])
const historySubmissions = ref([])
const showHistory = ref(false)
const imgError = ref(false)

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function isImage(type) { return /^image\//.test(type || '') }
function isPdf(type) { return /^application\/pdf/.test(type || '') }
function displayFieldValue(f) {
    const v = submission.value?.field_values?.[f.key]
    if (f.field_type === 'DATE' && v) return formatDateTime(v)
    if (f.field_type === 'DROPDOWN') return v || '—'
    if (f.field_type === 'MULTI_SELECT') return Array.isArray(v) ? v.join(', ') : (v || '—')
    return v !== undefined && v !== null && v !== '' ? v : '—'
}
function statusBadgeClass(status) {
    if (status === 'VERIFIED') return 'bg-emerald-500/15 text-emerald-300'
    if (status === 'REJECTED') return 'bg-red-500/15 text-red-300'
    if (status === 'EXPIRED') return 'bg-orange-500/15 text-orange-300'
    return 'bg-blue-500/15 text-blue-300'
}

async function loadSubmission() {
    loading.value = true
    try {
        submission.value = await store.getSubmission(props.pending.submission_id, { organization_id: props.organizationId })
        fields.value = submission.value?.fields || []
        // Load history (replaced submissions for the same assignment)
        if (submission.value?.assignment_id) {
            const all = await store.fetchAssignmentSubmissions(submission.value.assignment_id)
            historySubmissions.value = all.filter(s => s.id !== submission.value.id && !s.is_current)
        }
    } catch (e) {
        console.error('[verified detail] load error:', e)
    } finally {
        loading.value = false
    }
}

watch(() => props.modelValue, (v) => {
    if (v) {
        submission.value = null
        fields.value = []
        historySubmissions.value = []
        showHistory.value = false
        imgError.value = false
        if (props.pending?.submission_id) loadSubmission()
    }
})
</script>
