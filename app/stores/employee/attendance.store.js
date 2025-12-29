// app/stores/attendance.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../auth.store'

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        attendanceList: [],
        month: {
            value: new Date().getMonth() + 1,
            label: new Date().toLocaleString('en-IN', { month: 'long' }),
        },
        year: {
            value: new Date().getFullYear(),
            label: new Date().getFullYear(),
        },
        loading: false,
    }),

    actions: {
        async getAttendancesList() {
            this.loading = true
            const { $api } = useNuxtApp()
            const authStore = useAuthStore()
            try {
                const { data } = await $api.get(`/attendance`, {
                    params: {
                        employee_id: authStore.employee,
                        month: `${this.year.value}-${this.month.value < 10 ? `0${this.month.value}` : this.month.value}`,
                    },
                })
                this.attendanceList = data.attendance
            } catch (error) {
                console.error("Error fetching today's attendance:", error)
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
    }
})
