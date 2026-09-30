<template>
  <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
    <!-- Header -->
    <div class="rounded-lg p-5 bg-white/10 border min-h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold uppercase text-white/90">Leave Types</h2>
        <p class="text-xs text-white/55 max-w-xl mt-1 leading-relaxed">
          Configure leave types available for your organization. Each type defines accrual rules,
          carry-forward policies, and eligibility constraints.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UiSearch v-model="search" :loading="leaveTypeStore.loading" width="280px"
          placeholder="Search leave types..." />
        <UiButton @click="openCreate" color="#4aff7a" text="Add Leave Type" prepend-icon="ion:add-circle" />
        <UiButton @click="leaveTypeStore.fetchLeaveTypes()" color="#fff" prepend-icon="ion:refresh"
          :loading="leaveTypeStore.loading" />
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-lg border border-white/15 overflow-hidden">
      <div v-if="!filteredTypes.length && !leaveTypeStore.loading"
        class="text-center text-white/40 py-8 text-sm">
        No leave types configured
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-white/5 border-b border-white/10">
            <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Name</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Code</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Max/Year</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Paid</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Half Day</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Carry Fwd</th>
            <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Status</th>
            <th class="px-3 py-2 text-right text-xs font-medium text-white/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lt in filteredTypes" :key="lt.id"
            class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="px-3 py-2 text-white/80 text-xs font-medium">{{ lt.name }}</td>
            <td class="px-3 py-2 text-white/60 text-xs">{{ lt.code }}</td>
            <td class="px-3 py-2 text-white/60 text-xs">{{ lt.max_per_year || '-' }}</td>
            <td class="px-3 py-2">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                :class="lt.paid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'">
                {{ lt.paid ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-3 py-2 text-white/60 text-xs">{{ lt.allow_half_day ? 'Yes' : 'No' }}</td>
            <td class="px-3 py-2 text-white/60 text-xs">{{ lt.carry_forward ? 'Yes' : 'No' }}</td>
            <td class="px-3 py-2">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                :class="lt.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'">
                {{ lt.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-3 py-2 text-right">
              <div class="flex items-center justify-end gap-1">
                <button @click="openEdit(lt)"
                  class="px-2 py-1 text-[10px] font-medium rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                  Edit
                </button>
                <button @click="confirmDelete(lt)"
                  class="px-2 py-1 text-[10px] font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Drawer -->
    <UiSidebarModal v-model="showForm" :title="isEditing ? 'Edit Leave Type' : 'Add Leave Type'">
      <form @submit.prevent="submitForm" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Name *</label>
            <input v-model="leaveTypeStore.form.name" required
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30"
              placeholder="e.g. Casual Leave" />
          </div>
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Code *</label>
            <input v-model="leaveTypeStore.form.code" required
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30"
              placeholder="e.g. CL" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-white/60 mb-1">Description</label>
          <textarea v-model="leaveTypeStore.form.description" rows="2"
            class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
            placeholder="Description (optional)" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Max Per Year</label>
            <input type="number" v-model.number="leaveTypeStore.form.max_per_year" min="0"
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30" />
          </div>
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Default Annual Allocation</label>
            <input type="number" v-model.number="leaveTypeStore.form.default_annual_allocation" min="0"
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30"
              placeholder="Days per year" />
          </div>
        </div>

        <div class="flex items-end gap-4 pb-1">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="leaveTypeStore.form.paid" class="accent-[#4aff7a]" />
            <span class="text-xs text-white/70">Paid</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="leaveTypeStore.form.allow_half_day" class="accent-[#4aff7a]" />
            <span class="text-xs text-white/70">Half Day</span>
          </label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Carry Forward</label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="leaveTypeStore.form.carry_forward" class="accent-[#4aff7a]" />
                <span class="text-xs text-white/70">Enable</span>
              </label>
              <input v-if="leaveTypeStore.form.carry_forward" type="number"
                v-model.number="leaveTypeStore.form.max_carry_forward" min="0"
                class="w-20 bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30"
                placeholder="Max" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Sandwich Rule</label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="leaveTypeStore.form.sandwich_rule" class="accent-[#4aff7a]" />
              <span class="text-xs text-white/70">Apply sandwich rule</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Max Consecutive Days</label>
            <input type="number" v-model.number="leaveTypeStore.form.max_consecutive_days" min="0"
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30" />
          </div>
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Gender Restriction</label>
            <select v-model="leaveTypeStore.form.gender_restriction"
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30">
              <option value="NONE">None</option>
              <option value="MALE">Male Only</option>
              <option value="FEMALE">Female Only</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Requires Document</label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="leaveTypeStore.form.requires_document" class="accent-[#4aff7a]" />
                <span class="text-xs text-white/70">After</span>
              </label>
              <input v-if="leaveTypeStore.form.requires_document" type="number"
                v-model.number="leaveTypeStore.form.document_after_days" min="0"
                class="w-20 bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30"
                placeholder="Days" />
              <span v-if="leaveTypeStore.form.requires_document" class="text-xs text-white/50">days</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Probation Allowed</label>
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="leaveTypeStore.form.probation_allowed" class="accent-[#4aff7a]" />
                <span class="text-xs text-white/70">After</span>
              </label>
              <input v-if="leaveTypeStore.form.probation_allowed" type="number"
                v-model.number="leaveTypeStore.form.min_service_months" min="0"
                class="w-20 bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-white/30"
                placeholder="Months" />
              <span v-if="leaveTypeStore.form.probation_allowed" class="text-xs text-white/50">months</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <UiButton type="submit" :text="isEditing ? 'Update' : 'Create'" color="#4aff7a" class="flex-1"
            :loading="leaveTypeStore.loading" />
          <UiButton text="Cancel" color="#fff" @click="showForm = false" />
        </div>
      </form>
    </UiSidebarModal>

    <!-- Delete Confirmation -->
    <UiModal v-model="showDeleteConfirm" title="Delete Leave Type?" size="sm">
      <p class="text-white/85 text-sm leading-relaxed">
        Are you sure you want to delete
        <span class="font-semibold text-white">"{{ deleteTarget?.name }}"</span>?
        This action cannot be undone.
      </p>
      <template #footer>
        <UiButton @click="showDeleteConfirm = false" color="#fff" text="Cancel" />
        <UiButton @click="doDelete" color="#750d0d" text="Delete" :loading="leaveTypeStore.loading" />
      </template>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeaveTypeStore } from '~/stores/organization/leaveType.store'

definePageMeta({ layout: 'organization' })

const leaveTypeStore = useLeaveTypeStore()

const search = ref('')
const showForm = ref(false)
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const isEditing = computed(() => !!leaveTypeStore.leave_type_id)

const filteredTypes = computed(() => {
  if (!search.value) return leaveTypeStore.leaveTypes
  const q = search.value.toLowerCase()
  return leaveTypeStore.leaveTypes.filter(
    (lt) => lt.name?.toLowerCase().includes(q) || lt.code?.toLowerCase().includes(q)
  )
})

function openCreate() {
  leaveTypeStore.resetForm()
  showForm.value = true
}

function openEdit(lt) {
  leaveTypeStore.loadLeaveType(lt)
  showForm.value = true
}

function confirmDelete(lt) {
  deleteTarget.value = lt
  showDeleteConfirm.value = true
}

async function doDelete() {
  await leaveTypeStore.deleteLeaveType(deleteTarget.value.id)
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

async function submitForm() {
  const res = await leaveTypeStore.submit()
  if (res.success) showForm.value = false
}

onMounted(() => {
  leaveTypeStore.fetchLeaveTypes()
})
</script>
