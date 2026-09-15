<template>
    <div class="h-[calc(100vh-4rem)] overflow-y-auto text-white">
        <div class="max-w-full grid grid-cols- mx-auto p-2 space-y-2">

            <!-- Header -->
            <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div class="w-1/2">
                    <p class="text-xs uppercase tracking-[0.3em] text-white/40 font-semibold">
                        HRMS
                    </p>
                    <h1 class="text-2xl md:text-3xl font-semibold">
                        Attendance History
                    </h1>
                    <p class="text-xs text-white/60 mt-1">
                        View all check-ins, check-outs, work durations and audit logs.
                    </p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-col md:flex-row gap-3">

                <!-- Year Select -->
                <div class="w-[200px] flex flex-col items-start">
                    <label class="text-xs text-white/60 uppercase tracking-widest block mb-1">Year</label>
                    <FormSelect @select="on7YearChange" id="departent_head" class="w-full" color="#fff"
                        prepend-icon="lucide:calendar" v-model="year" :options="years" searchable size="lg" rounded="lg"
                        placeholder="Year" />
                </div>

                <!-- Month Select -->
                <div class="w-[200px] flex flex-col items-start">
                    <label class="text-xs text-white/60 uppercase tracking-widest block mb-1">Month</label>
                    <FormSelect width="300px" :fullWidth="false" id="departent_head" class="w-full" color="#fff"
                        prepend-icon="heroicons:calendar" v-model="month" :options="availableMonths" searchable
                        size="lg" rounded="lg" placeholder="Department" />
                    <span v-if="!month" class="text-sm text-red-500 mt-1">Select the month to reload.</span>
                </div>

            </div>

            <!-- Attendance List -->
            <div v-if="loading"
                class="rounded-lg h-64 flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.85)]">
                <UiLoader />
            </div>
            <div v-else
                class="rounded-lg bg-white/10 border border-white/20 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.85)] overflow-hidden">

                <table v-if="attendances.length" class="w-full text-left border-collapse">
                    <!-- Header -->
                    <thead class="uppercase text-[11px] text-white/50 tracking-[0.18em] border-b border-white/10">
                        <tr>
                            <th class="px-4 py-3 w-32">Date</th>
                            <th class="px-4 py-3">Work Duration</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 w-[230px]">Check In</th>
                            <th class="px-4 py-3 w-[230px]">Check Out</th>
                            <th class="px-4 py-3 w-24 text-right">Logs</th>
                        </tr>
                    </thead>

                    <!-- Body -->
                    <tbody v-if="attendances.length" class="divide-y divide-white/5">
                        <tr v-for="att in attendances" :key="att.id" class="hover:bg-white/5 transition rounded-xl">

                            <!-- Date -->
                            <td class="px-4 py-4 w-32 font-mono text-xs text-white/85">
                                {{ att.date }}
                            </td>

                            <!-- Duration -->
                            <td class="px-4 py-4 text-white/85">
                                <div class="font-semibold text-lg">
                                    {{ formatHours(att.effective_hours) }}
                                </div>
                                <div class="text-white/50 text-xs">
                                    Gross Hours: {{ formatHours(att.gross_hours) }}
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="px-4 py-4 text-white/85">
                                {{ att.status.replaceAll('_', ' ') }}
                            </td>

                            <!-- Check In -->
                            <td class="px-4 py-4 w-[230px] text-white/85">
                                {{ att.check_in || '-' }}
                            </td>

                            <!-- Check Out -->
                            <td class="px-4 py-4 w-[230px] text-white/85">
                                {{ att.check_out || '-' }}
                            </td>

                            <!-- Logs -->
                            <td class="px-4 py-4 w-24 text-right">
                                <UiButton @click="openAttendanceSidebar(att)" size="xs" color="#fff">
                                    View
                                </UiButton>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-else class="px-4 py-6 text-center text-sm text-white/60">
                    No attendance records for this month.
                </div>
            </div>
        </div>
    </div>
    <UiSidebarModal v-model="sidebarOpen" :title="'Attendance Details – ' + (selected?.date || '')">
        <!-- BODY -->
        <template #default>
            <div class="space-y-6 p-1 text-white/90">

                <!-- Date -->
                <section>
                    <h3 class="text-[11px] uppercase tracking-wide text-white/40 mb-1">Date</h3>
                    <p class="font-mono text-sm">{{ selected?.date }}</p>
                </section>

                <!-- Employee -->
                <section>
                    <h3 class="text-[11px] uppercase tracking-wide text-white/40 mb-2">Employee</h3>

                    <div class="space-y-1 text-sm">
                        <p><span class="text-white/50">Name:</span> {{ selected?.employee.first_name }} {{
                            selected?.employee.last_name }}</p>
                        <p><span class="text-white/50">Email:</span> {{ selected?.employee.email }}</p>
                        <p><span class="text-white/50">Phone:</span> {{ selected?.employee.phone }}</p>
                    </div>
                </section>

                <!-- Organization -->
                <section>
                    <h3 class="text-[11px] uppercase tracking-wide text-white/40 mb-2">Organization</h3>

                    <div class="space-y-1 text-sm">
                        <p><span class="text-white/50">Name:</span> {{ selected?.organization.name }}</p>
                        <p><span class="text-white/50">Domain:</span> {{ selected?.organization.domain }}</p>
                        <p><span class="text-white/50">Email:</span> {{ selected?.organization.email }}</p>
                        <p><span class="text-white/50">Industry:</span> {{ selected?.organization.industry }}</p>
                    </div>
                </section>

                <!-- Summary -->
                <section>
                    <h3 class="text-[11px] uppercase tracking-wide text-white/40 mb-2">Summary</h3>

                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-white/50 text-xs">Check In</p>
                            <p class="font-mono">{{ selected?.check_in || '-' }}</p>
                        </div>

                        <div>
                            <p class="text-white/50 text-xs">Check Out</p>
                            <p class="font-mono">{{ selected?.check_out || '-' }}</p>
                        </div>

                        <div>
                            <p class="text-white/50 text-xs">Gross Hours</p>
                            <p class="font-mono">{{ formatHours(selected?.gross_hours) }}</p>
                        </div>

                        <div>
                            <p class="text-white/50 text-xs">Effective Hours</p>
                            <p class="font-mono">{{ formatHours(selected?.effective_hours) }}</p>
                        </div>

                        <div>
                            <p class="text-white/50 text-xs">Late Arrival</p>
                            <p class="font-mono">{{ selected?.late_arrival_minutes }} min</p>
                        </div>

                        <div>
                            <p class="text-white/50 text-xs">Status</p>
                            <p class="font-mono uppercase">{{ selected?.status }}</p>
                        </div>
                    </div>
                </section>

                <!-- Logs -->
                <section>
                    <h3 class="text-[11px] uppercase tracking-wide text-white/40 mb-2">Logs</h3>

                    <div v-if="selected?.logs?.length" class="space-y-3">
                        <div v-for="log in selected.logs" :key="log.id"
                            class="bg-white/5 border border-white/10 rounded-lg p-3">
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-bold"
                                    :class="log.type === 'CHECK_IN' ? 'text-green-400' : 'text-red-400'">
                                    {{ log.type.replace('_', ' ') }}
                                </span>

                                <span class="text-[11px] text-white/50 font-mono">
                                    {{ log.createdAt }}
                                </span>
                            </div>

                            <div class="mt-2 text-xs space-y-1 text-white/80">
                                <p><span class="text-white/40">IP:</span> {{ log.ipAddress }}</p>
                                <p>
                                    <span class="text-white/40">Location:</span>
                                    {{ log.geoLocation.latitude }}, {{ log.geoLocation.longitude }}
                                </p>

                                <p class="text-white/40">Source:</p>
                                <pre
                                    class="bg-black/20 p-2 rounded-md whitespace-pre-wrap text-[10px] font-mono text-white/70">
{{ JSON.parse(log.source).source }}
                            </pre>
                            </div>
                        </div>
                    </div>

                    <p v-else class="text-white/40 text-sm">No logs available</p>
                </section>

            </div>
        </template>

        <!-- FOOTER -->
        <template #footer>
            <UiButton color="#fff" text="Close" prepend-icon="ion:close-circle" @click="sidebarOpen = false" />

            <UiButton color="#4aff7a" text="Export Logs" prepend-icon="ion:download-outline" @click="exportLogs" />
        </template>
    </UiSidebarModal>

