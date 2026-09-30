import { defineStore } from 'pinia'

const mapFolder = (f) => ({
    id: f?.id || '',
    organization_id: f?.organization_id || '',
    name: f?.name || '',
    description: f?.description || '',
    is_confidential: !!f?.is_confidential,
    is_active: f?.is_active ?? true,
    permissions: Array.isArray(f?.permissions) ? f.permissions : [],
    created_by_id: f?.created_by_id || '',
    updated_by_id: f?.updated_by_id || '',
    created_at: f?.created_at || '',
    updated_at: f?.updated_at || '',
    document_type_count: f?.document_type_count || 0,
})

const mapDocumentType = (t) => ({
    id: t?.id || '',
    folder_id: t?.folder_id || '',
    name: t?.name || '',
    description: t?.description || '',
    is_multiple: !!t?.is_multiple,
    is_mandatory: !!t?.is_mandatory,
    is_appliable_na: !!t?.is_appliable_na,
    is_file_upload_enabled: !!t?.is_file_upload_enabled,
    is_verification_required: !!t?.is_verification_required,
    ask_expiry_date: !!t?.ask_expiry_date,
    expiry_days: t?.expiry_days || null,
    expiry_period: t?.expiry_period || '',
    all_countries: t?.all_countries ?? true,
    allowed_countries: t?.allowed_countries || [],
    display_order: t?.display_order || 0,
    is_active: t?.is_active ?? true,
    field_count: t?.field_count || 0,
    assignment_count: t?.assignment_count || 0,
    fields: (t?.fields || []).map(mapField),
})

const mapField = (f) => ({
    id: f?.id || '',
    document_type_id: f?.document_type_id || '',
    label: f?.label || '',
    key: f?.key || '',
    field_type: f?.field_type || 'TEXTBOX',
    options: Array.isArray(f?.options) ? f.options : (f?.options ? [f.options] : []),
    is_mandatory: !!f?.is_mandatory,
    display_order: f?.display_order || 0,
})

const mapAssignment = (a) => ({
    id: a?.id || '',
    organization_id: a?.organization_id || '',
    employee_id: a?.employee_id || '',
    document_type_id: a?.document_type_id || '',
    assigned_by_id: a?.assigned_by_id || '',
    assigned_at: a?.assigned_at || '',
    status: a?.status || 'PENDING',
    created_at: a?.created_at || '',
    updated_at: a?.updated_at || '',
    employee_name: a?.employee_name || '',
    employee_code: a?.employee_code || '',
    department: a?.department || '',
    designation: a?.designation || '',
    document_type_name: a?.document_type_name || '',
    folder_id: a?.folder_id || '',
    folder_name: a?.folder_name || '',
    document_is_mandatory: !!a?.document_is_mandatory,
    document_is_multiple: !!a?.document_is_multiple,
    document_is_verification_required: !!a?.document_is_verification_required,
})

const mapPendingDocument = (p) => ({
    assignment_id: p?.assignment_id || '',
    employee_id: p?.employee_id || '',
    employee_name: p?.employee_name || '',
    employee_code: p?.employee_code || '',
    designation: p?.designation || '',
    department: p?.department || '',
    folder_id: p?.folder_id || '',
    folder_name: p?.folder_name || '',
    document_type_id: p?.document_type_id || '',
    document_type_name: p?.document_type_name || '',
    document_is_mandatory: !!p?.document_is_mandatory,
    document_is_multiple: !!p?.document_is_multiple,
    document_is_appliable_na: !!p?.document_is_appliable_na,
    document_is_verification_required: !!p?.document_is_verification_required,
    document_ask_expiry_date: !!p?.document_ask_expiry_date,
    assignment_status: p?.assignment_status || 'PENDING',
    assigned_at: p?.assigned_at || '',
    assigned_by_id: p?.assigned_by_id || '',
    submission_status: p?.submission_status || '',
    submission_id: p?.submission_id || '',
})

