import { defineStore } from 'pinia'

export const useOrganizationStore = defineStore('organization', {
    state: () => ({
        organizations_select: [],
        organizations: [],
        loading: false,
        error: null,

        // pagination + sorting state (defaults)
        meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            search: null,
            sortBy: 'created_at',
            sortOrder: 'desc',
        },

        editId: null,
        editData: null,

        deleteId: null,
        deleteData: null,

        create: {
            "name": "QuantLeap Dynamics",
            "domain": "https://quantleapdynamics.com",
            "gst_number": "29AAACQ1234F1Z7",
            "email": "hello@quantleapdynamics.com",
            "contact_person_name": "Diya Rao",
            "contact_person_number": "+91 9876543210",
            "industry": "Artificial Intelligence & Robotics",
            "size": 120,
            "address": {
                "streetName": "Embassy Tech Village",
                "streetNumber": "Block C, 6th Floor",
                "landmark": "Opp. Ecospace",
                "area": "Outer Ring Road",
                "locality": "Bellandur",
                "city": "Bengaluru",
                "state": "Karnataka",
                "country": "India",
                "postalCode": "560103"
            },
            "limits": {
                "maxEmployees": null,
                "storageGb": null,
                "apiRatePerMinute": null,
                "payrollRunsPerMonth": null,
                "maxLeavePolicies": null,
                "maxAdmins": null,
            }
        }
    }),

    getters: {
        hasData: (s) => s.organizations.length > 0,
        getById: (s) => (id) => s.organizations.find((o) => o.id === id),
        hasNext: (s) => s.meta.page < s.meta.totalPages,
        hasPrev: (s) => s.meta.page > 1,
    },

    actions: {
        /** Safe JSON parse for address field */
        _parseAddress(addr) {
            if (!addr) return null
            if (typeof addr === 'object') return addr
            try {
                return JSON.parse(addr)
            } catch {
                return addr // keep as-is if not valid JSON
            }
        },

        /** Normalize organization record (parse address, keep field names as-is) */
        _normalize(org = {}) {
            return {
                ...org,
                address: this._parseAddress(org.address),
            }
        },

        /**
         * Fetch organizations with pagination/sorting.
         * @param {Object} opts
         * @param {number} opts.page
         * @param {number} opts.limit
         * @param {string} opts.sortBy  e.g. 'createdAt' | 'updatedAt' | 'name'
         * @param {string} opts.sortOrder 'asc' | 'desc'
         */
        async fetchOrganizations() {
            const { $api } = useNuxtApp()

            // merge provided options with current meta defaults
            const page = this.meta.page
            const limit = this.meta.limit
            const sortBy = this.meta.sortBy
            const sortOrder = this.meta.sortOrder
            const search = this.meta.search != '' || this.meta.search != null ? this.meta.search : null

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/organizations', {
                    params: {
                        page,
                        limit,
                        search,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                    },
                })

                // Response shape:
                // { organizations: [...], total, page, limit, total_pages }
                const list = Array.isArray(data?.organizations) ? data.organizations : []

                this.organizations = list.map(this._normalize)
                this.meta.total = Number(data?.total ?? 0)
                this.meta.page = Number(data?.page ?? page)
                this.meta.limit = Number(data?.limit ?? limit)
                this.meta.totalPages = Number(data?.total_pages ?? data?.totalPages ?? 0)
                this.meta.sortBy = sortBy
                this.meta.sortOrder = sortOrder
            } catch (err) {
                console.error('❌ Failed to fetch organizations:', err)
                this.error =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to load organizations'
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },

        async fetchOrganizationsForSelect() {
            const { $api } = useNuxtApp()

            // merge provided options with current meta defaults
            // const page = this.meta.page
            // const limit = this.meta.total
            const sortBy = this.meta.sortBy
            const sortOrder = this.meta.sortOrder

            try {
                const { data } = await $api.get('/organizations', {
                    params: {
                        // page,
                        // limit,
                        sort_by: sortBy,
                        sort_order: sortOrder,
                    },
                })

                // Response shape:
                // { organizations: [...], total, page, limit, total_pages }
                const list = Array.isArray(data?.organizations) ? data.organizations : []

                this.organizations_select = list.map((e) => ({
                    value: e.id,
                    label: e.name
                }))
            } catch (err) {
                console.error('❌ Failed to fetch organizations:', err)
                this.error =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to load organizations'
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },

        /** Create new organization */
        async createOrganization() {
            const { $api } = useNuxtApp()
            const limits = JSON.parse(JSON.stringify(this.create.limits))
            delete this.create.limits
            const { data } = await $api.post('/organizations', {
                ...this.create,
                address: JSON.stringify(this.create.address),
                ...limits
            })
            this.meta.page = 1
            await this.fetchOrganizations()
            return data
        },


        /** Update organization */
        async updateOrganization() {
            const { $api } = useNuxtApp()
            const limits = JSON.parse(JSON.stringify(this.create.limits))
            delete this.create.limits
            const { data } = await $api.put(`/organizations/${this.editId}`, {
                ...this.create,
                address: JSON.stringify(this.create.address),
                ...limits
            })
            this.meta.page = 1
            await this.fetchOrganizations()
            return data
        },


        /** Delete organization */
        async deleteOrganization() {
            const { $api } = useNuxtApp()
            const { data } = await $api.delete(`/organizations/${this.deleteId}`)
            this.meta.page = 1
            await this.fetchOrganizations()
            return data
        },

        /** Refresh with current meta */
        async refresh() {
            return this.fetchOrganizations()
        },

        /** Pagination helpers */
        async setPage(page) {
            return this.fetchOrganizations({ page })
        },
        async nextPage() {
            if (this.hasNext) {
                this.meta.page += 1
                return this.fetchOrganizations({ page: this.meta.page })
            }
        },
        async prevPage() {
            if (this.hasPrev) {
                this.meta.page -= 1
                return this.fetchOrganizations({ page: this.meta.page - 1 })
            }
        },

        /** Sorting helper */
        async setSort({ sortBy, sortOrder }) {
            return this.fetchOrganizations({
                sortBy: sortBy ?? this.meta.sortBy,
                sortOrder: sortOrder ?? this.meta.sortOrder,
                page: 1, // reset to first page when sorting changes
            })
        },

        /** Optional: reset list */
        clear() {
            this.organizations = []
            this.error = null
            this.meta = {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            }
        },
    },
})
