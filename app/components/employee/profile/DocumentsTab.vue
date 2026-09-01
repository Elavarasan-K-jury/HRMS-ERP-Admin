<template>
    <section class="card">
        <div class="flex items-center justify-between mb-4">
            <h2 class="hdr"><Icon name="lucide:folder-open" class="ic" /> Documents</h2>
        </div>

        <div v-if="documents.length" class="table-wrap">
            <table class="tbl">
                <thead>
                    <tr>
                        <th>Document Name</th>
                        <th>Type</th>
                        <th>Uploaded On</th>
                        <th class="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="doc in documents" :key="doc.id">
                        <td class="doc-name">
                            <span class="doc-icon"><Icon name="lucide:file-text" class="h-4 w-4" /></span>
                            {{ doc.name }}
                        </td>
                        <td>{{ doc.type }}</td>
                        <td>{{ doc.uploaded_on }}</td>
                        <td class="text-right">
                            <button class="lnk-btn" @click="viewDocument(doc)">
                                <Icon name="lucide:eye" class="h-4 w-4" /> View
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="empty-state">
            <Icon name="lucide:file-question" class="h-10 w-10 text-white/25 mb-3" />
            <p class="text-sm text-white/50">No documents available</p>
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
    employee: { type: Object, required: true },
})

// No employee-documents API exists in the application yet.
// List stays empty until a document module is available.
const documents = []

function viewDocument(doc) {
    // Reserved for the future documents module
}
</script>

<style scoped>
.card {
    padding: 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin-bottom: 0;
    width: 100%;
}

.ic { width: 16px; height: 16px; opacity: 0.85; }

.table-wrap {
    overflow-x: auto;
}

.tbl {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.tbl th {
    text-align: left;
    font-size: 10.5px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    padding: 8px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tbl td {
    padding: 10px;
    color: rgba(255, 255, 255, 0.85);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.doc-name {
    display: flex;
    align-items: center;
    gap: 10px;
}

.doc-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
}

.lnk-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #7dd3fc;
    font-size: 12.5px;
}
.lnk-btn:hover { text-decoration: underline; text-underline-offset: 2px; }

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
}
</style>