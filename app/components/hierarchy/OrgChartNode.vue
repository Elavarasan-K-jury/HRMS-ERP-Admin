<template>
  <div class="inline-block align-top" :style="{ width: layout.subtreeWidth + 'px' }">
    <div class="flex flex-col items-center">
      <div class="relative w-full flex justify-center">
        <EmployeeCard :node="node" :expanded="expanded" @toggle="toggle" />
      </div>

      <template v-if="hasChildren">
        <div class="relative shrink-0" :style="{ width: layout.subtreeWidth + 'px', height: CONNECTOR_HEIGHT + 'px' }">
          <svg class="absolute inset-0 w-full h-full pointer-events-none" style="overflow: visible"
            :width="layout.subtreeWidth" :height="CONNECTOR_HEIGHT"
            :viewBox="`0 0 ${layout.subtreeWidth} ${CONNECTOR_HEIGHT}`">
            <line :x1="layout.stemX" y1="0" :x2="layout.stemX" :y2="JUNCTION_Y"
              stroke="rgba(255,255,255,0.18)" stroke-width="2" stroke-linecap="round" />

            <line v-if="node.reportees.length > 1"
              :x1="layout.barStart" :y1="JUNCTION_Y" :x2="layout.barEnd" :y2="JUNCTION_Y"
              stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-linecap="round" />

            <line v-for="(drop, i) in layout.dropPositions" :key="'drop-' + i"
              :x1="drop" :y1="JUNCTION_Y" :x2="drop" :y2="CONNECTOR_HEIGHT"
              stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </div>

        <transition name="expand">
          <div v-if="expanded" class="flex">
            <template v-for="(child, i) in node.reportees" :key="child.id">
              <div v-if="i > 0" :style="{ width: GAP + 'px' }" class="shrink-0"></div>
              <OrgChartNode :node="child" :layout="layout.childLayouts[i]" />
            </template>
          </div>
        </transition>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EmployeeCard from './EmployeeCard.vue'
import { GAP, CONNECTOR_HEIGHT, JUNCTION_Y } from '~/utils/treeLayout'

defineOptions({ name: 'OrgChartNode' })

const props = defineProps({
  node: { type: Object, required: true },
  layout: { type: Object, required: true },
})

const expanded = ref(true)

const hasChildren = computed(() => props.node.reportees?.length > 0)

function toggle() {
  expanded.value = !expanded.value
}
</script>

<style>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-12px) scaleY(0.95);
}
</style>