</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEmployeeAttendanceStore as useAttendanceStore } from '../../../../../stores/employee/attendance.store'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { storeToRefs } from 'pinia';
definePageMeta({ layout: 'employee' });

const attendanceStore = useAttendanceStore()

/* -------------------------
   YEAR SELECT (2025 → now)
-------------------------- */
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2025 + 1 }, (_, i) => ({
    value: 2025 + i,
    label: 2025 + i
}))


const sidebarOpen = ref(false)
const selected = ref(null)

const openAttendanceSidebar = (att) => {
    selected.value = att
    sidebarOpen.value = true
}
/* ----------------------------------------------------
   MAIN EXPORT FUNCTION
---------------------------------------------------- */
const exportLogs = () => {
    if (!selected.value) return;

    const data = selected.value;
    const logs = data.logs || [];

    const doc = new jsPDF({
        unit: "pt",
        format: "a4",
        orientation: "portrait",
    });

    const margin = 40;
    let y = margin;

    /* ============================================================
       HEADER TITLE
    ============================================================ */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ATTENDANCE DETAIL", margin, y);

    y += 26;

    doc.setFontSize(16);
    doc.text(`${data.employee.first_name} ${data.employee.last_name}`, margin, y);

    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(data.date, margin, y);

    // Reset text color
    doc.setTextColor(0);
    y += 35;

    /* ============================================================
       SUMMARY CARDS (clean, compact)
    ============================================================ */

    const card = (x, title, value, rightValue) => {
        doc.setDrawColor(220);
        doc.roundedRect(x, y, 230, 60, 6, 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, x + 12, y + 18);

        doc.setFontSize(18);
        doc.setTextColor(20);
        doc.text(value, x + 12, y + 42);

        if (rightValue) {
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(rightValue, x + 12, y + 54);
        }

        doc.setTextColor(0);
    };

    card(margin, "Gross Hours", `${data.gross_hours.toFixed(2)} hrs`, "First → Last check");
    card(margin + 250, "Effective Hours", `${data.effective_hours.toFixed(2)} hrs`, "Net working time");

    y += 80;

    card(margin, "Late Arrival", `${data.late_arrival_minutes} min`, "Compared to schedule");
    card(margin + 250, "Log Events", `${logs.length}`, "Total check-ins / outs");

    y += 95;

    /* ============================================================
        EMPLOYEE PANEL
    ============================================================ */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Employee", margin, y);
    y += 15;

    doc.setDrawColor(220);
    doc.roundedRect(margin, y, 240, 110, 6, 6);

    let ey = y + 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Name:", margin + 12, ey);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.employee.first_name} ${data.employee.last_name}`, margin + 80, ey);

    ey += 18;
    doc.setFont("helvetica", "normal");
    doc.text("Email:", margin + 12, ey);
    doc.setFont("helvetica", "bold");
    doc.text(data.employee.email, margin + 80, ey);

    ey += 18;
    doc.setFont("helvetica", "normal");
    doc.text("Phone:", margin + 12, ey);
    doc.setFont("helvetica", "bold");
    doc.text(data.employee.phone, margin + 80, ey);

    /* ============================================================
        ORGANIZATION PANEL
    ============================================================ */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Organization", margin + 280, y - 15);

    doc.setDrawColor(220);
    doc.roundedRect(margin + 280, y, 240, 110, 6, 6);

    let oy = y + 20;

    const org = data.organization;
    const orgRows = [
        ["Name", org.name],
        ["Website", org.domain],
        ["Email", org.email],
        ["Industry", org.industry],
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    orgRows.forEach(([label, value]) => {
        doc.text(`${label}:`, margin + 292, oy);
        doc.setFont("helvetica", "bold");
        doc.text(value || "-", margin + 360, oy);
        doc.setFont("helvetica", "normal");
        oy += 18;
    });

    y += 140;

    /* ============================================================
       LOG TABLE TITLE
    ============================================================ */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Attendance Logs (${logs.length})`, margin, y);

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
        `${logs.length} events • ${data.check_in || "—"} → ${data.check_out || "—"}`,
        margin,
        y
    );
    doc.setTextColor(0);

    y += 20;

    /* ============================================================
       LOG TABLE (IMPROVED LAYOUT)
    ============================================================ */

    const tableRows = logs.map((log) => {
        const src = parseSource(log.source);
        const browser = src.browser || "-";
        const os = src.os || "-";
        const location = `${log.geoLocation?.latitude?.toFixed(6)}, ${log.geoLocation?.longitude?.toFixed(6)}`;

        return [
            log.createdAt,
            log.type,
            log.ipAddress,
            location,
            browser,
            os,
        ];
    });

    autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: {
            fontSize: 9,
            cellPadding: 5,
            overflow: "hidden",   // prevents multi-line location wrapping
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: 0,
            fontStyle: "bold",
        },
        columnStyles: {
            0: { cellWidth: 110 },
            1: { cellWidth: 60, halign: "center" },
            2: { cellWidth: 90 },
            3: { cellWidth: 100 },
            4: { cellWidth: 80 },
            5: { cellWidth: 70 },
        },
        head: [["Time", "Type", "IP", "Location", "Browser", "OS"]],
        body: tableRows,
        margin: { left: margin },
    });

    /* SAVE PDF */
    const filename = `Attendance_${data.date.replace(/\//g, "-")}.pdf`;
    doc.save(filename);
};


const {
    month,
    year,
    loading
} = storeToRefs(attendanceStore)


watch(month, async () => {
    if (month.value) {
        await attendanceStore.getAttendancesList()
    }
})

const parseSource = (src) => {
    try {
        return JSON.parse(src)
    } catch {
        return {}
    }
}

/* ------------------------------
   MONTH LIST (auto-trim current)
------------------------------- */
const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
]

const availableMonths = computed(() => {
    if (year.value === currentYear) {
        const upto = new Date().getMonth() + 1
        return MONTHS.filter(m => m.value <= upto)
    }
    return MONTHS
})

/* -----------------------
   Auto-reset month
------------------------ */
const onYearChange = () => {
    if (year.value === currentYear) {
        const currentMonth = new Date().getMonth() + 1
        if (month.value > currentMonth) {
            month.value = null
        }
    }
}

/* -----------------------
   Attendance Filtering
------------------------ */

const attendances = computed(() => attendanceStore.attendanceList ?? [])

/* -----------------------
   Format Duration
------------------------ */
const formatHours = (h) => {
    if (!h) return "00:00:00"
    const secs = Math.floor(h * 3600)
    const hr = Math.floor(secs / 3600)
    const rem = secs % 3600
    const mm = Math.floor(rem / 60)
    const ss = rem % 60
    return `${hr.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

onMounted(async () => {
    await attendanceStore.getAttendancesList()
});
</script>
