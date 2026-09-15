<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div class="w-full mx-auto">
            <UiTabs v-model="activeTab" :tabs="tabList" color="#fff" :blur="16">
                <div v-if="activeTab == 0">
                    <div
                        class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
                        <h2 class="text-lg font-semibold uppercase text-white/90">{{ totalFlows }}
                            Onboarding Process<span>(s)</span></h2>
                        <div class="flex items-center gap-2">
                            <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="results"
                                :loading="loading" @search="fetchResults" @select="goTo" />
                            <UiButton @click="openAddModal" color="#4aff7a" text="Add New Onboarding Process"
                                prepend-icon="ion:add-circle" />
                            <UiButton @click="fetchOnboardingFlows" color="#fff" text="Reload"
                                prepend-icon="ion:refresh" />
                        </div>
                    </div>
                    <OnboardingProcessTable class="mt-2" :items="flows" :loading="loading" :page="page"
                        :total-pages="totalPages" :total="totalFlows" @view="viewProcess" @edit="editProcess"
                        @delete="deleteProcess" />
                </div>
                <UiPanel :index="1" color="#fff" :fillOpacity="0.08">
                    <h2 class="text-2xl font-bold text-white mb-4">Active Process</h2>
                    <p class="text-white/70">Blue glass vibes 💙</p>
                </UiPanel>
            </UiTabs>
        </div>
        <DetailedView v-model="viewModal" :process="viewData" />
        <UiSidebarModal width="980px" v-model="addUpdateModal" :title="formTitle" @close="closeOnboardingModal">
            <OnboardingForm />
            <template #footer>
                <UiButton :disabled="loading" @click="closeOnboardingModal" color="#fff" text="Cancel"
                    prepend-icon="ion:close-circle" />
                <UiButton :disabled="loading" @click="saveOnboarding" color="#4aff7a"
                    :text="!loading ? 'Save Onboarding Process' : 'Saving please wait...'"
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
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import OnboardingForm from '../../../../components/onboardingProcess/form.vue';
import OnboardingProcessTable from '../../../../components/onboardingProcess/dataTable.vue';
import DetailedView from '../../../../components/onboardingProcess/detailedView.vue';
import { useOnboardingStore } from '../../../../stores/organization/onBoarding.store';
import { useAuthStore } from '../../../../stores/shared/auth.store';
import InputTypes from '../../../../constants/inputTypes';
import { storeToRefs } from 'pinia';

definePageMeta({
    layout: 'organization',
});

const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()
const flows = computed(() => onboardingStore.onBoardingFlows)
const totalFlows = computed(() => onboardingStore.total)

const viewModal = ref(false)
const viewData = ref(null)

const {
    loading,
    error,
    page,
    limit,
    totalPages,
    search,
    sortBy,
    sortOrder,
    organization_id,
    name,
    description,
    estimated_days,
    flow_id,
    process_steps
} = storeToRefs(onboardingStore);

const deleteModal = ref(false)
const deleteData = ref(null)

const deleteProcess = (data) => {
    deleteData.value = data
    flow_id.value = data.id
    deleteModal.value = true
}

const cancelDelete = () => {
    deleteData.value = null
    deleteModal.value = false
}

const confirmDelete = async () => {
    await onboardingStore.deleteOnboardingFlow()
    flow_id.value = null
    deleteData.value = null
    deleteModal.value = false
}
const organization = computed(() => authStore.organization)

const activeTab = ref(0)

const timer = ref(null)
watch(search, () => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
        page.value = 1
        fetchOnboardingFlows()
    }, 300)
})

const viewProcess = (data) => {
    viewModal.value = true
    viewData.value = data
}

const editProcess = (data) => {
    console.log('onboarding.vue @ Line 83:', data);
    formTitle.value = 'Edit Onboarding Process'
    name.value = data.name
    description.value = data.description
    estimated_days.value = data.estimated_days
    flow_id.value = data.id
    process_steps.value = data.steps_list.map(step => {
        return {
            id: step.id,
            name: step.name,
            features: step.features.map(feature => {
                return {
                    id: feature.id,
                    name: feature.feature_name,
                    type: feature.feature_type ? InputTypes.find(type => type.value == feature.feature_type) : null,
                    hasOptions: feature.has_options,
                    optionText: null,
                    options: JSON.parse(feature.options)
                }
            })
        }
    })
    addUpdateModal.value = true
}

const addUpdateModal = ref(false)
const formTitle = ref('Add New Onboarding Process')

const closeOnboardingModal = () => {
    formTitle.value = null
    name.value = null
    description.value = null
    estimated_days.value = null
    flow_id.value = null
    process_steps.value = [
        {
            id: null,
            name: null,
            features: [
                {
                    id: null,
                    name: null,
                    type: null,
                    hasOptions: false,
                    optionText: null,
                    options: []
                },
            ]
        }
    ]
    addUpdateModal.value = false
}

const openAddModal = () => {
    formTitle.value = 'Add New Onboarding Process'
    addUpdateModal.value = true
}

const saveOnboarding = async () => {
    await onboardingStore.saveOnboarding()
    closeOnboardingModal()
}

const tabList = ref([
    { label: 'Onboarding Process', icon: 'lucide:git-fork', badge: '3' },
    { label: 'Active Process', icon: 'lucide:activity', badge: '1' },
]);

const fetchOnboardingFlows = async () => {
    await onboardingStore.fetchOnboardingFlows()
}

onMounted(async () => {
    organization_id.value = organization.value
    await fetchOnboardingFlows()
    tabList.value[0].badge = totalFlows.value
});
</script>