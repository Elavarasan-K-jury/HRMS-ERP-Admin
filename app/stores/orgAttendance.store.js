import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        days: [],               // array of daily records
        stats: null,            // monthly stats
        success: false,
        loading: false,
        error: null,
        month: null,
    }),

    getters: {
        getDays: (s) => s.days,
        getStats: (s) => s.stats,

        // Derived UI helpers
        totalWorkingDays: (s) => s.days?.length || 0,
        totalPresentDays: (s) =>
            s.days?.filter((d) =>
                d.attendance?.some(a => a.status !== 'ABSENT')
            ).length || 0,
    },

    actions: {
        async fetchMonthlyAttendance(month) {
            this.loading = true
            const auth = useAuthStore()
            this.error = null
            this.month = month

            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.get('/attendance/organization-monthly', {
                    params: {
                        organization_id: auth.organization,
                        month
                    }
                })

                console.log('orgAttendance.store.js @ Line 43:', data);

                this.days = data.days || []
                this.stats = data.stats || null
                this.success = data.success ?? true
                return data
            } catch (err) {
                console.error('❌ Monthly attendance error:', err)
                this.error = err?.response?.data?.error || err.message
                throw err
            } finally {
                this.loading = false
            }
        },

        reset() {
            this.days = []
            this.stats = null
            this.success = false
        }
    }
})
