import { defineStore } from 'pinia'

export const useHolidayStore = defineStore('holiday', {
    state: () => ({
        holidays: [],
        total_count: 0,

        holiday_id: null,
        organization_id: null,

        // form fields
        policy_id: null,
        date: null,
        name: null,
        type: 'PUBLIC',
        leave_optional: false,

        // filters
        filter_year: null,
        filter_type: null,
        filter_policy: null,

        // calendar view
        calendar: [],

        loading: false,
        error: null,
    }),

    actions: {
        /* ---------------------------------------------------------
         LIST HOLIDAYS
        -------------------------------------------------------- */
        async fetchHolidays() {
            const toast = useToast()
            this.loading = true
            this.error = null

            try {
                const { $api } = useNuxtApp()

                const params = {
                    organization_id: this.organization_id,
                    year: this.filter_year || undefined,
                    type: this.filter_type?.value || undefined,
                    policy_id: typeof this.filter_policy === 'object' ? this.filter_policy?.value : this.filter_policy || undefined,
                }

                const { data } = await $api.get('/holidays', { params })

                this.holidays = data?.holidays || []
                this.total_count = data?.total_count || 0

                return data
            } catch (err) {
                console.error('[holiday-store] fetchHolidays error:', err)
                this.holidays = []
                this.total_count = 0
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
            } finally {
                this.loading = false
            }
        },

        /* ---------------------------------------------------------
         GET HOLIDAY BY ID
        -------------------------------------------------------- */
        async fetchHolidayById(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/holidays/${id}`)

                return data
            } catch (err) {
                console.error('[holiday-store] fetchHolidayById error:', err)
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
            }
        },

        /* ---------------------------------------------------------
         CREATE HOLIDAY
        -------------------------------------------------------- */
        async createHoliday() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                const payload = {
                    organization_id: this.organization_id,
                    policy_id: this.policy_id || undefined,
                    date: this.date,
                    name: this.name,
                    type: this.type,
                    leave_optional: this.leave_optional,
                }

                const { data } = await $api.post('/holidays', payload)

                toast.success({
                    title: 'Success!',
                    message: data.message || 'Holiday created',
                    timeout: 1500
                })

                this.resetForm()
                this.fetchHolidays()

                return data
            } catch (err) {
                console.error('[holiday-store] createHoliday error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },

        /* ---------------------------------------------------------
         UPDATE HOLIDAY
        -------------------------------------------------------- */
        async updateHoliday() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                const payload = {
                    policy_id: this.policy_id || undefined,
                    date: this.date,
                    name: this.name,
                    type: this.type,
                    leave_optional: this.leave_optional,
                }

                const { data } = await $api.put(`/holidays/${this.holiday_id}`, payload)

                toast.success({
                    title: 'Updated!',
                    message: data.message || 'Holiday updated',
                    timeout: 1500
                })

                this.resetForm()
                this.fetchHolidays()

                return data
            } catch (err) {
                console.error('[holiday-store] updateHoliday error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },

        /* ---------------------------------------------------------
         DELETE HOLIDAY
        -------------------------------------------------------- */
        async deleteHoliday(id) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/holidays/${id}`)

                toast.success({
                    title: 'Deleted!',
                    message: data.message || 'Holiday deleted',
                    timeout: 1500
                })

                this.fetchHolidays()

                return data
            } catch (err) {
                console.error('[holiday-store] deleteHoliday error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
            }
        },

        /* ---------------------------------------------------------
         HOLIDAY CALENDAR VIEW (YYYY-MM)
        -------------------------------------------------------- */
        async fetchHolidayCalendar(month) {
            const toast = useToast()
            this.loading = true

            try {
                const { $api } = useNuxtApp()

                const params = {
                    organization_id: this.organization_id,
                    month,
                    policy_id: this.filter_policy || undefined,
                }

                const { data } = await $api.get('/holidays/calendar/view', { params })

                this.calendar = data.days || []
                return data
            } catch (err) {
                console.error('[holiday-store] fetchHolidayCalendar error:', err)
                toast.error({
                    title: 'Error!',
                    message: err.message,
                    timeout: 1500
                })
            } finally {
                this.loading = false
            }
        },

        /* ---------------------------------------------------------
         Reset form values
        -------------------------------------------------------- */
        resetForm() {
            this.policy_id = null
            this.date = null
            this.name = null
            this.type = 'PUBLIC'
            this.leave_optional = false
            this.holiday_id = null
        },

        /* ---------------------------------------------------------
         Aliases for backward compatibility (employee/holidays.vue)
        -------------------------------------------------------- */
        async fetchAllHolidays() {
            return this.fetchHolidays()
        },

        getHolidaysByYear() {
            if (!this.filter_year) return this.holidays
            return this.holidays.filter(h => {
                const d = new Date(h.date)
                return d.getFullYear() === this.filter_year
            })
        }
    }
})
