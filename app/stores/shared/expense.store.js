import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useExpenseStore = defineStore('expense', {
    state: () => ({
        loading: false,
        error: null,

        expenses: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        type: {
            value: 'ALL',
            label: 'All'
        },
        typeList: [
            {
                value: 'ALL',
                label: 'All'
            },
            {
                value: 'TRAVEL',
                label: 'Travel'
            },
            {
                value: 'FOOD',
                label: 'Food'
            },
            {
                value: 'ACCOMMODATION',
                label: 'Accommodation'
            },
            {
                value: 'OTHER',
                label: 'Other'
            },
        ],
        status: {
            value: 'PENDING',
            label: 'Pending'
        },
        statusList: [
            {
                value: 'ALL',
                label: 'All'
            },
            {
                value: 'PENDING',
                label: 'Pending'
            },
            {
                value: 'APPROVED',
                label: 'Approved'
            },
            {
                value: 'REJECTED',
                label: 'Rejected'
            },
        ],
        fromDate: null,
        toDate: null,
        employeeId: null,
        search: null,

        /* Toolbar filters used by the employee Expense page */
        fetchExpenseFilter: {
            search: '',
            type: 'ALL',
            status: null,
        },
        /* Modal form used by the employee Expense page */
        form: {
            id: null,
            type: 'OTHER',
            amount: null,
            description: '',
            receipt: null,
            receipt_url: null,
            preview_url: null,
            status: null,
        },
    }),
    getters: {
        /* Expense type values (strings) for the employee page selects */
        typesList: (state) => state.typeList.map(t => t.value).filter(v => v !== 'ALL'),
    },
    actions: {
        async fetchExpenseRequests() {
            const { $api } = useNuxtApp()

            this.loading = true
            this.error = null

            try {
                const auth = useAuthStore()
                const organizationId = auth.organization
                if (!organizationId) return false

                const { data } = await $api.get(`/organisation/${organizationId}/expense/admin`, {
                    params: {
                        page: this.page,
                        limit: this.limit,
                        type: this.type.value,
                        status: this.status.value,
                        from_date: this.fromDate,
                        to_date: this.toDate,
                        employee_id: this.employeeId,
                        search: this.search
                    }
                })

                this.expenses = data.expenses
                this.total = data.total_count
                this.page = data.page
                this.limit = data.limit
                this.totalPages = Math.ceil(data.total_count / data.limit)



            } catch (err) {
                console.error('❌ Failed to fetch service health:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },

        async approveExpenseRequest(id) {
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId || !id) return false

            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                const { data } = await $api.patch(`/organisation/${organizationId}/expense/${id}/status`, {
                    approver_id: 'SUPER_ADMIN',
                    status: 'APPROVED'
                })
                if (data.success) {
                    toast.success({ title: 'Success!', message: 'Expense request approved successfully' })
                    await this.fetchExpenseRequests()
                    return true
                }
            } catch (err) {
                console.error('❌ Failed to approve expense request:', err)
                toast.error({ title: 'Error!', message: err.message || 'Failed to approve request' })
            }
            return false
        },

        async rejectExpenseRequest(id) {
            const auth = useAuthStore()
            const organizationId = auth.organization
            if (!organizationId || !id) return false

            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                const { data } = await $api.patch(`/organisation/${organizationId}/expense/${id}/status`, {
                    approver_id: 'SUPER_ADMIN',
                    status: 'REJECTED'
                })
                if (data.success) {
                    toast.success({ title: 'Success!', message: 'Expense request rejected successfully' })
                    await this.fetchExpenseRequests()
                    return true
                }
            } catch (err) {
                console.error('❌ Failed to reject expense request:', err)
                toast.error({ title: 'Error!', message: err.message || 'Failed to reject request' })
            }
            return false
        },

        /* Employee — fetch own expenses (used by employee/expense.vue) */
        async getAllExpenses() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()
            const organizationId = auth.organization
            const employeeId = auth.employee
            if (!organizationId || !employeeId) return false

            this.loading = true
            this.error = null

            try {
                const params = {
                    employee_id: employeeId,
                    search: this.fetchExpenseFilter.search || '',
                    type: this.fetchExpenseFilter.type || 'ALL',
                    page: this.page,
                    limit: this.limit,
                }
                if (this.fetchExpenseFilter.status) params.status = this.fetchExpenseFilter.status

                const { data } = await $api.get(`/organisation/${organizationId}/expense`, { params })

                this.expenses = data?.expenses || []
                this.total = data?.total_count || 0
                this.page = data?.page || this.page
                this.limit = data?.limit || this.limit
                this.totalPages = Math.ceil(this.total / this.limit) || 0
                return true
            } catch (err) {
                console.error('❌ Failed to fetch expenses:', err)
                this.error = err
                return false
            } finally {
                this.loading = false
            }
        },

        /* Employee — create expense request */
        async requestExpense() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            const employeeId = auth.employee
            if (!organizationId || !employeeId) return false

            try {
                const { data } = await $api.post(`/organisation/${organizationId}/expense`, {
                    employee_id: employeeId,
                    type: this.form.type || 'OTHER',
                    amount: Number(this.form.amount),
                    description: this.form.description || '',
                    receipt_url: this.form.receipt_url || '',
                })
                toast.success({ title: 'Success!', message: data?.message || 'Expense request submitted', timeout: 1500 })
                await this.getAllExpenses()
                this.resetForm()
                return true
            } catch (err) {
                console.error('❌ Failed to submit expense request:', err)
                toast.error({ title: 'Error!', message: err?.response?.data?.error || err.message || 'Failed to submit request', timeout: 1500 })
                return false
            }
        },

        /* Employee — update expense request */
        async updateExpense() {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            const employeeId = auth.employee
            if (!organizationId || !employeeId || !this.form?.id) return false

            try {
                const body = {
                    employee_id: employeeId,
                    type: this.form.type,
                    description: this.form.description || '',
                    receipt_url: this.form.receipt_url || '',
                }
                if (this.form.amount !== null && this.form.amount !== undefined && this.form.amount !== '') {
                    body.amount = Number(this.form.amount)
                }

                const { data } = await $api.put(`/organisation/${organizationId}/expense/${this.form.id}`, body)
                toast.success({ title: 'Success!', message: data?.message || 'Expense request updated', timeout: 1500 })
                await this.getAllExpenses()
                this.resetForm()
                return true
            } catch (err) {
                console.error('❌ Failed to update expense request:', err)
                toast.error({ title: 'Error!', message: err?.response?.data?.error || err.message || 'Failed to update request', timeout: 1500 })
                return false
            }
        },

        /* Employee — delete expense request */
        async deleteExpense(id) {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const auth = useAuthStore()
            const organizationId = auth.organization
            const employeeId = auth.employee
            if (!organizationId || !employeeId || !id) return false

            try {
                await $api.delete(`/organisation/${organizationId}/expense/${id}`, {
                    params: { employee_id: employeeId },
                })
                toast.success({ title: 'Success!', message: 'Expense request deleted', timeout: 1500 })
                await this.getAllExpenses()
                return true
            } catch (err) {
                console.error('❌ Failed to delete expense request:', err)
                toast.error({ title: 'Error!', message: err?.response?.data?.error || err.message || 'Failed to delete request', timeout: 1500 })
                return false
            }
        },

        /* Reset the employee modal form */
        resetForm() {
            this.form = {
                id: null,
                type: 'OTHER',
                amount: null,
                description: '',
                receipt: null,
                receipt_url: null,
                preview_url: null,
                status: null,
            }
        },
    }
})