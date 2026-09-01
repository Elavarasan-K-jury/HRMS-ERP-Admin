<template>
    <UiSidebarModal v-model="open" :title="`Review ${pending?.document_type_name || 'Document'}`" width="720px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Review submitted document and verify or reject.</span>
        </template>
        <template #default>
            <div v-if="loading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                <span class="text-xs">Loading submission detail...</span>
            </div>
            <template v-else>
                <div class="flex flex-col gap-5">
                    <!-- Employee + document summary -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <span class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-sm font-semibold text-white/85">{{ initials(submission?.employee_name) }}</span>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-white/90 truncate">{{ submission?.employee_name }}</p>
                                <p class="text-xs text-white/45 truncate">{{ submission?.employee_code || '' }}{{ submission?.designation ? ' • ' + submission?.designation : '' }}{{ submission?.department ? ' • ' + submission?.department : '' }}</p>
                            </div>
                        </div>
                        <div class="text-sm text-white/80">
                            <p><span class="text-white/45">Folder:</span> {{ submission?.folder_name }}</p>
                            <p><span class="text-white/45">Document:</span> {{ submission?.document_type_name }}</p>
                        </div>
                    </div>

                    <!-- Submission info -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div class="min-w-0">
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Submitted By</p>
                            <p class="text-white/85 truncate">{{ submission?.submitted_by_name || submission?.submitted_by_id || '—' }}</p>
                        </div>
                        <div>
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Submitted On</p>
                            <p class="text-white/85">{{ formatDateTime(submission?.submitted_at) }}</p>
                        </div>
                        <div>
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Status</p>
                            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300">Pending Verification</span>
                        </div>
                    </div>

                    <!-- N/A -->
                    <div v-if="submission?.is_na" class="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                        <p class="text-sm font-semibold text-amber-200">Not Applicable</p>
                        <p class="text-xs text-white/60 mt-1">The employee marked this document as Not Applicable. No file is required.</p>
                    </div>

                    <!-- Dynamic field values -->
                    <template v-if="!submission?.is_na && fields.length">
                        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p class="text-sm font-semibold text-white/85 mb-3">Submission Details</p>
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
                        <div v-if="submission?.file_id" class="flex items-center gap-3">
                            <Icon name="ion:document-attach-outline" class="w-6 h-6 text-emerald-300" />
                            <div class="min-w-0 flex-1">
                                <p class="text-sm text-white/85 truncate">{{ submission?.file_name || 'Document file' }}</p>
                                <p class="text-xs text-white/45">{{ submission?.file_type || '' }}</p>
                            </div>
                            <a :href="resolveFileUrl(submission?.file_url)" target="_blank" rel="noopener" class="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">View / Download</a>
                        </div>
                        <p v-else class="text-xs text-white/40">No file attached.</p>
                    </div>

                    <!-- Expiry -->
                    <div v-if="submission?.expiry_date" class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm text-white/80"><span class="text-white/45">Expiry Date:</span> {{ formatDateTime(submission?.expiry_date) }}</p>
                    </div>

                    <!-- Rejection form -->
                    <div v-if="rejecting" class="rounded-xl border border-rose-400/20 bg-rose-500/5 p-4 flex flex-col gap-3">
                        <p class="text-sm font-semibold text-rose-300">Rejection Reason <span class="text-rose-400">*</span></p>
                        <textarea v-model="rejectReason" rows="3" placeholder="Explain why this document is being rejected..."
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-rose-400/50 resize-none"></textarea>
                        <p v-if="rejectError" class="text-xs text-rose-400">{{ rejectError }}</p>
                        <div class="flex items-center gap-2">
                            <UiButton @click="rejecting = false" color="#fff" text="Cancel" size="sm" :disabled="saving" />
                            <UiButton @click="confirmReject" color="#750d0d" text="Confirm Reject" size="sm" :disabled="saving || !rejectReason.trim()" :loading="saving" />
                        </div>
                    </div>
                </div>
            </template>
        </template>
        <template #footer>
            <div class="flex items-center gap-2 flex-1">
                <template v-if="!rejecting">
                    <UiButton @click="open = false" color="#fff" text="Close" prepend-icon="ion:close-circle" :disabled="saving" />
                    <UiButton @click="startReject" color="#f87171" text="Reject" prepend-icon="ion:close-circle" :disabled="saving" />
                    <UiButton @click="confirmVerify" color="#4aff7a" text="Verify Document" prepend-icon="ion:checkmark-circle" :disabled="saving" :loading="saving" class="ml-auto" />
                </template>
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/employeeDocument.store'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    pending: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'actioned'])

const store = useEmployeeDocumentStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const loading = ref(false)
const saving = ref(false)
const rejecting = ref(false)
const rejectReason = ref('')
const rejectError = ref('')
const submission = ref(null)
const fields = ref([])

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function resolveFileUrl(url) { if (!url) return '#'; const token = getAuthToken(); return token ? `${url}?token=${encodeURIComponent(token)}` : url }
function getAuthToken() {
    if (process.client) {
        const m = document.cookie.split('; ').find(r => r.startsWith('ADMIN_ACCESS_KEY='))
        return m ? decodeURIComponent(m.slice('ADMIN_ACCESS_KEY='.length)) : ''
    }
    return ''
}
function displayFieldValue(f) {
    const v = submission.value?.field_values?.[f.key]
    if (f.field_type === 'DATE' && v) return formatDateTime(v)
    if (f.field_type === 'DROPDOWN') return v || '—'
    if (f.field_type === 'MULTI_SELECT') return Array.isArray(v) ? v.join(', ') : (v || '—')
    return v !== undefined && v !== null && v !== '' ? v : '—'
}

async function loadSubmission() {
    loading.value = true
    try {
        submission.value = await store.getSubmission(props.pending.submission_id)
        fields.value = submission.value?.fields || []
    } catch (e) {
        console.error('[review] load error:', e)
    } finally {
        loading.value = false
    }
}

function startReject() {
    rejecting.value = true
    rejectError.value = ''
}

async function confirmVerify() {
    if (!submission.value || saving.value) return
    saving.value = true
    try {
        await store.verifySubmission(submission.value.id)
        open.value = false
        emit('actioned')
    } catch (e) {
        // store toast
    } finally {
        saving.value = false
    }
}

async function confirmReject() {
    if (!submission.value || saving.value) return
    const reason = rejectReason.value.trim()
    if (!reason) { rejectError.value = 'Rejection reason is required'; return }
    saving.value = true
    try {
        await store.rejectSubmission(submission.value.id, reason)
        open.value = false
        emit('actioned')
    } catch (e) {
        // store toast
    } finally {
        saving.value = false
    }
}

watch(() => props.modelValue, (v) => {
    if (v) {
        rejecting.value = false
        rejectReason.value = ''
        rejectError.value = ''
        submission.value = null
        fields.value = []
        if (props.pending?.submission_id) loadSubmission()
    }
})
</script>
