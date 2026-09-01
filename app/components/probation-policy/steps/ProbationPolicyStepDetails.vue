<template>
    <div class="flex flex-col gap-5">
        <!-- Policy type -->
        <section class="flex flex-col gap-1.5">
            <label class="text-md text-white/80">Policy Type</label>
            <FormSelect color="#fff" v-model="policy_type" :options="policyTypeOptions" placeholder="Select policy type" />
            <p class="text-xs text-white/50">Defines the employment category this policy governs (probation, internship, trainee or contract).</p>
        </section>

        <!-- Policy name & description -->
        <section class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-1.5">
                    <label class="text-md text-white/80">Policy Name</label>
                    <InfoTip tip="Unique name used to identify this policy in lists and reports." />
                </div>
                <FormInput color="#fff" v-model="name" placeholder="e.g. Standard Probation Policy" />
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="text-md text-white/80">Description <span class="text-xs text-white/40">(Optional)</span></label>
                <FormTextArea v-model="description" placeholder="Write a description..." color="#fff" rounded="lg" :rows="3"
                    :autoresize="true" clearable />
            </div>
        </section>

        <!-- Durations -->
        <section class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-1.5">
                    <label class="text-md text-white/80">Policy Duration</label>
                    <InfoTip tip="Length of the employment period before confirmation. Minimum of 1." />
                </div>
                <FormInput color="#fff" v-model="duration_value" type="number" min="1" placeholder="e.g. 3" />
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="text-md text-white/80">Unit</label>
                <FormSelect color="#fff" v-model="duration_unit" :options="unitOptions" placeholder="Unit" />
            </div>
            <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-1.5">
                    <label class="text-md text-white/80">Max Extension Duration</label>
                    <InfoTip tip="Maximum extension allowed if the probation needs more time. Set to 0 for no extension." />
                </div>
                <FormInput color="#fff" v-model="max_duration_value" type="number" min="0" placeholder="e.g. 3 (0 = none)" />
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="text-md text-white/80">Extension Unit</label>
                <FormSelect color="#fff" v-model="max_duration_unit" :options="unitOptions" placeholder="Unit" />
            </div>
        </section>

        <!-- End date -->
        <section class="flex flex-col gap-2">
                <div class="flex items-center gap-1.5">
                    <label class="text-md text-white/80">Policy End Date</label>
                    <InfoTip tip="End date is derived automatically from the joining date. Toggle: ends on the last day of the duration vs. the day after it completes." />
                </div>
            <div class="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <span class="font-medium block">Ends on the last day of the duration</span>
                        <span class="text-xs text-white/60">End date = joining date + duration − 1 day (e.g. Jun 15 + 3 mo → Sep 14)</span>
                    </div>
                    <UiSwitch v-model="end_date_after_completion" color="#4aff7a" />
                </div>
                <div v-if="end_date_after_completion"
                    class="mt-2 pt-2 border-t border-emerald-300/20 text-sm text-emerald-300">
                    <span class="font-medium block">Ends on the day after the duration completes</span>
                    <span class="text-xs text-white/60">End date = joining date + duration (e.g. Jun 15 + 3 mo → Sep 15)</span>
                </div>
                <p class="text-xs text-white/50 mt-2">Dates are derived automatically from the employee's joining date – no manual dates.</p>
            </div>
        </section>

        <!-- Active state -->
        <section class="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <div>
                <div class="flex items-center gap-1.5">
                    <label class="text-md text-white/80">Active Policy</label>
                    <InfoTip tip="Only active policies can be assigned to employee probations." />
                </div>
                <p class="text-xs text-white/50">Policy can be assigned to probations</p>
            </div>
            <UiSwitch v-model="is_active" color="#4aff7a" />
        </section>

        <!-- Categories -->
        <section class="flex flex-col gap-2">
            <div class="flex items-center gap-1.5">
                <label class="text-md text-white/80">Applied to Employee Categories</label>
                <InfoTip tip="Employees in the selected categories automatically follow this policy's probation rules." />
            </div>
            <p class="text-xs text-white/50">Employees in the selected categories follow this policy's probation rules.</p>
            <div v-if="categoryOptions.length" class="flex flex-wrap gap-2 mt-2">
                <button v-for="cat in categoryOptions" :key="cat.value" type="button"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition border"
                    :class="isCategorySelected(cat.value)
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                        : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10'"
                    @click="toggleCategory(cat.value)">
                    <Icon :name="isCategorySelected(cat.value) ? 'lucide:check-circle' : 'lucide:plus-circle'"
                        class="w-4 h-4" />
                    {{ cat.label }}
                </button>
            </div>
            <div v-else class="text-sm text-white/40">No employee categories available yet.</div>
        </section>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useProbationPolicyStore } from '@/stores/probationPolicy.store'
import { useEmpCategoryStore } from '@/stores/empCategory.store'
import { useAuthStore } from '@/stores/auth.store'

const store = useProbationPolicyStore()
const empCategoryStore = useEmpCategoryStore()
const authStore = useAuthStore()

const {
    name,
    description,
    policy_type,
    duration_value,
    duration_unit,
    max_duration_value,
    max_duration_unit,
    end_date_after_completion,
    is_active,
    employee_category_ids,
} = storeToRefs(store)

const unitOptions = ['MONTHS', 'WEEKS', 'DAYS']

const policyTypeOptions = [
    { value: 'PROBATION', label: 'Probation' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'TRAINEE', label: 'Trainee' },
    { value: 'CONTRACT', label: 'Contract' },
]

const categoryOptions = computed(() => empCategoryStore.category_list || [])

const isCategorySelected = (id) => employee_category_ids.value.includes(String(id))

const toggleCategory = (id) => {
    const str = String(id)
    const idx = employee_category_ids.value.indexOf(str)
    if (idx >= 0) {
        employee_category_ids.value.splice(idx, 1)
    } else {
        employee_category_ids.value.push(str)
    }
}

onMounted(async () => {
    empCategoryStore.organization_id = authStore.organization
    if (!empCategoryStore.category_list?.length) {
        await empCategoryStore.fetchAllEmployeeCategories()
    }
})
</script>