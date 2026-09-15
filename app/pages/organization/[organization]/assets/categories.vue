<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- HEADER -->
        <div class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">Asset Categories & Types</h2>
            <div class="flex items-center gap-2">
                <UiButton @click="openAddCategoryModal" color="#4aff7a" text="Add Category" prepend-icon="ion:add-circle" />
                <UiButton @click="fetchCategories" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- TWO-PANEL LAYOUT -->
        <div class="flex gap-2 flex-1 min-h-0">
            <!-- LEFT: Category List -->
            <div class="w-80 flex-shrink-0 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col">
                <div class="p-3 border-b border-white/10">
                    <FormInput rounded="lg" color="#fff" v-model="categorySearch" placeholder="Search categories..." prepend-icon="ion:search" />
                </div>
                <div class="flex-1 overflow-y-auto">
                    <div v-if="catLoading" class="p-4 text-center text-white/50 text-sm">Loading...</div>
                    <div v-else-if="!filteredCategories.length" class="p-4 text-center text-white/50 text-sm">No categories found</div>
                    <div v-else>
                        <div
                            v-for="cat in filteredCategories"
                            :key="cat.id"
                            @click="selectCategory(cat)"
                            class="px-4 py-3 border-b border-white/5 cursor-pointer transition-colors"
                            :class="selectedCategory?.id === cat.id
                                ? 'bg-[#4aff7a]/10 border-l-2 border-l-[#4aff7a]'
                                : 'hover:bg-white/5 border-l-2 border-l-transparent'"
                        >
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="text-sm font-medium text-white">{{ cat.name }}</div>
                                    <div class="text-xs text-white/50">{{ cat.code }}</div>
                                </div>
                                <span class="text-xs px-2 py-0.5 rounded"
                                    :class="cat.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'">
                                    {{ cat.is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Selected Category Details + Types -->
            <div class="flex-1 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col min-w-0">
                <!-- No category selected -->
                <div v-if="!selectedCategory" class="flex-1 flex items-center justify-center text-white/40">
                    <div class="text-center">
                        <Icon name="lucide:mouse-pointer-click" class="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p class="text-sm">Select a category to view its details and asset types</p>
                    </div>
                </div>

                <!-- Category selected -->
                <template v-else>
                    <!-- Category Header -->
                    <div class="p-4 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 class="text-white font-semibold text-base">{{ selectedCategory.name }}</h3>
                            <p class="text-white/50 text-xs">{{ stripHtml(selectedCategory.description) || 'No description' }}</p>
                        </div>
                        <div class="flex gap-1">
                            <UiButton color="#fff" class="btn-icon" title="Edit Category" @click="editCategory(selectedCategory)">
                                <Icon name="lucide:pencil" class="w-4 h-4" />
                            </UiButton>
                            <UiButton color="#ff0000" class="btn-icon-danger" title="Delete Category" @click="confirmDeleteCategory(selectedCategory)">
                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                            </UiButton>
                        </div>
                    </div>

                    <!-- Types Section -->
                    <div class="flex-1 overflow-y-auto p-4">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="text-white/80 text-sm font-semibold">Asset Types / Models</h4>
                            <UiButton @click="openAddTypeModal" color="#4aff7a" text="Add Type" prepend-icon="ion:add-circle" />
                        </div>

                        <div v-if="typeLoading" class="text-center py-6 text-white/50 text-sm">Loading types...</div>
                        <div v-else-if="!categoryModels.length" class="text-center py-6 text-white/50 text-sm">
                            No types in this category. Click "Add Type" to create one.
                        </div>
                        <table v-else class="min-w-full text-sm text-white/90">
                            <thead class="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th class="th">Brand</th>
                                    <th class="th">Model Name</th>
                                    <th class="th">Code</th>
                                    <th class="th">Status</th>
                                    <th class="th text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="m in categoryModels" :key="m.id" class="border-b border-white/5 hover:bg-white/5">
                                    <td class="td font-semibold">{{ m.brand }}</td>
                                    <td class="td">{{ m.model_name }}</td>
                                    <td class="td font-mono text-xs">{{ m.code }}</td>
                                    <td class="td">
                                        <span :class="m.is_active ? 'badge-green' : 'badge-gray'">
                                            {{ m.is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                    <td class="td text-right">
                                        <div class="inline-flex gap-1">
                                            <UiButton color="#fff" class="btn-icon" title="Edit" @click="editType(m)">
                                                <Icon name="lucide:pencil" class="w-4 h-4" />
                                            </UiButton>
                                            <UiButton color="#ff0000" class="btn-icon-danger" title="Delete" @click="confirmDeleteType(m)">
                                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                                            </UiButton>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </div>
        </div>
    </div>

    <!-- ADD/EDIT CATEGORY MODAL -->
    <UiSidebarModal width="500px" v-model="catModal" :title="catFormTitle">
        <div class="space-y-4 p-2">
            <div class="flex flex-col gap-1">
                <label class="text-white/70 text-sm font-medium">Category Name <span class="text-red-500">*</span></label>
                <FormInput rounded="lg" color="#fff" v-model="catStore.name" placeholder="e.g., Laptop" />
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-white/70 text-sm font-medium">Code <span class="text-red-500">*</span></label>
                <FormInput rounded="lg" color="#fff" v-model="catStore.code" placeholder="e.g., LAP" />
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-white/70 text-sm font-medium">Description</label>
                <FormInput rounded="lg" color="#fff" v-model="catStore.description" placeholder="Category description (optional)" />
            </div>
            <div class="flex items-center gap-3">
                <label class="text-white/70 text-sm font-medium">Active</label>
                <input type="checkbox" v-model="catStore.is_active" class="rounded" />
            </div>
        </div>
        <template #footer>
            <UiButton @click="catModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton :disabled="catStore.loading" @click="saveCategory" color="#4aff7a"
                :text="catStore.loading ? 'Saving...' : 'Save Category'" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <!-- ADD/EDIT TYPE MODAL -->
    <UiSidebarModal width="700px" v-model="typeModal" :title="typeFormTitle">
        <div class="space-y-4 p-2">
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1">
                    <label class="text-white/70 text-sm font-medium">Brand <span class="text-red-500">*</span></label>
                    <FormInput rounded="lg" color="#fff" v-model="modelStore.brand" placeholder="e.g., Apple" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-white/70 text-sm font-medium">Model Name <span class="text-red-500">*</span></label>
                    <FormInput rounded="lg" color="#fff" v-model="modelStore.model_name" placeholder="e.g., MacBook Pro 14" />
                </div>
            </div>
            <div class="flex flex-col gap-1">
                <label class="text-white/70 text-sm font-medium">Description</label>
                <FormTextArea rounded="lg" color="#fff" v-model="modelStore.description" placeholder="Model description" :rows="2" />
            </div>
            <div class="flex items-center gap-3">
                <label class="text-white/70 text-sm font-medium">Active</label>
                <input type="checkbox" v-model="modelStore.is_active" class="rounded" />
            </div>
            <div class="border-t border-white/10 pt-4 mt-4">
                <AttributeDefinitionEditor
                    ref="attrEditorRef"
                    v-model="attributeFields"
                    :definitions="existingAttributeDefinitions"
                />
            </div>
        </div>
        <template #footer>
            <UiButton @click="typeModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton :disabled="modelStore.loading" @click="saveType" color="#4aff7a"
                :text="modelStore.loading ? 'Saving...' : 'Save Type'" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <!-- DELETE CATEGORY CONFIRMATION -->
    <UiModal v-model="deleteCatModal" title="Delete Category?" size="sm">
        <template #default>
            <span>Are you sure you want to delete <strong>{{ deleteCatData?.name }}</strong>? All types in this category must be removed first.</span>
        </template>
        <template #footer>
            <UiButton @click="deleteCatModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDeleteCat" color="#750d0d" text="Delete" prepend-icon="ion:trash" />
        </template>
    </UiModal>

    <!-- DELETE TYPE CONFIRMATION -->
    <UiModal v-model="deleteTypeModal" title="Delete Type?" size="sm">
        <template #default>
            <span>Are you sure you want to delete <strong>{{ deleteTypeData?.model_name }}</strong>?</span>
        </template>
        <template #footer>
            <UiButton @click="deleteTypeModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDeleteTypeAction" color="#750d0d" text="Delete" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useAssetsCategoryStore } from '../../../../stores/organization/assetsCategory.store'
import { useAssetsModelStore } from '../../../../stores/organization/assetModel.store'
import { useAuthStore } from '../../../../stores/shared/auth.store'
import AttributeDefinitionEditor from '../../../../components/asset/AttributeDefinitionEditor.vue'

definePageMeta({ layout: 'organization' })

const catStore = useAssetsCategoryStore()
const modelStore = useAssetsModelStore()
const authStore = useAuthStore()
const { $api } = useNuxtApp()

const {
    loading: catLoading,
    name,
    code,
    description,
    is_active,
    assetCategoryId,
} = storeToRefs(catStore)

const categories = computed(() => catStore.categories)
const categorySearch = ref('')
const selectedCategory = ref(null)
const catModal = ref(false)
const catFormTitle = ref('Add Category')
const deleteCatModal = ref(false)
const deleteCatData = ref(null)
const codeManuallyEdited = ref(false)

const typeModal = ref(false)
const typeFormTitle = ref('Add Type')
const typeLoading = ref(false)
const categoryModels = ref([])
const deleteTypeModal = ref(false)
const deleteTypeData = ref(null)
const attrEditorRef = ref(null)
const attributeFields = ref([])
const existingAttributeDefinitions = ref([])

const filteredCategories = computed(() => {
    if (!categorySearch.value) return categories.value
    const q = categorySearch.value.toLowerCase()
    return categories.value.filter(c =>
        c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q)
    )
})

async function selectCategory(cat) {
    selectedCategory.value = cat
    await fetchTypesForCategory(cat.id)
}

async function fetchTypesForCategory(categoryId) {
    typeLoading.value = true
    try {
        const { $api } = useNuxtApp()
        const res = await $api.get('/asset-models', {
            params: {
                organization_id: authStore.organization,
                category_id: categoryId,
            },
        })
        if (res.data?.success) {
            categoryModels.value = res.data.models
        }
    } catch (err) {
        console.error('[Categories] Fetch types error:', err)
    } finally {
        typeLoading.value = false
    }
}

function openAddCategoryModal() {
    catStore.assetCategoryId = null
    catStore.name = null
    catStore.code = null
    catStore.description = null
    catStore.is_active = true
    codeManuallyEdited.value = false
    catFormTitle.value = 'Add Category'
    catModal.value = true
}

function editCategory(cat) {
    catStore.assetCategoryId = cat.id
    catStore.name = cat.name
    catStore.code = cat.code
    catStore.description = cat.description
    catStore.is_active = cat.is_active
    codeManuallyEdited.value = true
    catFormTitle.value = 'Edit Category'
    catModal.value = true
}

async function saveCategory() {
    await catStore.saveAssetsCategory()
    await fetchCategories()
    catModal.value = false
}

function confirmDeleteCategory(cat) {
    deleteCatData.value = cat
    catStore.assetCategoryId = cat.id
    deleteCatModal.value = true
}

async function confirmDeleteCat() {
    await catStore.deleteAssetsCategory()
    await fetchCategories()
    if (selectedCategory.value?.id === deleteCatData.value?.id) {
        selectedCategory.value = null
        categoryModels.value = []
    }
    deleteCatModal.value = false
    deleteCatData.value = null
}

function openAddTypeModal() {
    modelStore.resetForm()
    modelStore.organization_id = authStore.organization
    modelStore.category_id = { value: selectedCategory.value.id, label: selectedCategory.value.name }
    attributeFields.value = []
    existingAttributeDefinitions.value = []
    typeFormTitle.value = 'Add Type'
    typeModal.value = true
}

function editType(m) {
    modelStore.assetModelId = m.id
    modelStore.organization_id = authStore.organization
    modelStore.category_id = { value: selectedCategory.value.id, label: selectedCategory.value.name }
    modelStore.brand = m.brand
    modelStore.model_name = m.model_name
    modelStore.code = m.code
    modelStore.description = m.description
    modelStore.is_active = m.is_active
    attributeFields.value = []
    existingAttributeDefinitions.value = []
    loadAttributeDefinitions(m.id)
    typeFormTitle.value = 'Edit Type'
    typeModal.value = true
}

async function loadAttributeDefinitions(modelId) {
    try {
        const res = await $api.get('/asset-attribute-definitions', {
            params: { asset_model_id: modelId, organization_id: authStore.organization },
        })
        if (res.data?.definitions) {
            existingAttributeDefinitions.value = res.data.definitions
        }
    } catch (err) {
        console.error('[Categories] Failed to load attribute definitions:', err)
    }
}

async function syncAttributeDefinitions(modelId) {
    if (!attrEditorRef.value) return
    const defsToSend = attrEditorRef.value.toDefinitions(attributeFields.value)
    if (defsToSend.length === 0) return
    try {
        await $api.post('/asset-attribute-definitions/sync', {
            asset_model_id: modelId,
            organization_id: authStore.organization,
            definitions: defsToSend,
        })
    } catch (err) {
        console.error('[Categories] Failed to sync attribute definitions:', err)
    }
}

async function saveType() {
    await modelStore.saveAssetModel()
    const newModelId = modelStore.assetModelId
    if (newModelId && attributeFields.value.length > 0) {
        await syncAttributeDefinitions(newModelId)
    }
    await fetchTypesForCategory(selectedCategory.value.id)
    typeModal.value = false
}

function confirmDeleteType(m) {
    deleteTypeData.value = m
    modelStore.assetModelId = m.id
    deleteTypeModal.value = true
}

async function confirmDeleteTypeAction() {
    await modelStore.deleteAssetModel()
    await fetchTypesForCategory(selectedCategory.value.id)
    deleteTypeModal.value = false
    deleteTypeData.value = null
}

async function fetchCategories() {
    await catStore.fetchAssetsCategories()
}

function stripHtml(html) {
    if (!html) return ''
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
}

function slugify(str) {
    if (!str) return ''
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
}

let autoGeneratingCode = false

watch(name, (newName) => {
    if (!codeManuallyEdited.value) {
        autoGeneratingCode = true
        code.value = slugify(newName)
        nextTick(() => { autoGeneratingCode = false })
    }
})

watch(code, () => {
    if (!autoGeneratingCode) {
        codeManuallyEdited.value = true
    }
})

onMounted(async () => {
    catStore.organization_id = authStore.organization
    await fetchCategories()
})
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}
.td {
    @apply px-4 py-3 align-middle text-white/90;
}
.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}
.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}
.badge-green {
    @apply inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300;
}
.badge-gray {
    @apply inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/60;
}
</style>
