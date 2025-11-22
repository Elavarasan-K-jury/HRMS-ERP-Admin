<template>
    <div>
        <!-- LEVEL ROW -->
        <div class="flex items-center gap-2.5 hover:bg-white/20 cursor-pointer py-2.5 px-3 rounded-lg select-none transition-all duration-200 hover:bg-white/5 group"
            :style="{ marginLeft: `${depth * 20}px` }" @click="toggle">
            <!-- Chevron - FIXED WITH PROPER REACTIVITY -->
            <div class="transition-transform duration-200" :class="{ 'rotate-90': isOpen }">
                <Icon name="lucide:chevron-right" class="w-4 h-4 text-white/60 group-hover:text-white/80" />
            </div>

            <!-- Folder Icon -->
            <Icon :name="isOpen ? 'lucide:folder-open' : 'lucide:folder'" class="w-4 h-4 transition-all duration-200"
                :class="isOpen ? 'text-blue-400' : 'text-white/70 group-hover:text-white/90'" />

            <!-- Level Label -->
            <span class="text-sm text-white/95 font-semibold">
                {{ safeLabel }}
            </span>

            <!-- Counts Badge -->
            <div class="flex items-center gap-1.5 ml-auto">
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                    {{ roleCount }} {{ roleCount !== 1 ? 'Roles' : 'Role' }}
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    {{ empCount }} {{ empCount !== 1 ? 'Employees' : 'Employee' }}
                </span>
            </div>
        </div>

        <!-- CHILDREN -->
        <transition name="slide-fade">
            <div v-show="isOpen" class="space-y-0.5 mt-1">

                <!-- EMPTY LEVEL -->
                <div v-if="roleCount === 0 && empCount === 0"
                    class="text-xs text-white/40 italic py-2 px-3 rounded-lg bg-white/5"
                    :style="{ marginLeft: `${(depth + 1) * 20}px` }">
                    <Icon name="lucide:inbox" class="w-3.5 h-3.5 inline mr-1.5" />
                    No items in this level
                </div>

                <!-- DESIGNATION FOLDERS -->
                <div v-for="des in node.designations" :key="des.id">
                    <!-- Folder Row -->
                    <div class="flex items-center gap-2 py-2 px-3 cursor-pointer select-none rounded-lg transition-all duration-200 hover:bg-white/5 group"
                        :style="{ marginLeft: `${(depth + 1) * 20}px` }" @click="toggleGroup(des.id)">
                        <!-- FIXED CHEVRON -->
                        <div class="transition-transform duration-200"
                            :class="{ 'rotate-90': currentOpenGroup === des.id }">
                            <Icon name="lucide:chevron-right"
                                class="w-3.5 h-3.5 text-white/50 group-hover:text-white/70" />
                        </div>

                        <Icon :name="currentOpenGroup === des.id ? 'lucide:folder-open' : 'lucide:folder'"
                            class="w-3.5 h-3.5 transition-all duration-200"
                            :class="currentOpenGroup === des.id ? 'text-purple-400' : 'text-white/60 group-hover:text-white/80'" />

                        <span class="text-sm text-white/90 font-medium group-hover:text-white">
                            {{ des.name }}
                        </span>

                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 ml-auto">
                            {{ employeesByDesignation(des.name).length }} {{ employeesByDesignation(des.name).length !==
                                1 ? 'Employees' : 'Employee' }}
                        </span>
                    </div>

                    <!-- EMPLOYEES -->
                    <transition name="slide-fade">
                        <div v-show="currentOpenGroup === des.id" class="space-y-1 mt-1">

                            <div v-for="emp in employeesByDesignation(des.name)" :key="emp.id"
                                class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-all duration-200 group"
                                :style="{ marginLeft: `${(depth + 2) * 20}px` }">
                                <div class="flex items-center gap-2.5">
                                    <div
                                        class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <Icon name="lucide:user" class="w-3.5 h-3.5 text-white" />
                                    </div>

                                    <div class="flex flex-col">
                                        <span class="text-sm text-white/95 font-medium">{{ emp.full_name }}</span>
                                        <span class="text-[10px] text-white/50">{{ emp.designation }}</span>
                                    </div>
                                </div>

                                <!-- Eye button -->
                                <button @click.stop="view(emp)"
                                    class="opacity-0 group-hover:opacity-100 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-1.5">
                                    <Icon name="lucide:eye" class="w-3.5 h-3.5 text-white/70" />
                                    <span class="text-xs text-white/80 font-medium">View</span>
                                </button>
                            </div>

                            <!-- EMPTY DESIGNATION -->
                            <div v-if="employeesByDesignation(des.name).length === 0"
                                class="text-xs text-white/40 italic py-2 px-3 rounded-lg bg-white/5"
                                :style="{ marginLeft: `${(depth + 2) * 20}px` }">
                                <Icon name="lucide:users" class="w-3.5 h-3.5 inline mr-1.5 opacity-50" />
                                No employees assigned
                            </div>
                        </div>
                    </transition>
                </div>

            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
    node: { type: Object, required: true },
    depth: { type: Number, default: 0 }
})

/* -------- STATE -------- */
const isOpen = ref(false)
const currentOpenGroup = ref(null) // FIXED: Using single value instead of object for better reactivity

/* -------- LABEL FIX -------- */
const safeLabel = computed(() =>
    props.node.label ||
    props.node.level?.replace(/_/g, ' ') ||
    'Untitled Level'
)

/* -------- LOGIC -------- */
const toggle = () => {
    isOpen.value = !isOpen.value
    // Close all designation folders when closing the level
    if (!isOpen.value) {
        currentOpenGroup.value = null
    }
}

// FIXED: Accordion behavior with proper reactivity
const toggleGroup = (id) => {
    currentOpenGroup.value = currentOpenGroup.value === id ? null : id
}

const employeesByDesignation = (designationName) =>
    (props.node.employees || []).filter(emp => emp.designation === designationName)

const roleCount = computed(() => props.node.designations?.length || 0)
const empCount = computed(() => props.node.employees?.length || 0)

/* -------- NAVIGATION -------- */
function view(emp) {
    router.push({
        path: `/panel/super-admin/organization/${props.node.organization_id}/employee/list`,
        query: { employee_id: emp.id, preview: true }
    })
}
</script>

<style scoped>
.slide-fade-enter-active {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>