<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">

            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Attendance Policy<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">
                <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="filteredResults"
                    :loading="loading" @search="runSearch" @select="selectSuggestion" />

                <UiButton @click="openAddModal" color="#4aff7a" text="Add Policy" prepend-icon="ion:add-circle" />

                <UiButton @click="fetchPolicies" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- TABLE -->
        <AttendancePolicyTable :items="policies" :loading="loading" :total="total" @edit="editPolicy"
            @view="viewPolicy" />

    </div>

    <!-- VIEW MODAL -->
    <AttendancePolicyView v-model="viewModal" :policy="viewData" />
    <!-- ADD / EDIT SIDEBAR -->
    <UiSidebarModal v-model="addUpdateModal" :title="formTitle">
        <template #default>
            <AttendancePolicyForm />
        </template>

        <template #footer>
            <UiButton @click="closeForm" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="savePolicy" color="#4aff7a" text="Save Policy" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <!-- DELETE CONFIRM MODAL -->
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Delete policy <b>{{ deleteData?.name }}</b>?</span>
        </template>

        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Policy" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useAttendancePolicyStore } from '../../../../stores/attendancePolicy.store'
import { useAuthStore } from '../../../../stores/auth.store'

import AttendancePolicyTable from '../../../../components/policies/PolicyTable.vue'
import AttendancePolicyForm from '../../../../components/policies/PolicyForm.vue'
import AttendancePolicyView from '../../../../components/policies/PolicyView.vue'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath
})

/* STORES */
const auth = useAuthStore()
const store = useAttendancePolicyStore()

const {
    policies,
    loading,
    name,
    policy_id,
} = storeToRefs(store)

const total = computed(() => policies.value.length)

/* SEARCH */
const search = ref('')
const filteredResults = ref([])

watch(search, () => {
    filteredResults.value = search.value
        ? policies.value.filter(p => p.name.toLowerCase().includes(search.value.toLowerCase()))
            .map(p => ({ label: p.name, value: p.id }))
        : []
})

const runSearch = () => { }
const selectSuggestion = item => {
    const p = policies.value.find(x => x.id === item.value)
    if (p) viewPolicy(p)
}

/* MODAL STATES */
const addUpdateModal = ref(false)
const viewModal = ref(false)
const deleteModal = ref(false)

const viewData = ref(null)
const deleteData = ref(null)
const formTitle = ref('')

/* CRUD HANDLERS */
const fetchPolicies = async () => {
    await store.fetchPolicies()
}

const openAddModal = () => {
    store.resetForm()
    formTitle.value = 'Add New Policy'
    addUpdateModal.value = true
}

const editPolicy = policy => {
    formTitle.value = 'Update Attendance Policy'
    store.loadPolicy(policy)
    addUpdateModal.value = true
}

const viewPolicy = policy => {
    viewData.value = policy
    viewModal.value = true
}

const closeForm = () => {
    addUpdateModal.value = false
    store.resetForm()
}

const savePolicy = async () => {
    if (policy_id.value) {
        await store.updatePolicy()
    } else {
        await store.createPolicy()
    }
    addUpdateModal.value = false
}

const cancelDelete = () => {
    deleteModal.value = false
    deleteData.value = null
}

const confirmDelete = async () => {
    await store.deletePolicy(deleteData.value.id)
    cancelDelete()
}

/* INIT */
onMounted(async () => {
    await fetchPolicies()
});
</script>
