<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">{{ total }}
                Designation<span>(s)</span></h2>
            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                    :loading="loading" @search="fetchResults" @select="goTo" />
                <UiButton @click="createNewDesignation" color="#4aff7a" text="Add Designation"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchDesignations" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <DataTable :items="designations" :loading="loading" :total="total" :page="page" :total-pages="totalPages"
            @refresh="fetchDesignations" @view="view" @edit="editDesignation" @delete="deleteDesignation"
            @next="changePage('+')" @prev="changePage('-')" />
    </div>
    <DetailedView v-model="viewModal" :department="viewData" />
    <UiSidebarModal v-model="addUpdateModal" :title="formTitle">
        <template #default>
            <DesignationForm />
        </template>

        <template #footer>
            <UiButton @click="closeDepartmentModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="saveDesignation" color="#4aff7a" text="Save Organization"
                prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Department" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useDesignationStore } from '../../../stores/organization/designation.store';
import { useAuthStore } from '../../../stores/shared/auth.store';
import DataTable from '../../../components/designation/dataTable.vue';
import DetailedView from '../../../components/designation/detailedView.vue';
import DesignationForm from '../../../components/designation/form.vue';
import designationsList from '../../../constants/designations';
import { useDepartmentStore } from '../../../stores/organization/department.store'
import { storeToRefs } from 'pinia';
definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
});
const departmentStore = useDepartmentStore();
const addUpdateModal = ref(false)
const deleteModal = ref(false)
const deleteData = ref(null)
const formTitle = ref(null)
const authStore = useAuthStore()
const designationStore = useDesignationStore()
const {
    total,
    page,
    loading,
    totalPages,
    organization_id,
    search,
    name,
    designation_level,
    description,
    department_id,
    designation_id,
} = storeToRefs(designationStore)

const viewModal = ref(false)
const viewData = ref(null)

const departments = computed(() => departmentStore.department_select);
const designations = computed(() => designationStore.designations)
const timer = ref(null)
watch(search, () => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        fetchDesignations()
    }, 300)
})

const saveDesignation = async () => {
    await designationStore.saveDesignation()
    closeDepartmentModal()
}

const createNewDesignation = () => {
    formTitle.value = 'Add Designation'
    addUpdateModal.value = true
}

const closeDepartmentModal = () => {
    formTitle.value = null
    name.value = null
    description.value = null
    department_id.value = null
    designation_level.value = null
    designation_id.value = null
    addUpdateModal.value = false
}
watch(page, () => {
    fetchDesignations()
})

function changePage(symbol) {
    switch (symbol) {
        case '+':
            page.value = page.value < totalPages.value ? page.value + 1 : page.value
            break;
        case '-':
            page.value = page.value > 1 ? page.value - 1 : page.value
            break;

        default:
            break;
    }
}
const editDesignation = async (desig) => {
    await departmentStore.fetchAllDepartments()
    formTitle.value = 'Update Designation'
    name.value = desig.name
    designation_level.value = designationsList.find(d => d.value == desig.level)
    description.value = desig.description
    department_id.value = departments.value.find(d => d.value == desig.department_id)
    designation_id.value = desig.id
    addUpdateModal.value = true
}

const confirmDelete = async () => {
    await designationStore.deleteDesignation()
    deleteModal.value = false
}

const cancelDelete = () => {
    deleteData.value = null
    deleteModal.value = false
}

const deleteDesignation = (desig) => {
    deleteData.value = desig
    designation_id.value = desig.id
    deleteModal.value = true
}

const fetchDesignations = async () => {
    await designationStore.fetchDesignations()
}

const view = (desig) => {
    console.log('designations.vue @ Line 51:', desig);
    viewData.value = desig
    viewModal.value = true
}

onMounted(async () => {
    if (authStore.organization) {
        organization_id.value = authStore.organization
    }
    await fetchDesignations()
});
</script>