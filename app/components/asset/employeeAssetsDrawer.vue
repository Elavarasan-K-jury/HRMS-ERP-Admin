<template>
    <UiSidebarModal v-model="drawerOpen" title="Assigned Assets" width="600px">
        <template #default>
            <!-- Employee Header -->
            <div v-if="drawerEmployee" class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                    {{ getInitials(drawerEmployee.employee_name) }}
                </div>
                <div class="flex-1">
                    <div class="text-white font-semibold text-base">{{ drawerEmployee.employee_name }}</div>
                    <div class="text-white/50 text-sm">{{ drawerEmployee.employee_code }}</div>
                </div>
                <div class="text-right">
                    <div class="text-white font-semibold text-lg">{{ drawerAssignments.length }}</div>
                    <div class="text-white/50 text-xs">Total Assets</div>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="drawerLoading" class="flex items-center justify-center py-10">
                <div class="text-white/50 text-sm">Loading assets...</div>
            </div>

            <!-- Empty -->
            <div v-else-if="!drawerAssignments.length" class="flex flex-col items-center justify-center py-10 gap-2 text-white/50">
                <Icon name="lucide:inbox" class="w-8 h-8" />
                <span>No assets assigned to this employee.</span>
            </div>

            <!-- Asset List -->
            <div v-else class="space-y-2">
                <div v-for="assignment in drawerAssignments" :key="assignment.id"
                    class="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition-colors">

                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <Icon name="ion:laptop-outline" class="w-5 h-5 text-cyan-400" />
                            <div>
                                <div class="text-white font-medium text-sm">
                                    {{ assignment.asset?.asset_tag || assignment.asset?.serial_number || '—' }}
                                </div>
                                <div class="text-white/50 text-xs">
                                    {{ assignment.asset?.model?.brand }} {{ assignment.asset?.model?.model_name }}
                                </div>
                            </div>
                        </div>
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                            :class="assignmentStatusClass(assignment.status)">
                            {{ assignment.status }}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs text-white/60 mt-3">
                        <div>
                            <span class="text-white/40">Category:</span>
                            {{ assignment.asset?.category?.name || '—' }}
                        </div>
                        <div>
                            <span class="text-white/40">Serial:</span>
                            {{ assignment.asset?.serial_number || '—' }}
                        </div>
                        <div>
                            <span class="text-white/40">Assigned:</span>
                            {{ formatDate(assignment.assigned_date) }}
                        </div>
                        <div v-if="assignment.condition_assign">
                            <span class="text-white/40">Condition:</span>
                            {{ assignment.condition_assign }}
                        </div>
                    </div>

                    <div v-if="assignment.notes" class="mt-2 text-xs text-white/50 border-t border-white/5 pt-2">
                        {{ assignment.notes }}
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <UiButton @click="closeDrawer" color="#fff" text="Close" prepend-icon="ion:close-circle" />
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAssetAssignmentStore } from '../../stores/organization/assetAssignment.store'

const assignmentStore = useAssetAssignmentStore()
const {
    drawerOpen,
    drawerEmployee,
    drawerAssignments,
    drawerLoading,
} = storeToRefs(assignmentStore)

const closeDrawer = () => {
    assignmentStore.closeDrawer()
}

function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function assignmentStatusClass(status) {
    const map = {
        'ASSIGNED': 'bg-green-500/20 text-green-300',
        'ASSIGNMENT_PENDING': 'bg-indigo-500/20 text-indigo-300',
        'RETURN_REQUESTED': 'bg-orange-500/20 text-orange-300',
        'RETURNED': 'bg-slate-500/20 text-slate-300',
    }
    return map[status] || 'bg-white/10 text-white/60'
}
</script>
