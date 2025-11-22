<template>
    <div class="relative flex flex-col items-center">

        <!-- CARD -->
        <div class="w-52 rounded-lg border border-white/20 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl 
                   shadow-[0_8px_40px_rgba(0,0,0,.4),0_0_0_1px_rgba(255,255,255,.05)_inset]
                   flex flex-col items-center gap-3 text-center
                   transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_50px_rgba(0,0,0,.5)]
                   hover:border-white/30 group relative overflow-hidden">

            <!-- HEAD BADGE -->
            <div v-if="node.isHead" class="absolute top-2 right-2 z-20 px-2 py-0.5 text-[10px] font-bold
                       rounded-md bg-amber-400 text-slate-900 shadow-lg border border-amber-600/40">
                HEAD
            </div>

            <!-- Content wrapper -->
            <div class="w-full p-4 rounded-lg bg-slate-900 border-2 border-slate-700 transition group">

                <!-- Header Row -->
                <div class="flex items-center gap-2">
                    <img v-if="node.profile" :src="node.profile"
                        class="w-14 h-14 rounded-lg object-cover border-2 border-white/20 shadow-md" />

                    <div v-else class="w-14 h-14 rounded-lg bg-slate-700 flex items-center justify-center
                               text-white text-lg font-bold border-2 border-white/20 shadow-md">
                        {{ initials }}
                    </div>

                    <div class="flex-1 flex flex-col items-start">
                        <h3 class="text-white text-[15px] font-semibold">{{ node.full_name }}</h3>
                        <p v-if="node.designation" class="text-emerald-400 text-xs font-bold mt-0.5">
                            {{ node.designation }}
                        </p>
                    </div>
                </div>

                <!-- Button -->
                <button @click.stop="viewProfile" class="mt-4 w-full py-2 text-xs font-semibold bg-emerald-500 text-slate-900
                           rounded-lg hover:bg-emerald-400 transition flex items-center justify-center gap-1">
                    <Icon name="lucide:eye" class="w-3.5 h-3.5" />
                    View Profile
                </button>
            </div>
        </div>

        <!-- Vertical line under parent -->
        <div v-if="hasChildren" class="w-0.5 h-6 bg-white/20"></div>

        <!-- CHILDREN WITH PERFECT DIAGONAL LINES -->
        <div v-if="hasChildren" class="relative mt-10 flex items-start justify-center gap-12" ref="childrenContainer">
            <!-- SVG attaches to parent (always aligned) -->
            <svg class="absolute -top-10 pointer-events-none" :width="svgWidth" height="70"
                :style="{ left: `calc(50% - ${svgWidth / 2}px)` }">
                <line v-for="(child, index) in node.reportees" :key="child.id" :x1="svgWidth / 2" y1="0"
                    :x2="childX(index)" y2="70" stroke="rgba(255,255,255,0.2)" stroke-width="2"
                    stroke-linecap="round" />
            </svg>

            <!-- CHILD CARDS -->
            <div v-for="(child, index) in node.reportees" :key="child.id" class="relative flex flex-col items-center">
                <EmployeeNode :node="child" />
            </div>
        </div>

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

/* ============================================================
   DIAGONAL SVG LINE CALCULATION
============================================================ */

const cardWidth = 208
const gap = 48

const svgWidth = computed(() => {
    const count = props.node.reportees?.length || 1
    return count * (cardWidth + gap)
})

function childX(index) {
    return index * (cardWidth + gap) + cardWidth / 2
}

function viewProfile() {
    router.push({
        path: `/panel/super-admin/organization/${props.node.organization_id}/employee/list`,
        query: {
            employee_id: props.node.id,
            preview: true
        }
    })
}
</script>

<style scoped></style>
