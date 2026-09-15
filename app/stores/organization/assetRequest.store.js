import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useAssetRequestsStore = defineStore('AssetRequests', {
    state: () => ({
        total: 0,
        asset_requests: [],
        page: 1,
        limit: 20,
        totalPages: 0,
        search: '',
        statusFilter: '',
        sortBy: 'created_at',
        sortOrder: 'desc',
        loading: false,
        error: null,

        approveModal: false,
        rejectionModal: false,
        assignModal: false,
        detailsDrawer: false,
        selectedRequest: null,
        reason: '',
    }),

    actions: {
        async fetchAssetRequests() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const params = {
                    organization_id: auth.organization,
                    page: Number(this.page),
                    limit: Number(this.limit),
                    sort_by: this.sortBy,
                    sort_order: this.sortOrder,
                }

                if (this.search) params.search = this.search

                const res = await $api.get('/asset-requests', { params })

                if (res.data?.success) {
                    let requests = res.data.requests || []
                    if (this.statusFilter) {
                        requests = requests.filter(r => r.status === this.statusFilter)
                    }
                    this.asset_requests = requests
                    this.total = res.data.total || requests.length
                    this.totalPages = res.data.total_pages || 1
                }
            } catch (err) {
                console.error('[AssetRequests] Fetch error:', err)
                toast.error({
                    title: 'Error',
                    message: err?.data?.message || err?.message || 'Failed to fetch asset requests',
                    timeout: 3000,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        async fetchRequestById(id) {
            const { $api } = useNuxtApp()
            try {
                const res = await $api.get(`/asset-requests/${id}`)
                return res.data?.request || null
            } catch (err) {
                console.error('[AssetRequests] Fetch by ID error:', err)
                return null
            }
        },

        async approveAssetRequest() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            if (!this.selectedRequest) return

            try {
                this.loading = true
                this.error = null

                const res = await $api.put(`/asset-requests/${this.selectedRequest.id}/status`, {
                    status: 'APPROVED',
                    approved_by: auth.admin?.id || '',
                    approved_at: new Date().toISOString(),
                })

                if (res.data?.success) {
                    toast.success({
                        title: 'Approved',
                        message: 'Asset request approved successfully',
                        timeout: 3000,
                    })
                    this.approveModal = false
                    this.selectedRequest = null
                    await this.fetchAssetRequests()
                } else {
                    toast.error({
                        title: 'Error',
                        message: res.data?.message || 'Failed to approve request',
                        timeout: 3000,
                    })
                }
            } catch (err) {
                console.error('[AssetRequests] Approve error:', err)
                toast.error({
                    title: 'Error',
                    message: err?.data?.message || err?.message || 'Failed to approve request',
                    timeout: 3000,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        async rejectAssetRequest() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            if (!this.selectedRequest) return

            if (!this.reason?.trim()) {
                return toast.error({
                    title: 'Error',
                    message: 'Rejection reason is required',
                    timeout: 3000,
                })
            }

            try {
                this.loading = true
                this.error = null

                const res = await $api.put(`/asset-requests/${this.selectedRequest.id}/status`, {
                    status: 'REJECTED',
                    approved_by: auth.admin?.id || '',
                    rejection_reason: this.reason.trim(),
                })

                if (res.data?.success) {
                    toast.success({
                        title: 'Rejected',
                        message: 'Asset request rejected',
                        timeout: 3000,
                    })
                    this.rejectionModal = false
                    this.selectedRequest = null
                    this.reason = ''
                    await this.fetchAssetRequests()
                } else {
                    toast.error({
                        title: 'Error',
                        message: res.data?.message || 'Failed to reject request',
                        timeout: 3000,
                    })
                }
            } catch (err) {
                console.error('[AssetRequests] Reject error:', err)
                toast.error({
                    title: 'Error',
                    message: err?.data?.message || err?.message || 'Failed to reject request',
                    timeout: 3000,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        async assignAssetToRequest(assetId, assignedDate, conditionAssign, notes) {
            const { $api } = useNuxtApp()
            const toast = useToast()

            if (!this.selectedRequest) return

            try {
                this.loading = true
                this.error = null

                const res = await $api.post(`/asset-requests/${this.selectedRequest.id}/assign`, {
                    asset_id: assetId,
                    assigned_date: assignedDate || '',
                    condition_assign: conditionAssign || '',
                    notes: notes || '',
                })

                if (res.data?.success) {
                    toast.success({
                        title: 'Assigned',
                        message: 'Asset assigned to request successfully',
                        timeout: 3000,
                    })
                    this.assignModal = false
                    this.selectedRequest = null
                    await this.fetchAssetRequests()
                    return true
                } else {
                    toast.error({
                        title: 'Error',
                        message: res.data?.message || 'Failed to assign asset',
                        timeout: 3000,
                    })
                    return false
                }
            } catch (err) {
                console.error('[AssetRequests] Assign error:', err)
                toast.error({
                    title: 'Error',
                    message: err?.data?.message || err?.message || 'Failed to assign asset',
                    timeout: 3000,
                })
                this.error = err
                return false
            } finally {
                this.loading = false
            }
        },

        openDetails(request) {
            this.selectedRequest = request
            this.detailsDrawer = true
        },

        openApprove(request) {
            this.selectedRequest = request
            this.approveModal = true
        },

        openReject(request) {
            this.selectedRequest = request
            this.reason = ''
            this.rejectionModal = true
        },

        openAssign(request) {
            this.selectedRequest = request
            this.assignModal = true
        },

        closeAll() {
            this.approveModal = false
            this.rejectionModal = false
            this.assignModal = false
            this.detailsDrawer = false
            this.selectedRequest = null
            this.reason = ''
        },
    },
})
