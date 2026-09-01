<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <!-- Header bar -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90 capitalize">
                {{ activeTab }} Hierarchy
            </h2>

            <div class="flex items-center gap-2">
                <!-- Tabs -->
                <button
                    class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border transition flex items-center gap-1"
                    :class="activeTab === 'organization'
                        ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-100'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'"
                    @click="changeTab('organization')">
                    <Icon name="lucide:layers" class="w-4 h-4" />
                    Organization
                </button>

                <button
                    class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border transition flex items-center gap-1"
                    :class="activeTab === 'department'
                        ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-100'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'"
                    @click="changeTab('department')">
                    <Icon name="lucide:git-branch" class="w-4 h-4" />
                    Department
                </button>

                <!-- Reload -->
                <UiButton v-if="activeTab === 'organization'" :disabled="orgLoading" @click="reloadOrg" color="#fff"
                    text="Reload" prepend-icon="ion:refresh" />

                <UiButton v-else :disabled="deptLoading || !currentDepartmentId" @click="reloadDept" color="#fff"
                    text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <!-- Content -->
        <div class="grid grid-cols-12 gap-2">

            <!-- Left selector for departments -->
            <div class="col-span-12" v-if="activeTab === 'department'">
                <div
                    class="rounded-lg p-4 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg justify-between items-center flex gap-3">
                    <h3 class="text-sm font-semibold text-white/80 flex items-center gap-2">
                        <Icon name="lucide:building-2" class="w-4 h-4" />
                        Department
                    </h3>

                    <FormSelect v-model="currentDepartmentId" :options="departmentOptions"
                        placeholder="Select Department" color="#fff" />
                    <FormSelect v-if="currentDepartmentId" v-model="subDepartmentId" :options="subDepartmentOptions"
                        placeholder="Sub Department" color="#fff" />

                    <p class="text-[11px] text-white/60 leading-snug">
                        Select a department to view its reporting hierarchy (head → reportees).
                    </p>

                    <UiButton :disabled="!currentDepartmentId || deptLoading" @click="loadDeptHierarchy" color="#4aff7a"
                        text="Load Hierarchy" prepend-icon="lucide:play-circle" />
                </div>
            </div>

            <!-- Main Panel -->
            <div class="col-span-12">

                <!-- Organization section (unchanged) -->
                <OrganizationTree v-if="activeTab === 'organization'" :levels="orgLevels" />


                <!-- Department hierarchy (updated to NEW horizontal org chart) -->
                <div v-else
                    class="rounded-lg p-4 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg h-full flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <h3 class="text-sm font-semibold text-white/80 flex items-center gap-2">
                            <Icon name="lucide:git-branch" class="w-4 h-4" />
                            Department Reporting Hierarchy
                        </h3>
                    </div>

                    <div v-if="deptLoading" class="flex-1 flex items-center justify-center">
                        <UiLoader />
                    </div>

                    <div v-else-if="deptError" class="flex-1 flex items-center justify-center text-xs text-red-300">
                        {{ deptError }}
                    </div>

                    <div v-else class="flex-1 overflow-x-auto pr-1">
                        <OrgChartTree :root="deptTree" />
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../../../stores/auth.store'
import { useDepartmentStore } from '../../../stores/department.store'
import { useHierarchyStore } from '../../../stores/hierarchy.store'

import OrgChartTree from '../../../components/hierarchy/OrgChartTree.vue'
import OrganizationTree from '../../../components/hierarchy/OrganizationTree.vue'

definePageMeta({
    layout: 'organization',
})

const route = useRoute()
const router = useRouter()
const activeTab = ref('organization')

const authStore = useAuthStore()
const departmentStore = useDepartmentStore()
const hierarchyStore = useHierarchyStore()

const {
    orgHierarchy,
    deptHierarchy,
    orgLoading,
    deptLoading,
    orgError,
    deptError,
} = storeToRefs(hierarchyStore)

const changeTab = async (tab) => {
    activeTab.value = tab
    deptHierarchy.value = null
    orgHierarchy.value = null
    router.replace({ query: { tab } })
    if (tab === 'organization') {
        await reloadOrg()
    } else {
        departmentStore.fetchAllDepartments()
    }
}

const orgLevels = computed(() => orgHierarchy.value?.levels || [])
const deptTree = computed(() => (deptHierarchy.value?.hierarchy ? {
    ...{
        ...deptHierarchy.value?.hierarchy,
        isHead: true
    }
} : null))

const departmentOptions = computed(() =>
    departmentStore.department_select.filter(d => !d.parent_id)
)

const currentDepartmentId = ref(null)
const subDepartmentId = ref(null)

const subDepartmentOptions = computed(() => {
    if (!currentDepartmentId.value) return []
    return departmentStore.department_select.filter(d => d.parent_id === currentDepartmentId.value)
})

const reloadOrg = async () => {
    if (!authStore.organization) return
    await hierarchyStore.fetchOrganizationHierarchy(authStore.organization)
}

const reloadDept = async () => {
    if (!authStore.organization || !currentDepartmentId.value) return
    const deptId = subDepartmentId.value || currentDepartmentId.value
    await hierarchyStore.fetchDepartmentHierarchy(
        authStore.organization,
        deptId
    )
}

const loadDeptHierarchy = reloadDept

watch(currentDepartmentId, () => {
    subDepartmentId.value = null
})

onMounted(async () => {
    if (route.query.tab && ['organization', 'department'].includes(route.query.tab)) {
        activeTab.value = route.query.tab
    } else {
        router.replace({ query: { tab: 'organization' } })
        activeTab.value = 'organization'
    }

    if (authStore.organization) {
        if (activeTab.value === 'department') {
            departmentStore.fetchAllDepartments()
        }
        await reloadOrg()
    }
});
</script>
