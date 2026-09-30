<template>
  <div class="flex flex-col h-full">
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
      <!-- Header -->
      <div class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
        <h2 class="text-lg font-semibold uppercase text-white/90">Approval Flows</h2>
        <div class="flex items-center gap-2">
          <UiButton @click="openCreate" color="#4aff7a" text="Add Flow" prepend-icon="ion:add-circle" />
          <UiButton @click="load" color="#fff" text="Reload" prepend-icon="ion:refresh" :loading="approvalStore.loading" />
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
        <button v-for="tab in entityTabs" :key="tab.value"
          @click="activeTab = tab.value"
          class="flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200"
          :class="activeTab === tab.value ? 'bg-white/15 text-white/90' : 'text-white/50 hover:text-white/70'">
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="approvalStore.loading && !flows.length" class="text-center text-white/40 py-12 text-sm">
        Loading flows...
      </div>

      <!-- Empty -->
      <div v-else-if="!flows.length" class="text-center text-white/40 py-12 text-sm">
        No approval flows configured for {{ activeTabLabel }}.
        <br />
        <button @click="openCreate" class="mt-2 text-[#4aff7a] hover:underline text-xs">Create one now</button>
      </div>

      <!-- Flow Cards -->
      <div v-else class="grid gap-3">
        <div v-for="flow in flows" :key="flow.id"
          class="rounded-lg p-4 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-white/90 font-medium">{{ flow.name || flow.entity_type + ' Flow' }}</span>
              <span class="ml-2 text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                {{ flow.levels?.length || 0 }} level{{ (flow.levels?.length || 0) !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button @click="editFlow(flow)" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
              <button @click="deleteFlow(flow)" class="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
            </div>
          </div>

          <!-- Level Preview -->
          <div class="mt-3 space-y-1.5">
            <div v-for="lvl in (flow.levels || [])" :key="lvl.id"
              class="flex items-center gap-2 text-xs text-white/60">
              <span class="text-white/40 font-mono w-6">L{{ lvl.level }}</span>
              <span class="text-white/30">→</span>
              <span v-for="(approver, ai) in (lvl.approvers || [])" :key="ai"
                class="bg-white/5 border border-white/10 rounded px-2 py-0.5">
                {{ approver.employee?.full_name || approver.role || 'Unknown' }}
              </span>
              <span v-if="!lvl.approvers?.length" class="text-white/30 italic">No approvers</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Drawer -->
    <UiSidebarModal v-model="showDrawer" :title="editingFlow ? 'Edit Approval Flow' : 'Create Approval Flow'"
      :show-footer="false">
      <div class="space-y-4">
        <!-- Flow Name -->
        <div>
          <label class="block text-xs font-medium text-white/60 mb-1">Flow Name</label>
          <input v-model="approvalStore.form.name" placeholder="e.g. Leave Approval"
            class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30" />
        </div>

        <!-- Entity Type (only on create) -->
        <div v-if="!editingFlow">
          <label class="block text-xs font-medium text-white/60 mb-1">Entity Type</label>
          <select v-model="approvalStore.form.entity_type"
            class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/30">
            <option value="LEAVE">Leave</option>
            <option value="REGULARISATION">Regularisation</option>
            <option value="WORKDAY">Workday</option>
            <option value="EXIT">Exit</option>
          </select>
        </div>

        <!-- Levels -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-medium text-white/60">Approval Levels</label>
            <button @click="addLevel"
              class="text-xs text-[#4aff7a] hover:underline flex items-center gap-1">
              <Icon name="ion:add" class="w-3 h-3" /> Add Level
            </button>
          </div>

          <div v-if="!approvalStore.form.levels.length" class="text-xs text-white/40 py-4 text-center">
            No levels added. Click "Add Level" to start.
          </div>

          <div v-for="(level, li) in approvalStore.form.levels" :key="li"
            class="rounded-lg bg-white/5 border border-white/10 p-3 mb-2 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-white/70">Level {{ li + 1 }}</span>
              <button @click="removeLevel(li)" class="text-red-400 hover:text-red-300 text-xs">Remove</button>
            </div>

            <!-- Auto approve days -->
            <div class="flex items-center gap-2">
              <label class="text-[10px] text-white/50 w-28">Auto-approve after</label>
              <input v-model.number="level.auto_approve_days" type="number" min="0"
                class="w-16 bg-white/10 border border-white/15 rounded px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30" />
              <span class="text-[10px] text-white/40">days</span>
            </div>

            <!-- Approvers -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-white/50">Approvers</span>
                <button @click="addApprover(li)"
                  class="text-[10px] text-[#4aff7a] hover:underline">+ Add Approver</button>
              </div>
              <div v-for="(approver, ai) in level.approvers" :key="ai"
                class="flex items-center gap-2 mb-1">
                <input v-model="approver.user_id" placeholder="Employee ID"
                  class="flex-1 bg-white/10 border border-white/15 rounded px-2 py-1 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30" />
                <input v-model="approver.role" placeholder="Role (HR/MANAGER)"
                  class="w-28 bg-white/10 border border-white/15 rounded px-2 py-1 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30" />
                <button @click="removeApprover(li, ai)" class="text-red-400 hover:text-red-300 text-xs">
                  <Icon name="lucide:x" class="w-3 h-3" />
                </button>
              </div>
              <div v-if="!level.approvers?.length" class="text-[10px] text-white/30 italic py-1">
                No approvers added
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="approvalStore.error" class="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          {{ approvalStore.error }}
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-2">
          <UiButton :text="editingFlow ? 'Update Flow' : 'Create Flow'" color="#4aff7a"
            @click="save" :loading="approvalStore.loading" class="flex-1" />
          <UiButton text="Cancel" color="#fff" @click="showDrawer = false" />
        </div>
      </div>
    </UiSidebarModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApprovalStore } from '~/stores/organization/approval.store'