const mapSubmission = (s) => ({
    id: s?.id || '',
    organization_id: s?.organization_id || '',
    assignment_id: s?.assignment_id || '',
    employee_id: s?.employee_id || '',
    document_type_id: s?.document_type_id || '',
    file_id: s?.file_id || '',
    storage_key: s?.storage_key || '',
    file_name: s?.file_name || '',
    file_type: s?.file_type || '',
    file_url: s?.file_url || '',
    field_values: s?.field_values ? (typeof s.field_values === 'string' ? JSON.parse(s.field_values) : s.field_values) : {},
    is_na: !!s?.is_na,
    status: s?.status || 'PENDING_VERIFICATION',
    submitted_by_id: s?.submitted_by_id || '',
    submitted_at: s?.submitted_at || '',
    expiry_date: s?.expiry_date || '',
    created_at: s?.created_at || '',
    updated_at: s?.updated_at || '',
    employee_name: s?.employee_name || '',
    employee_code: s?.employee_code || '',
    document_type_name: s?.document_type_name || '',
    folder_id: s?.folder_id || '',
    folder_name: s?.folder_name || '',
    submitted_by_name: s?.submitted_by_name || '',
    submitted_by_type: s?.submitted_by_type || '',
    submitted_by_email: s?.submitted_by_email || '',
    verified_by_id: s?.verified_by_id || '',
    verified_at: s?.verified_at || '',
    verified_by_name: s?.verified_by_name || '',
    verified_by_type: s?.verified_by_type || '',
    verified_by_email: s?.verified_by_email || '',
    rejected_by_id: s?.rejected_by_id || '',
    rejected_at: s?.rejected_at || '',
    rejection_reason: s?.rejection_reason || '',
    rejected_by_name: s?.rejected_by_name || '',
    rejected_by_type: s?.rejected_by_type || '',
    rejected_by_email: s?.rejected_by_email || '',
    fields: s?.fields || [],
    replaced_by_submission_id: s?.replaced_by_submission_id || '',
    is_current: !!s?.is_current,
})

const mapPendingVerification = (p) => ({
    submission_id: p?.submission_id || '',
    assignment_id: p?.assignment_id || '',
    employee_id: p?.employee_id || '',
    employee_name: p?.employee_name || '',
    employee_code: p?.employee_code || '',
    designation: p?.designation || '',
    department: p?.department || '',
    folder_id: p?.folder_id || '',
    folder_name: p?.folder_name || '',
    document_type_id: p?.document_type_id || '',
    document_type_name: p?.document_type_name || '',
    status: p?.status || 'PENDING_VERIFICATION',
    submitted_at: p?.submitted_at || '',
    submitted_by_id: p?.submitted_by_id || '',
    submitted_by_name: p?.submitted_by_name || '',
    submitted_by_type: p?.submitted_by_type || '',
    submitted_by_email: p?.submitted_by_email || '',
    file_id: p?.file_id || '',
    file_name: p?.file_name || '',
    file_type: p?.file_type || '',
    file_url: p?.file_url || '',
    field_values: p?.field_values ? (typeof p.field_values === 'string' ? JSON.parse(p.field_values) : p.field_values) : {},
    is_na: !!p?.is_na,
    expiry_date: p?.expiry_date || '',
    document_ask_expiry_date: !!p?.document_ask_expiry_date,
    replaced_by_submission_id: p?.replaced_by_submission_id || '',
    is_current: !!p?.is_current,
})

const mapVerifiedDocument = (p) => ({
    submission_id: p?.submission_id || '',
    assignment_id: p?.assignment_id || '',
    employee_id: p?.employee_id || '',
    employee_name: p?.employee_name || '',
    employee_code: p?.employee_code || '',
    designation: p?.designation || '',
    department: p?.department || '',
    folder_id: p?.folder_id || '',
    folder_name: p?.folder_name || '',
    document_type_id: p?.document_type_id || '',
    document_type_name: p?.document_type_name || '',
    status: p?.status || 'VERIFIED',
    submitted_at: p?.submitted_at || '',
    submitted_by_id: p?.submitted_by_id || '',
    submitted_by_name: p?.submitted_by_name || '',
    submitted_by_type: p?.submitted_by_type || '',
    submitted_by_email: p?.submitted_by_email || '',
    verified_at: p?.verified_at || '',
    verified_by_id: p?.verified_by_id || '',
    verified_by_name: p?.verified_by_name || '',
    verified_by_type: p?.verified_by_type || '',
    verified_by_email: p?.verified_by_email || '',
    file_id: p?.file_id || '',
    file_name: p?.file_name || '',
    file_type: p?.file_type || '',
    file_url: p?.file_url || '',
    field_values: p?.field_values ? (typeof p.field_values === 'string' ? JSON.parse(p.field_values) : p.field_values) : {},
    is_na: !!p?.is_na,
    expiry_date: p?.expiry_date || '',
    document_is_multiple: !!p?.document_is_multiple,
    document_is_mandatory: !!p?.document_is_mandatory,
    document_is_verification_required: !!p?.document_is_verification_required,
    fields: (p?.fields || []).map(mapField),
    replaced_by_submission_id: p?.replaced_by_submission_id || '',
    is_current: !!p?.is_current,
})

