// app/stores/assetModel.store.js
import { defineStore } from 'pinia'

export const useAssetsModelStore = defineStore('AssetsModel', {
    state: () => ({
        total: 0,
        models: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        loading: false,
        error: null,

        // Form fields
        organization_id: null,
        assetModelId: null,
        category_id: null,
        brand: null,
        model_name: null,
        code: null,
        description: null,
        specs: null,
        is_active: true,

        // Dropdown lists
        category_list: []
    }),

    actions: {
        /* ----------------------------------------------------
         * FETCH MODELS (LIST)
        ---------------------------------------------------- */
        async fetchAssetModels() {
            const { $api } = useNuxtApp()
            const toast = useToast()

            try {
                this.loading = true

                const res = await $api.get('/asset-models', {
                    params: {
                        organization_id: this.organization_id,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                        sort_by: this.sortBy,
                        sort_order: this.sortOrder
                    },
                })

                if (res.data.success) {
                    this.models = res.data.models
                    this.total = res.data.total
                    this.totalPages = res.data.total_pages
                }
            } catch (err) {
                console.error('[AssetsModel] Fetch models error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },

        /* ----------------------------------------------------
         * LOAD CATEGORY DROPDOWN
        ---------------------------------------------------- */
        async fetchAllCategories() {
            const { $api } = useNuxtApp()
            const toast = useToast()

            try {
                const res = await $api.get('/asset-categories', {
                    params: {
                        organization_id: this.organization_id,
                    },
                })

                if (res.data.success) {
                    this.category_list = res.data.categories.map(e => ({
                        value: e.id,
                        label: `${e.name} (${e.code})`
                    }))
                }
            } catch (err) {
                console.error('[AssetsModel] Fetch categories error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },

        /* ----------------------------------------------------
         * DELETE MODEL
        ---------------------------------------------------- */
        async deleteAssetModel() {
            const toast = useToast()

            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/asset-models/${this.assetModelId}`)

                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.fetchAssetModels()
                }
            } catch (err) {
                console.error('[AssetsModel] Delete model error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.assetModelId = null
            }
        },

        /* ----------------------------------------------------
         * CREATE / UPDATE ASSET MODEL
        ---------------------------------------------------- */
        async saveAssetModel() {
            const toast = useToast()

            const payload = {
                organization_id: this.organization_id,
                category_id: this.category_id.value,
                brand: this.brand,
                model_name: this.model_name,
                code: this.code,
                description: this.description,
                specs: this.specs,
                is_active: this.is_active
            }

            try {
                const { $api } = useNuxtApp()

                if (this.assetModelId) {
                    // UPDATE
                    const { data } = await $api.put(`/asset-models/${this.assetModelId}`, payload)

                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.fetchAssetModels()
                    } else {
                        toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                    }
                } else {
                    // CREATE
                    const { data } = await $api.post('/asset-models', payload)

                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.fetchAssetModels()
                    } else {
                        toast.error({ title: 'Error!', message: data.message, timeout: 1500 })
                    }
                }
            } catch (err) {
                console.error('[AssetsModel] Save model error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.resetForm()
            }
        },

        /* ----------------------------------------------------
         * RESET FORM
        ---------------------------------------------------- */
        resetForm() {
            this.assetModelId = null
            this.category_id = null
            this.brand = null
            this.model_name = null
            this.code = null
            this.description = null
            this.specs = JSON.stringify([
                {
                    key: '',
                    value: ''
                }
            ])
            this.is_active = true
        }
    }
})
