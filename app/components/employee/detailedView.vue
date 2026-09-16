<template>
    <div>
        <UiSidebarModal v-model="open" @close="close" :title="`Employee: ${employee?.display_name || employee?.full_name || '—'}`" size="xl">
            <template #default>
                <div v-if="employee && !loading" class="cv-auto text-white/90">
                    <!-- 🌟 Profile Header -->
                    <section class="blk">
                        <div class="profile-card">
                            <div class="avatar">
                                <span>{{ initials }}</span>
                            </div>

                            <div class="profile-main">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <h2 class="profile-name">
                                        {{ employee.display_name || employee.full_name || '—' }}
                                    </h2>
                                    <span v-if="employee.display_name" class="profile-sub">{{ employee.full_name }}</span>
                                    <span v-if="employee.employee_code" class="chip chip-soft">
                                        <Icon name="lucide:badge-check" class="chip-ic" />
                                        {{ employee.employee_code }}
                                    </span>
                                    <span class="chip" :class="employee.is_active ? 'chip-green' : 'chip-red'">
                                        <Icon :name="employee.is_active ? 'lucide:check-circle' : 'lucide:x-circle'"
                                            class="chip-ic" />
                                        {{ employee.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </div>

                                <div class="profile-meta">
                                    <div class="meta-item">
                                        <Icon name="lucide:briefcase" class="meta-ic" />
                                        <span>{{ employee.designation?.name || '—' }}</span>
                                    </div>
                                    <div class="meta-item">
                                        <Icon name="lucide:building-2" class="meta-ic" />
                                        <span>{{ employee.organization?.name || '—' }}</span>
                                    </div>
                                    <div class="meta-item">
                                        <Icon name="lucide:layers" class="meta-ic" />
                                        <span>{{ employee.category?.name || '—' }}</span>
                                    </div>
                                </div>

                                <div class="profile-contact">
                                    <div class="meta-item">
                                        <Icon name="lucide:mail" class="meta-ic" />
                                        <span class="meta-tag">Work Email</span>
                                        <span>{{ employee.email || '—' }}</span>
                                    </div>
                                    <div v-if="employee.personal_email" class="meta-item">
                                        <Icon name="lucide:mail-plus" class="meta-ic" />
                                        <span class="meta-tag">Personal</span>
                                        <span>{{ employee.personal_email }}</span>
                                    </div>
                                    <div class="meta-item">
                                        <Icon name="lucide:phone" class="meta-ic" />
                                        <span class="meta-tag">Personal #</span>
                                        <span>{{ employee.phone || '—' }}</span>
                                    </div>
                                    <div v-if="employee.alt_phone" class="meta-item">
                                        <Icon name="lucide:phone-call" class="meta-ic" />
                                        <span class="meta-tag">Work #</span>
                                        <span>{{ employee.alt_phone }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- 📂 Employment Info -->
                    <section class="blk">
                        <h2 class="hdr">
                            <Icon name="lucide:id-card" class="ic" /> Employment Details
                        </h2>
                        <div class="grid2">
                            <div>
                                <span class="label">Employee Code</span>
                                {{ employee.employee_code || '—' }}
                            </div>
                            <div>
                                <span class="label">Joining Date</span>
                                {{ employee.joining_date || '—' }}
                            </div>
                            <div>
                                <span class="label">Organization</span>
                                {{ employee.organization?.name || '—' }}
                            </div>
                            <div>
                                <span class="label">Employment Status</span>
                                <span v-if="employmentStatusLabel === 'Permanent'" class="chip chip-green">
                                    <Icon name="lucide:shield-check" class="chip-ic" />
                                    Permanent
                                </span>
                                <span v-else class="chip chip-soft">
                                    <Icon name="lucide:hourglass" class="chip-ic" />
                                    {{ employmentStatusLabel }}
                                </span>
                            </div>
                            <div>
                                <span class="label">Worker Type</span>
                                {{ workerTypeLabel }}
                            </div>
                            <div>
                                <span class="label">Category</span>
                                {{ employee.is_permanent ? '—' : (employee.category?.name || '—') }}
                            </div>
                            <div>
                                <span class="label">Designation</span>
                                {{ employee.designation?.name || '—' }}
                            </div>
                            <div>
                                <span class="label">Department</span>
                                <div v-if="employee.departments?.length" class="flex flex-col gap-1">
                                    <div v-for="d in employee.departments" :key="d.id">
                                        <div class="flex items-start gap-2">
                                            <span class="text-white/90 font-medium">{{ formatDept(d) }}</span>
                                        </div>
                                        <div v-if="d.reporting_to_name" class="text-xs text-white/60 mt-0.5 flex items-center gap-1">
                                            <Icon name="lucide:user" class="w-3 h-3" />
                                            Reports to: {{ d.reporting_to_name }}
                                        </div>
                                    </div>
                                </div>
                                <span v-else>—</span>
                            </div>
                            <div>
                                <span class="label">Reporting Manager</span>
                                <span v-if="reportingManager" class="text-white/90 flex items-center gap-1">
                                    <Icon name="lucide:user-round" class="w-4 h-4 text-blue-400" />
                                    {{ reportingManager }}
                                </span>
                                <span v-else>—</span>
                            </div>
                        </div>
                    </section>

                    <!-- 🧍 Personal Info -->
                    <section class="blk">
                        <h2 class="hdr">
                            <Icon name="lucide:user-round" class="ic" /> Personal Info
                        </h2>
                        <div class="grid2">
                            <div>
                                <span class="label">Full Name</span>
                                {{ employee.full_name || '—' }}
                            </div>
                            <div>
                                <span class="label">Display Name</span>
                                {{ employee.display_name || '—' }}
                            </div>
                            <div>
                                <span class="label">Gender</span>
                                <span class="chip chip-soft">
                                    <Icon name="lucide:user" class="chip-ic" />
                                    {{ formatGender(employee.gender) }}
                                </span>
                            </div>
                            <div>
                                <span class="label">Date of Birth</span>
                                {{ employee.date_of_birth || '—' }}
                            </div>
                            <div>
                                <span class="label">Marital Status</span>
                                {{ employee.marital_status || '—' }}
                            </div>
                            <div>
                                <span class="label">Blood Group</span>
                                {{ employee.blood_group || '—' }}
                            </div>
                            <div>
                                <span class="label">Nationality</span>
                                {{ employee.nationality || '—' }}
                            </div>
                            <div>
                                <span class="label">Physically Handicapped</span>
                                {{ employee.physically_handicapped ? 'Yes' : 'No' }}
                            </div>
                        </div>
                    </section>
                </div>

                <div v-else class="center">
                    <Icon name="lucide:loader-2" class="spin ic mr-2" /> Loading employee details...
                </div>
            </template>

            <template #footer>
                <div class="footer flex gap-2">
                    <UiButton @click="openReportView(employee.id)" text="Report" color="#fff" />
                    <NuxtLink v-if="employee" target="_blank"
                        :to="getUserProfileUrl(employee.id, employee.organization_id)">
                        <UiButton text="Open Profile" color="#fff" />
                    </NuxtLink>
                    <UiButton text="Close" color="#4aff7a" @click="close" />
                </div>
            </template>
        </UiSidebarModal>
        <UiSidebarModal :showFooter="false" v-model="openReport" @close="closeReportView"
            :title="`Report: ${employee?.full_name || '—'}`" width="900px">
            <template #default>
                <div v-if="loadingReport" class="w-full h-full flex items-center justify-center">
                    <UiLoader />
                </div>
                <div v-else v-html="report.html" />
            </template>
        </UiSidebarModal>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useEmployeesStore } from '../../stores/organization/employee.store'
import { useDepartmentStore } from '../../stores/organization/department.store'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const employeesStore = useEmployeesStore()
const departmentStore = useDepartmentStore()
const loading = ref(false)
const employee = ref(null)
const props = defineProps({
    modelValue: { type: Boolean, default: false },
    id: { type: String, default: null },
})

const emit = defineEmits(['update:modelValue'])

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

const openReport = computed(() => route.query.report || false)
const report = computed(() => employeesStore.employeeReport)
const loadingReport = ref(true)

const openReportView = (empid) => {
    router.push({ query: { employee_id: empid, preview: true, report: true } })
}

const close = () => {
    emit('update:modelValue', false)
    router.push({ query: {} })
}
const closeReportView = () => {
    const { report, ...rest } = router.currentRoute.value.query

    router.push({
        query: {
            ...rest
        }
    })
}
const initials = computed(() => {
    const e = employee.value
    if (!e) return '—'
    const src = e.display_name || e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim()
    if (!src) return '—'
    return src
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
})

function formatGender(g) {
    if (!g) return '—'
    const up = String(g).toUpperCase()
    if (up === 'MALE') return 'Male'
    if (up === 'FEMALE') return 'Female'
    if (up === 'OTHER') return 'Other'
    return g
}

const getUserProfileUrl = (employeeId, orgId) => `/organization/${orgId}/employee/${employeeId}/profile`

const formatDept = (d) => {
    const dept = d.department
    if (!dept) return '—'
    if (dept.parent) return `${dept.parent.name} >> ${dept.name}`
    const found = departmentStore.department_select.find(ds => ds.value === dept.id)
    if (found?.parent_id) {
        const parent = departmentStore.department_select.find(ds => ds.value === found.parent_id)
        if (parent) return `${parent.label.replace(/^—+\s*/, '')} >> ${dept.name}`
    }
    return dept.name
}

const reportingManager = computed(() => {
    if (!employee.value?.manager_id) return null
    const mgr = employeesStore.all_employees?.find(e => e.id === employee.value.manager_id)
    return mgr ? mgr.full_name || `${mgr.first_name || ''} ${mgr.last_name || ''}`.trim() : null
})

const employmentStatusLabel = computed(() => {
    const raw = employee.value?.employment_status
        || (employee.value?.is_permanent ? 'PERMANENT' : (employee.value?.category?.employment_type || 'PROBATION'))
    return ({
        PERMANENT: 'Permanent',
        PROBATION: 'Probation',
        INTERNSHIP: 'Internship',
        TRAINEE: 'Trainee',
        CONTRACT: 'Contract',
    })[raw] || 'Probationary'
})

const workerTypeLabel = computed(() => {
    const wt = employee.value?.worker_type
    const map = {
        FULL_TIME: 'Full-time',
        PART_TIME: 'Part-time',
        CONTRACT: 'Contract',
        INTERN: 'Intern',
        PERMANENT: 'Permanent',
    }
    if (wt && map[wt]) return map[wt]
    if (wt) return wt.charAt(0) + wt.slice(1).toLowerCase()
    return employee.value?.is_permanent ? 'Permanent' : '—'
})

const fetchEmployeeData = async (id) => {
    if (!id) return
    loading.value = true
    if (!employeesStore.all_employees?.length) {
        await employeesStore.fetchAllEmployees()
    }
    const data = await employeesStore.fetchEmployee(id)
    if (!data) {
        loading.value = false
        return
    }
    if (openReport.value) {
        loadingReport.value = true
        await employeesStore.fetchEmployeeReport(id)
        setTimeout(() => {
            loadingReport.value = false
        }, 1000);
    }
    employee.value = data.employee
    if (employee.value?.departments) {
        employee.value.departments.forEach(d => {
            if (d.reporting_to) {
                const rpt = employeesStore.all_employees?.find(e => e.id === d.reporting_to)
                d.reporting_to_name = rpt ? rpt.full_name || `${rpt.first_name || ''} ${rpt.last_name || ''}`.trim() : null
            }
        })
    }
    loading.value = false
}

onMounted(() => {
    fetchEmployeeData(props.id)
})

watch(() => props.id, (newId) => {
    if (newId) fetchEmployeeData(newId)
})
</script>

<style scoped>
/* --- Scroll performance --- */
.scroll-area {
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable;
}

.cv-auto>section {
    content-visibility: auto;
    contain-intrinsic-size: 1px 600px;
}

/* --- Profile Card --- */
.profile-card {
    display: flex;
    gap: 16px;
    padding: 10px 12px;
    border-radius: 16px;
    background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.12), transparent),
        rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.35);
}

