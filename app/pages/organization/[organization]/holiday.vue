<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Holiday<span>(s)</span>
            </h2>

            <div class="flex items-center gap-2">
                <!-- VIEW TOGGLE -->
                <div class="flex items-center gap-2">
                    <UiButton :color="isListView ? '#4aff7a' : '#fff'" text="List View" prepend-icon="ion:list"
                        @click="switchToList" />

                    <UiButton :color="!isListView ? '#4aff7a' : '#fff'" text="Calendar View" prepend-icon="ion:calendar"
                        @click="switchToCalendar" />
                </div>

                <div class="flex gap-2 items-center">
                    <UiButton color="#fff" @click="yearOptions.prevFunc" :text="yearOptions.prev" />
                    <UiButton color="#4aff7a" :text="yearOptions.current" />
                    <UiButton color="#fff" @click="yearOptions.nextFunc" append-icon="ion:arrow-forward"
                        :text="yearOptions.next" />
                </div>
                <UiButton @click="openHolidayModal" color="#4aff7a" text="Add Holiday" prepend-icon="ion:add-circle" />
                <UiButton @click="fetchHolidays" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- FILTERS -->
        <!-- <div class="flex flex-wrap gap-3">

            <FormSelect v-model="holidayStore.filter_type" :options="typeOptions" placeholder="Type"
                prepend-icon="lucide:filter" />

            <FormSelect v-model="holidayStore.filter_region" :options="regionOptions" placeholder="Region"
                prepend-icon="lucide:map-pin" />

            <FormSelect v-model="holidayStore.filter_policy" :options="policyOptions" placeholder="Policy"
                prepend-icon="lucide:shield" />
        </div> -->

        <!-- TABLE -->
        <HolidayTable v-if="isListView" :items="holidays" :loading="loading" :total="total" :page="page"
            :total-pages="totalPages" @view="viewHoliday" @edit="editHoliday" @delete="deleteHoliday" @prev="prevPage"
            @next="nextPage" />

        <HolidayCalendarView v-else :calendar="calendar" :month="selectedMonth" @month-change="changeMonth" />
    </div>

    <!-- VIEW MODAL -->
    <HolidayDetailedView v-model="viewModal" :holiday="viewData" />

    <!-- ADD / EDIT MODAL -->
    <UiSidebarModal v-model="addUpdateModal" :title="formTitle">
        <template #default>
            <HolidayForm />
        </template>
        <template #footer>
            <UiButton @click="closeHolidayModal" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="saveHoliday" color="#4aff7a" text="Save Holiday" prepend-icon="ion:save-outline" />
        </template>
    </UiSidebarModal>

    <!-- DELETE CONFIRM -->
    <UiModal v-model="deleteModal" title="Are you sure?" size="sm">
        <template #default>
            <span>Are you sure you want to delete {{ deleteData?.name }}?</span>
        </template>
        <template #footer>
            <UiButton @click="cancelDelete" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="confirmDelete" color="#750d0d" text="Delete Holiday" prepend-icon="ion:trash" />
        </template>
    </UiModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../../../stores/auth.store'
import { useHolidayStore } from '../../../stores/holiday.store'

import HolidayTable from '../../../components/holiday/dataTable.vue'
import HolidayDetailedView from '../../../components/holiday/DetailedView.vue'
import HolidayForm from '../../../components/holiday/Form.vue'
import HolidayCalendarView from '../../../components/holiday/HolidayCalendarView.vue'

/* -----------------------------------------
   PAGE META
----------------------------------------- */
definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

/* -----------------------------------------
   STORES
----------------------------------------- */
const authStore = useAuthStore()
const holidayStore = useHolidayStore()

const {
    holidays,
    calendar,
    total_count,
    organization_id,
    loading,
    holiday_id,
    policy_id,
    date,
    name,
    region,
    type,
    filter_year
} = storeToRefs(holidayStore)

/* -----------------------------------------
   UI STATE
----------------------------------------- */
const search = ref('')
const page = ref(1)
const totalPages = ref(1)

const viewModal = ref(false)
const viewData = ref(null)

const addUpdateModal = ref(false)
const deleteModal = ref(false)
const deleteData = ref(null)
const formTitle = ref(null)

/* -----------------------------------------
   FILTER OPTIONS
----------------------------------------- */

