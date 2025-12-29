<template>
    <div v-if="loading" class="w-full h-full flex items-center justify-center">
        <UiLoader />
    </div>

    <div v-else class="h-[calc(100vh-5rem)] flex flex-col">
        <label class="text-lg text-white font-semibold">Template Components</label>

        <div class="grid grid-cols-12 gap-2 mt-2 flex-1 min-h-0">

            <!-- ================= LEFT SIDEBAR ================= -->
            <div class="col-span-3 h-full">
                <div class="h-full rounded-lg border border-white/20 bg-white/10
                 backdrop-blur-xl p-3 flex flex-col min-h-0">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-3 shrink-0">
                        <h3 class="text-white font-semibold text-sm">Salary Ranges</h3>

                        <button @click="addSalaryRange"
                            :disabled="salaryRanges.length && salaryRanges[salaryRanges.length - 1].high === null"
                            class="text-green-400 hover:text-green-300 transition
         disabled:opacity-40 disabled:cursor-not-allowed" title="Add range">
                            <Icon name="ion:add-circle" size="20" />
                        </button>

                    </div>

                    <!-- Empty State -->
                    <div v-if="salaryRanges.length === 0" class="text-xs text-white/50 text-center mt-6">
                        No salary ranges added
                    </div>

                    <!-- Ranges -->
                    <div class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">

                        <div v-for="(range, index) in salaryRanges" :key="range.id">
                            <!-- EDIT MODE -->
                            <div v-if="!range.saved" class="flex gap-2 items-end">
                                <div class="flex-1">
                                    <label class="text-xs text-white/60">Low</label>
                                    <FormInput color="#fff" v-model="range.low" type="number" size="sm" rounded="lg" />
                                </div>

                                <div class="flex-1">
                                    <label class="text-xs text-white/60">High</label>
                                    <FormInput color="#fff" v-model="range.high" type="number" size="sm" rounded="lg" />
                                </div>

                                <button @click="saveSalaryRange(range)" :disabled="rangeStore.saving"
                                    class="text-green-400 hover:text-green-300 pb-1 disabled:opacity-40"
                                    title="Save range">
                                    <Icon :name="rangeStore.saving ? 'lucide:loader-2' : 'lucide:save'"
                                        :class="{ 'animate-spin': rangeStore.saving }" size="16" />
                                </button>

                                <button @click="removeSalaryRange(index)" :disabled="rangeStore.saving"
                                    class="text-red-400 hover:text-red-300 pb-1 disabled:opacity-40"
                                    title="Delete range">
                                    <Icon name="lucide:trash" size="16" />
                                </button>
                            </div>

                            <!-- TAB MODE -->
                            <div v-else
                                class="flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition"
                                :class="activeRangeId === range.id
                                    ? 'bg-white/20 border-green-400 text-white'
                                    : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'">
                                <!-- TAB CLICK -->
                                <div class="flex-1 cursor-pointer" @click="selectRange(range.id)">
                                    {{ formatter.format(Number(range.low)) }} – {{ range.high ?
                                        formatter.format(Number(range.high)) : 'Above' }}
                                </div>

                                <!-- ACTIONS -->
                                <div class="flex items-center gap-2 ml-2">
                                    <!-- EDIT -->
                                    <button @click.stop="editSalaryRange(range)"
                                        class="text-cyan-400 hover:text-cyan-300" title="Edit range">
                                        <Icon name="lucide:edit-3" size="14" />
                                    </button>

                                    <!-- DELETE -->
                                    <button @click.stop="deleteSavedRange(range.id)" :disabled="rangeStore.loading"
                                        class="text-red-500 hover:text-red-400 disabled:opacity-40"
                                        title="Delete range">
                                        <Icon name="lucide:trash-2" size="14" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <!-- ================= RIGHT PANEL ================= -->
            <div class="col-span-9 h-full flex flex-col min-h-0
               rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl p-2">
                <!-- Header -->
                <div class="flex items-center justify-between border-b border-white/30 pb-2 mb-2 shrink-0">
                    <h3 class="text-white font-semibold text-sm">
                        Template Components
                    </h3>

                    <div class="flex gap-2">
                        <UiButton size="xs" color="#4aff7a" text="Add Component" prepend-icon="ion:add-circle"
                            @click="addTemplateComponent" :disabled="!activeRange" />

                        <UiButton v-if="activeRange?.components.length" size="xs" color="#60eaff" text="Save Components"
                            prepend-icon="lucide:save" :loading="rangeStore.saving" @click="saveComponents" />
                    </div>
                </div>

                <!-- Empty state -->
                <div v-if="!activeRange" class="flex-1 flex items-center justify-center text-white/50 text-sm">
                    Select a salary range to configure components
                </div>

                <!-- Components -->
                <div v-else class="flex-1 overflow-y-auto pr-1">
                    <div class="grid grid-cols-2 gap-2">
                        <div v-if="activeRange.components.length === 0" class="flex col-span-2 flex-col items-center justify-center h-full py-12 text-center
         border border-dashed border-white/20 rounded-lg
         bg-white/5 backdrop-blur-sm">
                            <!-- Icon -->
                            <div class="w-12 h-12 flex items-center justify-center rounded-full
           bg-white/10 text-white/70 mb-3">
                                <Icon name="lucide:layers" size="22" />
                            </div>

                            <!-- Text -->
                            <p class="text-sm text-white/80 font-medium">
                                No components added yet
                            </p>
                            <p class="text-xs text-white/50 mt-1 max-w-xs">
                                Add earnings, deductions, or employer contributions to build this salary structure.
                            </p>

                            <!-- CTA -->
                            <UiButton class="mt-4" size="xs" color="#4aff7a" text="Add First Component"
                                prepend-icon="ion:add-circle" @click="addTemplateComponent" />
                        </div>

                        <div v-else v-for="(tc, index) in activeRange.components" :key="tc._localId"
                            class="border grid grid-cols-2 border-white/20 p-2 rounded-lg gap-3"
                            :class="tc.isDefault ? 'bg-amber-500/10 border-amber-400/40' : 'bg-white/10'">
                            <template v-if="!tc.loading">

                                <div class="flex flex-col">
                                    <div>
                                        <label class="text-white/70 text-xs flex items-center gap-1">
                                            Component
                                            <span v-if="tc.isDefault"
                                                class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                                DEFAULT
                                            </span>
                                        </label>
                                        <FormSelect @select="chooseComponent(tc)" v-model="tc.componentId"
                                            :options="componentOptions" placeholder="Choose Component" searchable
                                            color="#fff" rounded="lg" size="md" :disabled="tc.isDefault" />
                                    </div>

                                    <div>
                                        <label class="text-white/70 text-xs">Fixed Value</label>
                                        <FormInput v-model="tc.value" type="number" size="md" rounded="lg"
                                            prepend-icon="lucide:calculator" color="#fff" :disabled="tc.isDefault" />
                                    </div>

                                    <div>
                                        <label class="text-white/70 text-xs">Order</label>
                                        <FormInput v-model="tc.priority" color="#fff" type="number" size="md"
                                            rounded="lg" :disabled="tc.isDefault" />
                                    </div>

                                    <div>
                                        <label class="text-xs text-white/70">Min Value</label>
                                        <FormInput v-model="tc.minValue" color="#fff" type="number" rounded="lg"
                                            :disabled="tc.isDefault" />
                                    </div>

                                    <div>
                                        <label class="text-xs text-white/70">Max Value</label>
                                        <FormInput v-model="tc.maxValue" color="#fff" type="number" rounded="lg"
                                            :disabled="tc.isDefault" />
                                    </div>
                                </div>

                                <div>
                                    <label class="text-white/70 text-xs flex items-center gap-1">
                                        Formula
                                        <span v-if="tc.isDefault"
                                            class="text-[10px] text-amber-300">(auto-calculated)</span>
                                        <span v-else class="text-white/40">(optional)</span>
                                    </label>
                                    <FormFormulaBuilder v-model="tc.formula" :components="componentDefinitionList"
                                        :disabled="tc.isDefault" />
                                </div>

                                <div class="flex col-span-2 justify-end">
                                    <UiButton v-if="!tc.isDefault" size="xs" color="#ff502e" text="Remove Component"
                                        prepend-icon="lucide:trash" @click="removeTemplateComponent(index)" />
                                    <div v-else class="text-xs text-amber-300/70 italic">
                                        This is a default component and cannot be removed
                                    </div>
                                </div>

                            </template>

                            <template v-else>
                                <UiLoader />
                            </template>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useSalaryTemplateStore } from '../../stores/salaryTemplate.store'
