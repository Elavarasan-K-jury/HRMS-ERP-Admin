<template>
    <UiSidebarModal v-model="open" :title="`Department: ${department?.name || '—'}`" size="xl">
        <template #default>
            <div v-if="department" class="scroll-area cv-auto text-white/90">
                <!-- 🏢 Department Info -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:briefcase" class="ic" /> Department Info
                    </h2>
                    <div class="grid2">
                        <div>
                            <span class="label">Name</span>
                            {{ department.name || '—' }} ({{ department.code || '—' }})
                        </div>
                        <div>
                            <span class="label">Employee Count</span>{{ department.employee_count ?? '—' }}
                        </div>
                        <div class="col2">
                            <span class="label">Description</span>{{ department.description || '—' }}
                        </div>
                        <div class="col2">
                            <span class="label">Note</span>{{ department.note || '—' }}
                        </div>
                    </div>
                </section>

                <!-- 🏬 Organization -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:building" class="ic" /> Organization
                    </h2>
                    <div class="grid2">
                        <div>
                            <span class="label">Name</span>{{ department.organization?.name ||
                                department.organization_name || '—' }}
                        </div>
                        <div>
                            <span class="label">Email</span>{{ department.organization?.email || '—' }}
                        </div>
                        <div>
                            <span class="label">Industry</span>{{ department.organization?.industry || '—' }}
                        </div>
                        <div>
                            <span class="label">Size</span>{{ department.organization?.size ?
                                department.organization.size + ' Employees' : '—' }}
                        </div>
                        <div>
                            <span class="label">Domain</span>
                            <a v-if="department.organization?.domain" :href="department.organization.domain"
                                target="_blank" rel="noopener" class="text-[#4aff7a] hover:underline break-all">
                                {{ department.organization.domain }}
                            </a>
                            <span v-else>—</span>
                        </div>
                        <div>
                            <span class="label">GST Number</span>{{ department.organization?.gst_number || '—' }}
                        </div>
                        <div>
                            <span class="label">Contact Person</span>{{ department.organization?.contact_person_name ||
                                '—' }}
                        </div>
                        <div>
                            <span class="label">Phone</span>{{ department.organization?.contact_person_number || '—' }}
                        </div>
                    </div>
                </section>

                <!-- 👤 Department Head -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:user" class="ic" /> Department Head
                    </h2>
                    <div class="grid2">
                        <div>
                            <span class="label">Head ID</span>{{ department.department_head?.id ||
                                department.department_head_id || '—' }}
                        </div>
                        <div>
                            <span class="label">Start Date</span>{{ formatDate(department.department_head_start_date) }}
                        </div>
                        <div>
                            <span class="label">Name</span>{{ department.department_head?.full_name || '—' }}
                        </div>
                        <div>
                            <span class="label">Email</span>{{ department.department_head?.email || '—' }}
                        </div>
                        <div>
                            <span class="label">Phone</span>{{ department.department_head?.phone || '—' }}
                        </div>
                        <div>
                            <span class="label">Designation ID</span>{{ department.department_head?.designation_id ||
                                '—' }}
                        </div>
                        <div>
                            <span class="label">Gender</span>{{ department.department_head?.gender || '—' }}
                        </div>
                        <div>
                            <span class="label">DOB</span>{{ department.department_head?.date_of_birth || '—' }}
                        </div>
                        <div>
                            <span class="label">Head Created</span>{{ formatDate(department.department_head?.created_at)
                            }}
                        </div>
                        <div>
                            <span class="label">Head Updated</span>{{ formatDate(department.department_head?.updated_at)
                            }}
                        </div>
                    </div>
                </section>

                <!-- 👥 Employees (if you later include employees array on this payload) -->
                <section class="blk" v-if="(department.employees?.length || 0) > 0">
                    <h2 class="hdr">
                        <Icon name="lucide:users" class="ic" /> Employees
                    </h2>
                    <div class="list">
                        <div v-for="emp in visibleEmployees" :key="emp.id" class="row">
                            <div class="who">
                                <span class="nm">{{ emp.full_name || (emp.first_name + ' ' + (emp.last_name || ''))
                                }}</span>
                                <span class="sub">{{ emp.email }}</span>
                                <span class="sub">{{ emp.phone }}</span>
                            </div>
                            <span class="meta">
                                Joined: <span class="val">{{ formatDate(emp.created_at) }}</span>
                            </span>
                        </div>
                    </div>
                    <div v-if="(department.employees?.length || 0) > maxEmp" class="mt-2">
                        <button class="btn" @click="showAll = !showAll">
                            {{ showAll ? 'Show less' : `Show all ${department.employees.length}` }}
                        </button>
                    </div>
                </section>

                <!-- 📊 Stats -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:bar-chart-3" class="ic" /> Stats
                    </h2>
                    <div class="grid2">
                        <div>
                            <span class="label">Employee Count</span>{{ department.employee_count ?? '—' }}
                        </div>
                        <div>
                            <span class="label">Department ID</span>{{ department.id || '—' }}
                        </div>
                    </div>
                </section>
            </div>

            <div v-else class="center">
                <Icon name="lucide:loader-2" class="spin ic" /> Loading department details...
            </div>
        </template>

        <template #footer>
            <div class="footer">
                <UiButton text="Close" color="#4aff7a" @click="open = false" />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    department: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

