import { defineStore } from 'pinia'

const mapFolder = (f) => ({
    id: f?.id || '',
    organization_id: f?.organization_id || '',
    name: f?.name || '',
    description: f?.description || '',
    is_confidential: !!f?.is_confidential,
    is_active: f?.is_active ?? true,
    legal_entity_ids: Array.isArray(f?.legal_entity_ids) ? f.legal_entity_ids : [],
    branch_ids: Array.isArray(f?.branch_ids) ? f.branch_ids : [],
    location_ids: Array.isArray(f?.location_ids) ? f.location_ids : [],
    department_ids: Array.isArray(f?.department_ids) ? f.department_ids : [],
    sub_department_ids: Array.isArray(f?.sub_department_ids) ? f.sub_department_ids : [],
    worker_types: Array.isArray(f?.worker_types) ? f.worker_types : [],
    legal_entity_names: Array.isArray(f?.legal_entity_names) ? f.legal_entity_names : [],
    branch_names: Array.isArray(f?.branch_names) ? f.branch_names : [],
    location_names: Array.isArray(f?.location_names) ? f.location_names : [],
    department_names: Array.isArray(f?.department_names) ? f.department_names : [],
    sub_department_names: Array.isArray(f?.sub_department_names) ? f.sub_department_names : [],
    created_by_id: f?.created_by_id || '',
    updated_by_id: f?.updated_by_id || '',
    created_by_name: f?.created_by_name || '',
    updated_by_name: f?.updated_by_name || '',
    created_at: f?.created_at || '',
    updated_at: f?.updated_at || '',
    document_count: f?.document_count || 0,
})

const mapDocument = (d) => ({
    id: d?.id || '',
    organization_id: d?.organization_id || '',
    folder_id: d?.folder_id || '',
    name: d?.name || '',
    description: d?.description || '',
    allow_download: d?.allow_download ?? true,
    acknowledgement_required: d?.acknowledgement_required ?? false,
    block_until_acknowledged: d?.block_until_acknowledged ?? false,
    ask_expiry_date: d?.ask_expiry_date ?? false,
    expiry_date: d?.expiry_date || '',
    expiry_status: d?.expiry_status || 'NO_EXPIRY',
    file_id: d?.file_id || '',
    storage_key: d?.storage_key || '',
    file_name: d?.file_name || '',
    file_type: d?.file_type || '',
    file_size: d?.file_size || 0,
    created_by_id: d?.created_by_id || '',
    updated_by_id: d?.updated_by_id || '',
    created_by_name: d?.created_by_name || '',
    updated_by_name: d?.updated_by_name || '',
    is_active: d?.is_active ?? true,
    created_at: d?.created_at || '',
    updated_at: d?.updated_at || '',
    file_url: d?.file_url || '',
    folder_name: d?.folder_name || '',
})

const mapApplicableEmployee = (e) => ({
    employee_id: e?.employee_id || '',
    full_name: e?.full_name || '',
    employee_code: e?.employee_code || '',
    email: e?.email || '',
    branch_name: e?.branch_name || '',
    department_name: e?.department_name || '',
    designation_name: e?.designation_name || '',
    worker_type: e?.worker_type || '',
})

