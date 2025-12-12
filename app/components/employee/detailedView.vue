<template>
    <UiSidebarModal v-model="open" @close="close" :title="`Employee: ${employee?.full_name || '—'}`" size="xl">
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
                                    {{ employee.full_name || '—' }}
                                </h2>
                                <span v-if="employee.employee_code" class="chip chip-soft">
                                    <Icon name="lucide:badge-check" class="chip-ic" />
                                    {{ employee.employee_code }}
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
                                    <span>{{ employee.email || '—' }}</span>
                                </div>
                                <div class="meta-item">
                                    <Icon name="lucide:phone" class="meta-ic" />
                                    <span>{{ employee.phone || '—' }}</span>
                                </div>
                                <div v-if="employee.alt_phone" class="meta-item">
                                    <Icon name="lucide:phone-call" class="meta-ic" />
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
                            <span class="label">Organization</span>
                            {{ employee.organization?.name || '—' }}
                        </div>
                        <div>
                            <span class="label">Category</span>
                            {{ employee.category?.name || '—' }}
                        </div>
                        <div>
                            <span class="label">Designation</span>
                            {{ employee.designation?.name || '—' }}
                        </div>
                        <div>
                            <span class="label">Department</span>
                            {{ employee.department?.name || employee.department_id || '—' }}
                        </div>
                        <div>
                            <span class="label">Employment Type</span>
                            <span>
                                <template v-if="employee.category?.is_permanent">Permanent</template>
                                <template v-else>—</template>
                            </span>
                        </div>
                        <div>
                            <span class="label">Benefits Applicable</span>
                            {{ bool(employee.category?.benefits_applicable) }}
                        </div>
                        <div>
                            <span class="label">Training Required</span>
                            {{ bool(employee.category?.training_required) }}
                        </div>
                        <div>
                            <span class="label">Probation</span>
                            <template v-if="employee.category?.probation_required">
                                {{ employee.category.probation_months || 0 }} month(s)
                            </template>
                            <template v-else>—</template>
                        </div>
                        <div>
                            <span class="label">Notice Period</span>
                            <template v-if="employee.category?.notice_required">
                                {{ employee.category.notice_months || 0 }} month(s)
                            </template>
                            <template v-else>—</template>
                        </div>
                        <div class="col2">
                            <span class="label">Category Description</span>
                            {{ employee.category?.description || '—' }}
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
                            <span class="label">Primary Phone</span>
                            {{ employee.phone || '—' }}
                        </div>
                        <div>
                            <span class="label">Alternate Phone</span>
                            {{ employee.alt_phone || '—' }}
                        </div>
                        <div class="col2">
                            <span class="label">Email</span>
                            {{ employee.email || '—' }}
                        </div>
                    </div>
                </section>

                <!-- 🏢 Organization -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:building-2" class="ic" /> Organization
                    </h2>
                    <div class="grid2">
                        <div>
                            <span class="label">Name</span>
                            {{ employee.organization?.name || '—' }}
                        </div>
                        <div>
                            <span class="label">Email</span>
                            {{ employee.organization?.email || '—' }}
                        </div>
                        <div>
                            <span class="label">Industry</span>
                            {{ employee.organization?.industry || '—' }}
                        </div>
                        <div>
                            <span class="label">Size</span>
                            <template v-if="employee.organization?.size">
                                {{ employee.organization.size }} Employees
                            </template>
                            <template v-else>—</template>
                        </div>
                        <div class="col2">
                            <span class="label">Domain</span>
                            <a v-if="employee.organization?.domain" :href="employee.organization.domain" target="_blank"
                                rel="noopener" class="lnk">
                                {{ employee.organization.domain }}
                            </a>
                            <span v-else>—</span>
                        </div>
                        <div>
                            <span class="label">Contact Person</span>
                            {{ employee.organization?.contact_person_name || '—' }}
                        </div>
                        <div>
                            <span class="label">Phone</span>
                            {{ employee.organization?.contact_person_number || '—' }}
                        </div>
                        <div class="col2">
                            <span class="label">Address</span>
                            {{ formatAddress(employee.organization?.address) }}
                        </div>
                    </div>
                </section>

                <!-- 🕒 Timestamps -->
                <section class="blk">
                    <h2 class="hdr">
                        <Icon name="lucide:calendar-clock" class="ic" /> Timestamps
                    </h2>
                    <div class="grid2">
                        <div>
                            <span class="label">Created</span>
                            {{ formatDate(employee.created_at) }}
                        </div>
                        <div>
                            <span class="label">Updated</span>
                            {{ formatDate(employee.updated_at) }}
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
                <NuxtLink v-if="employee" target="_blank"
                    :to="getUserProfileUrl(employee.id, employee.organization_id)">
                    <UiButton text="Open Profile" color="#fff" />
                </NuxtLink>
                <UiButton text="Close" color="#4aff7a" @click="close" />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useEmployeesStore } from '../../stores/employee.store'
import { useRouter } from 'vue-router'
const router = useRouter()
const employeesStore = useEmployeesStore()
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

const close = () => {
    emit('update:modelValue', false)
    router.push({ query: {} })
}

const initials = computed(() => {
    const e = employee.value
    if (!e) return '—'
    const src = e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim()
    if (!src) return '—'
    return src
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
})

function formatDate(date) {
    if (!date) return '—'
    try {
        // If backend sends human readable, just return as is
        const parsed = new Date(date)
        if (isNaN(parsed.getTime())) return date
        return parsed.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    } catch {
        return date
    }
}

function formatAddress(address) {
    if (!address) return '—'
    try {
        const addr = typeof address === 'string' ? JSON.parse(address) : address
        return [
            addr.streetNumber,
            addr.streetName,
            addr.area,
            addr.locality,
            addr.city,
            addr.state,
            addr.country,
            addr.postalCode,
        ]
            .filter(Boolean)
            .join(', ')
    } catch {
        return address
    }
}

function bool(v) {
    if (v === true) return 'Yes'
    if (v === false) return 'No'
    return '—'
}

function formatGender(g) {
    if (!g) return '—'
    const up = String(g).toUpperCase()
    if (up === 'MALE') return 'Male'
    if (up === 'FEMALE') return 'Female'
    if (up === 'OTHER') return 'Other'
    return g
}

const getUserProfileUrl = (employeeId, orgId) => `/organization/${orgId}/employee/${employeeId}/home`

onMounted(async () => {
    loading.value = true
    const data = await employeesStore.fetchEmployee(props.id)
    employee.value = data.employee
    loading.value = false
});
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
