// app/stores/head.store.js
import { defineStore } from 'pinia'

export const useAssetsModelStore = defineStore('AssetsModel', {
    state: () => ({
        total: 0,
        model_list: [],
        models: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        loading: false,
        error: null,
        organization_id: null,
        assetCategoryId: null,
        name: null,
        brandName: null,
        code: null,
        description: null,
        is_active: true,
        specs: null,
    }),
    actions: {
        async fetchAssetsCategories() {
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
                console.error('[AssetsCategory] Fetch categories error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },
        async fetchAllAssetsCategories() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                this.loading = true
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
                console.error('[AssetsCategory] Fetch categories error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.loading = false
            }
        },
        async deleteAssetsCategory() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/asset-categories/${this.assetCategoryId}`)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.fetchAssetsCategories()
                }
            } catch (err) {
                console.error('[AssetsCategory] Delete category error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.assetCategoryId = null
            }
        },
        async saveAssetsCategory() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                if (this.assetCategoryId) {
                    const { data } = await $api.put(`/asset-categories/${this.assetCategoryId}`, {
                        name: this.name,
                        code: this.code,
                        description: this.description,
                        is_active: this.is_active,
                        organization_id: this.organization_id
                    }
                    )
                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.fetchAssetsCategories()
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }
                } else {
                    const { data } = await $api.post('/asset-categories', {
                        name: this.name,
                        code: this.code,
                        description: this.description,
                        is_active: this.is_active,
                        organization_id: this.organization_id
                    }
                    )
                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.fetchAssetsCategories()
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }
                }
            } catch (err) {
                console.error('[AssetCategory] Save category error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            } finally {
                this.name = null
                this.code = null
                this.description = null
                this.is_active = true
                this.assetCategoryId = null
            }
        }
    }
})
