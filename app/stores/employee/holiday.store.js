// stores/holidayPublic.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useHolidayStore = defineStore('holidayPublic', {
    state: () => ({
        holidays: [],
        upcomingHoliday: null,

        filter_year: new Date().getFullYear(), // default year
        loading: false,
        error: null,
    }),

    actions: {
        /** ---------------------------------------------------------
         *  Fetch ALL holidays (server returns all for org)
        --------------------------------------------------------- **/
        async fetchAllHolidays() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get('/holidays', {
                    params: {
                        organization_id: auth.organization
                    }
                })

                this.holidays = data.holidays || []

                // sync upcoming holiday
                this.computeUpcomingHoliday()

                return data
            } catch (err) {
                console.error('[holidayPublicStore] fetchAllHolidays error:', err)
                this.error = err
            } finally {
                this.loading = false
            }
        },

        /** ---------------------------------------------------------
         *  Compute upcoming holiday (including today's)
        --------------------------------------------------------- **/
        computeUpcomingHoliday() {
            if (!this.holidays.length) {
                this.upcomingHoliday = null
                return
            }

            const todayKey = new Date().toISOString().slice(0, 10)

            const normalize = (val) => {
                if (!val) return null
                if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
                const d = new Date(val)
                if (isNaN(d)) return null
                return d.toISOString().slice(0, 10)
            }

            const upcoming = this.holidays
                .map(h => ({
                    ...h,
                    _key: normalize(h.date)
                }))
                .filter(h => h._key && h._key >= todayKey)
                .sort((a, b) => (a._key > b._key ? 1 : -1))[0]

            this.upcomingHoliday = upcoming || null
        },

        /** ---------------------------------------------------------
         * Filter holidays by selected year
        --------------------------------------------------------- **/
        getHolidaysByYear() {
            return this.holidays.filter(h => {
                const d = new Date(h.date)
                return d.getFullYear() === Number(this.filter_year)
            })
        }
    }
})
