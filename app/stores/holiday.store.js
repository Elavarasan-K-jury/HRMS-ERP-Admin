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
        region: null,
        type: 'PUBLIC',

        // filters
        filter_year: null,
        filter_type: null,
        filter_region: null,
        filter_policy: null,

        // calendar view
        calendar: [],

        loading: false,
        error: null,
    }),

    actions: {
        /* ---------------------------------------------------------
         📌 LIST HOLIDAYS
        --------------------------------------------------------- */
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
                    region: this.filter_region?.value || undefined,
                    policy_id: this.filter_policy?.value || undefined,
                }

                const { data } = await $api.get('/holidays', { params })

                this.holidays = data.holidays
                this.total_count = data.total_count

                return data
            } catch (err) {
                console.error('[holiday-store] fetchHolidays error:', err)
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
         📌 GET HOLIDAY BY ID
        --------------------------------------------------------- */
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
         📌 CREATE HOLIDAY
        --------------------------------------------------------- */
        async createHoliday() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                const payload = {
                    organization_id: this.organization_id,
                    policy_id: this.policy_id || undefined,
                    date: this.date,
                    name: this.name,
                    region: this.region || undefined,
                    type: this.type,
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
         📌 UPDATE HOLIDAY
        --------------------------------------------------------- */
        async updateHoliday() {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()

                const payload = {
                    policy_id: this.policy_id || undefined,
                    date: this.date,
                    name: this.name,
                    region: this.region || undefined,
                    type: this.type,
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
         📌 DELETE HOLIDAY
        --------------------------------------------------------- */
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
         📌 HOLIDAY CALENDAR VIEW (YYYY-MM)
        --------------------------------------------------------- */
        async fetchHolidayCalendar(month) {
            const toast = useToast()
            this.loading = true

            try {
                const { $api } = useNuxtApp()

                const params = {
                    organization_id: this.organization_id,
                    month,
                    policy_id: this.filter_policy || undefined,
                    region: this.filter_region || undefined,
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
         📌 Reset form values
        --------------------------------------------------------- */
        resetForm() {
            this.policy_id = null
            this.date = null
            this.name = null
            this.region = null
            this.type = 'PUBLIC'
            this.holiday_id = null
        }
    }
})