import { useComponentDefinitionStore } from '../../stores/componentDefinition.store'
import { useDepartmentStore } from '../../stores/department.store'
import { useDesignationStore } from '../../stores/designation.store'
import { useSalaryRangeStore } from '../../stores/salaryRange.store'
const toast = useToast()

const props = defineProps({
    templateId: {
        type: [String, Number],
        required: true
    }
})

const templateStore = useSalaryTemplateStore()
const componentStore = useComponentDefinitionStore()
const departmentStore = useDepartmentStore()
const designationStore = useDesignationStore()
const rangeStore = useSalaryRangeStore()

const { loading } = storeToRefs(templateStore)

/* ================= RANGE STATE (synced with store) ================= */
const salaryRanges = computed(() => rangeStore.ranges)
const activeRangeId = computed(() => rangeStore.activeRangeId)
const activeRange = computed(() => rangeStore.activeRange)

/* ================= DEFAULT COMPONENT ================= */
const defaultComponent = computed(() =>
    componentStore.components.find(c => c.isDefault === true && c.isDeletable === false)
)

/* ================= COMPONENT OPTIONS ================= */
const componentDefinitionList = computed(() =>
    componentStore.components.map(c => ({ key: c.key, name: c.name }))
)

const componentOptions = computed(() =>
    componentStore.components.map(c => ({ value: c.id, label: c.name }))
)

