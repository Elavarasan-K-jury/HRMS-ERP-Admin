<template>
    <UiSidebarModal v-model="open" :title="`Salary Template: ${template?.name || '—'}`" size="xl">
        <template #default>
            <div v-if="template" class="max-h-[calc(100vh-160px)] overflow-y-auto overscroll-contain text-white/90">
                <div class="cv-auto">

                    <!-- 🧾 TEMPLATE INFO -->
                    <section class="py-1.5">
                        <h2
                            class="flex items-center gap-2 text-xs font-semibold text-white/75 border-b border-white/10 pb-1 mb-1.5">
                            <Icon name="lucide:receipt" class="w-4 h-4 opacity-85" />
                            Template Info
                        </h2>

                        <div class="grid grid-cols-2 gap-1.5 gap-x-4 text-[13.5px] leading-snug">
                            <div>
                                <span class="block text-xs uppercase tracking-wide text-white/55 mb-0.5">Name</span>
                                <span>{{ template.name || '—' }}</span>
                            </div>

                            <div>
                                <span class="block text-xs uppercase tracking-wide text-white/55 mb-0.5">Default</span>
                                <span>{{ template.isDefault ? 'Yes' : 'No' }}</span>
                            </div>

                            <div>
                                <span class="block text-xs uppercase tracking-wide text-white/55 mb-0.5">Status</span>
                                <span :class="template.isActive ? 'text-[#4aff7a]' : 'text-white/60'">
                                    {{ template.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </div>

                            <div>
                                <span class="block text-xs uppercase tracking-wide text-white/55 mb-0.5">
                                    Salary Ranges
                                </span>
                                <span>{{ template.ranges.length }}</span>
                            </div>

                            <div class="col-span-2">
                                <span class="block text-xs uppercase tracking-wide text-white/55 mb-0.5">
                                    Description
                                </span>
                                <div v-html="template.description" class="text-white/85" />
                            </div>

                            <div>
                                <span class="block text-xs uppercase tracking-wide text-white/55 mb-0.5">
                                    Created At
                                </span>
                                <span>{{ formatDate(template.createdAt) }}</span>
                            </div>

                            <div>
                                <span class="block text-xs uppercase tracking-wide text-white/55 mb-0.5">
                                    Updated At
                                </span>
                                <span>{{ formatDate(template.updatedAt) }}</span>
                            </div>
                        </div>
                    </section>

                    <!-- 🏢 DEPARTMENTS -->
                    <section class="py-1.5">
                        <h2
                            class="flex items-center gap-2 text-xs font-semibold text-white/75 border-b border-white/10 pb-1 mb-1.5">
                            <Icon name="lucide:building" class="w-4 h-4 opacity-85" />
                            Applicable Departments
                        </h2>

                        <div class="flex flex-wrap gap-2">
                            <span v-for="d in template.departments" :key="d"
                                class="px-2 py-1 rounded-lg bg-white/10 text-xs border border-white/5">
                                {{ d }}
                            </span>
                        </div>
                    </section>

                    <!-- 👔 DESIGNATIONS -->
                    <section class="py-1.5">
                        <h2
                            class="flex items-center gap-2 text-xs font-semibold text-white/75 border-b border-white/10 pb-1 mb-1.5">
                            <Icon name="lucide:user-square" class="w-4 h-4 opacity-85" />
                            Applicable Designations
                        </h2>

                        <div class="flex flex-wrap gap-2">
                            <span v-for="d in template.designations" :key="d"
                                class="px-2 py-1 rounded-lg bg-white/10 text-xs border border-white/5">
                                {{ d }}
                            </span>
                        </div>
                    </section>

                    <!-- 🧩 TEMPLATE RANGES & COMPONENTS -->
                    <section class="py-1.5">
                        <h2
                            class="flex items-center gap-2 text-xs font-semibold text-white/75 border-b border-white/10 pb-1 mb-1.5">
                            <Icon name="lucide:layers" class="w-4 h-4 opacity-85" />
                            Salary Ranges & Components
                        </h2>

                        <div v-if="template.ranges.length" class="space-y-4">

                            <div v-for="range in template.ranges" :key="range.id"
                                class="border border-white/10 rounded-lg overflow-hidden">
                                <!-- RANGE HEADER -->
                                <div
                                    class="px-3 py-2 bg-white/5 border-b border-white/10 text-xs font-semibold text-white/85">
                                    Gross Range: {{ range.label }}
                                </div>

                                <!-- COMPONENTS -->
                                <div v-if="range.components?.length" class="space-y-2 p-2">

                                    <div v-for="c in range.components" :key="c.id"
                                        class="border border-white/10 rounded-lg overflow-hidden">

                                        <!-- COMPONENT HEADER -->
                                        <div
                                            class="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10">
                                            <span class="font-semibold text-sm text-white">
                                                {{ c.component?.name }}
                                            </span>

                                            <span class="px-2 py-0.5 rounded bg-white/10 text-[10px] uppercase">
                                                {{ c.component?.key }}
                                            </span>

                                            <span class="ml-auto px-2 py-0.5 rounded text-[10px]" :class="c.component?.isDefault
                                                ? 'bg-[#4aff7a]/20 text-[#4aff7a]'
                                                : 'bg-white/10 text-white/70'">
                                                {{ c.component?.type }}
                                            </span>
                                        </div>

                                        <!-- COMPONENT BODY -->
                                        <div class="grid grid-cols-3 gap-4 p-3 text-[13px]">

                                            <div>
                                                <span
                                                    class="block text-[11px] uppercase text-white/55 mb-1">Order</span>
                                                {{ c.priority }}
                                            </div>

                                            <div>
                                                <span
                                                    class="block text-[11px] uppercase text-white/55 mb-1">Min–Max</span>
                                                {{ c.min_value }} – {{ c.max_value }}
                                            </div>

                                            <div>
                                                <span
                                                    class="block text-[11px] uppercase text-white/55 mb-1">Taxable</span>
                                                <span
                                                    :class="c.component?.isTaxable ? 'text-[#4aff7a]' : 'text-white/60'">
                                                    {{ c.component?.isTaxable ? 'Yes' : 'No' }}
                                                </span>
                                            </div>

                                            <div class="col-span-3">
                                                <span
                                                    class="block text-[11px] uppercase text-white/55 mb-1">Formula</span>
                                                <pre
                                                    class="text-[11px] font-mono bg-black/30 p-2 rounded border border-white/5 text-white/75">
{{ c.formula || '—' }}
                                                </pre>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div v-else class="p-3 text-xs text-white/60">
                                    No components configured for this range.
                                </div>

                            </div>
                        </div>

                        <div v-else class="text-sm text-white/60 mt-2">
                            No salary ranges configured.
                        </div>
                    </section>

                </div>
            </div>

            <div v-else class="flex items-center justify-center py-6 text-white/70">
                <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin mr-2" />
                Loading template...
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end border-t border-white/10 pt-2">
                <UiButton text="Close" color="#4aff7a" @click="open = false" />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed } from 'vue'
import { useSalaryTemplateStore } from '../../stores/organization/salaryTemplate.store'

const templateStore = useSalaryTemplateStore()

const props = defineProps({
    modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const open = computed({
    get: () => props.modelValue,
    set: v => emit('update:modelValue', v)
})

const template = computed(() => templateStore.builder?.template)

// ✅ filter deleted ranges
const activeRanges = computed(() =>
    (template.value?.ranges || []).filter(r => !r.deletedAt)
)

function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}
</script>

<style scoped>
.cv-auto>section {
    content-visibility: auto;
    contain-intrinsic-size: 1px 600px;
}
</style>
