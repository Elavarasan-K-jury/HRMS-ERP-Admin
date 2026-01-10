import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useStorageStore = defineStore('storage', {
    state: () => ({
        /* ===============================
           FOLDERS
        =============================== */
        folders: [],
        currentFolder: null,
        foldersLoading: false,
        foldersError: null,

        totalStorage: 0,
        usedStorage: 0,

        foldersMeta: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
            search: '',
            visibility: null, // PRIVATE, SHARED, PUBLIC
            sortBy: 'created_at',
            sortOrder: 'desc',
        },

        /* ===============================
           FILES
        =============================== */
        files: [],
        filesLoading: false,
        filesError: null,

        filesMeta: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
        },

        /* ===============================
           UPLOAD STATE
        =============================== */
        uploading: false,
        uploadProgress: 0,
        uploadingFileName: null,

        /* ===============================
           UI STATE
        =============================== */
        // Folder UI
        createFolderModal: false,
        editFolderModal: false,
        deleteFolderModal: false,
        shareFolderModal: false,

        editFolderId: null,
        editFolderData: null,

        deleteFolderId: null,
        deleteFolderData: null,

        shareFolderId: null,
        shareFolderData: null,

        // File UI
        deleteFileModal: false,
        deleteFileId: null,
        deleteFileData: null,

        // Form data
        folderForm: {
            name: '',
            color: '#3b82f6',
            visibility: 'PRIVATE',
            folder_image: null,
        },

        shareForm: {
            employee_ids: [],
        },
    }),

    getters: {
        /* ===============================
           FOLDER GETTERS
        =============================== */
        hasFolders: (s) => s.folders.length > 0,
        getFolderById: (s) => (id) => s.folders.find(f => f.id === id),
        hasNextFolders: (s) => s.foldersMeta.page < s.foldersMeta.totalPages,
        hasPrevFolders: (s) => s.foldersMeta.page > 1,

        privateFolders: (s) => s.folders.filter(f => f.visibility === 'PRIVATE'),
        sharedFolders: (s) => s.folders.filter(f => f.visibility === 'SHARED'),
        publicFolders: (s) => s.folders.filter(f => f.visibility === 'PUBLIC'),

        /* ===============================
           FILE GETTERS
        =============================== */
        hasFiles: (s) => s.files.length > 0,
        getFileById: (s) => (id) => s.files.find(f => f.id === id),
        hasNextFiles: (s) => s.filesMeta.page < s.filesMeta.totalPages,
        hasPrevFiles: (s) => s.filesMeta.page > 1,

        /* ===============================
           UTILITY GETTERS
        =============================== */
        isUploading: (s) => s.uploading,
        uploadPercentage: (s) => Math.round(s.uploadProgress),
    },

    actions: {
        /* ===============================
           FOLDER OPERATIONS
        =============================== */

        /**
         * Fetch all folders with pagination & filters
         */
        async fetchFolders() {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.foldersLoading = true
            this.foldersError = null

            try {
                const { data } = await $api.get('/folders', {
                    params: {
                        organization_id: auth.organization,
                        page: this.foldersMeta.page,
                        limit: this.foldersMeta.limit,
                        search: this.foldersMeta.search || undefined,
                        visibility: this.foldersMeta.visibility || undefined,
                        sort_by: this.foldersMeta.sortBy,
                        sort_order: this.foldersMeta.sortOrder,
                    },
                })

                this.folders = data?.folders ?? []
                this.foldersMeta.total = Number(data?.total ?? 0)
                this.foldersMeta.page = Number(data?.page ?? 1)
                this.foldersMeta.limit = Number(data?.limit ?? 20)
                this.foldersMeta.totalPages = Number(data?.total_pages ?? 1)
                this.totalStorage = Number(data.total_storage)
                this.usedStorage = Number(data.used_storage)
            } catch (err) {
                console.error('❌ Failed to fetch folders:', err)
                this.foldersError = err?.message
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to fetch folders',
                    timeout: 2000,
                })
            } finally {
                this.foldersLoading = false
            }
        },

        /**
         * Get single folder by ID
         */
        async fetchFolderById(folderId) {
            const toast = useToast()
            const { $api } = useNuxtApp()

            this.foldersLoading = true

            try {
                const { data } = await $api.get(`/folders/${folderId}`)
                this.currentFolder = data
                return data
            } catch (err) {
                console.error('❌ Failed to fetch folder:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to fetch folder',
                    timeout: 2000,
                })
            } finally {
                this.foldersLoading = false
            }
        },

        /**
         * Create new folder (with optional image)
         */
        async createFolder(createdById) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            try {
                // Create FormData for multipart upload
                const formData = new FormData()
                formData.append('name', this.folderForm.name)
                formData.append('organization_id', auth.organization)
                formData.append('created_by_id', createdById)
                formData.append('color', this.folderForm.color)
                formData.append('visibility', this.folderForm.visibility)

                // Add image if present
                if (this.folderForm.folder_image) {
                    formData.append('folder_image', this.folderForm.folder_image)
                }

                const { data } = await $api.post('/folders', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })

                toast.success({
                    title: 'Success!',
                    message: 'Folder created successfully',
                    timeout: 1500,
                })

                // Reset form
                this.resetFolderForm()
                this.createFolderModal = false

                // Refresh folders
                this.foldersMeta.page = 1
                await this.fetchFolders()

                return data
            } catch (err) {
                console.error('❌ Create folder failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to create folder',
                    timeout: 2000,
                })
                throw err
            }
        },

        /**
         * Update folder (with optional new image)
         */
        async updateFolder() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const formData = new FormData()

                if (this.folderForm.name) {
                    formData.append('name', this.folderForm.name)
                }
                if (this.folderForm.color) {
                    formData.append('color', this.folderForm.color)
                }
                if (this.folderForm.visibility) {
                    formData.append('visibility', this.folderForm.visibility)
                }
                if (this.folderForm.folder_image) {
                    formData.append('folder_image', this.folderForm.folder_image)
                }

                const { data } = await $api.put(
                    `/folders/${this.editFolderId}`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    }
                )

                toast.success({
                    title: 'Success!',
                    message: 'Folder updated successfully',
                    timeout: 1500,
                })

                this.resetFolderForm()
                this.editFolderModal = false
                this.editFolderId = null

                await this.fetchFolders()

                return data
            } catch (err) {
                console.error('❌ Update folder failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to update folder',
                    timeout: 2000,
                })
                throw err
            }
        },

        /**
         * Delete folder
         */
        async deleteFolder() {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.delete(`/folders/${this.deleteFolderId}`)

                toast.success({
                    title: 'Success!',
                    message: data?.message || 'Folder deleted successfully',
                    timeout: 1500,
                })

                this.deleteFolderModal = false
                this.deleteFolderId = null
                this.deleteFolderData = null

                await this.fetchFolders()

                return data
            } catch (err) {
                console.error('❌ Delete folder failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to delete folder',
                    timeout: 2000,
                })
                throw err
            }
        },

        /**
         * Share folder with employees
         */
        async shareFolder(addedById) {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.post(
                    `/folders/${this.shareFolderId}/share`,
                    {
                        employee_ids: this.shareForm.employee_ids,
                        added_by_id: addedById,
                    }
                )

                toast.success({
                    title: 'Success!',
                    message: data?.message || 'Folder shared successfully',
                    timeout: 1500,
                })

                this.shareFolderModal = false
                this.shareFolderId = null
                this.shareFolderData = null
                this.shareForm.employee_ids = []

                return data
            } catch (err) {
                console.error('❌ Share folder failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to share folder',
                    timeout: 2000,
                })
                throw err
            }
        },

        /* ===============================
           FILE OPERATIONS
        =============================== */

        /**
         * Fetch files (organization-wide or folder-specific)
         */
        async fetchFiles(folderId = null) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.filesLoading = true
            this.filesError = null

            try {
                const { data } = await $api.get('/files', {
                    params: {
                        organization_id: auth.organization,
                        folder_id: folderId || undefined,
                        page: this.filesMeta.page,
                        limit: this.filesMeta.limit,
                    },
                })

                this.files = data?.files ?? []
                this.filesMeta.total = Number(data?.total ?? 0)
                this.filesMeta.page = Number(data?.page ?? 1)
                this.filesMeta.limit = Number(data?.limit ?? 20)
                this.filesMeta.totalPages = Number(data?.total_pages ?? 1)
            } catch (err) {
                console.error('❌ Failed to fetch files:', err)
                this.filesError = err?.message
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to fetch files',
                    timeout: 2000,
                })
            } finally {
                this.filesLoading = false
            }
        },

        /**
         * Upload file to folder with progress tracking
         */
        async uploadFile(folderId, addedById, file) {
            const toast = useToast()
            const { $api } = useNuxtApp()
            const auth = useAuthStore()

            this.uploading = true
            this.uploadProgress = 0
            this.uploadingFileName = file.name

            try {
                const formData = new FormData()
                formData.append('organization_id', auth.organization)
                formData.append('added_by_id', addedById)
                formData.append('file', file)
                if (folderId) formData.append('folder_id', folderId)

                const { data } = await $api.post(
                    `/files`,
                    formData,
                    {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: (progressEvent) => {
                            this.uploadProgress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            )
                        },
                    }
                )

                toast.success({
                    title: 'Success!',
                    message: `${file.name} uploaded successfully`,
                    timeout: 1500,
                })

                // Refresh files list
                await this.fetchFiles(folderId)

                return data
            } catch (err) {
                console.error('❌ Upload file failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to upload file',
                    timeout: 2000,
                })
                throw err
            } finally {
                this.uploading = false
                this.uploadProgress = 0
                this.uploadingFileName = null
                this.fetchFolders()
                if (folderId) {
                    this.fetchFiles(folderId)
                } else {
                    this.fetchFiles()
                }
            }
        },

        /**
         * Upload multiple files with sequential processing
         * FIXED: Correct parameter order - (folderId, addedById, files)
         */
        async uploadMultipleFiles(folderId, addedById, files) {
            const results = []

            for (const file of files) {
                try {
                    const result = await this.uploadFile(
                        folderId,
                        addedById,  // ✅ FIXED: Now passing userId correctly
                        file
                    )
                    results.push({ file: file.name, success: true, data: result })
                } catch (err) {
                    results.push({ file: file.name, success: false, error: err })
                }
            }

            return results
        },

        /**
         * Delete file
         */
        async deleteFile(folderId = null) {
            const toast = useToast()
            const { $api } = useNuxtApp()

            try {
                const { data } = await $api.delete(`/files/${this.deleteFileId}`)

                toast.success({
                    title: 'Success!',
                    message: data?.message || 'File deleted successfully',
                    timeout: 1500,
                })

                this.deleteFileModal = false
                this.deleteFileId = null
                this.deleteFileData = null

                await this.fetchFiles(folderId)

                return data
            } catch (err) {
                console.error('❌ Delete file failed:', err)
                toast.error({
                    title: 'Error!',
                    message: err?.response?.data?.message || 'Failed to delete file',
                    timeout: 2000,
                })
                throw err
            }
        },

        /* ===============================
           PAGINATION
        =============================== */

        async nextPageFolders() {
            if (this.hasNextFolders) {
                this.foldersMeta.page++
                return this.fetchFolders()
            }
        },

        async prevPageFolders() {
            if (this.hasPrevFolders) {
                this.foldersMeta.page--
                return this.fetchFolders()
            }
        },

        async nextPageFiles(folderId = null) {
            if (this.hasNextFiles) {
                this.filesMeta.page++
                return this.fetchFiles(folderId)
            }
        },

        async prevPageFiles(folderId = null) {
            if (this.hasPrevFiles) {
                this.filesMeta.page--
                return this.fetchFiles(folderId)
            }
        },

        /* ===============================
           UI HELPERS
        =============================== */

        openCreateFolderModal() {
            this.resetFolderForm()
            this.createFolderModal = true
        },

        openEditFolderModal(folder) {
            this.editFolderId = folder.id
            this.editFolderData = folder
            this.folderForm = {
                name: folder.name,
                color: folder.color || '#3b82f6',
                visibility: folder.visibility,
                folder_image: null,
            }
            this.editFolderModal = true
        },

        openDeleteFolderModal(folder) {
            this.deleteFolderId = folder.id
            this.deleteFolderData = folder
            this.deleteFolderModal = true
        },

        openShareFolderModal(folder) {
            this.shareFolderId = folder.id
            this.shareFolderData = folder
            this.shareForm.employee_ids = []
            this.shareFolderModal = true
        },

        openDeleteFileModal(file) {
            this.deleteFileId = file.id
            this.deleteFileData = file
            this.deleteFileModal = true
        },

        resetFolderForm() {
            this.folderForm = {
                name: '',
                color: '#3b82f6',
                visibility: 'PRIVATE',
                folder_image: null,
            }
        },

        /* ===============================
           FILTERS & SEARCH
        =============================== */

        setSearchQuery(query) {
            this.foldersMeta.search = query
            this.foldersMeta.page = 1
        },

        setVisibilityFilter(visibility) {
            this.foldersMeta.visibility = visibility
            this.foldersMeta.page = 1
        },

        setSortBy(sortBy, sortOrder = 'desc') {
            this.foldersMeta.sortBy = sortBy
            this.foldersMeta.sortOrder = sortOrder
            this.foldersMeta.page = 1
        },

        /* ===============================
           RESET
        =============================== */

        clearFolders() {
            this.folders = []
            this.currentFolder = null
            this.foldersError = null
            this.foldersMeta = {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
                search: '',
                visibility: null,
                sortBy: 'created_at',
                sortOrder: 'desc',
            }
        },

        clearFiles() {
            this.files = []
            this.filesError = null
            this.filesMeta = {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
            }
        },

        clearAll() {
            this.clearFolders()
            this.clearFiles()
            this.resetFolderForm()
            this.shareForm.employee_ids = []
            this.uploading = false
            this.uploadProgress = 0
            this.uploadingFileName = null
        },
    },
})