import { defineStore } from 'pinia'

export const useDesignationStore = defineStore('designation', {
    state: () => ({
        total: 0,
        designation_list: [],
        designations: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        organization_id: null,
        department_id: null,
        band_id: null,
        loading: false,
        error: null,
        name: null,
        designation_level: null,
        description: null,
        designation_id: null
    }),
    actions: {
        async deleteDesignation() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/designations/${this.designation_id}`)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.fetchDesignations()
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[designation-store] Delete designation error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },
        async saveDesignation() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                if (this.designation_id) {
                    const { data } = await $api.put(`/designations/${this.designation_id}`, {
                        name: this.name,
                        level: this.designation_level?.value ?? null,
                        description: this.description,
                        organization_id: this.organization_id,
                        department_id: this.department_id?.value ?? null,
                        band_id: this.band_id?.value ?? null,
                    })

                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.name = null
                        this.designation_level = null
                        this.description = null
                        this.department_id = null
                        this.band_id = null
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }
                } else {
                    const { data } = await $api.post('/designations', {
                        name: this.name,
                        level: this.designation_level?.value ?? null,
                        organization_id: this.organization_id,
                        description: this.description,
                        department_id: this.department_id?.value ?? null,
                        band_id: this.band_id?.value ?? null,
                    })

                    if (data.success) {
                        toast.success({
                            title: 'Success!',
                            message: data.message,
                            timeout: 1500
                        })
                        this.name = null
                        this.designation_level = null
                        this.description = null
                        this.department_id = null
                        this.band_id = null
                    } else {
                        toast.error({
                            title: 'Error!',
                            message: data.message,
                            timeout: 1500
                        })
                    }

                    this.page = 1
                }
                await this.fetchDesignations()
            } catch (error) {
                console.error('[designation-store] Save designation error:', error)
                toast.error({
                    title: 'Error!',
                    message: error.message,
                    timeout: 1500
                })
                return error
            }
        },
        async fetchDesignationList() {
            const { $api } = useNuxtApp()

            // merge provided options with current meta defaults
            const organization_id = this.organization_id

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/designations/all', {
                    params: {
                        organization_id,
                    },
                })
                if (data.success) {
                    this.designation_list = data.designations.map(e => ({
                        value: e.id,
                        label: `${e.name} (${e.level.replaceAll('_', ' ').toUpperCase()})`,
                        band_id: e.band_id || null,
                        band_name: e.band_name || '',
                    }))
                }
            } catch (err) {
                console.error('❌ Failed to fetch departments:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async fetchDesignations() {
            const { $api } = useNuxtApp()

            // merge provided options with current meta defaults
            const organization_id = this.organization_id
            const department_id = this.department_id
            const page = this.page
            const limit = this.limit
            const sortBy = this.sortBy
            const sortOrder = this.sortOrder
            const search = this.search != '' || this.search != null ? this.search : null

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/designations', {
                    params: {
                        page,
                        organization_id,
                        department_id,
                        limit,
                        search,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                    },
                })

                this.total = data.total
                this.totalPages = data.total_pages
                this.designations = data.designations
            } catch (err) {
                console.error('❌ Failed to fetch departments:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
    }
})