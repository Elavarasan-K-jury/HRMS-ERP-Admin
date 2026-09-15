<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Branch<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiButton @click="openBranchModal" color="#4aff7a" text="Add Branch"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchBranches" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <DataTable :items="branches" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @edit="editBranch" @delete="deleteBranch" @next="changePage('+')" @prev="changePage('-')" />
    </div>

    <UiSidebarModal v-model="addUpdateModal" :title="formTitle">
        <template #default>
            <BranchForm />
        </template>
        <template #footer>
            <UiButton @click="closeBranchModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="saveBranch" color="#4aff7a" text="Save Branch" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Branch" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue';
import { useAuthStore } from '../../../stores/shared/auth.store';
import { useBranchStore } from '../../../stores/organization/branch.store';
import DataTable from '../../../components/branch/dataTable.vue';
import BranchForm from '../../../components/branch/form.vue';
import { storeToRefs } from 'pinia';

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
});

const addUpdateModal = ref(false)
const deleteModal = ref(false)
const deleteData = ref(null)
const formTitle = ref(null)

const authStore = useAuthStore()
const branchStore = useBranchStore()
const {
    total,
    page,
    loading,
    totalPages,
    branch_id,
    name,
    code,
} = storeToRefs(branchStore)
const branches = computed(() => branchStore.branches)

const organization_id = computed(() => authStore.organization)

const fetchBranches = () => {
    branchStore.organization_id = organization_id.value
    branchStore.fetchBranches()
}

const openBranchModal = () => {
    formTitle.value = 'Add Branch'
    branchStore.resetForm()
    addUpdateModal.value = true
}

const closeBranchModal = () => {
    addUpdateModal.value = false
}

const editBranch = (branch) => {
    formTitle.value = 'Edit Branch'
    branchStore.branch_id = branch.id
    branchStore.name = branch.name
    branchStore.code = branch.code
    branchStore.description = branch.description
    branchStore.is_active = branch.is_active
    addUpdateModal.value = true
}

const deleteBranch = (branch) => {
    deleteData.value = branch
    deleteModal.value = true
}

const cancelDelete = () => {
    deleteModal.value = false
    deleteData.value = null
}

const confirmDelete = async () => {
    branchStore.branch_id = deleteData.value.id
    await branchStore.deleteBranch()
    deleteModal.value = false
    deleteData.value = null
}

const saveBranch = async () => {
    branchStore.organization_id = organization_id.value
    await branchStore.saveBranch()
    addUpdateModal.value = false
}

const changePage = (dir) => {
    if (dir === '+') branchStore.page++
    else if (dir === '-') branchStore.page--
}

watch(page, () => {
    fetchBranches()
})

onMounted(async () => {
    branchStore.organization_id = organization_id.value
    await fetchBranches()
})
</script>
