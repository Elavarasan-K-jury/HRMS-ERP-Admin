<template>
    <section
        class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
            <p class="label"><Icon name="lucide:building-2" class="h-3.5 w-3.5 inline -mt-0.5" /> Business Unit</p>
            <p class="value">{{ employee.organization?.name || '—' }}</p>
        </div>

        <div>
            <p class="label"><Icon name="lucide:git-branch" class="h-3.5 w-3.5 inline -mt-0.5" /> Department</p>
            <p class="value">{{ departmentName || '—' }}</p>
        </div>

        <div>
            <p class="label"><Icon name="lucide:wallet" class="h-3.5 w-3.5 inline -mt-0.5" /> Cost Center</p>
            <p class="value">{{ costCenter || '—' }}</p>
        </div>

        <div>
            <p class="label"><Icon name="heroicons:currency-dollar" class="h-3.5 w-3.5 inline -mt-0.5" /> Pay Grade</p>
            <p class="value">{{ payGrade || '—' }}</p>
        </div>

        <div>
            <p class="label"><Icon name="lucide:user-round" class="h-3.5 w-3.5 inline -mt-0.5" /> Reporting Manager</p>
            <NuxtLink v-if="reportingManager && reportingManagerLink" :to="reportingManagerLink"
                class="value-link">
                <span class="avatar-sm">{{ managerInitials }}</span>
                {{ reportingManager }}
            </NuxtLink>
            <p v-else class="value">{{ reportingManager || '—' }}</p>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    employee: { type: Object, required: true },
})

const departmentName = computed(() => {
    const e = props.employee
    if (e.department_name) return e.department_name
    return e.departments?.map(d => d.department?.name).filter(Boolean).join(', ') || ''
})

const costCenter = computed(() => props.employee.cost_center_name || '—')

const payGrade = computed(() => props.employee.pay_grade_name || '—')

const reportingManager = computed(() => props.employee.reporting_manager?.full_name || '')

const reportingManagerLink = computed(() => {
    const rm = props.employee.reporting_manager
    return rm?.id && props.employee.organization_id
        ? `/organization/${props.employee.organization_id}/employee/${rm.id}/profile`
        : null
})

const managerInitials = computed(() => {
    const name = reportingManager.value || ''
    return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?'
})
</script>

<style scoped>
.label {
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 6px;
}
.value {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.4;
}
.value-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    color: #7dd3fc;
    line-height: 1.4;
}
.value-link:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
}
.avatar-sm {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 20%, #4aff7a, #22c55e, #0ea5e9);
    color: #020617;
    font-size: 10px;
    font-weight: 800;
}
</style>