const mapExpiringDocument = (p) => ({
    submission_id: p?.submission_id || '',
    assignment_id: p?.assignment_id || '',
    employee_id: p?.employee_id || '',
    employee_name: p?.employee_name || '',
    employee_code: p?.employee_code || '',
    designation: p?.designation || '',
    department: p?.department || '',
    folder_id: p?.folder_id || '',
    folder_name: p?.folder_name || '',
    document_type_id: p?.document_type_id || '',
    document_type_name: p?.document_type_name || '',
    status: p?.status || 'VERIFIED',
    submitted_at: p?.submitted_at || '',
    submitted_by_id: p?.submitted_by_id || '',
    submitted_by_name: p?.submitted_by_name || '',
    verified_at: p?.verified_at || '',
    verified_by_id: p?.verified_by_id || '',
    verified_by_name: p?.verified_by_name || '',
    file_id: p?.file_id || '',
    file_name: p?.file_name || '',
    file_type: p?.file_type || '',
    file_url: p?.file_url || '',
    field_values: p?.field_values ? (typeof p.field_values === 'string' ? JSON.parse(p.field_values) : p.field_values) : {},
    is_na: !!p?.is_na,
    expiry_date: p?.expiry_date || '',
    days_left: p?.days_left ?? null,
    expiry_state: p?.expiry_state || 'UPCOMING',
    document_is_multiple: !!p?.document_is_multiple,
    replaced_by_submission_id: p?.replaced_by_submission_id || '',
    is_current: !!p?.is_current,
})

