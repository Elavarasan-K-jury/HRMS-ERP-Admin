import { defineStore } from 'pinia'

export const useEmployeesStore = defineStore('employee', {
    state: () => ({
        all_employees: [],
        organization_id: null,
        loading: false,
        error: null,
        category_id: null,
        employees: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        type: "EMPLOYEE",
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        alt_phone: null,
        gender: null,
        dateOfBirth: null,
        employee_category: null,
        employee_designation: null,
        employee_department: [
            {
                id: null,
                department: null,
                reporting_to: null,
                start_date: new Date().toISOString().split('T')[0],
                end_date: null,
                employees_list: []
            }
        ],
        employee_id: null,
        employeeReport: null,
    }),
    actions: {
        async fetchEmployeeReport(employee_id) {
            this.loading = true
            const { $api } = useNuxtApp()

            try {

                const { data } = await $api.get(`/reports/employee/${employee_id}`)
                console.log('employee.store.js @ Line 18:', data);
                this.employeeReport = data
            } catch (err) {
                console.error('❌ Failed to fetch employee report:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async fetchAllEmployees(department_id = null, ret = false) {
            this.loading = true
            const { $api } = useNuxtApp()
            const organization_id = this.organization_id

            try {
                const { data } = await $api.get('/employees/all', {
                    params: department_id ? {
                        organization_id,
                        department_id
                    } : {
                        organization_id
                    },
                })
                console.log('employee.store.js @ Line 18:', data);
                if (ret) return data.employees
                this.all_employees = data.employees
            } catch (err) {
                console.error('❌ Failed to fetch employees:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async fetchAllEmployeesForADepartment(department_id) {
            this.loading = true
            const { $api } = useNuxtApp()
            const organization_id = this.organization_id

            try {
                const { data } = await $api.get('/employees/all', {
                    params: {
                        organization_id,
                        department_id
                    },
                })
                console.log('employee.store.js @ Line 18:', data);
                this.all_employees = data.employees
            } catch (err) {
                console.error('❌ Failed to fetch employees:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async fetchEmployee(id) {
            this.loading = true
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.get(`/employee/${id}`)
                return data
            } catch (err) {
                console.error('❌ Failed to fetch employees:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        async fetchEmployees() {
            this.loading = true
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.get('/employees', {
                    params: {
                        organization_id: this.organization_id,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                        sort_by: this.sortBy,
                        sort_order: this.sortOrder,
                        category_id: this.category_id ? this.category_id.value : null
                    },
                })
                console.log('employee.store.js @ Line 18:', data);
                this.employees = data.employees
                this.total = data.total
                this.totalPages = data.total_pages
            } catch (err) {
                console.error('❌ Failed to fetch employees:', err)
                this.error = err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        },
        addNewDepartment() {
            this.employee_department.push({
                id: null,
                department: null,
                reporting_to: null,
                start_date: null,
                end_date: null
            })
        },
        removeDepartment(index) {
            this.employee_department.splice(index, 1)
        },
        async saveEmployee() {
            this.loading = true
            const toast = useToast()
            const { $api } = useNuxtApp()
            try {
                if (this.employee_id) {
                    const { data } = await $api.put(`/employees/${this.employee_id}`, {
                        organizationId: this.organization_id,
                        firstName: this.first_name,
                        isAdmin: this.type == 'ADMIN',
                        lastName: this.last_name,
                        fullName: this.first_name + ' ' + this.last_name,
                        email: this.email,
                        phone: this.phone,
                        altPhone: this.alt_phone,
                        gender: this.gender,
                        dateOfBirth: this.dateOfBirth,
                        categoryId: this.employee_category.value,
                        designationId: this.employee_designation.value,
                    })
                    console.log('employee.store.js @ Line 147:', data);
                    if (data.success) {
                        toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                        for (const dept of this.employee_department) {
                            const emp_dept = {
                                department_id: dept.department.value,
                                reporting_to: dept.reporting_to ? dept.reporting_to.value : null,
                                employee_id: data.employee.id,
                                start_date: dept.start_date,
                                end_date: dept.end_date
                            }
                            if (dept.id) {
                                const resp = await $api.put(`/employees/departments/${dept.id}`, emp_dept)
                                const update_data = resp.data
                                if (update_data.success) {
                                    toast.success({ title: 'Success!', message: update_data.message, timeout: 1500 })
                                }
                                continue
                            }
                            const resp = await $api.post('/employees/departments', emp_dept)
                            const create_data = resp.data
                            console.log('employee.store.js @ Line 157:', create_data);
                            if (create_data.success) {
                                toast.success({ title: 'Success!', message: create_data.message, timeout: 1500 })
                            }
                        }
                    }
                    return
                }
                const { data } = await $api.post('/employees', {
                    organizationId: this.organization_id,
                    firstName: this.first_name,
                    isAdmin: this.type == 'ADMIN',
                    lastName: this.last_name,
                    fullName: this.first_name + ' ' + this.last_name,
                    email: this.email,
                    phone: this.phone,
                    altPhone: this.alt_phone,
                    gender: this.gender,
                    dateOfBirth: this.dateOfBirth,
                    categoryId: this.employee_category.value,
                    designationId: this.employee_designation.value,
                })
                console.log('employee.store.js @ Line 147:', data);
                if (data.success) {
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                    for (const dept of this.employee_department) {
                        const emp_dept = {
                            department_id: dept.department.value,
                            reporting_to: dept.reporting_to ? dept.reporting_to.value : null,
                            employee_id: data.employee.id,
                            start_date: dept.start_date,
                            end_date: dept.end_date
                        }
                        if (dept.id) {
                            const resp = await $api.put(`/employees/departments/${dept.id}`, emp_dept)
                            const update_data = resp.data
                            if (update_data.success) {
                                toast.success({ title: 'Success!', message: update_data.message, timeout: 1500 })
                            }
                            continue
                        }
                        const resp = await $api.post('/employees/departments', emp_dept)
                        const create_data = resp.data
                        console.log('employee.store.js @ Line 157:', create_data);
                        if (create_data.success) {
                            toast.success({ title: 'Success!', message: create_data.message, timeout: 1500 })
                        }
                    }
                }
            } catch (err) {
                console.error('❌ Failed to save employee:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                this.error = err
            } finally {
                await this.fetchEmployees()
                this.employee_id = null
                this.first_name = null
                this.last_name = null
                this.email = null
                this.phone = null
                this.alt_phone = null
                this.gender = null
                this.dateOfBirth = null
                this.employee_category = null
                this.employee_designation = null
                this.employee_department = [
                    {
                        id: null,
                        department: null,
                        reporting_to: null,
                        start_date: new Date().toISOString().split('T')[0],
                        end_date: null,
                        employees_list: []
                    }
                ],
                    setTimeout(() => {
                        this.loading = false
                    }, 1000);
            }
        },
        async deleteEmployee() {
            this.loading = true
            const toast = useToast()
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.delete(`/employees/${this.employee_id}`)
                if (data.success) {
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                }
            } catch (err) {
                console.error('❌ Failed to delete employee:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                this.error = err
            } finally {
                await this.fetchEmployees()
                this.employee_id = null
                setTimeout(() => {
                    this.loading = false
                }, 1000);
            }
        }
    }
})