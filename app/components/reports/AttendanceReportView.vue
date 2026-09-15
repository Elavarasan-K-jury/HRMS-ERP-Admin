<template>
    <UiSidebarModal v-model="model" title="Attendance Report" size="650px">
        <template #default>

            <!-- LOADING -->
            <div v-if="loading" class="flex items-center justify-center py-20">
                <UiLoader />
            </div>

            <!-- REPORT CONTENT -->
            <div v-else-if="report" class="space-y-5 h-[70vh] overflow-y-auto custom-scroll">
                <!-- HEADER SUMMARY -->
                <div class="grid grid-cols-12 gap-3">
                    <div class="col-span-4 p-3 bg-white/10 rounded-lg border border-white/30">
                        <div class="text-[11px] uppercase tracking-widest text-white/60">Status</div>
                        <div class="mt-1">
                            <span class="px-2 py-1 rounded-full text-[11px] font-medium border"
                                :class="statusClass(report.status)">
                                {{ report.status }}
                            </span>
                        </div>
                    </div>

                    <div class="col-span-4 p-3 bg-white/10 rounded-lg border border-white/30">
                        <div class="text-[11px] uppercase tracking-widest text-white/60">Start Date</div>
                        <div class="text-sm mt-1">{{ report.start_date || '—' }}</div>
                    </div>

                    <div class="col-span-4 p-3 bg-white/10 rounded-lg border border-white/30">
                        <div class="text-[11px] uppercase tracking-widest text-white/60">End Date</div>
                        <div class="text-sm mt-1">{{ report.end_date || '—' }}</div>
                    </div>

                    <div class="col-span-6 p-3 bg-white/10 rounded-lg border border-white/30">
                        <div class="text-[11px] uppercase tracking-widest text-white/60">Initiated At</div>
                        <div class="text-sm mt-1">{{ formatDate(report.initiated_at) }}</div>
                    </div>

                    <div class="col-span-6 p-3 bg-white/10 rounded-lg border border-white/30">
                        <div class="text-[11px] uppercase tracking-widest text-white/60">Completed At</div>
                        <div class="text-sm mt-1">{{ formatDate(report.completed_at) }}</div>
                    </div>

                    <NuxtLink target="_blank" v-if="pdfUrl" :to="pdfUrl"
                        class="col-span-12 cursor-pointer p-3 bg-white/10 rounded-lg border border-white/30 flex items-center justify-center uppercase">
                        <Icon name="lucide:eye" class="w-4 h-4 mr-2" />
                        Report PDF
                    </NuxtLink>
                </div>

                <!-- FAIL REASON -->
                <div v-if="report.failing_reason"
                    class="p-3 bg-rose-500/10 border border-rose-400/20 rounded-lg text-rose-200 text-sm">
                    <b>Error:</b> {{ report.failing_reason }}
                </div>

                <!-- DAY SECTIONS -->
                <div class="flex flex-col gap-3">
                    <div v-for="day in report.data" :key="day.date"
                        class="rounded-lg bg-white/10 border border-white/30 overflow-hidden">
                        <!-- DAY HEADER -->
                        <button class="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition"
                            @click="toggleDay(day.date)">
                            <div class="flex items-center gap-3">
                                <div class="text-left">
                                    <div class="text-lg font-semibold">
                                        {{ formatFullDate(day.date) }}
                                    </div>
                                    <div class="text-xs text-white/60">
                                        {{ day.attendance.length }} employee records
                                    </div>
                                </div>
                            </div>

                            <svg class="w-5 h-5 transition-transform" :class="expandedDays[day.date] ? 'rotate-90' : ''"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        <!-- DAY CONTENT -->
                        <div v-if="expandedDays[day.date]" class="border-t border-white/30 bg-black/20">
                            <div v-for="att in day.attendance" :key="att.attendance_id" class="border-b border-white/5">
                                <!-- EMPLOYEE ROW -->
                                <button type="button"
                                    class="w-full grid grid-cols-12 gap-3 px-4 py-3 hover:bg-white/10 transition"
                                    @click="toggleEmployee(day.date, att.employee.id)">
                                    <div class="col-span-4 flex items-start gap-3">
                                        <div
                                            class="hidden sm:flex p-2 rounded-full items-center justify-center text-sm font-semibold bg-gradient-to-br from-sky-500 to-emerald-500">
                                            {{ initials(att.employee.name) }}
                                        </div>

                                        <div class="flex flex-col justify-start items-start">
                                            <div class="text-sm font-semibold">
                                                {{ att.employee.name }}
                                            </div>
                                            <div class="text-xs text-white/50">
                                                {{ att.employee.email }}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-span-2 font-mono text-xs sm:text-sm">
                                        {{ formatTime(att.check_in) }}
                                    </div>

                                    <div class="col-span-2 font-mono text-xs sm:text-sm">
                                        {{ formatTime(att.check_out) }}
                                    </div>

                                    <div class="col-span-2 text-xs sm:text-sm">
                                        <div class="font-mono">
                                            {{ formatHours(att.gross_hours) }}
                                        </div>
                                        <div class="text-[11px] text-white/50">
                                            Eff: {{ formatHours(att.effective_hours) }}
                                        </div>
                                    </div>

                                    <div class="col-span-2 flex justify-end items-center">
                                        <span class="px-2 py-1 rounded-full text-[10px] font-medium border"
                                            :class="statusChip(att.status)">
                                            {{ att.status }}
                                        </span>
                                    </div>
                                </button>

                                <!-- LOGS (MATCHING YOUR MONTHLY ATTENDANCE DESIGN) -->
                                <div v-if="expandedEmployees[key(day.date, att.employee.id)]"
                                    class="px-4 pb-4 bg-black/30">
                                    <div class="text-xs text-white/60 uppercase tracking-widest mb-1">
                                        Activity Log
                                    </div>

                                    <div class="h-40 overflow-y-auto pr-1 custom-scroll">
                                        <div class="grid grid-cols-2 gap-1.5 text-xs">

                                            <!-- IN/OUT PAIRED ROWS (Your Exact Design) -->
                                            <template v-for="(pair, index) in buildPairs(att.logs)" :key="index">
                                                <div v-if="pair.in"
                                                    class="flex items-center gap-1 bg-white/10 border border-white/30 px-2 py-1.5 rounded">
                                                    <span
                                                        class="px-2 py-0.5 rounded-md bg-emerald-600 text-emerald-200 font-semibold">
                                                        IN
                                                    </span>
                                                    <span class="font-mono">{{ formatDate(pair.in.created_at) }}</span>
                                                </div>
                                                <div v-else class="h-9"></div>

                                                <div v-if="pair.out"
                                                    class="flex items-center gap-1 bg-white/10 border border-white/30 px-2 py-1.5 rounded">
                                                    <span
                                                        class="px-2 py-0.5 rounded-md bg-amber-600 text-amber-200 font-semibold">
                                                        OUT
                                                    </span>
                                                    <span class="font-mono">{{ formatDate(pair.out.created_at) }}</span>
                                                </div>
                                                <div v-else class="h-9"></div>
                                            </template>

                                            <!-- EMPTY -->
                                            <div v-if="!att.logs?.length"
                                                class="col-span-2 text-center text-[11px] text-white/50 py-3">
                                                No logs recorded
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- END LOGS -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- EMPTY -->
            <div v-else class="text-center py-12 text-white/50">No report data available.</div>

        </template>

        <template #footer>
            <UiButton color="#fff" text="Close" prepend-icon="ion:close-circle" @click="closeModal" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed, reactive, watch } from "vue"