/* ================= DYNAMIC FORMULA UPDATER ================= */
watch(
    () => activeRange.value?.components,
    (components) => {
        if (!components || !defaultComponent.value) return

        updateDefaultComponentFormula()
    },
    { deep: true }
)

function updateDefaultComponentFormula() {
    if (!activeRange.value || !defaultComponent.value) return

    const defaultComp = activeRange.value.components.find(c => c.isDefault)
    if (!defaultComp) return

    // Get all non-default components with their keys
    const otherComponents = activeRange.value.components
        .filter(c => !c.isDefault && c.componentId)
        .map(c => {
            const selectedId = c.componentId?.value ?? c.componentId
            const component = componentStore.components.find(comp => comp.id === selectedId)
            return component?.key
        })
        .filter(Boolean)

    // Build formula: gross - (sum of all other components)
    if (otherComponents.length === 0) {
        defaultComp.formula = 'gross'
    } else {
        const sumFormula = otherComponents.join(' + ')
        defaultComp.formula = `gross - (${sumFormula})`
    }
}

/* ================= RANGE ACTIONS ================= */
function editSalaryRange(range) {
    range.saved = false
}

async function deleteSavedRange(rangeId) {
    if (!confirm('Are you sure you want to delete this range?')) return

    try {
        await rangeStore.deleteRange(rangeId)
    } catch (err) {
        console.error('Failed to delete range:', err)
        toast.error({ title: 'Error!', message: 'Failed to delete range. Please try again.', timeout: 1500 })
    }
}

async function selectRange(rangeId) {
    if (rangeStore.activeRangeId === rangeId) return

    try {
        await rangeStore.setActiveRange(rangeId)
        ensureDefaultComponent()
    } catch (err) {
        console.error('Failed to load range components:', err)
    }
}

/* ================= HELPERS ================= */
function createEmptyComponent() {
    return {
        _localId: Date.now() + Math.random(),
        componentId: '',
        formula: '',
        value: null,
        priority: 0,
        minValue: null,
        maxValue: null,
        condition: '',
        kind: '',
        isDefault: false,
    }
}

function createDefaultComponent() {
    if (!defaultComponent.value) return null

    return {
        _localId: Date.now() + Math.random(),
        componentId: {
            value: defaultComponent.value.id,
            label: defaultComponent.value.name
        },
        formula: 'gross',
        value: null,
        priority: defaultComponent.value.displayOrder || 999,
        minValue: 0,
        maxValue: null,
        condition: '',
        kind: defaultComponent.value.kind || '',
        isDefault: true,
        isDeletable: false,
    }
}

function ensureDefaultComponent() {
    if (!activeRange.value || !defaultComponent.value) return

    // Check if default component exists (either by isDefault flag OR by matching component ID)
    const hasDefault = activeRange.value.components.some(c => {
        const compId = c.componentId?.value ?? c.componentId
        return c.isDefault || compId === defaultComponent.value.id
    })

    if (!hasDefault) {
        const defComp = createDefaultComponent()
        if (defComp) {
            activeRange.value.components.unshift(defComp)
            updateDefaultComponentFormula()
        }
    } else {
        // If it exists but doesn't have the isDefault flag, mark it
        const defaultComp = activeRange.value.components.find(c => {
            const compId = c.componentId?.value ?? c.componentId
            return compId === defaultComponent.value.id
        })
        if (defaultComp && !defaultComp.isDefault) {
            defaultComp.isDefault = true
            defaultComp.isDeletable = false
            defaultComp.minValue = 0
        }
        updateDefaultComponentFormula()
    }
}

