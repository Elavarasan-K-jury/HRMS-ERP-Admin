// app/stores/organization/attendance.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'
import { useUtilsStore } from '../shared/utils.store'

export const useEmployeeAttendanceStore = defineStore('employeeAttendance', {
    state: () => ({
        todayAttendance: null,
        grossTime: null,
        effectiveTime: null,
        attendanceList: [],
        // NO LOCALSTORAGE — always correct from backend
        isClockedOut: true,
        month: {
            value: new Date().getMonth() + 1,
            label: new Date().toLocaleString('en-IN', { month: 'long' }),
        },
        year: {
            value: new Date().getFullYear(),
            label: new Date().getFullYear(),
        },
        loading: false,
        buttonLoading: false,
    }),

    actions: {
        /* --------------------------------------------------
           Helper: detect clock-in/out based on API response
        ---------------------------------------------------*/
        evaluateClockState(att) {
            if (!att || !att.check_in) {
                this.isClockedOut = true
                return
            }

            const checkInDate = new Date(att.check_in).toDateString()
            const todayDate = new Date().toDateString()

            // If check-in is not today → treat as clocked out
            if (checkInDate !== todayDate) {
                this.isClockedOut = true
                return
            }

            // Check-in today but no check-out → clocked in
            if (att.check_in && !att.check_out) {
                this.isClockedOut = false
                return
            }

            // Check-in + check-out today → clocked out
            if (att.check_in && att.check_out) {
                this.isClockedOut = true
                return
            }
        },

        async getAttendancesList() {
            this.loading = true
            const { $api } = useNuxtApp()
            const authStore = useAuthStore()
            try {
                const { data } = await $api.get(`/attendance`, {
                    params: {
                        employee_id: authStore.user.id,
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

        /* --------------------------------------------------
           Get today's attendance
        ---------------------------------------------------*/
        async getTodayAttendance() {
            this.loading = true
            const { $api } = useNuxtApp()
            const authStore = useAuthStore()

            try {
                const today = new Date()
                const pad = (n) => n.toString().padStart(2, "0")
                const formattedDate =
                    `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

                const { data } = await $api.post(`/attendance/recompute`, {
                    employee_id: authStore.user.id,
                    date: formattedDate,
                })

                const att = data.attendance ?? data

                // remove status
                const { status, ...cleaned } = att

                this.todayAttendance = cleaned

                this.grossTime = cleaned.gross_hours ?? 0
                this.effectiveTime = cleaned.effective_hours ?? 0

                // Update local reactive state
                this.evaluateClockState(cleaned)
            } catch (error) {
                console.error("Error fetching today's attendance:", error)
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },

        /* --------------------------------------------------
           Clock In
        ---------------------------------------------------*/
        async clockIn() {
            this.buttonLoading = true
            const toast = useToast()
            const { $api } = useNuxtApp()
            const authStore = useAuthStore()
            const utilsStore = useUtilsStore()

            try {
                const { data } = await $api.post(`/attendance/check-in`, {
                    employee_id: authStore.user.id,
                    ip_address: utilsStore.IpAddress,
                    latitude: utilsStore.lattitude,
                    longitude: utilsStore.longitude,
                    source: JSON.stringify({
                        browser: utilsStore.browser,
                        os: utilsStore.os,
                        userAgent: utilsStore.userAgent,
                        source: utilsStore.source
                    })
                })

                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500
                    })
                }

            } catch (error) {
                console.error("Error clocking in:", error)
                toast.error({ title: 'Error!', message: error.message, timeout: 1500 })
            } finally {
                await this.getTodayAttendance()
                await this.getAttendancesList()
                setTimeout(() => {
                    this.buttonLoading = false
                }, 1000);
            }
        },

        /* --------------------------------------------------
           Clock Out
        ---------------------------------------------------*/
        async clockOut() {
            this.buttonLoading = true
            const toast = useToast()
            const { $api } = useNuxtApp()
            const authStore = useAuthStore()
            const utilsStore = useUtilsStore()
            try {
                const { data } = await $api.post(`/attendance/check-out`, {
                    employee_id: authStore.user.id,
                    ip_address: utilsStore.IpAddress,
                    latitude: utilsStore.lattitude,
                    longitude: utilsStore.longitude,
                    source: JSON.stringify({
                        browser: utilsStore.browser,
                        os: utilsStore.os,
                        userAgent: utilsStore.userAgent,
                        source: utilsStore.source
                    })
                })

                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500
                    })
                }

            } catch (error) {
                console.error("Error clocking out:", error)
                toast.error({ title: 'Error!', message: error.message, timeout: 1500 })
            } finally {
                await this.getTodayAttendance()
                if (this.month.value == new Date().getMonth() + 1 && this.year.value == new Date().getFullYear()) {
                    await this.getAttendancesList()
                }
                setTimeout(() => {
                    this.buttonLoading = false
                }, 1000);
            }
        }
    }
})
