<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- Header -->
        <div
            class="rounded-lg p-5 bg-white/10 border min-h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold uppercase text-white/90">Bands</h2>
                <p class="text-xs text-white/55 max-w-xl mt-1 leading-relaxed">
                    Bands represent job/career levels and group designations with similar roles, complexity, skills,
                    knowledge and competency requirements.
                </p>
            </div>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :loading="loading" width="280px"
                    placeholder="Search bands…" @search="onSearch" @clear="onSearch('')" />
                <UiButton @click="openCreate" color="#4aff7a" text="Add Band" prepend-icon="ion:add-circle"
                    :disabled="saving" />
                <UiButton @click="fetchBands" color="#fff" text="Reload" prepend-icon="ion:refresh"
                    :disabled="loading" />
            </div>
        </div>

        <!-- Table -->
        <BandTable :items="bands" :loading="loading" :searched="searched" @create="openCreate" @edit="openEdit"
            @delete="openDelete" />

        <!-- Add/Edit modal -->
        <UiSidebarModal v-model="formModal" :title="formTitle">
            <template #default>
                <BandForm ref="formRef" :initial="editingItem" :saving="saving" @submit="saveForm" />
            </template>
            <template #footer>
                <UiButton @click="closeFormModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle"
                    :disabled="saving" />
                <UiButton @click="submitForm" color="#4aff7a" :text="saving ? 'Saving...' : (isEditing ? 'Update' : 'Add')"
                    prepend-icon="ion:save-outline" :disabled="saving" />
            </template>
        </UiSidebarModal>

        <!-- Delete confirmation -->
        <UiModal v-model="deleteModal" title="Delete Band?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm leading-relaxed">
                    Are you sure you want to delete the band
                    <span class="font-semibold text-white">“{{ deleteData?.name }}”</span>?
                </p>
                <p v-if="deleteData?.designation_count > 0 || deleteData?.employee_count > 0"
                    class="mt-3 text-amber-300/90 text-xs leading-relaxed">
                    This band is currently assigned to {{ deleteData.designation_count || 0 }} designation(s) and
                    {{ deleteData.employee_count || 0 }} employee(s). Please reassign them before deleting this band.
                </p>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle"
                    :disabled="deleting" />
                <UiButton @click="confirmDelete" color="#750d0d" text="Delete Band" prepend-icon="ion:trash"
                    :disabled="deleting || deleteData?.designation_count > 0 || deleteData?.employee_count > 0" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBandStore } from '~/stores/band.store'
import { useAuthStore } from '~/stores/auth.store'
import { storeToRefs } from 'pinia'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const orgId = route.params.organization

const bandStore = useBandStore()
const authStore = useAuthStore()

const {
    bands,
    loading,
    saving,
    search,
} = storeToRefs(bandStore)

const formModal = ref(false)
const formRef = ref(null)
const formTitle = ref('Add Band')
const editingItem = ref(null)
const deleteModal = ref(false)
const deleteData = ref(null)
const deleting = ref(false)

const isEditing = computed(() => !!editingItem.value)
const searched = computed(() => !!search.value?.trim())

let debounceTimer = null

const fetchBands = async () => {
    bandStore.organizationId = orgId
    await bandStore.fetchBands(orgId)
}

const onSearch = (term) => {
    search.value = term
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
        bandStore.page = 1
        fetchBands()
    }, 300)
}

const openCreate = () => {
    editingItem.value = null
    formTitle.value = 'Add Band'
    formModal.value = true
}

const openEdit = (band) => {
    editingItem.value = band
    formTitle.value = 'Edit Band'
    formModal.value = true
}

const closeFormModal = () => {
    if (saving.value) return
    formModal.value = false
    editingItem.value = null
    bandStore.resetForm()
}

const submitForm = () => {
    formRef.value?.submit()
}

const saveForm = async (payload) => {
    bandStore.organizationId = orgId
    bandStore.name = payload.name
    bandStore.description = payload.description
    bandStore.order = payload.order
    if (isEditing.value) {
        bandStore.band_id = editingItem.value.id
        await bandStore.updateBand()
    } else {
        bandStore.band_id = null
        await bandStore.createBand()
    }
    closeFormModal()
}

const openDelete = (band) => {
    deleteData.value = band
    deleteModal.value = true
}

const confirmDelete = async () => {
    if (!deleteData.value) return
    deleting.value = true
    try {
        await bandStore.deleteBand(deleteData.value.id)
        deleteModal.value = false
        deleteData.value = null
    } finally {
        deleting.value = false
    }
}

onMounted(async () => {
    if (authStore.organization) {
        bandStore.organizationId = authStore.organization
    }
    await fetchBands()
})
</script>