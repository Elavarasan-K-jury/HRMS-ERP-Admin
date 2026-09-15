import { defineStore } from 'pinia'

export const useEmployeesStore = defineStore('employee', {
    state: () => ({
        all_employees: [],
        organization_id: null,
        loading: false,
        error: null,
        category_id: null,
        department_id: null,
        branch_filter: null,
        location_filter: null,
        employees: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        search: null,
        sortBy: 'created_at',
        sortOrder: 'desc',
        type: "EMPLOYEE",
        is_active: true,
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        alt_phone: null,
        gender: null,
        dateOfBirth: null,
        joining_date: null,
        display_name: null,
        marital_status: null,
        blood_group: null,
        physically_handicapped: false,
        nationality: null,
        personal_email: null,
        professional_summary: null,
        current_address: { address_line1: null, address_line2: null, city: null, state: null, country: null, postal_code: null },
        permanent_address: { address_line1: null, address_line2: null, city: null, state: null, country: null, postal_code: null },
        same_as_current_address: false,
        employee_category: null,
        employee_designation: null,
        probation_policy_id: null,
        probation_start_date: null,
        probation_end_date: null,
        is_permanent: false,
        worker_type: 'FULL_TIME',
        manager_id: null,
        branch_id: null,
        location_id: null,
        employee_department: [
            {
                id: null,
                department: null,
                sub_department: null,
                reporting_to: null,
                start_date: new Date().toISOString().split('T')[0],
                end_date: null,
                employees_list: []
            }
        ],
        employee_id: null,
        number_series: [],
        number_series_id: null,
        employee_code: null,
        series_preset_id: null,
        employeeReport: null,
        profile_image: null,
        profile_image_file_id: null,
        cost_center_id: null,
        pay_grade_id: null,
        band_id: null,
        notice_period_policy_id: null,
        relationships: [],
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
        async fetchNumberSeries() {
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.get(`/organizations/${this.organization_id}/employee-number-series`)
                this.number_series = data.series || []
                return this.number_series
            } catch (err) {
                console.error('❌ Failed to fetch employee number series:', err)
                this.error = err
                return []
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
            const extractId = (v) => v && typeof v === 'object' && 'value' in v ? v.value : v
            try {
                const { data } = await $api.get('/employees', {
                    params: {
                        organization_id: this.organization_id,
                        page: Number(this.page),
                        limit: Number(this.limit),
                        search: this.search,
                        sort_by: this.sortBy,
                        sort_order: this.sortOrder,
                        category_id: extractId(this.category_id),
                        department_id: extractId(this.department_id),
                        branch_id: extractId(this.branch_filter),
                        location_id: extractId(this.location_filter)
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
                sub_department: null,
                reporting_to: null,
                start_date: null,
                end_date: null,
                employees_list: []
            })
        },
        removeDepartment(index) {
            this.employee_department.splice(index, 1)
        },
        addRelationship() {
            this.relationships.push({
                _key: Date.now() + Math.random(),
                _persisted: false,
                id: null,
                relationship: '',
                first_name: '',
                last_name: '',
                gender: '',
                email: '',
                phone: '',
                profession: '',
                date_of_birth: '',
            })
        },
        removeRelationship(index) {
            this.relationships.splice(index, 1)
        },
        async fetchRelationships(employeeId) {
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.get(`/employees/${employeeId}/relationships`)
                this.relationships = (data.relationships || []).map(r => ({
                    _key: r.id,
                    _persisted: true,
                    id: r.id,
                    relationship: r.relationship || '',
                    first_name: r.first_name || '',
                    last_name: r.last_name || '',
                    gender: r.gender || '',
                    email: r.email || '',
                    phone: r.phone || '',
                    profession: r.profession || '',
                    date_of_birth: r.date_of_birth || '',
                }))
                return this.relationships
            } catch (err) {
                console.error('❌ Failed to fetch relationships:', err)
                this.relationships = []
                return []
            }
        },
        async saveRelationships(employeeId) {
            const { $api } = useNuxtApp()
            const toast = useToast()
            const extractValue = (v) => v && typeof v === 'object' && v.value ? v.value : v

            for (const rel of this.relationships) {
                const payload = {
                    relationship: extractValue(rel.relationship) || rel.relationship,
                    first_name: rel.first_name,
                    last_name: rel.last_name || null,
                    gender: extractValue(rel.gender) || rel.gender || null,
                    email: rel.email || null,
                    phone: rel.phone || null,
                    profession: rel.profession || null,
                    date_of_birth: rel.date_of_birth || null,
                }

                if (rel._persisted && rel.id) {
                    try {
                        await $api.put(`/employees/${employeeId}/relationships/${rel.id}`, payload)
                    } catch (err) {
                        console.error('❌ Failed to update relationship:', err)
                        toast.error({ title: 'Error!', message: `Failed to update relationship for ${rel.first_name}: ${err.message}`, timeout: 4000 })
                    }
                } else if (!rel._persisted && rel.first_name && rel.relationship) {
                    try {
                        const { data } = await $api.post(`/employees/${employeeId}/relationships`, payload)
                        if (data.relationship) {
                            rel.id = data.relationship.id
                            rel._persisted = true
                        }
                    } catch (err) {
                        console.error('❌ Failed to create relationship:', err)
                        toast.error({ title: 'Error!', message: `Failed to create relationship for ${rel.first_name}: ${err.message}`, timeout: 4000 })
                    }
                }
            }

            for (let i = this.relationships.length - 1; i >= 0; i--) {
                const rel = this.relationships[i]
                if (rel._markedForDeletion && rel._persisted && rel.id) {
                    try {
                        await $api.delete(`/employees/${employeeId}/relationships/${rel.id}`)
                        this.relationships.splice(i, 1)
                    } catch (err) {
                        console.error('❌ Failed to delete relationship:', err)
                        toast.error({ title: 'Error!', message: `Failed to delete relationship: ${err.message}`, timeout: 4000 })
                    }
                }
            }
        },
        addressPayload(addr) {
            if (!addr) return null
            const hasValue = ['address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code']
                .some(k => (addr[k] || '').trim())
            if (!hasValue) return null
            return {
                addressLine1: (addr.address_line1 || '').trim() || null,
                addressLine2: (addr.address_line2 || '').trim() || null,
                city: (addr.city || '').trim() || null,
                state: (addr.state || '').trim() || null,
                country: (addr.country || '').trim() || null,
                postalCode: (addr.postal_code || '').trim() || null,
            }
        },
        async saveEmployee() {
            this.loading = true
            const toast = useToast()
            const { $api } = useNuxtApp()
            this.error = null
            let success = false
            try {
                if (this.employee_id) {
                    const { data } = await $api.put(`/employees/${this.employee_id}`, {
                        organizationId: this.organization_id,
                        firstName: this.first_name,
                        isAdmin: this.type == 'ADMIN',
                        isActive: this.is_active,
                        lastName: this.last_name,
                        fullName: this.first_name + ' ' + this.last_name,
                        email: this.email,
                        phone: this.phone,
                        altPhone: this.alt_phone,
                        gender: this.gender,
                        dateOfBirth: this.dateOfBirth,
                        joiningDate: this.joining_date,
                        categoryId: this.employee_category?.value || this.employee_category || null,
                        designationId: this.employee_designation?.value || this.employee_designation || null,
                        probationPolicyId: this.probation_policy_id?.value || this.probation_policy_id || null,
                        probationStartDate: this.probation_start_date,
                        probationEndDate: this.probation_end_date,
                        isPermanent: this.is_permanent,
                        workerType: this.worker_type,
                    managerId: this.manager_id ? this.manager_id.value : null,
                    branchId: this.branch_id ? this.branch_id.value : null,
                    locationId: this.location_id ? (this.location_id.value || this.location_id) : null,
                    numberSeriesId: this.number_series_id?.value || this.number_series_id || null,
                    employeeCode: this.employee_code,
                    displayName: this.display_name,
                    maritalStatus: this.marital_status,
                    bloodGroup: this.blood_group,
                    physicallyHandicapped: this.physically_handicapped,
                    nationality: this.nationality,
                    personalEmail: this.personal_email,
                    professionalSummary: this.professional_summary,
                    currentAddress: this.addressPayload(this.current_address),
                    permanentAddress: this.addressPayload(this.permanent_address),
                    profileImage: this.profile_image || undefined,
                    profileImageFileId: this.profile_image_file_id || undefined,
                    costCenterId: this.cost_center_id?.value ?? this.cost_center_id ?? undefined,
                    payGradeId: this.pay_grade_id?.value ?? this.pay_grade_id ?? undefined,
                    bandId: this.band_id?.value ?? this.band_id ?? undefined,
                    noticePeriodPolicyId: this.notice_period_policy_id?.value ?? this.notice_period_policy_id ?? null,
                })
                        console.log('employee.store.js @ Line 147:', data);
                    if (data.success) {
                        success = true
                        for (const dept of this.employee_department) {
                            const extractId = (v) => v && typeof v === 'object' && v.value ? v.value : v
                            const deptId = extractId(dept.sub_department) || extractId(dept.department)
                            console.log('[save] sub_department:', dept.sub_department, 'department:', dept.department, 'deptId:', deptId)
                            if (!deptId) {
                                console.warn('[save] No department selected, skipping assignment')
                                continue
                            }
                            const emp_dept = {
                                department_id: deptId,
                                reporting_to: dept.reporting_to ? extractId(dept.reporting_to) : null,
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
                            console.log('[save] create response:', create_data);
                            if (create_data.success) {
                                toast.success({ title: 'Success!', message: create_data.message, timeout: 1500 })
                            }
                        }
                        if (this.relationships.length > 0) {
                            await this.saveRelationships(this.employee_id)
                        }
                    }
                    return
                }
                const { data } = await $api.post('/employees', {
                    organizationId: this.organization_id,
                    firstName: this.first_name,
                    isAdmin: this.type == 'ADMIN',
                    isActive: this.is_active,
                    lastName: this.last_name,
                    fullName: this.first_name + ' ' + this.last_name,
                    email: this.email,
                    phone: this.phone,
                    altPhone: this.alt_phone,
                    gender: this.gender,
                    dateOfBirth: this.dateOfBirth,
                    joiningDate: this.joining_date,
                    numberSeriesId: this.number_series_id?.value || this.number_series_id || null,
                    employeeCode: null,
                    categoryId: this.employee_category?.value || this.employee_category || null,
                    designationId: this.employee_designation?.value || this.employee_designation || null,
probationPolicyId: this.probation_policy_id?.value || this.probation_policy_id || null,
                        probationStartDate: this.probation_start_date,
                        probationEndDate: this.probation_end_date,
                        isPermanent: this.is_permanent,
                        workerType: this.worker_type,
                        managerId: this.manager_id ? this.manager_id.value : null,
                        branchId: this.branch_id ? this.branch_id.value : null,
                        locationId: this.location_id ? (this.location_id.value || this.location_id) : null,
                        displayName: this.display_name,
                        maritalStatus: this.marital_status,
                        bloodGroup: this.blood_group,
                        physicallyHandicapped: this.physically_handicapped,
                        nationality: this.nationality,
                        personalEmail: this.personal_email,
                        professionalSummary: this.professional_summary,
                        currentAddress: this.addressPayload(this.current_address),
                        permanentAddress: this.addressPayload(this.permanent_address),
                        profileImage: this.profile_image || undefined,
                        profileImageFileId: this.profile_image_file_id || undefined,
                        costCenterId: this.cost_center_id?.value ?? this.cost_center_id ?? undefined,
                    payGradeId: this.pay_grade_id?.value ?? this.pay_grade_id ?? undefined,
                    bandId: this.band_id?.value ?? this.band_id ?? undefined,
                    noticePeriodPolicyId: this.notice_period_policy_id?.value ?? this.notice_period_policy_id ?? null,
                    })
                    console.log('[save] create emp response:', data);
                if (data.success) {
                    success = true
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                    for (const dept of this.employee_department) {
                        const extractId = (v) => v && typeof v === 'object' && v.value ? v.value : v
                        const deptId = extractId(dept.sub_department) || extractId(dept.department)
                        console.log('[save] sub_department:', dept.sub_department, 'department:', dept.department, 'deptId:', deptId)
                        if (!deptId) {
                            console.warn('[save] No department selected, skipping assignment')
                            continue
                        }
                        const emp_dept = {
                            department_id: deptId,
                            reporting_to: dept.reporting_to ? extractId(dept.reporting_to) : null,
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
                    if (this.relationships.length > 0) {
                        await this.saveRelationships(data.employee.id)
                    }
                }
            } catch (err) {
                console.error('❌ Failed to save employee:', err)
                const rawMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Something went wrong'
                toast.error({ title: 'Error!', message: String(rawMsg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 4000 })
                this.error = err
                throw err
            } finally {
                await this.fetchEmployees()
                if (success) {
                this.employee_id = null
                this.first_name = null
                this.last_name = null
                this.email = null
                this.phone = null
                this.alt_phone = null
                this.gender = null
                this.is_active = true
                this.dateOfBirth = null
                this.joining_date = null
                this.display_name = null
                this.marital_status = null
                this.blood_group = null
                this.physically_handicapped = false
                this.nationality = null
                this.personal_email = null
                this.professional_summary = null
                this.current_address = { address_line1: null, address_line2: null, city: null, state: null, country: null, postal_code: null }
                this.permanent_address = { address_line1: null, address_line2: null, city: null, state: null, country: null, postal_code: null }
                this.same_as_current_address = false
                this.employee_category = null
                this.employee_designation = null
                this.probation_policy_id = null
                this.probation_start_date = null
                this.probation_end_date = null
                this.is_permanent = false
                this.worker_type = 'FULL_TIME'
                this.manager_id = null
                this.branch_id = null
                this.location_id = null
                this.number_series_id = null
                this.employee_code = null
                this.series_preset_id = null
                this.band_id = null
                this.notice_period_policy_id = null
                this.profile_image = null
                this.profile_image_file_id = null
                this.relationships = []
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
        },

        // Partial update: only the provided (changed) fields are sent to the API.
        // Unchanged fields are omitted so no spurious writes happen.
        async updateEmployeeFields(employee_id, changes) {
            if (!employee_id || !changes || Object.keys(changes).length === 0) return null
            this.loading = true
            const toast = useToast()
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.put(`/employees/${employee_id}`, changes)
                if (data.success) {
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                }
                return data
            } catch (err) {
                console.error('❌ Failed to update employee fields:', err)
                toast.error({ title: 'Error!', message: err.response?.data?.error || err.message, timeout: 1500 })
                this.error = err
                throw err
            } finally {
                setTimeout(() => {
                    this.loading = false
                }, 500);
            }
        },

        async extendProbation(employee_id, months) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            try {
                const { data } = await $api.post(`/employees/${employee_id}/probation/extend`, {
                    organization_id: this.organization_id,
                    months,
                })
                if (data.success) {
                    toast.success({ title: 'Success!', message: data.message, timeout: 1500 })
                    return data.employee
                }
                toast.error({ title: 'Error!', message: data.message || 'Failed to extend probation', timeout: 1500 })
                return null
            } catch (err) {
                console.error('❌ Failed to extend probation:', err)
                toast.error({ title: 'Error!', message: err.message, timeout: 1500 })
                this.error = err
                return null
            }
        },

        // async fetchProbationEmployees() {
        //     this.loading = true
        //     const { $api } = useNuxtApp()
        //     try {
        //         const { data } = await $api.get('/employees/probation', {
        //             params: {
        //                 organization_id: this.organization_id,
        //             },
        //         })
        //         console.log('employee.store.js @ Line 18:', data);
        //         this.employees = data.employees
        //         this.total = data.total
        //         this.totalPages = data.total_pages
        //     } catch (err) {
        //         console.error('❌ Failed to fetch probation employees:', err)
        //         this.error = err
        //     } finally {
        //         setTimeout(() => {
        //             this.loading = false
        //         }, 1000);
        //     }
        // }
    }
})