export const useOrganizationDocumentStore = defineStore('organizationDocument', {
    state: () => ({
        folders: [],
        foldersLoading: false,
        foldersError: null,
        foldersTotal: 0,
        foldersPage: 1,
        foldersLimit: 50,
        foldersTotalPages: 0,
        foldersSearch: '',
        selectedFolderId: null,

        documents: [],
        documentsLoading: false,
        documentsTotal: 0,
        documentsPage: 1,
        documentsLimit: 10,
        documentsTotalPages: 0,
        documentsSearch: '',
        documentsSort: 'created_at',
        documentsSortOrder: 'desc',
        documentsLifecycleFilter: '',

        selectedDocument: null,
        documentDetailLoading: false,
        documentDetailError: null,

        documentStats: null,
        statsLoading: false,
        statsError: null,

        applicableEmployees: [],
        applicableEmployeesLoading: false,
        applicableEmployeesTotal: 0,

        targetingOptions: null,
        targetingOptionsLoading: false,

        saving: false,
    }),

    getters: {
        selectedFolder: (state) => state.folders.find(f => f.id === state.selectedFolderId) || null,
    },

    actions: {
        async fetchFolders(organizationId, opts = {}) {
            this.foldersLoading = true
            this.foldersError = null
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: organizationId,
                    page: opts.page || this.foldersPage,
                    limit: opts.limit || this.foldersLimit,
                    search: opts.search ?? this.foldersSearch,
                    sort_by: opts.sort_by || 'name',
                    sort_order: opts.sort_order || 'asc',
                }
                const { data } = await $api.get('/organization-documents/folders', { params })
                this.folders = (data?.folders || []).map(mapFolder)
                this.foldersTotal = data?.total || 0
                this.foldersPage = data?.page || 1
                this.foldersTotalPages = data?.total_pages || 0
                if (opts.search !== undefined) this.foldersSearch = opts.search
            } catch (err) {
                this.foldersError = err
                console.error('[organizationDocument] fetchFolders error:', err)
                throw err
            } finally {
                this.foldersLoading = false
            }
        },

        async fetchFolder(organizationId, folderId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/organization-documents/folders/${folderId}`, {
                    params: { organization_id: organizationId },
                })
                const mapped = mapFolder(data?.folder)
                const idx = this.folders.findIndex(f => f.id === folderId)
                if (idx >= 0) this.folders[idx] = mapped
                return mapped
            } catch (err) {
                console.error('[organizationDocument] fetchFolder error:', err)
                throw err
            }
        },

        async createFolder(organizationId, payload) {
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.post('/organization-documents/folders', {
                    organization_id: organizationId,
                    name: payload.name,
                    description: payload.description || '',
                    is_confidential: !!payload.is_confidential,
                    is_active: payload.is_active !== undefined ? payload.is_active : true,
                    legal_entity_ids: payload.legal_entity_ids || [],
                    branch_ids: payload.branch_ids || [],
                    location_ids: payload.location_ids || [],
                    department_ids: payload.department_ids || [],
                    sub_department_ids: payload.sub_department_ids || [],
                    worker_types: payload.worker_types || [],
                })
                const toast = useToast()
                toast.success({ title: 'Success!', message: data?.message || 'Folder created', timeout: 1500 })
                return mapFolder(data?.folder)
            } catch (err) {
                const toast = useToast()
                const msg = String(err?.response?.data?.error || err?.message || 'Failed to create folder').replace(/^\d+ [A-Z_]+:\s*/, '')
                toast.error({ title: 'Error!', message: msg, timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updateFolder(organizationId, folderId, payload) {
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const body = { organization_id: organizationId }
                if (payload.name !== undefined) body.name = payload.name
                if (payload.description !== undefined) body.description = payload.description
                if (payload.is_confidential !== undefined) body.is_confidential = payload.is_confidential
                if (payload.is_active !== undefined) body.is_active = payload.is_active
                if (payload.legal_entity_ids !== undefined) body.legal_entity_ids = payload.legal_entity_ids
                if (payload.branch_ids !== undefined) body.branch_ids = payload.branch_ids
                if (payload.location_ids !== undefined) body.location_ids = payload.location_ids
                if (payload.department_ids !== undefined) body.department_ids = payload.department_ids
                if (payload.sub_department_ids !== undefined) body.sub_department_ids = payload.sub_department_ids
                if (payload.worker_types !== undefined) body.worker_types = payload.worker_types
                const { data } = await $api.patch(`/organization-documents/folders/${folderId}`, body)
                const toast = useToast()
                toast.success({ title: 'Success!', message: data?.message || 'Folder updated', timeout: 1500 })
                return mapFolder(data?.folder)
            } catch (err) {
                const toast = useToast()
                const msg = String(err?.response?.data?.error || err?.message || 'Failed to update folder').replace(/^\d+ [A-Z_]+:\s*/, '')
                toast.error({ title: 'Error!', message: msg, timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async deleteFolder(organizationId, folderId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/organization-documents/folders/${folderId}`, {
                    params: { organization_id: organizationId },
                })
                const toast = useToast()
                toast.success({ title: 'Deleted', message: data?.message || 'Folder deleted', timeout: 1500 })
                this.folders = this.folders.filter(f => f.id !== folderId)
                if (this.selectedFolderId === folderId) {
                    this.selectedFolderId = this.folders.length ? this.folders[0].id : null
                }
            } catch (err) {
                const toast = useToast()
                const msg = String(err?.response?.data?.error || err?.message || 'Failed to delete folder').replace(/^\d+ [A-Z_]+:\s*/, '')
                toast.error({ title: 'Error!', message: msg, timeout: 3000 })
                throw err
            }
        },

        async fetchDocuments(organizationId, folderId, opts = {}) {
            this.documentsLoading = true
            try {
                const { $api } = useNuxtApp()
                const params = {
                    organization_id: organizationId,
                    page: opts.page || this.documentsPage,
                    limit: opts.limit || this.documentsLimit,
                    search: opts.search ?? this.documentsSearch,
                    sort_by: opts.sort_by || this.documentsSort,
                    sort_order: opts.sort_order || this.documentsSortOrder,
                    expiry_status: opts.expiry_status ?? this.documentsLifecycleFilter,
                }
                const { data } = await $api.get(`/organization-documents/folders/${folderId}/documents`, { params })
                this.documents = (data?.documents || []).map(mapDocument)
                this.documentsTotal = data?.total || 0
                this.documentsPage = data?.page || 1
                this.documentsTotalPages = data?.total_pages || 0
                if (opts.search !== undefined) this.documentsSearch = opts.search
                if (opts.sort_by !== undefined) this.documentsSort = opts.sort_by
                if (opts.sort_order !== undefined) this.documentsSortOrder = opts.sort_order
                if (opts.expiry_status !== undefined) this.documentsLifecycleFilter = opts.expiry_status
            } catch (err) {
                console.error('[organizationDocument] fetchDocuments error:', err)
                throw err
            } finally {
                this.documentsLoading = false
            }
        },

        async fetchApplicableEmployees(organizationId, folderId) {
            this.applicableEmployeesLoading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/organization-documents/folders/${folderId}/applicable-employees`, {
                    params: { organization_id: organizationId },
                })
                this.applicableEmployees = (data?.employees || []).map(mapApplicableEmployee)
                this.applicableEmployeesTotal = data?.total || 0
            } catch (err) {
                console.error('[organizationDocument] fetchApplicableEmployees error:', err)
                throw err
            } finally {
                this.applicableEmployeesLoading = false
            }
        },

        async fetchTargetingOptions(organizationId) {
            this.targetingOptionsLoading = true
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get('/organization-documents/targeting/options', {
                    params: { organization_id: organizationId },
                })
                this.targetingOptions = {
                    legal_entities: data?.legal_entities || [],
                    branches: data?.branches || [],
                    locations: data?.locations || [],
                    departments: data?.departments || [],
                    worker_types: data?.worker_types || [],
                }
            } catch (err) {
                console.error('[organizationDocument] fetchTargetingOptions error:', err)
                throw err
            } finally {
                this.targetingOptionsLoading = false
            }
        },

        selectFolder(id) {
            this.selectedFolderId = id
            this.documents = []
            this.documentsPage = 1
            this.documentsSearch = ''
            this.documentsSort = 'created_at'
            this.documentsSortOrder = 'desc'
            this.documentsLifecycleFilter = ''
            this.selectedDocument = null
            this.documentStats = null
            this.applicableEmployees = []
        },

        /* ============================ DOCUMENTS ============================ */

        async createDocument(organizationId, folderId, formData) {
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const fd = new FormData()
                fd.append('organization_id', organizationId)
                fd.append('name', formData.name)
                if (formData.description) fd.append('description', formData.description)
                fd.append('allow_download', String(!!formData.allow_download))
                fd.append('acknowledgement_required', String(!!formData.acknowledgement_required))
                fd.append('block_until_acknowledged', String(!!formData.block_until_acknowledged))
                fd.append('ask_expiry_date', String(!!formData.ask_expiry_date))
                if (formData.ask_expiry_date && formData.expiry_date) fd.append('expiry_date', formData.expiry_date)
                if (formData.file) fd.append('file', formData.file)
                const { data } = await $api.post(`/organization-documents/folders/${folderId}/documents`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                const toast = useToast()
                toast.success({ title: 'Success!', message: data?.message || 'Document created', timeout: 1500 })
                return mapDocument(data?.document)
            } catch (err) {
                const toast = useToast()
                const msg = String(err?.response?.data?.error || err?.message || 'Failed to create document').replace(/^\d+ [A-Z_]+:\s*/, '')
                toast.error({ title: 'Error!', message: msg, timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async updateDocument(organizationId, documentId, formData) {
            this.saving = true
            try {
                const { $api } = useNuxtApp()
                const fd = new FormData()
                fd.append('organization_id', organizationId)
                if (formData.name !== undefined) fd.append('name', formData.name)
                if (formData.description !== undefined) fd.append('description', formData.description ?? '')
                if (formData.allow_download !== undefined) fd.append('allow_download', String(!!formData.allow_download))
                if (formData.acknowledgement_required !== undefined) fd.append('acknowledgement_required', String(!!formData.acknowledgement_required))
                if (formData.block_until_acknowledged !== undefined) fd.append('block_until_acknowledged', String(!!formData.block_until_acknowledged))
                if (formData.ask_expiry_date !== undefined) fd.append('ask_expiry_date', String(!!formData.ask_expiry_date))
                if (formData.expiry_date !== undefined) fd.append('expiry_date', formData.expiry_date ?? '')
                if (formData.file) fd.append('file', formData.file)
                const { data } = await $api.patch(`/organization-documents/documents/${documentId}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                const toast = useToast()
                toast.success({ title: 'Success!', message: data?.message || 'Document updated', timeout: 1500 })
                return mapDocument(data?.document)
            } catch (err) {
                const toast = useToast()
                const msg = String(err?.response?.data?.error || err?.message || 'Failed to update document').replace(/^\d+ [A-Z_]+:\s*/, '')
                toast.error({ title: 'Error!', message: msg, timeout: 3000 })
                throw err
            } finally {
                this.saving = false
            }
        },

        async deleteDocument(organizationId, documentId) {
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.delete(`/organization-documents/documents/${documentId}`, {
                    params: { organization_id: organizationId },
                })
                const toast = useToast()
                toast.success({ title: 'Deleted', message: data?.message || 'Document deleted', timeout: 1500 })
                this.documents = this.documents.filter(d => d.id !== documentId)
                this.documentsTotal = Math.max(0, this.documentsTotal - 1)
                if (this.selectedDocument?.id === documentId) {
                    this.selectedDocument = null
                    this.documentStats = null
                }
                const folder = this.selectedFolder
                if (folder) folder.document_count = Math.max(0, (folder.document_count || 0) - 1)
            } catch (err) {
                const toast = useToast()
                const msg = String(err?.response?.data?.error || err?.message || 'Failed to delete document').replace(/^\d+ [A-Z_]+:\s*/, '')
                toast.error({ title: 'Error!', message: msg, timeout: 3000 })
                throw err
            }
        },

        async fetchDocument(organizationId, documentId) {
            this.documentDetailLoading = true
            this.documentDetailError = null
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/organization-documents/documents/${documentId}`, {
                    params: { organization_id: organizationId },
                })
                this.selectedDocument = mapDocument(data?.document)
                return this.selectedDocument
            } catch (err) {
                this.documentDetailError = err
                console.error('[organizationDocument] fetchDocument error:', err)
                throw err
            } finally {
                this.documentDetailLoading = false
            }
        },

        async fetchDocumentStats(organizationId, documentId) {
            this.statsLoading = true
            this.statsError = null
            try {
                const { $api } = useNuxtApp()
                const { data } = await $api.get(`/organization-documents/documents/${documentId}/stats`, {
                    params: { organization_id: organizationId },
                })
                this.documentStats = {
                    applicable_employee_count: data?.applicable_employee_count || 0,
                    viewed_count: data?.viewed_count || 0,
                    acknowledged_count: data?.acknowledged_count || 0,
                }
                return this.documentStats
            } catch (err) {
                this.statsError = err
                console.error('[organizationDocument] fetchDocumentStats error:', err)
                throw err
            } finally {
                this.statsLoading = false
            }
        },
    },
})