const yearOptions = ref({
    prev: new Date().getFullYear() - 1,
    prevFunc: () => {
        yearOptions.value.prev = yearOptions.value.prev - 1
        yearOptions.value.current = yearOptions.value.current - 1
        yearOptions.value.next = yearOptions.value.next - 1
        holidayStore.filter_year = yearOptions.value.current
        fetchHolidays()
    },
    current: new Date().getFullYear(),
    next: new Date().getFullYear() + 1,
    nextFunc: () => {
        yearOptions.value.prev = yearOptions.value.prev + 1
        yearOptions.value.current = yearOptions.value.current + 1
        yearOptions.value.next = yearOptions.value.next + 1
        holidayStore.filter_year = yearOptions.value.current
        fetchHolidays()
    },
})

const typeOptions = [
    { label: 'PUBLIC', value: 'PUBLIC' },
    { label: 'RESTRICTED', value: 'RESTRICTED' },
    { label: 'OPTIONAL', value: 'OPTIONAL' },
    { label: 'WEEK OFF', value: 'WEEK_OFF' },
    { label: 'COMPANY EVENT', value: 'COMPANY_EVENT' },
]

const regionOptions = [
    { label: 'All Regions', value: '' },
    { label: 'KA - Karnataka', value: 'KA' },
    { label: 'TN - Tamil Nadu', value: 'TN' },
    { label: 'MH - Maharashtra', value: 'MH' },
    { label: 'DL - Delhi', value: 'DL' },
]

const policyOptions = [
    { label: 'Default Policy', value: null }
]

/* -----------------------------------------
   COMPUTEDS
----------------------------------------- */
const total = computed(() => total_count.value)

/* -----------------------------------------
   FILTER WATCHERS (auto-fetch)
----------------------------------------- */
watch(
    () => [
        holidayStore.filter_year,
        holidayStore.filter_type,
        holidayStore.filter_region,
        holidayStore.filter_policy,
    ],
    () => fetchHolidays()
)

/* -----------------------------------------
   SEARCH
----------------------------------------- */
const timer = ref(null)

watch(search, () => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => fetchResults(search.value), 300)
})

const goTo = (item) => {
    const match = holidays.value.find(h => h.id === item.value)
    if (match) viewHoliday(match)
}

/* -----------------------------------------
   CRUD Actions
----------------------------------------- */
const fetchHolidays = async () => {
    await holidayStore.fetchHolidays()
}

const viewHoliday = (holiday) => {
    viewData.value = holiday
    viewModal.value = true
}

const changeMonth = (m) => {
    selectedMonth.value = m
    holidayStore.fetchHolidayCalendar(m)
}

const openHolidayModal = () => {
    holidayStore.resetForm()
    formTitle.value = 'Add New Holiday'
    addUpdateModal.value = true
}

const closeHolidayModal = () => {
    holidayStore.resetForm()
    addUpdateModal.value = false
}

const editHoliday = (holiday) => {
    holiday_id.value = holiday.id
    policy_id.value = holiday.policy_id || null
    date.value = holiday.date
    name.value = holiday.name
    region.value = holiday.region
    type.value = holiday.type

    formTitle.value = 'Update Holiday'
    addUpdateModal.value = true
}

const saveHoliday = async () => {
    if (holiday_id.value) {
        await holidayStore.updateHoliday()
    } else {
        await holidayStore.createHoliday()
    }
    closeHolidayModal()
}

const deleteHoliday = (holiday) => {
    holiday_id.value = holiday.id
    deleteData.value = holiday
    deleteModal.value = true
}

const cancelDelete = () => {
    holiday_id.value = null
    deleteData.value = null
    deleteModal.value = false
}

const confirmDelete = async () => {
    await holidayStore.deleteHoliday(deleteData.value.id)
    cancelDelete()
}

const isListView = ref(true)
const selectedMonth = ref(null)

const switchToList = () => {
    isListView.value = true
}

const switchToCalendar = () => {
    isListView.value = false

    const currentYear = yearOptions.value.current
    selectedMonth.value = `${currentYear}-01` // default Jan

    holidayStore.fetchHolidayCalendar(selectedMonth.value)
}

/* -----------------------------------------
   ON MOUNT
----------------------------------------- */
onMounted(async () => {
    if (authStore.organization) {
        organization_id.value = authStore.organization
    }

    // Set default year = current year
    filter_year.value = new Date().getFullYear()

    await fetchHolidays()
});
</script>