definePageMeta({ layout: 'organization' })

const approvalStore = useApprovalStore()

const activeTab = ref('LEAVE')
const showDrawer = ref(false)
const editingFlow = ref(null)

const entityTabs = [
  { label: 'Leave', value: 'LEAVE' },
  { label: 'Regularisation', value: 'REGULARISATION' },
  { label: 'Workday', value: 'WORKDAY' },
  { label: 'Exit', value: 'EXIT' },
]

const activeTabLabel = computed(() => entityTabs.find((t) => t.value === activeTab.value)?.label || activeTab.value)

const flows = computed(() => {
  return approvalStore.flows.filter((f) => f.entity_type === activeTab.value)
})

function openCreate() {
  editingFlow.value = null
  approvalStore.resetForm()
  approvalStore.form.entity_type = activeTab.value
  showDrawer.value = true
}

function editFlow(flow) {
  editingFlow.value = flow
  approvalStore.loadFlow(flow)
  showDrawer.value = true
}

async function save() {
  let res
  if (editingFlow.value) {
    res = await approvalStore.updateFlow(editingFlow.value.id)
  } else {
    res = await approvalStore.createFlow()
  }
  if (res?.success) {
    showDrawer.value = false
  }
}

async function deleteFlow(flow) {
  const pendingInstances = approvalStore.pendingApprovals?.filter(
    (a) => a.flow_id === flow.id
  )?.length || 0

  if (pendingInstances > 0) {
    alert('Cannot delete: this flow has pending approval instances.')
    return
  }

  if (!confirm(`Delete "${flow.name || flow.entity_type + ' Flow'}"?`)) return
  await approvalStore.deleteFlow(flow.id)
}

function addLevel() {
  approvalStore.form.levels.push({
    level: approvalStore.form.levels.length + 1,
    auto_approve_days: 3,
    escalation_role: '',
    is_active: true,
    approvers: [],
  })
}

function removeLevel(idx) {
  approvalStore.form.levels.splice(idx, 1)
  // Re-number levels
  approvalStore.form.levels.forEach((lvl, i) => {
    lvl.level = i + 1
  })
}

function addApprover(levelIdx) {
  if (!approvalStore.form.levels[levelIdx].approvers) {
    approvalStore.form.levels[levelIdx].approvers = []
  }
  approvalStore.form.levels[levelIdx].approvers.push({ user_id: '', role: '' })
}

function removeApprover(levelIdx, approverIdx) {
  approvalStore.form.levels[levelIdx].approvers.splice(approverIdx, 1)
}

async function load() {
  await approvalStore.fetchFlows()
}

onMounted(() => {
  load()
})
</script>
