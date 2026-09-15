// app/stores/organization/assetModel.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useAssetsStore = defineStore('Assets', {
    state: () => ({
        /* ================= LIST STATE ================= */
        total: 0,
        assets: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        category_id: null,
        model_id: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        loading: false,
        error: null,

        /* ================= CREATE / EDIT FORM ================= */
        addModal: false,

        serial_number: null,
        asset_tag: null,
        generated_asset_id: null,
        custom_attribute_values: null,
        user_name: null,
        password: null,
        purchase_date: null,
        warranty_expire: null, // ✅ fixed spelling
        status: null,
        location: null,

        selectedAsset: null,

        assignModal: false,
        condition_assign: null,
        notes: null,
        employeeId: null,
        assignStatus: null,
    }),

    actions: {
        async assignAssetToEmployee() {
            const toast = useToast()
            const auth = useAuthStore()
            try {
                if (!this.employeeId.value) return toast.error({ title: 'Error!', message: 'Employee selection is required.', timeout: 1500 })
                if (!this.condition_assign?.value) return toast.error({ title: 'Error!', message: 'Asset condition selection is required.', timeout: 1500 })
                const { $api } = useNuxtApp()
                const { data } = await $api.post("/asset-assignments", {
                    organization_id: auth.organization,
                    asset_id: this.selectedAsset.id,
                    employee_id: this.employeeId.value,
                    assigned_date: new Date().toLocaleString('en-IN', {
                        day: "numeric",
                        month: 'short',
                        year: "numeric",
                    }),
                    // return_date: null,
                    condition_assign: this.condition_assign?.value ?? 'GOOD',
                    status: this.assignStatus?.value || 'ASSIGNED',
                    notes: this.notes
                })
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.fetchAssets()
                }
            } catch (err) {
                console.error('[Assets] Delete asset error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.selectedAsset = null
                this.employeeId = null
                this.condition_assign = null
                this.assignStatus = null
                this.notes = null
                this.assignModal = false
            }
        },
        async deleteAssets() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/assets/${this.selectedAsset.id}`)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.fetchAssets()
                }
            } catch (err) {
                console.error('[Assets] Delete asset error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.selectedAsset = null
            }
        },
        /* ----------------------------------------------------
         * FETCH ASSETS (LIST)
        ---------------------------------------------------- */
        async fetchAssets() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const res = await $api.get('/assets', {
                    params: {
                        organization_id: auth.organization,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                        sort_by: this.sortBy,
                        sort_order: this.sortOrder,
                        category_id: this.category_id?.value ?? null,
                        model_id: this.model_id?.value ?? null,
                    },
                })

                if (res.data?.success) {
                    this.assets = res.data.assets
                    this.total = res.data.total
                    this.totalPages = res.data.total_pages
                }
            } catch (err) {
                console.error('[Assets] Fetch assets error:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.message || 'Failed to fetch assets',
                    timeout: 1500,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------------
         * CREATE ASSET
        ---------------------------------------------------- */
        async createAsset() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const payload = {
                    organization_id: auth.organization,
                    category_id: this.category_id?.value,
                    model_id: this.model_id?.value,
                    serial_number: this.serial_number,
                    asset_tag: this.asset_tag,
                    generated_asset_id: this.generated_asset_id,
                    custom_attribute_values: this.custom_attribute_values,
                    user_name: this.user_name,
                    password: this.password,
                    purchase_date: this.purchase_date,
                    warranty_expire: this.warranty_expire,
                    status: this.status?.value,
                    location: this.location,
                }

                // Basic validation
                const missing = Object.entries(payload)
                    .filter(([_, v]) => v === null || v === undefined || v === '')
                    .map(([k]) => k)

                if (missing.length) {
                    toast.error({
                        title: 'Validation Error',
                        message: `${missing[0]} is required`,
                        timeout: 1500,
                    })
                    return
                }

                const res = await $api.post('/assets', payload)

                if (res.data?.success) {
                    toast.success({
                        title: 'Success!',
                        message: res.data.message || 'Asset created successfully',
                        timeout: 1500,
                    })

                    this.addModal = false
                    this.resetForm()
                    await this.fetchAssets()
                } else {
                    toast.error({
                        title: 'Error!',
                        message: res.data?.message || 'Failed to create asset',
                        timeout: 1500,
                    })
                }
            } catch (err) {
                console.error('[Assets] Create asset error:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.message || 'Asset creation failed',
                    timeout: 1500,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------------
         * UDPATE ASSET
        ---------------------------------------------------- */
        async updateAsset() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()

            try {
                this.loading = true
                this.error = null

                const payload = {
                    organization_id: auth.organization,
                    category_id: this.category_id?.value,
                    model_id: this.model_id?.value,
                    serial_number: this.serial_number,
                    asset_tag: this.asset_tag,
                    user_name: this.user_name,
                    password: this.password,
                    purchase_date: this.purchase_date,
                    warranty_expire: this.warranty_expire,
                    status: this.status?.value,
                    location: this.location,
                }

                // Basic validation
                const missing = Object.entries(payload)
                    .filter(([_, v]) => v === null || v === undefined || v === '')
                    .map(([k]) => k)

                if (missing.length) {
                    toast.error({
                        title: 'Validation Error',
                        message: `${missing[0]} is required`,
                        timeout: 1500,
                    })
                    return
                }

                const res = await $api.put(`/assets/${this.selectedAsset.id}`, payload)

                if (res.data?.success) {
                    toast.success({
                        title: 'Success!',
                        message: res.data.message || 'Asset updated successfully',
                        timeout: 1500,
                    })

                    this.addModal = false
                    this.resetForm()
                    await this.fetchAssets()
                } else {
                    toast.error({
                        title: 'Error!',
                        message: res.data?.message || 'Failed to update asset',
                        timeout: 1500,
                    })
                }
            } catch (err) {
                console.error('[Assets] Update asset error:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.message || 'Asset updation failed',
                    timeout: 1500,
                })
                this.error = err
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------------
         * RESET FORM
        ---------------------------------------------------- */
        resetForm() {
            this.selectedAsset = null
            this.serial_number = null
            this.asset_tag = null
            this.generated_asset_id = null
            this.custom_attribute_values = null
            this.user_name = null
            this.password = null
            this.purchase_date = null
            this.warranty_expire = null
            this.status = null
            this.location = null
            this.category_id = null
            this.model_id = null
        },
    },
})
