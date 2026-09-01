<template>
  <div class="w-full overflow-x-auto py-10 px-8 relative">
    <div class="absolute inset-0 pointer-events-none"
      style="background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px;">
    </div>
    <div class="flex justify-center min-w-max relative z-10">
      <template v-if="roots && roots.length > 0">
        <div class="flex flex-col items-center gap-10">
          <template v-for="(root, idx) in roots" :key="root.id">
            <div v-if="idx > 0" class="w-px h-6 bg-white/10"></div>
            <OrgChartNode :node="root" :layout="layouts[idx]" />
          </template>
        </div>
      </template>

      <div v-else class="flex flex-col items-center justify-center py-12 px-8">
        <div class="relative mb-6">
          <div class="w-28 h-28 rounded-full bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-xl shadow-lg">
            <Icon name="lucide:users-round" class="w-14 h-14 text-white/30" />
          </div>
        </div>
        <h3 class="text-xl font-bold text-white/90 mb-2">No Employees Found</h3>
        <p class="text-sm text-white/50 text-center max-w-sm">
          The organization hierarchy is empty. Add employees to start building your org structure.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import OrgChartNode from './OrgChartNode.vue'
import { computeLayout } from '~/utils/treeLayout'

const props = defineProps({
  roots: Array,
  root: Object,
})

const effectiveRoots = computed(() => {
  if (props.roots?.length) return props.roots
  if (props.root) return [props.root]
  return []
})

const layouts = computed(() => {
  return effectiveRoots.value.map(r => computeLayout(r))
})
</script>