// Keep these — if/when employees are present, it performs well.
const maxEmp = 25
const showAll = ref(false)
const visibleEmployees = computed(() => {
    const list = props.department?.employees || []
    return showAll.value ? list : list.slice(0, maxEmp)
})

function formatDate(date) {
    if (!date) return '—'
    try {
        // Handles ISO strings and already-formatted strings
        return new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    } catch { return String(date) }
}

function formatAddress(address) {
    if (!address) return '—'
    try {
        const addr = typeof address === 'string' ? JSON.parse(address) : address
        return [
            addr?.streetNumber,
            addr?.streetName,
            addr?.area,
            addr?.locality,
            addr?.city,
            addr?.state,
            addr?.country,
            addr?.postalCode,
        ].filter(Boolean).join(', ')
    } catch { return address }
}
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

/* Only lay out/paint visible sections */
.cv-auto>section {
    content-visibility: auto;
    contain-intrinsic-size: 1px 600px;
}

/* --- Visual rhythm (compact) --- */
.blk {
    padding: 6px 0;
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, .75);
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    padding-bottom: 4px;
    margin-bottom: 6px;
}

.ic {
    width: 16px;
    height: 16px;
    opacity: .85;
}

/* Dense 2-col grid that wraps gracefully */
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
    font-size: 12.5px;
    letter-spacing: .02em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, .55);
    margin-bottom: 2px;
}

/* Employees list — minimal styles, no heavy transitions */
.list {
    border: 1px solid rgba(255, 255, 255, .1);
    border-radius: 8px;
    overflow: hidden;
}

.row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
}

.who {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.nm {
    font-weight: 600;
    color: #fff;
    font-size: 13.5px;
}

.sub {
    font-size: 12px;
    color: rgba(255, 255, 255, .7);
}

.meta {
    font-size: 11.5px;
    color: rgba(255, 255, 255, .65);
    white-space: nowrap;
}

.val {
    color: rgba(255, 255, 255, .85);
}

.muted {
    color: rgba(255, 255, 255, .6);
}

/* Button (no shadows, no transitions) */
.btn {
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, .08);
    border: 1px solid rgba(255, 255, 255, .12);
}

/* Footer / loading */
.footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, .1);
    padding-top: 8px;
}

.center {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: rgba(255, 255, 255, .7);
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive tweaks */
@media (max-width: 640px) {
    .grid2 {
        grid-template-columns: 1fr;
        gap: 6px 12px;
    }
}
</style>