export const useEmployeeDocumentStore = defineStore('employeeDocument', {
    state: () => ({
        loading: false,
        saving: false,
        organizationId: null,

        // Folders
        folders: [],
        foldersTotal: 0,
        foldersPage: 1,
        foldersLimit: 20,
        foldersTotalPages: 0,
        foldersSearch: '',
        foldersLoading: false,
        selectedFolderId: null,

        // Document types
        documentTypes: [],
        documentTypesTotal: 0,
        documentTypesPage: 1,
        documentTypesLimit: 20,
        documentTypesTotalPages: 0,
        documentTypesSearch: '',
        documentTypesLoading: false,
        selectedDocumentTypeId: null,
        selectedDocumentType: null,
        selectedDocumentTypeLoading: false,

        // Assignments (flat)
        assignments: [],
        assignmentsLoading: false,
        assignmentTotal: 0,
        assignmentPage: 1,
        assignmentLimit: 20,
        assignmentTotalPages: 0,
        assignmentSearch: '',
        selectedAssignmentEmployeeId: null,

        // Grouped assignments (employee-level pagination)
        groupedAssignments: [],
        groupedLoading: false,
        groupedError: false,
        groupedTotalEmployees: 0,
        groupedPage: 1,
        groupedLimit: 10,
        groupedTotalPages: 0,
        groupedSearch: '',

        // Pending on employee
        pendingEmployeeDocuments: [],
        pendingLoading: false,
        pendingError: false,
        pendingTotal: 0,
        pendingPage: 1,
        pendingLimit: 10,
        pendingTotalPages: 0,
        pendingSearch: '',
        pendingTotalEmployees: 0,

        // Submissions
        submissions: [],
        submissionsLoading: false,
        submissionTotal: 0,
        submissionPage: 1,
        submissionLimit: 10,
        submissionTotalPages: 0,

        // Pending verification
        pendingVerificationDocuments: [],
        pendingVerificationLoading: false,
        pendingVerificationError: false,
        pendingVerificationTotal: 0,
        pendingVerificationPage: 1,
        pendingVerificationLimit: 10,
        pendingVerificationTotalPages: 0,
        pendingVerificationSearch: '',

        // Verified documents
        verifiedDocuments: [],
        verifiedLoading: false,
        verifiedError: false,
        verifiedTotal: 0,
        verifiedPage: 1,
        verifiedLimit: 10,
        verifiedTotalPages: 0,
        verifiedSearch: '',

        // Expiring documents
        expiringDocuments: [],
        expiringLoading: false,
        expiringError: false,
        expiringTotal: 0,
        expiringPage: 1,
        expiringLimit: 10,
        expiringTotalPages: 0,
        expiringSearch: '',
        expiringDays: 30,
    }),

    getters: {
        selectedFolder(state) {
            return state.folders.find(f => String(f.id) === String(state.selectedFolderId)) || state.folders[0] || null
        },
    },

    actions: {
        /* ================== FOLDERS ================== */
        async fetchFolders(orgId, opts = {}) {
            this.foldersLoading = true
            try {
                const { $api } = useNuxtApp()
                this.organizationId = orgId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.foldersPage,
                    limit: opts.limit ?? this.foldersLimit,
                    search: opts.search ?? this.foldersSearch,
                    sort_by: opts.sortBy ?? 'created_at',
                    sort_order: opts.sortOrder ?? 'asc',
                }
                const { data } = await $api.get('/employee-documents/folders', { params })
                this.folders = (data?.folders || []).map(mapFolder)
                this.foldersTotal = data?.total || 0
                this.foldersPage = data?.page || 1
                this.foldersTotalPages = data?.total_pages || 0
                this.foldersSearch = params.search
                // Preserve selection if still present, else pick first
                if (!this.selectedFolderId || !this.folders.find(f => String(f.id) === String(this.selectedFolderId))) {
                    this.selectedFolderId = this.folders[0]?.id || null
                }
                return this.folders
            } catch (err) {
                console.error('[employeeDocument] fetchFolders error:', err)
                throw err
            } finally {
                this.foldersLoading = false
            }
        },

        selectFolder(id) { this.selectedFolderId = id },

        async getFolder(folderId) {
            const { $api } = useNuxtApp()
            const { data } = await $api.get(`/employee-documents/folders/${folderId}`, { params: { organization_id: this.organizationId } })
            return mapFolder(data?.folder)
        },

        async createFolder(payload) {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/employee-documents/folders', {
                    organization_id: this.organizationId,
                    name: payload.name?.trim(),
                    description: payload.description?.trim() || null,
                    is_confidential: !!payload.is_confidential,
                    is_active: payload.is_active !== undefined ? payload.is_active : true,
                    permissions: payload.permissions || [],
                })
                toast.success({ title: 'Success!', message: data.message || 'Folder created', timeout: 1500 })
                await this.fetchFolders(this.organizationId)
                const created = mapFolder(data?.folder)
                if (created.id) this.selectedFolderId = created.id
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to create folder'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updateFolder(folderId, payload) {
            const toast = useToast()
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.patch(`/employee-documents/folders/${folderId}`, {
                    organization_id: this.organizationId,
                    name: payload.name !== undefined ? payload.name?.trim() : undefined,
                    description: payload.description !== undefined ? (payload.description?.trim() || null) : undefined,
                    is_confidential: payload.is_confidential !== undefined ? !!payload.is_confidential : undefined,
                    is_active: payload.is_active !== undefined ? !!payload.is_active : undefined,
                    permissions: payload.permissions !== undefined ? payload.permissions : undefined,
                })
                toast.success({ title: 'Success!', message: data.message || 'Folder updated', timeout: 1500 })
                await this.fetchFolders(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to update folder'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async deleteFolder(folderId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-documents/folders/${folderId}`, { params: { organization_id: this.organizationId } })
                toast.success({ title: 'Success!', message: data.message || 'Folder deleted', timeout: 1500 })
                await this.fetchFolders(this.organizationId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to delete folder'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        /* ================== DOCUMENT TYPES ================== */
        async fetchDocumentTypes(folderId, opts = {}) {
            this.documentTypesLoading = true
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: this.organizationId,
                    page: opts.page ?? this.documentTypesPage,
                    limit: opts.limit ?? this.documentTypesLimit,
                    search: opts.search ?? this.documentTypesSearch,
                    sort_by: opts.sortBy ?? 'display_order',
                    sort_order: opts.sortOrder ?? 'asc',
                }
                const { data } = await $api.get(`/employee-documents/folders/${folderId}/types`, { params })
                this.documentTypes = (data?.document_types || []).map(mapDocumentType)
                this.documentTypesTotal = data?.total || 0
                this.documentTypesPage = data?.page || 1
                this.documentTypesTotalPages = data?.total_pages || 0
                this.documentTypesSearch = params.search
                if (!this.selectedDocumentTypeId || !this.documentTypes.find(t => String(t.id) === String(this.selectedDocumentTypeId))) {
                    this.selectedDocumentTypeId = this.documentTypes[0]?.id || null
                }
                return this.documentTypes
            } catch (err) {
                console.error('[employeeDocument] fetchDocumentTypes error:', err)
                throw err
            } finally {
                this.documentTypesLoading = false
            }
        },

        async getDocumentType(folderId, typeId) {
            this.selectedDocumentTypeLoading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/employee-documents/folders/${folderId}/types/${typeId}`, { params: { organization_id: this.organizationId } })
                this.selectedDocumentType = mapDocumentType(data?.document_type)
                return this.selectedDocumentType
            } catch (err) {
                console.error('[employeeDocument] getDocumentType error:', err)
                throw err
            } finally {
                this.selectedDocumentTypeLoading = false
            }
        },

        async createDocumentType(payload) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post(`/employee-documents/folders/${payload.folder_id}/types`, {
                    organization_id: this.organizationId,
                    name: payload.name?.trim(),
                    description: payload.description?.trim() || null,
                    is_multiple: !!payload.is_multiple,
                    is_mandatory: !!payload.is_mandatory,
                    is_appliable_na: !!payload.is_appliable_na,
                    is_file_upload_enabled: !!payload.is_file_upload_enabled,
                    is_verification_required: !!payload.is_verification_required,
                    ask_expiry_date: !!payload.ask_expiry_date,
                    expiry_days: payload.expiry_days || null,
                    expiry_period: payload.expiry_period || null,
                    all_countries: payload.all_countries ?? true,
                    allowed_countries: payload.allowed_countries || [],
                    display_order: payload.display_order || 0,
                    is_active: payload.is_active !== undefined ? payload.is_active : true,
                })
                toast.success({ title: 'Success!', message: data.message || 'Document type created', timeout: 1500 })
                return mapDocumentType(data?.document_type)
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to create document type'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async updateDocumentType(folderId, typeId, payload) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.patch(`/employee-documents/folders/${folderId}/types/${typeId}`, {
                    organization_id: this.organizationId,
                    ...payload,
                })
                toast.success({ title: 'Success!', message: data.message || 'Document type updated', timeout: 1500 })
                return mapDocumentType(data?.document_type)
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to update document type'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async deleteDocumentType(folderId, typeId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-documents/folders/${folderId}/types/${typeId}`, { params: { organization_id: this.organizationId } })
                toast.success({ title: 'Success!', message: data.message || 'Document type deleted', timeout: 1500 })
                await this.fetchDocumentTypes(folderId)
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to delete document type'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        /* ================== DOCUMENT FIELDS ================== */
        async listDocumentFields(typeId) {
            const { $api } = useNuxtApp()
            const { data } = await $api.get(`/employee-documents/types/${typeId}/fields`, { params: { organization_id: this.organizationId } })
            return (data?.fields || []).map(mapField)
        },

        async createDocumentField(typeId, payload) {
            const { $api } = useNuxtApp()
            const { data } = await $api.post(`/employee-documents/types/${typeId}/fields`, {
                organization_id: this.organizationId,
                label: payload.label?.trim(),
                key: payload.key?.trim(),
                field_type: payload.field_type,
                options: payload.options || [],
                is_mandatory: !!payload.is_mandatory,
                display_order: payload.display_order || 0,
            })
            return mapField(data?.field)
        },

        async updateDocumentField(typeId, fieldId, payload) {
            const { $api } = useNuxtApp()
            const { data } = await $api.patch(`/employee-documents/types/${typeId}/fields/${fieldId}`, {
                organization_id: this.organizationId,
                label: payload.label !== undefined ? payload.label?.trim() : undefined,
                key: payload.key !== undefined ? payload.key?.trim() : undefined,
                field_type: payload.field_type !== undefined ? payload.field_type : undefined,
                options: payload.options !== undefined ? payload.options : undefined,
                is_mandatory: payload.is_mandatory !== undefined ? !!payload.is_mandatory : undefined,
                display_order: payload.display_order !== undefined ? payload.display_order : undefined,
            })
            return mapField(data?.field)
        },

        async deleteDocumentField(typeId, fieldId) {
            const { $api } = useNuxtApp()
            const { data } = await $api.delete(`/employee-documents/types/${typeId}/fields/${fieldId}`, { params: { organization_id: this.organizationId } })
            return data
        },

        /* ================== ASSIGNMENTS ================== */
        async assignDocument(employeeId, documentTypeId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/employee-documents/assignments', {
                    organization_id: this.organizationId,
                    employee_id: employeeId,
                    document_type_id: documentTypeId,
                })
                toast.success({ title: 'Success!', message: data.message || 'Document assigned', timeout: 1500 })
                return mapAssignment(data?.assignment)
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to assign'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async assignDocuments(employeeId, documentTypeIds) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/employee-documents/assignments/bulk', {
                    organization_id: this.organizationId,
                    employee_id: employeeId,
                    document_type_ids: documentTypeIds,
                })
                const parts = [`${data.assigned_count || 0} document(s) assigned.`]
                if (data.already_assigned_count) parts.push(`${data.already_assigned_count} already assigned.`)
                if (data.failed_count) parts.push(`${data.failed_count} failed.`)
                toast.success({ title: 'Success!', message: parts.join(' '), timeout: 2500 })
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to assign documents'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async assignDocumentsBulk(employeeIds, documentTypeIds) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/employee-documents/assignments/bulk-multi', {
                    organization_id: this.organizationId,
                    employee_ids: employeeIds,
                    document_type_ids: documentTypeIds,
                })
                const parts = [`${data.assigned_count || 0} assigned.`]
                if (data.already_assigned_count) parts.push(`${data.already_assigned_count} already assigned.`)
                if (data.failed_count) parts.push(`${data.failed_count} failed.`)
                toast.success({ title: 'Success!', message: parts.join(' '), timeout: 2500 })
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to assign documents'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchEmployeeAssignments(employeeId, opts = {}) {
            this.assignmentsLoading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/employee-documents/employees/${employeeId}/assignments`, { params: { organization_id: opts.organization_id || this.organizationId } })
                this.assignments = (data?.assignments || []).map(mapAssignment)
                this.assignmentTotal = data?.total || this.assignments.length
                return this.assignments
            } catch (err) {
                console.error('[employeeDocument] fetchEmployeeAssignments error:', err)
                throw err
            } finally {
                this.assignmentsLoading = false
            }
        },

        async fetchDocumentAssignments(documentTypeId, opts = {}) {
            this.assignmentsLoading = true
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: this.organizationId,
                    page: opts.page ?? this.assignmentPage,
                    limit: opts.limit ?? this.assignmentLimit,
                    search: opts.search ?? this.assignmentSearch,
                    sort_by: opts.sortBy ?? 'created_at',
                    sort_order: opts.sortOrder ?? 'desc',
                }
                const { data } = await $api.get(`/employee-documents/types/${documentTypeId}/assignments`, { params })
                this.assignments = (data?.assignments || []).map(mapAssignment)
                this.assignmentTotal = data?.total || 0
                this.assignmentPage = data?.page || 1
                this.assignmentTotalPages = data?.total_pages || 0
                this.assignmentSearch = params.search
                return this.assignments
            } catch (err) {
                console.error('[employeeDocument] fetchDocumentAssignments error:', err)
                throw err
            } finally {
                this.assignmentsLoading = false
            }
        },

        async fetchGroupedAssignments(opts = {}) {
            this.groupedLoading = true
            this.groupedError = false
            try {
                const { $api } = useNuxtApp()
                const orgId = opts.organization_id || this.organizationId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.groupedPage,
                    limit: opts.limit ?? this.groupedLimit,
                    search: opts.search ?? this.groupedSearch,
                    sort_by: opts.sortBy ?? 'name',
                    sort_order: opts.sortOrder ?? 'asc',
                }
                const { data } = await $api.get('/employee-documents/assignments/grouped', { params })
                this.groupedAssignments = (data?.groups || [])
                this.groupedTotalEmployees = data?.total_employees || 0
                this.groupedPage = data?.page || 1
                this.groupedLimit = params.limit
                this.groupedTotalPages = data?.total_pages || 0
                this.groupedSearch = params.search
                return this.groupedAssignments
            } catch (err) {
                console.error('[employeeDocument] fetchGroupedAssignments error:', err)
                this.groupedError = true
                throw err
            } finally {
                this.groupedLoading = false
            }
        },

        async getAssignment(assignmentId) {
            const { $api } = useNuxtApp()
            const { data } = await $api.get(`/employee-documents/assignments/${assignmentId}`, { params: { organization_id: this.organizationId } })
            return mapAssignment(data?.assignment)
        },

        async unassignDocument(assignmentId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-documents/assignments/${assignmentId}`, { params: { organization_id: this.organizationId } })
                toast.success({ title: 'Success!', message: data.message || 'Assignment removed', timeout: 1500 })
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to unassign'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchPendingEmployeeDocuments(opts = {}) {
            this.pendingLoading = true
            this.pendingError = false
            try {
                const { $api } = useNuxtApp()
                const orgId = opts.organization_id || this.organizationId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.pendingPage,
                    limit: opts.limit ?? this.pendingLimit,
                    search: opts.search ?? this.pendingSearch,
                    sort_by: opts.sortBy ?? 'created_at',
                    sort_order: opts.sortOrder ?? 'desc',
                }
                if (opts.employee_id) params.employee_id = opts.employee_id
                if (opts.folder_id) params.folder_id = opts.folder_id
                if (opts.document_type_id) params.document_type_id = opts.document_type_id
                const { data } = await $api.get('/employee-documents/pending', { params })
                this.pendingEmployeeDocuments = (data?.pending_documents || []).map(mapPendingDocument)
                this.pendingTotal = data?.total || 0
                this.pendingPage = data?.page || 1
                this.pendingTotalPages = data?.total_pages || 0
                this.pendingSearch = params.search
                this.pendingTotalEmployees = data?.total_pending_employees || 0
                return this.pendingEmployeeDocuments
            } catch (err) {
                console.error('[employeeDocument] fetchPendingEmployeeDocuments error:', err)
                this.pendingError = true
                throw err
            } finally {
                this.pendingLoading = false
            }
        },

        async submitDocument(payload) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const formData = new FormData()
                formData.append('organization_id', payload.organization_id || this.organizationId)
                formData.append('assignment_id', payload.assignment_id)
                formData.append('employee_id', payload.employee_id)
                formData.append('document_type_id', payload.document_type_id)
                if (payload.submitted_by_id) formData.append('submitted_by_id', payload.submitted_by_id)
                if (payload.field_values) formData.append('field_values', JSON.stringify(payload.field_values))
                if (payload.is_na) formData.append('is_na', 'true')
                if (payload.expiry_date) formData.append('expiry_date', payload.expiry_date)
                if (payload.file) formData.append('file', payload.file)
                const { data } = await $api.post('/employee-documents/submissions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                toast.success({ title: 'Success!', message: data.message || 'Document submitted', timeout: 1500 })
                return mapSubmission(data?.submission)
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to submit document'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async getSubmission(submissionId, opts = {}) {
            const { $api } = useNuxtApp()
            const { data } = await $api.get(`/employee-documents/submissions/${submissionId}`, { params: { organization_id: opts.organization_id || this.organizationId } })
            const result = mapSubmission(data?.submission)
            if (data?.previous_submission) {
                result._previousSubmission = mapSubmission(data.previous_submission)
            }
            return result
        },

        async fetchEmployeeSubmissions(employeeId, opts = {}) {
            this.submissionsLoading = true
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: opts.organization_id || this.organizationId,
                    page: opts.page ?? this.submissionPage,
                    limit: opts.limit ?? this.submissionLimit,
                }
                const { data } = await $api.get(`/employee-documents/employees/${employeeId}/submissions`, { params })
                this.submissions = (data?.submissions || []).map(mapSubmission)
                this.submissionTotal = data?.total || 0
                this.submissionPage = data?.page || 1
                this.submissionTotalPages = data?.total_pages || 0
                return this.submissions
            } catch (err) {
                console.error('[employeeDocument] fetchEmployeeSubmissions error:', err)
                throw err
            } finally {
                this.submissionsLoading = false
            }
        },

        async fetchAssignmentSubmissions(assignmentId) {
            const { $api } = useNuxtApp()
            const { data } = await $api.get(`/employee-documents/assignments/${assignmentId}/submissions`, { params: { organization_id: this.organizationId } })
            return (data?.submissions || []).map(mapSubmission)
        },

        async deleteSubmission(submissionId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/employee-documents/submissions/${submissionId}`, { params: { organization_id: this.organizationId } })
                toast.success({ title: 'Success!', message: data.message || 'Submission removed', timeout: 1500 })
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to remove submission'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async renewDocument(submissionId, payload) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const formData = new FormData()
                formData.append('organization_id', payload.organization_id || this.organizationId)
                if (payload.submitted_by_id) formData.append('submitted_by_id', payload.submitted_by_id)
                if (payload.field_values) formData.append('field_values', JSON.stringify(payload.field_values))
                if (payload.is_na) formData.append('is_na', 'true')
                if (payload.expiry_date) formData.append('expiry_date', payload.expiry_date)
                if (payload.file) formData.append('file', payload.file)
                const { data } = await $api.post(`/employee-documents/submissions/${submissionId}/renew`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                toast.success({ title: 'Success!', message: data.message || 'Document renewed — awaiting verification', timeout: 2000 })
                return mapSubmission(data?.submission)
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to renew document'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchPendingVerificationDocuments(opts = {}) {
            this.pendingVerificationLoading = true
            this.pendingVerificationError = false
            try {
                const { $api } = useNuxtApp()
                const orgId = opts.organization_id || this.organizationId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.pendingVerificationPage,
                    limit: opts.limit ?? this.pendingVerificationLimit,
                    search: opts.search ?? this.pendingVerificationSearch,
                    sort_by: opts.sortBy ?? 'submitted_at',
                    sort_order: opts.sortOrder ?? 'desc',
                }
                if (opts.employee_id) params.employee_id = opts.employee_id
                if (opts.folder_id) params.folder_id = opts.folder_id
                if (opts.document_type_id) params.document_type_id = opts.document_type_id
                const { data } = await $api.get('/employee-documents/pending-verification', { params })
                this.pendingVerificationDocuments = (data?.pending_verification_documents || []).map(mapPendingVerification)
                this.pendingVerificationTotal = data?.total || 0
                this.pendingVerificationPage = data?.page || 1
                this.pendingVerificationTotalPages = data?.total_pages || 0
                this.pendingVerificationSearch = params.search
                return this.pendingVerificationDocuments
            } catch (err) {
                console.error('[employeeDocument] fetchPendingVerificationDocuments error:', err)
                this.pendingVerificationError = true
                throw err
            } finally {
                this.pendingVerificationLoading = false
            }
        },

        async verifySubmission(submissionId, verifiedById, organizationId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post(`/employee-documents/submissions/${submissionId}/verify`, {
                    organization_id: organizationId || this.organizationId,
                    verified_by_id: verifiedById || undefined,
                })
                toast.success({ title: 'Success!', message: data.message || 'Document verified', timeout: 1500 })
                return mapSubmission(data?.submission)
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to verify document'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async rejectSubmission(submissionId, rejectionReason, rejectedById, organizationId) {
            const toast = useToast()
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post(`/employee-documents/submissions/${submissionId}/reject`, {
                    organization_id: organizationId || this.organizationId,
                    rejection_reason: rejectionReason,
                    rejected_by_id: rejectedById || undefined,
                })
                toast.success({ title: 'Success!', message: data.message || 'Document rejected', timeout: 1500 })
                return mapSubmission(data?.submission)
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to reject document'
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchVerifiedDocuments(opts = {}) {
            this.verifiedLoading = true
            this.verifiedError = false
            try {
                const { $api } = useNuxtApp()
                const orgId = opts.organization_id || this.organizationId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.verifiedPage,
                    limit: opts.limit ?? this.verifiedLimit,
                    search: opts.search ?? this.verifiedSearch,
                    sort_by: opts.sortBy ?? 'verified_at',
                    sort_order: opts.sortOrder ?? 'desc',
                }
                if (opts.employee_id) params.employee_id = opts.employee_id
                if (opts.folder_id) params.folder_id = opts.folder_id
                if (opts.document_type_id) params.document_type_id = opts.document_type_id
                const { data } = await $api.get('/employee-documents/verified', { params })
                this.verifiedDocuments = (data?.verified_documents || []).map(mapVerifiedDocument)
                this.verifiedTotal = data?.total || 0
                this.verifiedPage = data?.page || 1
                this.verifiedTotalPages = data?.total_pages || 0
                this.verifiedSearch = params.search
                return this.verifiedDocuments
            } catch (err) {
                console.error('[employeeDocument] fetchVerifiedDocuments error:', err)
                this.verifiedError = true
                throw err
            } finally {
                this.verifiedLoading = false
            }
        },

        async fetchMyVerifiedDocuments(opts = {}) {
            try {
                const { $api } = useNuxtApp()
                const params = {
                    page: opts.page ?? 1,
                    limit: opts.limit ?? 50,
                }
                const { data } = await $api.get('/employee-documents/my/verified', { params })
                return (data?.verified_documents || []).map(mapVerifiedDocument)
            } catch (err) {
                console.error('[employeeDocument] fetchMyVerifiedDocuments error:', err)
                throw err
            }
        },

        async fetchMyAssignments() {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/employee-documents/my/assignments')
                return (data?.assignments || []).map(a => ({
                    id: a.id,
                    document_type_id: a.document_type_id,
                    document_type_name: a.document_type_name,
                    folder_id: a.folder_id,
                    folder_name: a.folder_name,
                    document_is_mandatory: a.document_is_mandatory,
                    document_is_multiple: a.document_is_multiple,
                    document_is_verification_required: a.document_is_verification_required,
                    status: a.status,
                }))
            } catch (err) {
                console.error('[employeeDocument] fetchMyAssignments error:', err)
                throw err
            }
        },

        async fetchMySubmissions() {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/employee-documents/my/submissions')
                return (data?.submissions || []).map(s => ({
                    id: s.id,
                    assignment_id: s.assignment_id,
                    document_type_id: s.document_type_id,
                    document_type_name: s.document_type_name,
                    status: s.status,
                    submitted_at: s.submitted_at,
                    file_name: s.file_name,
                    replaced_by_submission_id: s.replaced_by_submission_id,
                    is_current: s.is_current,
                }))
            } catch (err) {
                console.error('[employeeDocument] fetchMySubmissions error:', err)
                throw err
            }
        },

        async fetchDocumentTypeFields(documentTypeId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/employee-documents/my/document-type/${documentTypeId}/fields`)
                return data
            } catch (err) {
                console.error('[employeeDocument] fetchDocumentTypeFields error:', err)
                throw err
            }
        },

        async submitMyDocument(payload) {
            try {
                const { $api } = useNuxtApp()
                const toast = useToast()
                const formData = new FormData()
                formData.append('assignment_id', payload.assignment_id)
                formData.append('document_type_id', payload.document_type_id)
                if (payload.field_values) formData.append('field_values', JSON.stringify(payload.field_values))
                if (payload.is_na) formData.append('is_na', 'true')
                if (payload.expiry_date) formData.append('expiry_date', payload.expiry_date)
                if (payload.file) formData.append('file', payload.file)
                const { data } = await $api.post('/employee-documents/my/submissions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                toast.success({ title: 'Success!', message: data.message || 'Document submitted', timeout: 1500 })
                return data
            } catch (err) {
                const msg = err?.response?.data?.error || err.message || 'Failed to submit document'
                const toast = useToast()
                toast.error({ title: 'Error!', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
                throw err
            }
        },

        async fetchExpiringDocuments(opts = {}) {
            this.expiringLoading = true
            this.expiringError = false
            try {
                const { $api } = useNuxtApp()
                const orgId = opts.organization_id || this.organizationId
                const params = {
                    organization_id: orgId,
                    page: opts.page ?? this.expiringPage,
                    limit: opts.limit ?? this.expiringLimit,
                    search: opts.search ?? this.expiringSearch,
                    sort_by: opts.sortBy ?? 'expiry_date',
                    sort_order: opts.sortOrder ?? 'asc',
                    days: opts.days ?? this.expiringDays,
                }
                if (opts.employee_id) params.employee_id = opts.employee_id
                if (opts.folder_id) params.folder_id = opts.folder_id
                if (opts.document_type_id) params.document_type_id = opts.document_type_id
                const { data } = await $api.get('/employee-documents/expiring', { params })
                this.expiringDocuments = (data?.expiring_documents || []).map(mapExpiringDocument)
                this.expiringTotal = data?.total || 0
                this.expiringPage = data?.page || 1
                this.expiringTotalPages = data?.total_pages || 0
                this.expiringSearch = params.search
                this.expiringDays = params.days
                return this.expiringDocuments
            } catch (err) {
                console.error('[employeeDocument] fetchExpiringDocuments error:', err)
                this.expiringError = true
                throw err
            } finally {
                this.expiringLoading = false
            }
        },
    },
})
