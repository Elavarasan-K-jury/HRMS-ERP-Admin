// stores/organization/attendanceReport.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

let refreshInterval = null // 🔁 Global interval handler for auto-refresh

export const useAttendanceReportsStore = defineStore('attendanceReports', {
    state: () => ({

        /* -------------------------------
         📄 LIST DATA
        ------------------------------- */
        reports: [],
        singleReport: null,

        page: 1,
        limit: 10,
        total: 0,

        loading: false,
        error: null,

        /* -------------------------------
         📋 REPORT GENERATION FORM STATE
        ------------------------------- */
        department_id: null,
        designation_id: null,
        employee_id: null,
        start_date: null,
        end_date: null,
    }),

    actions: {

        /* ---------------------------------------------------------
         🟣 FETCH SINGLE REPORT DETAILS
        --------------------------------------------------------- */
        async fetchReportById(reportId) {
            const { $api } = useNuxtApp()

            if (!reportId || reportId.length !== 24) {
                console.error("Invalid reportId:", reportId)
                return
            }

            this.loading = true
            this.error = null
            this.singleReport = null

            try {
                const { data } = await $api.get('/attendance/report/result', {
                    params: { report_id: reportId }
                })

                this.singleReport = data.report || null
                return data

            } catch (err) {
                console.error('[AttendanceReportsStore] fetchReportById', err)
                this.error = err

            } finally {
                this.loading = false
            }
        },

        /* ---------------------------------------------------------
         🟦 FETCH REPORT LIST + AUTO REFRESH
        --------------------------------------------------------- */
        async fetchReports({ page = 1, limit = 10 } = {}) {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.loading = refreshInterval ? false : true
            this.error = null

            try {
                const { data } = await $api.get('/attendance/report/list', {
                    params: {
                        organization_id: auth.organization,
                        page,
                        limit,
                    }
                })

                this.reports = data.reports || []
                this.page = data.page
                this.limit = data.limit
                this.total = data.total

                /* -----------------------------------------
                   🔁 AUTO-REFRESH WHILE REPORTS ARE ACTIVE
                ----------------------------------------- */
                const hasPending = this.reports.some(r =>
                    r.status !== 'COMPLETED' && r.status !== 'FAILED'
                )

                if (hasPending) {
                    if (!refreshInterval) {
                        refreshInterval = setInterval(() => {
                            console.log("[AutoRefresh] Checking pending reports...")
                            this.fetchReports({ page: this.page, limit: this.limit })
                        }, 2000)
                    }
                } else {
                    if (refreshInterval) {
                        clearInterval(refreshInterval)
                        refreshInterval = null
                    }
                }

                return data

            } catch (err) {
                console.error('[AttendanceReportsStore] fetchReports', err)
                this.error = err

            } finally {
                this.loading = false
            }
        },

        /* ---------------------------------------------------------
         ▶️ GENERATE REPORT
        --------------------------------------------------------- */
        async generateReport() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            try {
                const body = {
                    organization_id: auth.organization,
                    department_id: this.department_id ? this.department_id.value : null,
                    designation_id: this.designation_id ? this.designation_id.value : null,
                    employee_id: this.employee_id ? this.employee_id.value : null,
                    start_date: this.start_date ? this.start_date : null,
                    end_date: this.end_date ? this.end_date : null,
                }

                const { data } = await $api.get('/attendance/report', {
                    params: body
                })

                this.fetchReports({ page: this.page, limit: this.limit })
                return data

            } catch (err) {
                console.error('[AttendanceReportsStore] generateReport', err)
                this.error = err
            }
        },

        /* ---------------------------------------------------------
         🔄 RESET GENERATE FORM
        --------------------------------------------------------- */
        resetGenerateForm() {
            this.department_id = ""
            this.designation_id = ""
            this.employee_id = ""
            this.start_date = ""
            this.end_date = ""
        }
    }
})
