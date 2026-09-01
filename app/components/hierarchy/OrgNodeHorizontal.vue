<template>
    <div class="relative flex flex-col items-center">
        <div class="w-80 rounded-xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-lg relative overflow-visible">
            <div v-for="dept in node.department_head_of" :key="dept"
                class="absolute -top-2.5 right-3 z-20 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-900 shadow-lg border border-amber-500/60 whitespace-nowrap max-w-[80%] truncate">
                {{ dept }} Head
            </div>

            <div class="p-3.5 rounded-xl bg-slate-900/95 border border-slate-700/80">
                <div class="flex items-start gap-3">
                    <img v-if="node.profile_image" :src="node.profile_image"
                        class="w-12 h-12 rounded-lg object-cover border border-white/15 shrink-0" />
                    <div v-else class="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center
                                text-white font-bold text-sm border border-white/15 shrink-0">
                        {{ initials }}
                    </div>

                    <div class="flex-1 min-w-0">
                        <h3 class="text-white text-sm font-semibold truncate">{{ node.full_name }}</h3>
                        <p v-if="node.employee_code" class="text-[10px] text-white/40 font-mono mt-0.5">
                            {{ node.employee_code }}
                        </p>
                        <p v-if="node.designation" class="text-emerald-400 text-[11px] font-semibold mt-1 truncate">
                            {{ node.designation }}
                        </p>
                        <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span v-if="node.department"
                                class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 max-w-full truncate">
                                {{ node.department }}
                            </span>
                            <span v-if="node.category"
                                class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                                {{ node.category }}
                            </span>
                        </div>
                        <span v-if="experienceLabel"
                            class="block mt-1.5 text-[10px] text-white/40 font-medium">
                            Age: {{ experienceLabel }}
                        </span>
                    </div>
                </div>

                <div class="mt-3 pt-3 border-t border-slate-700/50 flex gap-2">
                    <button @click.stop="viewProfile"
                        class="flex-1 py-2 text-[11px] font-semibold rounded-lg bg-emerald-500/90 text-slate-900 hover:bg-emerald-400 transition flex items-center justify-center gap-1">
                        <Icon name="lucide:eye" class="w-3.5 h-3.5" />
                        View Profile
                    </button>
                </div>
            </div>
        </div>

        <template v-if="hasChildren">
            <div class="relative shrink-0" :style="{ width: svgWidth + 'px', height: connectorHeight + 'px' }">
                <svg class="absolute inset-0 w-full h-full pointer-events-none" style="overflow: visible">
                    <polyline v-for="(child, index) in node.reportees" :key="child.id"
                        :points="`${svgWidth / 2},0 ${svgWidth / 2},${junctionY} ${childX(index)},${junctionY} ${childX(index)},${connectorHeight}`"
                        fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"
                        stroke-linejoin="round" stroke-linecap="round" />
                </svg>
            </div>
            <div class="flex items-start justify-center gap-12">
                <div v-for="child in node.reportees" :key="child.id" class="relative z-10">
                    <EmployeeNode :node="child" />
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
defineOptions({ name: "EmployeeNode" })

import { computed } from "vue"
import { useRouter } from "vue-router"

const props = defineProps({
    node: Object
})

const router = useRouter()

const initials = computed(() => {
    if (!props.node?.full_name) return "?"
    return props.node.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
})

const hasChildren = computed(() => {
    return props.node.reportees && props.node.reportees.length > 0
})

const experienceLabel = computed(() => {
    if (!props.node.date_of_birth) return ''
    const dob = new Date(props.node.date_of_birth)
    if (isNaN(dob.getTime())) return ''
    const now = new Date()
    let years = now.getFullYear() - dob.getFullYear()
    const m = now.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--
    if (years < 0) return ''
    return `${years} yr${years !== 1 ? 's' : ''}`
})

const connectorHeight = 28
const junctionY = 10
const cardWidth = 320
const gap = 48

const svgWidth = computed(() => {
    const count = props.node.reportees?.length || 1
    return count * cardWidth + (count - 1) * gap
})

function childX(index) {
    return index * (cardWidth + gap) + cardWidth / 2
}

function viewProfile() {
    router.push({
        path: `/organization/${props.node.organization_id}/employee/list`,
        query: {
            employee_id: props.node.id,
            preview: true
        }
    })
}
</script>

<style scoped></style>
