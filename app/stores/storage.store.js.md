# `app/stores/storage.store.js` — File Storage Store

## Purpose

Comprehensive Pinia store for folder and file management with upload progress, sharing, and visibility controls.

## State

| Field | Type | Description |
|-------|------|-------------|
| `folders` | Array | Folder list with pagination |
| `files` | Array | File list with pagination |
| `currentFolder` | Object | Currently viewed folder |
| `totalStorage, usedStorage` | Numbers | Storage quotas |
| `uploading, uploadProgress, uploadingFileName` | — | Upload state |
| `folderForm` | Object | { name, color, visibility, folder_image } |
| `shareForm` | Object | { employee_ids } |
| Modal states | Booleans | Various CRUD modals |

## Key Actions — Folders

```js
async fetchFolders()                // Paginated folder list
async fetchFolderById(id)           // Single folder details
async createFolder(createdById)     // Create with optional image (multipart)
async updateFolder()                // Update with optional new image
async deleteFolder()                // Delete folder
async shareFolder(addedById)        // Share folder with employees
```

## Key Actions — Files

```js
async fetchFiles(folderId)          // List files (org-wide or folder-specific)
async uploadFile(folderId, addedById, file)  // Single file upload with progress
async uploadMultipleFiles(folderId, addedById, files)  // Sequential multi-file upload
async deleteFile(folderId)          // Delete file
```

## Upload Progress

```js
const { data } = await $api.post('/files', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (progressEvent) => {
    this.uploadProgress = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    )
  },
})
```

## Folder Visibility

- `PRIVATE` — Only creator can see
- `SHARED` — Shared with specific employees
- `PUBLIC` — Visible to all org members

## Explanation

- Full CRUD for folders and files with multipart upload support.
- Folder sharing with employee selection.
- Upload progress tracking with percentage.
- Sequential multi-file upload with individual error handling.
- Storage quota tracking (total vs used).
- Visibility and sort filters for folder listing.
