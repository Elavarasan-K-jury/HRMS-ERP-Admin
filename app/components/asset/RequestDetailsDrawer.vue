<template>
    <UiSidebarModal v-model="open" title="Request Details" width="560px" :show-footer="false">
        <template #default>
            <div v-if="request" class="details-body">
                <!-- Status Banner -->
                <div class="status-banner" :class="statusBannerClass(request.status)">
                    <Icon :name="statusIcon(request.status)" class="h-5 w-5" />
                    <div>
                        <div class="font-semibold">{{ request.status }}</div>
                        <div class="text-xs opacity-75">{{ statusDescription(request) }}</div>
                    </div>
                </div>

                <!-- Request Info -->
                <div class="section">
                    <h3 class="section-title">Request Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Request ID</span>
                            <span class="info-value font-mono">#{{ request.id?.slice(-8) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Requested Date</span>
                            <span class="info-value">{{ formatDate(request.created_at) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Priority</span>
                            <span class="badge" :class="priorityClass(request.priority)">{{ request.priority }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Quantity</span>
                            <span class="info-value">{{ request.quantity || 1 }}</span>
                        </div>
                    </div>
                </div>

                <!-- Employee Info -->
                <div class="section" v-if="request.employee">
                    <h3 class="section-title">Requested By</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Name</span>
                            <span class="info-value">{{ request.employee.full_name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Employee Code</span>
                            <span class="info-value">{{ request.employee.employee_code || '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email</span>
                            <span class="info-value">{{ request.employee.email || '—' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Requested Asset -->
                <div class="section">
                    <h3 class="section-title">Requested Asset</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Category</span>
                            <span class="info-value">{{ request.category?.name || '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Model</span>
                            <span class="info-value">{{ request.model ? `${request.model.brand} ${request.model.model_name}` : '—' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Reason -->
                <div class="section" v-if="request.reason">
                    <h3 class="section-title">Reason</h3>
                    <p class="text-sm text-white/70">{{ request.reason }}</p>
                </div>

                <!-- Approval Info -->
                <div class="section" v-if="request.status === 'APPROVED' || request.status === 'REJECTED'">
                    <h3 class="section-title">{{ request.status === 'APPROVED' ? 'Approval' : 'Rejection' }} Info</h3>
                    <div class="info-grid">
                        <div class="info-item" v-if="request.approved_at">
                            <span class="info-label">{{ request.status === 'APPROVED' ? 'Approved At' : 'Rejected At' }}</span>
                            <span class="info-value">{{ formatDate(request.approved_at) }}</span>
                        </div>
                        <div class="info-item" v-if="request.rejection_reason">
                            <span class="info-label">Rejection Reason</span>
                            <span class="info-value text-red-300">{{ request.rejection_reason }}</span>
                        </div>
                    </div>
                </div>

                <!-- Assignment Info -->
                <div class="section" v-if="request.assignment_details">
                    <h3 class="section-title">Assigned Asset</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Asset Tag</span>
                            <span class="info-value">{{ request.assignment_details.asset?.asset_tag || '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Serial Number</span>
                            <span class="info-value">{{ request.assignment_details.asset?.serial_number || '—' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Assigned Date</span>
                            <span class="info-value">{{ formatDate(request.assignment_details.assigned_date) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Assignment Status</span>
                            <span class="badge bg-green-500/20 text-green-300">{{ request.assignment_details.status }}</span>
                        </div>
                    </div>
                </div>

                <!-- Awaiting Assignment Notice -->
                <div class="section" v-if="request.status === 'APPROVED' && !request.assignment_id">
                    <div class="awaiting-notice">
                        <Icon name="lucide:clock" class="h-5 w-5 text-amber-400" />
                        <div>
                            <div class="font-semibold text-amber-300">Awaiting Asset Assignment</div>
                            <div class="text-xs text-white/50">This request has been approved but no physical asset has been assigned yet.</div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetRequestsStore } from '../../stores/organization/assetRequest.store'

const store = useAssetRequestsStore()
const { detailsDrawer, selectedRequest: request } = storeToRefs(store)

const open = computed({
    get: () => detailsDrawer.value,
    set: (val) => { detailsDrawer.value = val },
})

function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    if (isNaN(d)) return '—'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusBannerClass(status) {
    return {
        PENDING: 'status-pending',
        APPROVED: 'status-approved',
        REJECTED: 'status-rejected',
    }[status] || 'status-pending'
}

function statusIcon(status) {
    return {
        PENDING: 'lucide:clock',
        APPROVED: 'lucide:check-circle',
        REJECTED: 'lucide:x-circle',
    }[status] || 'lucide:clock'
}

function statusDescription(request) {
    if (request.status === 'APPROVED' && !request.assignment_id) return 'Awaiting asset assignment'
    if (request.status === 'APPROVED' && request.assignment_id) return 'Asset assigned'
    if (request.status === 'REJECTED') return 'Request was rejected'
    return 'Awaiting review'
}

function priorityClass(p) {
    return {
        CRITICAL: 'bg-red-600/20 text-red-400',
        URGENT: 'bg-red-500/20 text-red-300',
        HIGH: 'bg-orange-500/20 text-orange-300',
        MEDIUM: 'bg-yellow-500/20 text-yellow-300',
        LOW: 'bg-sky-500/20 text-sky-300',
    }[p] || 'bg-white/10 text-white/70'
}
</script>

<style scoped>
.details-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 4px 0;
}

.status-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 13px;
}

.status-pending {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #fcd34d;
}

.status-approved {
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #86efac;
}

.status-rejected {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.45);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 6px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.info-label {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.4);
}

.info-value {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    width: fit-content;
}

.awaiting-notice {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 10px;
    font-size: 13px;
}
</style>