function addSalaryRange() {
    if (salaryRanges.value.length > 0) {
        const last = salaryRanges.value[salaryRanges.value.length - 1]

        if (!last.saved) return
        if (last.high === null) return
        if (Number(last.high) <= Number(last.low)) return
    }

    const last = salaryRanges.value[salaryRanges.value.length - 1]
    const low = last ? Number(last.high) + 1 : 0

    // Add to store's ranges array
    rangeStore.ranges.push({
        id: Date.now(),
        low,
        high: null,
        saved: false,
        components: [],
    })
}

const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
})

async function saveSalaryRange(range) {
    // Validate
    if (
        range.low === null ||
        (range.high !== null && Number(range.high) < Number(range.low))
    ) {
        return
    }

    try {
        // Check if it's a new range (no server ID yet) or an update
        if (typeof range.id === 'number' && range.id > 1000000000000) {
            // It's a temp ID, create new range
            const result = await rangeStore.createRange(props.templateId, {
                ...range,
                label: `${formatter.format(Number(range.low))} – ${range.high ?
                    formatter.format(Number(range.high)) : 'Above'}`
            })

            if (result?.success) {
                // Replace temp range with server range
                const index = rangeStore.ranges.findIndex(r => r.id === range.id)
                if (index !== -1) {
                    rangeStore.ranges[index] = result.range
                }
            }
        } else {
            // Update existing range
            await rangeStore.updateRange({
                ...range,
                label: `${formatter.format(Number(range.low))} – ${range.high ?
                    formatter.format(Number(range.high)) : 'Above'}`
            })
            range.saved = true
        }

        // Auto-select and load components
        await rangeStore.setActiveRange(rangeStore.activeRangeId || range.id)

        // Ensure default component exists
        ensureDefaultComponent()
    } catch (err) {
        console.error('Failed to save range:', err)
        alert('Failed to save range. Please try again.')
    }
}

function removeSalaryRange(index) {
    const removed = rangeStore.ranges.splice(index, 1)[0]

    if (removed?.id === rangeStore.activeRangeId) {
        rangeStore.activeRangeId = rangeStore.ranges[0]?.id ?? null
        rangeStore.rangeComponents = []
    }
}

/* ================= COMPONENT ACTIONS ================= */
function addTemplateComponent() {
    if (!activeRange.value) return
    activeRange.value.components.push(createEmptyComponent())
    updateDefaultComponentFormula()
}

function removeTemplateComponent(index) {
    const component = activeRange.value.components[index]

    // Prevent removal of default component
    if (component.isDefault) {
        toast.error({
            title: 'Cannot Remove',
            message: 'Default component cannot be removed.',
            timeout: 2000
        })
        return
    }

    activeRange.value.components.splice(index, 1)
    updateDefaultComponentFormula()
}

function chooseComponent(tc) {
    if (tc.isDefault) return // Prevent changes to default component

    const selectedId = tc.componentId?.value ?? tc.componentId
    const component = componentStore.components.find(c => c.id === selectedId)
    if (!component) return

    tc.formula = component.defaultFormula
    tc.priority = component.displayOrder

    // Update default component formula
    updateDefaultComponentFormula()
}

async function saveComponents() {
    if (!activeRange.value) return

    try {
        await rangeStore.saveRangeComponents(
            props.templateId,
            activeRange.value.id,
            activeRange.value.components
        )

        toast.success({
            title: 'Success!',
            message: 'Components saved successfully!',
            timeout: 2000
        })

        // Reload to get server IDs - this will automatically mark default component
        await rangeStore.fetchRangeComponents(activeRange.value.id)
        // No need to call ensureDefaultComponent here - the fetched data already has it
    } catch (err) {
        console.error('Failed to save components:', err)
        toast.error({
            title: 'Error!',
            message: 'Failed to save components. Please try again.',
            timeout: 2000
        })
    }
}

/* ================= INIT ================= */
onMounted(async () => {
    loading.value = true

    try {
        // Load all required data
        await Promise.all([
            componentStore.fetchComponents(),
            departmentStore.fetchAllDepartments(),
            designationStore.fetchDesignationList(),
            rangeStore.fetchRanges(props.templateId)
        ])

        // If no ranges exist, add a starter range
        if (rangeStore.ranges.length === 0) {
            addSalaryRange()
        } else if (rangeStore.activeRangeId) {
            // Load components for the active range
            await rangeStore.fetchRangeComponents(rangeStore.activeRangeId)
            ensureDefaultComponent()
        }
    } catch (err) {
        console.error('Failed to initialize:', err)
    } finally {
        loading.value = false
    }
});
</script>