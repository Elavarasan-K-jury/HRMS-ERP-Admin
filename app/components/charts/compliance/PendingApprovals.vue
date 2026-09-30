<template>
    <ChartCard height="100" title="Pending Approvals">
        <div v-if="loading" class="text-white/40 text-xs py-2">Loading...</div>
        <div v-else-if="error" class="text-red-400 text-xs py-2">{{ error }}</div>
        <template v-else>
            <ul class="text-white/80 text-sm space-y-2">
                <li v-for="item in summary" :key="item.type" class="flex items-center justify-between">
                    <span>{{ item.label }}</span>
                    <span class="text-brand-300 font-medium">{{ item.count }}</span>
                </li>
                <li v-if="!summary.length" class="text-white/40 text-xs">No pending approvals</li>
            </ul>
            <div v-if="total > 0" class="mt-3 pt-2 border-t border-white/10">
                <NuxtLink :to="inboxLink"
                    class="text-xs text-[#4aff7a] hover:underline flex items-center gap-1">
                    View all {{ total }} pending
                    <Icon name="lucide:arrow-right" class="w-3 h-3" />
                </NuxtLink>
            </div>
        </template>
    </ChartCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChartCard from '../ChartCard.vue'
import { useApprovalStore } from '~/stores/organization/approval.store'
import { useAuthStore } from '~/stores/shared/auth.store'

const approvalStore = useApprovalStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)

const orgId = computed(() => authStore.admin?.organization_id || authStore.organization || '')
const inboxLink = computed(() => `/organization/${orgId.value}/approvals/inbox`)
const total = computed(() => approvalStore.totalPending)

const summary = computed(() => {
  const counts = { LEAVE: 0, REGULARISATION: 0, WORKDAY: 0, EXIT: 0 }
  for (const a of approvalStore.pendingApprovals) {
    if (counts[a.entity_type] !== undefined) counts[a.entity_type]++
  }
  const items = [
    { type: 'LEAVE', label: 'Leaves', count: counts.LEAVE },
    { type: 'REGULARISATION', label: 'Regularisations', count: counts.REGULARISATION },
    { type: 'WORKDAY', label: 'Workdays', count: counts.WORKDAY },
    { type: 'EXIT', label: 'Exits', count: counts.EXIT },
  ]
  return items.filter((i) => i.count > 0)
})

onMounted(async () => {
  loading.value = true
  try {
    await approvalStore.fetchPending(1, 50)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>
