// app/stores/organization/payroll.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const usePayrollStore = defineStore('payroll', {
    state: () => ({
        year: {
            value: new Date().getFullYear(),
            label: new Date().getFullYear(),
        },
        month: {
            value: new Date().getMonth() + 1,
            label: new Date().toLocaleString('en-IN', { month: 'long' }),
        },
        monthOptions: [
            { value: 1, label: 'January' },
            { value: 2, label: 'February' },
            { value: 3, label: 'March' },
            { value: 4, label: 'April' },
            { value: 5, label: 'May' },
            { value: 6, label: 'June' },
            { value: 7, label: 'July' },
            { value: 8, label: 'August' },
            { value: 9, label: 'September' },
            { value: 10, label: 'October' },
            { value: 11, label: 'November' },
            { value: 12, label: 'December' },
        ],
        loading: false,
        error: null,
        payrollList: [],
        runPayrollList: [],
    }),

    actions: {
        async fetchSystemCalculatedPayroll() {
            this.loading = true
            try {
                const auth = useAuthStore()
                const organisation_id = auth.organization

                // Convert month to string to use padStart safely
                const formattedMonth = String(this.month.value).padStart(2, '0');
                const formattedYear = String(this.year.value);

                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/system-payroll`, {
                    params: {
                        organisation_id,
                        month: formattedMonth,
                        year: formattedYear
                    },
                })

                console.log('payroll.store.js @ Line 46:', data);
                this.payrollList = data.data || []; // Assuming the proto response has a data field

            } catch (error) {
                console.error('Payroll Store Error:', error);
                this.error = error
            } finally {
                this.loading = false
            }
        },

        async calculatePayroll(employeeId = null) {
            this.loading = true
            this.error = null
            try {
                const auth = useAuthStore()
                const organisation_id = auth.organization

                const formattedMonth = String(this.month.value).padStart(2, '0');
                const formattedYear = String(this.year.value);

                const payload = {
                    organization_id: organisation_id,
                    year: formattedYear,
                    month: formattedMonth,
                }

                if (employeeId) {
                    payload.employee_id = employeeId
                }

                const { $api } = useNuxtApp()
                const { data } = await $api.post(`/calculate-payroll`, payload)

                if (data.success) {
                    const calculations = data.calculations || []

                    // Map the response to update payrollList
                    const updatedList = calculations.map(calc => ({
                        id: calc.employee_id,
                        employee_code: calc.employee_code,
                        full_name: calc.employee_name,
                        attendance: calc.attendance || {},
                        leave: calc.leave || {},
                        expenses: calc.expenses || {},
                        salary_components: calc.salary_components || [],
                        gross_monthly: calc.gross_monthly || 0,
                        total_earnings: calc.total_earnings || 0,
                        total_deductions: calc.total_deductions || 0,
                        total_benefits: calc.total_benefits || 0,
                        expense_reimbursement: calc.expense_reimbursement || 0,
                        net_pay: calc.net_pay || 0,
                        ctc_monthly: calc.ctc_monthly || 0,
                        deduction_for_absences: calc.deduction_for_absences || 0,
                        adjustment_for_leaves: calc.adjustment_for_leaves || 0,
                        isCalculated: true,
                    }))

                    // If specific employee, update only that employee
                    if (employeeId) {
                        const index = this.runPayrollList.findIndex(e => e.id === employeeId)
                        if (index !== -1) {
                            this.runPayrollList[index] = { ...this.runPayrollList[index], ...updatedList[0] }
                        } else {
                            this.runPayrollList.push(...updatedList)
                        }
                    } else {
                        this.runPayrollList = updatedList
                    }

                    return { success: true, calculations: updatedList }
                } else {
                    this.error = data.message || 'Failed to calculate payroll'
                    return { success: false, message: this.error }
                }

            } catch (error) {
                console.error('Calculate Payroll Error:', error)
                this.error = error.response?.data?.message || 'Failed to calculate payroll'
                return { success: false, message: this.error }
            } finally {
                this.loading = false
            }
        }
    },
})
