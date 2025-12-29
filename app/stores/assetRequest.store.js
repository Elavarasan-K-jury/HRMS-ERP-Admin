// app/stores/assetModel.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useAssetRequestsStore = defineStore('AssetRequests', {
    state: () => ({
        /* ================= LIST STATE ================= */
        total: 0,
        asset_requests: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        loading: false,
        error: null,
        approveModal: false,
        rejectionModal: false,
        selectedRequest: null,
        reason: null,
    }),

    actions: {
        /* ----------------------------------------------------
         * FETCH ASSETS (LIST)
        ---------------------------------------------------- */
        async fetchAssetRequests() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const res = await $api.get('/asset-requests', {
                    params: {
                        organization_id: auth.organization,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                        sort_by: this.sortBy,
                        sort_order: this.sortOrder,
                    },
                })

                if (res.data?.success) {
                    this.asset_requests = res.data.requests
                    this.total = res.data.total
                    this.totalPages = res.data.total_pages
                }
            } catch (err) {
                console.error('[AssetRequests] Fetch asset requests error:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.message || 'Failed to fetch asset requests',
                    timeout: 1500,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },
        async approveAssetRequest() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const res = await $api.put(`/asset-requests/${this.selectedRequest.id}/status`, {
                    status: 'APPROVED',
                    approved_by: auth.admin.id,
                    approved_at: new Date().toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })
                })

                if (res.data?.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[AssetRequests] Approving asset requests error:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.message || 'Failed to approve asset requests',
                    timeout: 1500,
                })
                this.error = err
            } finally {
                this.fetchAssetRequests()
                this.selectedRequest = null
                this.loading = false
                this.approveModal = false
            }
        },
        async rejectAssetRequest() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            if (!this.reason) {
                return toast.error({
                    title: 'Error!',
                    message: 'Rejection reason is mandatory to reject a request.',
                    timeout: 1500,
                })
            }

            try {
                this.loading = true
                this.error = null

                const res = await $api.put(`/asset-requests/${this.selectedRequest.id}/status`, {
                    status: 'REJECTED',
                    approved_by: auth.admin.id,
                    approved_at: new Date().toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }),
                    rejection_reason: this.reason
                })

                if (res.data?.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[AssetRequests] Rejecting asset requests error:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.message || 'Failed to reject asset requests',
                    timeout: 1500,
                })
                this.error = err
            } finally {
                this.fetchAssetRequests()
                this.selectedRequest = null
                this.reason = null
                this.loading = false
                this.rejectionModal = false
            }
        },
    },
})
