import { defineStore } from 'pinia'
import { useAuthStore } from '../shared/auth.store'

export const useExpenseAdminStore = defineStore('expense-admin', {
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
        search: null
    }),
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
            const employee_id = auth.employee
            if (!employee_id) return false

            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                const { data } = await $api.patch(`/organisation/${organizationId}/expense/${id}/status`, {
                    approver_id: employee_id,
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
            const employee_id = auth.employee
            if (!employee_id) return false

            const { $api } = useNuxtApp()
            const toast = useToast()
            try {
                const { data } = await $api.patch(`/organisation/${organizationId}/expense/${id}/status`, {
                    approver_id: employee_id,
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
    }
})