.avatar {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30% 20%, #4aff7a, #22c55e, #0ea5e9);
    color: #020617;
    font-weight: 800;
    font-size: 20px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.profile-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.profile-name {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: #f9fafb;
}

.profile-sub {
    font-size: 12px;
    font-weight: 500;
    color: rgba(148, 163, 184, 0.9);
}

.meta-tag {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.75);
    margin-right: 1px;
}

.profile-meta,
.profile-contact {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 12.5px;
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: rgba(241, 245, 249, 0.9);
}

.meta-ic {
    width: 14px;
    height: 14px;
    opacity: 0.9;
}

/* Chips / badges */
.chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: rgba(15, 23, 42, 0.7);
}

.chip-soft {
    background: rgba(148, 163, 184, 0.18);
    border-color: rgba(148, 163, 184, 0.35);
}

.chip-green {
    border-color: rgba(34, 197, 94, 0.7);
    background: rgba(34, 197, 94, 0.18);
    color: #bbf7d0;
}

.chip-red {
    border-color: rgba(248, 113, 113, 0.7);
    background: rgba(248, 113, 113, 0.18);
    color: #fecaca;
}

.chip-ic {
    width: 13px;
    height: 13px;
}

/* --- Sections --- */
.blk {
    padding: 6px 0;
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 4px;
    margin-bottom: 6px;
}

.ic {
    width: 16px;
    height: 16px;
    opacity: 0.85;
}

/* Grid */
.grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
    font-size: 13.5px;
    line-height: 1.35;
}

.grid2 .col2 {
    grid-column: 1 / -1;
}

/* Labels */
.label {
    display: block;
    font-size: 10.5px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 2px;
}

/* Links */
.lnk {
    color: #7dd3fc;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-style: dotted;
}

/* Footer / loading */
.footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 8px;
}

.center {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: rgba(255, 255, 255, 0.7);
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive */
@media (max-width: 640px) {
    .grid2 {
        grid-template-columns: 1fr;
        gap: 6px 12px;
    }

    .profile-card {
        flex-direction: row;
        align-items: flex-start;
    }
}
</style>