import { useAttendanceReportsStore } from "../../stores/organization/attendanceReport.store"
import { useRouter, useRoute } from "vue-router"

const model = defineModel()
const props = defineProps({ reportId: String })
const config = useRuntimeConfig()

const store = useAttendanceReportsStore()
const loading = computed(() => store.loading)
const report = computed(() => store.singleReport)

const expandedDays = reactive({})
const expandedEmployees = reactive({})
const toggleDay = (d) => (expandedDays[d] = !expandedDays[d])
const toggleEmployee = (d, e) => (expandedEmployees[`${d}-${e}`] = !expandedEmployees[`${d}-${e}`])
const key = (d, e) => `${d}-${e}`

watch(model, async (v) => v && store.fetchReportById(props.reportId))

const closeModal = () => (model.value = false)

const formatDate = (d) => new Date(d).toLocaleString()
const formatTime = (d) => (d ? new Date(d).toLocaleTimeString() : "—")

const formatHours = (h) => `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`
const initials = (n) => n.split(" ").map((x) => x[0]).join("")

const pdfUrl = computed(() => report.value.pdf_url && report.value.pdf_url != "" ? `/pdf-view?url=${config.public.apiBase}${report.value.pdf_url}` : null)

const buildPairs = (logs) => {
    const pairs = []
    let i = 0
    while (i < logs.length) {
        if (logs[i].type === "CHECK_IN" && logs[i + 1]?.type === "CHECK_OUT")
            pairs.push({ in: logs[i++], out: logs[i++] })
        else if (logs[i].type === "CHECK_IN")
            pairs.push({ in: logs[i++], out: null })
        else pairs.push({ in: null, out: logs[i++] })
    }
    return pairs
}

const statusClass = (s) =>
({
    COMPLETED: "border-emerald-400/50 text-emerald-200 bg-emerald-500/10",
    FAILED: "border-rose-400/50 text-rose-200 bg-rose-500/10",
    PROCESSING: "border-sky-400/50 text-sky-200 bg-sky-500/10",
}[s] || "border-white/40 text-white bg-white/10")

const statusChip = statusClass

const formatFullDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 6px;
}
</style>
