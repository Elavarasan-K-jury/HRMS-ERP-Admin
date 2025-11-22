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
                        <div><span class="label">Name</span>{{ department.name || '—' }}</div>
                        <div><span class="label">Code</span>{{ department.code || '—' }}</div>
                        <div class="col2"><span class="label">Description</span>{{ department.description || '—' }}
                        </div>
                    </div>
                </section>

                <!-- 🏬 Organization -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:building" class="ic" /> Organization
                    </h2>
                    <div class="grid2">
                        <div><span class="label">Name</span>{{ department.organization?.name || '—' }}</div>
                        <div><span class="label">Email</span>{{ department.organization?.email || '—' }}</div>
                        <div><span class="label">Industry</span>{{ department.organization?.industry || '—' }}</div>
                        <div><span class="label">Size</span>{{ department.organization?.size ?
                            department.organization.size + ' Employees' : '—' }}</div>
                        <div class="col2">
                            <span class="label">Domain</span>
                            <a v-if="department.organization?.domain" :href="department.organization.domain"
                                target="_blank" rel="noopener" class="lnk">
                                {{ department.organization.domain }}
                            </a>
                            <span v-else>—</span>
                        </div>
                        <div><span class="label">Contact Person</span>{{ department.organization?.contact_person_name ||
                            '—' }}</div>
                        <div><span class="label">Phone</span>{{ department.organization?.contact_person_number || '—' }}
                        </div>
                        <div class="col2"><span class="label">Address</span>{{
                            formatAddress(department.organization?.address) }}</div>
                    </div>
                </section>

                <!-- 👤 Department Head -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:user" class="ic" /> Department Head
                    </h2>
                    <div class="grid2">
                        <div><span class="label">Head ID</span>{{ department.department_head_id || '—' }}</div>
                        <div><span class="label">Start Date</span>{{ formatDate(department.department_head_start_date)
                        }}</div>
                    </div>
                </section>

                <!-- 👥 Employees -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:users" class="ic" /> Employees
                    </h2>

                    <div v-if="(department.employees?.length || 0) > 0" class="list">
                        <div v-for="emp in visibleEmployees" :key="emp.id" class="row">
                            <div class="who">
                                <span class="nm">{{ emp.full_name }}</span>
                                <span class="sub">{{ emp.email }}</span>
                                <span class="sub">{{ emp.phone }}</span>
                            </div>
                            <span class="meta">
                                Joined: <span class="val">{{ formatDate(emp.created_at) }}</span>
                            </span>
                        </div>
                    </div>
                    <div v-else class="muted">No employees found.</div>

                    <!-- Show more to avoid huge DOMs -->
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
                        <div><span class="label">Employee Count</span>{{ department.employee_count ?? '—' }}</div>
                        <div><span class="label">Department ID</span>{{ department.id || '—' }}</div>
                    </div>
                </section>

                <!-- 🕒 Timestamps -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:calendar-clock" class="ic" /> Timestamps
                    </h2>
                    <div class="grid2">
                        <div><span class="label">Created</span>{{ formatDate(department.created_at) }}</div>
                        <div><span class="label">Updated</span>{{ formatDate(department.updated_at) }}</div>
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

const maxEmp = 25
const showAll = ref(false)
const visibleEmployees = computed(() => {
    const list = props.department?.employees || []
    return showAll.value ? list : list.slice(0, maxEmp)
})

function formatDate(date) {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    } catch { return date }
}

function formatAddress(address) {
    if (!address) return '—'
    try {
        const addr = typeof address === 'string' ? JSON.parse(address) : address
        return [addr.streetNumber, addr.streetName, addr.area, addr.locality, addr.city, addr.state, addr.country, addr.postalCode]
            .filter(Boolean).join(', ')
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
    /* iOS smoother */
    scrollbar-gutter: stable;
}

/* Only lay out/paint visible sections; huge perf win on long content */
.cv-auto>section {
    content-visibility: auto;
    contain-intrinsic-size: 1px 600px;
    /* reserve space to avoid jump */
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
    font-size: 10.5px;
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
