// stores/holidayPublic.store.js
import { defineStore } from 'pinia'
import { useAuthStore } from '../auth.store'

export const useSalaryStore = defineStore('salary', {
    state: () => ({
        loading: true,
        error: null,
        revisions: [],
        salaryUpdateModal: false,
        template: null,
        grossAmount: null,
        effectiveFrom: null,
        status: { label: "ACTIVE", value: "ACTIVE" },
        statusOptions: [
            { label: "ACTIVE", value: "ACTIVE" },
            { label: "INACTIVE", value: "INACTIVE" },
            { label: "SUPERSEDED", value: "SUPERSEDED" },
        ],
        isCurrentActive: true,
        deductFromInHand: true,
        salaryCalculated: null
    }),

    actions: {
        /** ---------------------------------------------------------
         *  Fetch ALL holidays (server returns all for org)
        --------------------------------------------------------- **/
        async fetchAllSalaryRevisions() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.loading = true
            this.error = null

            try {
                const { data } = await $api.get(`/salary/revisions/employee/${auth.employee}`)
                this.revisions = data.revisions
            } catch (err) {
                console.error('[salaryStore] fetchAllSalaryRevisions error:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },

        async previewSalaryStructure() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()
            const toast = useToast()

            this.loading = true
            this.error = null

            try {
                if (!this.template || !this.grossAmount) {
                    toast.error({ title: 'Error!', message: 'Template and gross amount is required.', timeout: 1500 })
                }
                const { data } = await $api.post(`/salary/structure/preview`, {
                    templateId: this.template.value,
                    grossAnnual: Number(this.grossAmount)
                })
                this.salaryCalculated = data.structure
            } catch (err) {
                console.error('[salaryStore] previewSalaryStructure error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async fetchDetailedSalary(id) {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()
            const toast = useToast()

            this.error = null

            try {
                const selectedRevision = this.revisions.find(e => e.id == id)
                const { data } = await $api.get(`/salary/structure/employee/${auth.employee}/${selectedRevision.structure.id}`)
                this.salaryCalculated = data.structure
            } catch (err) {
                console.error('[salaryStore] fetchDetailedSalary error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                this.error = err
            }
        },


        async assignSalaryStructure() {
            const { $api } = useNuxtApp()
            const auth = useAuthStore()
            const toast = useToast()

            this.loading = true
            this.error = null

            try {
                const payload = {
                    templateId: this.template.value,
                    grossAnnual: Number(this.grossAmount),
                    employeeId: auth.employee || null,
                    effectiveFrom: this.effectiveFrom ? new Date(this.effectiveFrom).toLocaleDateString('en-IN') : null,
                    status: this.status?.value || null,
                    isCurrentActive: this.isCurrentActive || null,
                    deductFromInHand: this.deductFromInHand || true
                }
                const emptyData = Object.keys(payload).filter(e => e != 'deductFromInHand').find(e => payload[e] == null || payload[e] == undefined)
                if (emptyData) {
                    toast.error({ title: 'Error!', message: `${emptyData} in required.`, timeout: 1500 })
                }
                const { data } = await $api.post(`/salary/structure/assign`, payload)
                if (data.success) {
                    toast.success({
                        title: 'Success!',
                        message: data.message,
                        timeout: 1500
                    })
                    this.salaryCalculated = null;
                    this.template = null;
                    this.grossAmount = null;
                    this.effectiveFrom = null;
                    this.status = { label: "ACTIVE", value: "ACTIVE" };
                    this.isCurrentActive = true;
                    this.deductFromInHand = true;
                    this.salaryUpdateModal = false
                } else {
                    toast.error({
                        title: 'Error!',
                        message: data.message,
                        timeout: 1500
                    })
                }
            } catch (err) {
                console.error('[salaryStore] previewSalaryStructure error:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                this.error = err
            } finally {
                await this.fetchAllSalaryRevisions()
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        }
    }
})
