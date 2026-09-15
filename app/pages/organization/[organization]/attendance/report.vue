<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">

            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ total }} Attendance Report(s)
            </h2>

            <div class="flex items-center gap-2">
                <!-- <UiSearch :color="search ? '#4aff7a' : '#fff'" v-model="search" :suggestions="filteredResults"
                    :loading="loading" @search="runSearch" @select="selectSuggestion" /> -->

                <!-- Generate -->
                <UiButton @click="openGenerateModal" color="#4aff7a" text="Generate Report"
                    prepend-icon="ion:add-circle" />

                <!-- Reload -->
                <UiButton @click="fetchReports" :disabled="loading || autoRefreshing"
                    :text="loading || autoRefreshing ? 'Reloading…' : 'Reload'"
                    :prepend-icon="loading || autoRefreshing ? 'ion:reload-circle' : 'ion:refresh'"
                    :color="loading || autoRefreshing ? '#999' : '#fff'" />
            </div>
        </div>

        <!-- TABLE -->
        <AttendanceReportsTable :items="reports" :loading="loading" :page="page" :limit="limit" :total="total"
            @view="viewReport" @page-change="changePage" />

    </div>

    <!-- VIEW MODAL -->
    <AttendanceReportView v-model="viewModal" :reportId="viewData" />

    <!-- GENERATE SIDEBAR -->
    <UiSidebarModal v-model="generateModal" title="Generate Attendance Report">
        <template #default>
            <GenerateReportForm />
        </template>

        <template #footer>
            <UiButton @click="closeGenerateForm" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
            <UiButton @click="submitGenerateReport" color="#4aff7a" text="Generate" prepend-icon="ion:cloud-upload" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue"
import { storeToRefs } from "pinia"

import { useAttendanceReportsStore } from "../../../../stores/organization/attendanceReport.store"
import AttendanceReportsTable from "../../../../components/reports/AttendanceReportsTable.vue"
import AttendanceReportView from "../../../../components/reports/AttendanceReportView.vue"
import GenerateReportForm from "../../../../components/reports/AttendanceGenerateReportForm.vue"

definePageMeta({
    layout: "organization",
    key: route => route.fullPath
})

/* STORE */
const store = useAttendanceReportsStore()
const {
    reports,
    loading,
    page,
    limit,
} = storeToRefs(store)

const total = computed(() => store.total)

/* --------------------------------------
   🔁 Auto-refresh visual state
-------------------------------------- */
const autoRefreshing = computed(() =>
    reports.value.some(r => r.status !== "COMPLETED" && r.status !== "FAILED")
)

/* SEARCH */
const search = ref("")
const filteredResults = ref([])

watch(search, () => {
    filteredResults.value = search.value
        ? reports.value
            .filter(r => r.id.toLowerCase().includes(search.value.toLowerCase()))
            .map(r => ({ label: r.id, value: r.id }))
        : []
})

const runSearch = () => { }
const selectSuggestion = (item) => {
    const report = reports.value.find(r => r.id === item.value)
    if (report) viewReport(report)
}

/* MODALS */
const viewModal = ref(false)
const generateModal = ref(false)
const viewData = ref(null)

/* Action Handlers */
const fetchReports = async () => {
    await store.fetchReports({ page: page.value, limit: limit.value })
}

const changePage = async (newPage) => {
    store.page = newPage
    await fetchReports()
}

const openGenerateModal = () => {
    store.resetGenerateForm()
    generateModal.value = true
}

const closeGenerateForm = () => {
    generateModal.value = false
}

const submitGenerateReport = async () => {
    await store.generateReport()
    generateModal.value = false
}

const viewReport = (report) => {
    viewData.value = report.id
    viewModal.value = true
}

/* INIT */
onMounted(async () => {
    await fetchReports()
});
</script>
