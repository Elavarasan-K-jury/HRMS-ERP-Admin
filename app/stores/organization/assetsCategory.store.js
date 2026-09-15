// app/stores/shared/head.store.js
import { defineStore } from 'pinia'

export const useAssetsCategoryStore = defineStore('AssetsCategory', {
    state: () => ({
        total: 0,
        category_list: [],
        categories: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        organization_id: null,
        loading: false,
        error: null,
        name: null,
        code: null,
        description: null,
        is_active: true,
        assetCategoryId: null
    }),
    actions: {
        async fetchAssetsCategories() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                this.loading = true
                const res = await $api.get('/asset-categories', {
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
                    this.categories = res.data.categories
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
                console.log('assetsCategory.store.js @ Line 62:', res.data);
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
                        description: this.description || '',
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
                        description: this.description || '',
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
