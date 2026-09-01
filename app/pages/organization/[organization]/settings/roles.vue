<template>
    <div class="flex flex-col h-full">
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">Roles &amp; Permissions</h2>
            <div class="flex items-center gap-2">
                <UiButton @click="openCreateRole = true" color="#4aff7a" text="Add Role"
                    prepend-icon="ion:add-circle" />
                <UiButton @click="fetchRoles" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>

        <div v-if="loading" class="text-center text-white/60 py-12">Loading roles...</div>

        <div v-else class="grid gap-3">
            <div v-for="role in roles" :key="role.id"
                class="rounded-lg p-4 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
                <div class="flex items-center justify-between cursor-pointer" @click="toggleRole(role.id)">
                    <div class="flex items-center gap-3">
                        <Icon :name="expandedRole === role.id ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                            class="w-5 h-5 text-white/60" />
                        <div>
                            <span class="text-white/90 font-medium">{{ role.name }}</span>
                            <span v-if="role.is_system"
                                class="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">System</span>
                            <span v-if="!role.is_active"
                                class="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Inactive</span>
                            <p v-if="role.description" class="text-xs text-white/50 mt-0.5">{{ role.description }}</p>
                        </div>
                    </div>
                    <button v-if="!role.is_system" @click.stop="deleteRole(role.id)"
                        class="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>

                <transition name="collapse">
                    <div v-if="expandedRole === role.id" class="mt-4 pt-4 border-t border-white/10">
                        <div class="grid grid-cols-12 gap-6">
                            <div class="col-span-7">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="text-sm font-semibold text-white/70">Permissions</h3>
                                    <label v-if="modulePerms.length" class="flex items-center gap-1.5 cursor-pointer text-xs text-white/70"
                                        :class="allScopeSelected ? 'text-[#4aff7a]' : ''">
                                        <input type="checkbox" :checked="allScopeSelected"
                                            @change="toggleScopeAll(role.id)"
                                            class="accent-[#4aff7a]" />
                                        Select all
                                    </label>
                                </div>
                                <div v-if="loadingPerms" class="text-xs text-white/40">Loading...</div>
                                <div v-else class="space-y-3 max-h-72 overflow-y-auto">
                                    <div
                                        class="flex items-center justify-between rounded-lg bg-white/10 border border-white/10 px-3 py-2 mb-1">
                                        <span class="text-xs font-semibold text-white/70 uppercase">Organization Modules</span>
                                    </div>
                                    <div v-for="mod in moduleTree" :key="mod.key"
                                        class="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                                        <!-- Main module row -->
                                        <div class="flex items-center justify-between gap-3">
                                            <div class="flex items-center gap-2 min-w-0">
                                                <button v-if="mod.children.length" @click="toggleModuleOpen(mod.key)"
                                                    class="shrink-0 text-white/60 hover:text-white">
                                                    <Icon :name="openModules.has(mod.key) ? 'lucide:chevron-down' : 'lucide:chevron-right'"
                                                        class="w-4 h-4" />
                                                </button>
                                                <Icon v-else name="lucide:dot" class="w-4 h-4 text-white/30 shrink-0" />
                                                <Icon :name="mod.icon || 'ion:grid-outline'"
                                                    class="w-4 h-4 text-white/50 shrink-0" />
                                                <span class="text-sm text-white/85 font-medium truncate">{{ mod.name }}</span>
                                            </div>
                                            <div class="flex items-center gap-3 shrink-0">
                                                <!-- Parent module select-all (if has children) -->
                                                <label v-if="mod.children.length"
                                                    class="flex items-center gap-1.5 cursor-pointer"
                                                    :class="isModuleSelected(mod) ? 'text-[#4aff7a]' : 'text-white/40'">
                                                    <input type="checkbox" :checked="isModuleSelected(mod)"
                                                        @change="toggleModuleAll(role.id, mod)"
                                                        class="accent-[#4aff7a]" />
                                                    <span class="text-xs text-white/60">All</span>
                                                </label>
                                                <label v-for="action in mod.perms" :key="action.id"
                                                    class="flex items-center gap-1.5 cursor-pointer"
                                                    :title="action.action === 'manage' ? 'Manage implies full CRUD (create, view, edit, delete)' : ''"
                                                    :class="rolePermSet.has(action.id) ? 'text-white/90' : 'text-white/40'">
                                                    <input type="checkbox" :checked="rolePermSet.has(action.id)"
                                                        @change="togglePerm(role.id, action.id)"
                                                        class="accent-[#4aff7a]" />
                                                    <span class="text-xs capitalize">{{ action.action }}</span>
                                                </label>
                                            </div>
                                        </div>

                                        <!-- Sub-modules accordion -->
                                        <transition name="collapse">
                                            <div v-if="mod.children.length && openModules.has(mod.key)"
                                                class="mt-2 ml-5 pl-3 border-l border-white/10 space-y-1.5">
                                                <div v-for="sub in mod.children" :key="sub.key"
                                                    class="flex items-center justify-between gap-3 rounded-md bg-white/5 border border-white/10 px-3 py-2">
                                                    <div class="flex items-center gap-2 min-w-0">
                                                        <Icon name="lucide:git-branch"
                                                            class="w-3.5 h-3.5 text-white/40 shrink-0" />
                                                        <span class="text-xs text-white/80 font-medium truncate">{{ sub.name }}</span>
                                                    </div>
                                                    <div class="flex items-center gap-3 shrink-0">
                                                        <label v-for="action in sub.perms" :key="action.id"
                                                            class="flex items-center gap-1.5 cursor-pointer"
                                                            :title="action.action === 'manage' ? 'Manage implies full CRUD (create, view, edit, delete)' : ''"
                                                            :class="rolePermSet.has(action.id) ? 'text-white/90' : 'text-white/40'">
                                                            <input type="checkbox" :checked="rolePermSet.has(action.id)"
                                                                @change="togglePerm(role.id, action.id)"
                                                                class="accent-[#4aff7a]" />
                                                            <span class="text-xs capitalize">{{ action.action }}</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </transition>
                                    </div>
                                    <div v-if="modulePerms.length === 0" class="text-xs text-white/40">No permissions</div>
                                </div>
                            </div>
                            <div class="col-span-5">
                                <h3 class="text-sm font-semibold text-white/70 mb-2">Assigned Users</h3>
                                <div v-if="loadingAdmins" class="text-xs text-white/40">Loading...</div>
                                <div v-else class="flex flex-col gap-2 max-h-56 overflow-y-auto">
                                    <div v-for="assigned in assignedUsers[role.id] || []" :key="assigned.kind + '-' + assigned.id"
                                        class="flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm text-white/90 truncate">{{ assigned.name }}</span>
                                                <span v-if="assigned.kind === 'employee'"
                                                    class="text-[10px] uppercase tracking-wide text-white/40 px-1.5 py-0.5 rounded bg-white/10">Employee</span>
                                                <span v-else
                                                    class="text-[10px] uppercase tracking-wide text-[#4aff7a]/70 px-1.5 py-0.5 rounded bg-[#4aff7a]/10">Admin</span>
                                            </div>
                                            <div class="text-xs text-white/40">{{ assigned.email || assigned.phone }}</div>
                                        </div>
                                        <button @click="unassignUser(role.id, assigned)"
                                            class="text-red-400 hover:text-red-300 text-xs whitespace-nowrap">Remove</button>
                                    </div>
                                    <div v-if="(assignedUsers[role.id] || []).length === 0" class="text-xs text-white/40">No users assigned
                                    </div>
                                </div>
                                <button @click="openAssignModal(role.id)"
                                    class="mt-3 text-xs text-[#4aff7a] hover:text-white transition-colors flex items-center gap-1">
                                    <Icon name="ion:add" class="w-4 h-4" /> Assign user
                                </button>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div v-if="!loading && roles.length === 0" class="text-center text-white/40 py-12">
            No roles found. Click "Add Role" to create one.
        </div>
    </div>

    <UiSidebarModal v-model="openCreateRole" title="Create Role">
        <div class="flex flex-col gap-4 p-4">
            <FormInput v-model="newRole.name" color="#fff" size="lg" rounded="lg" placeholder="Role name" />
            <FormInput v-model="newRole.description" color="#fff" size="lg" rounded="lg" placeholder="Description (optional)" />
            <UiButton @click="createRole" color="#4aff7a" text="Create" :loading="creating" />
        </div>
    </UiSidebarModal>

    <UiSidebarModal v-model="openAssign" title="Assign Admins">
        <div class="flex flex-col gap-4 p-4">
            <FormInput v-model="assignSearch" color="#fff" size="sm" rounded="lg" placeholder="Search admins & employees" />
            <div v-if="loadingAdmins" class="text-xs text-white/40">Loading...</div>
            <div v-else class="flex flex-col gap-2">
                <div v-for="candidate in filteredCandidates" :key="candidate.kind + '-' + candidate.id"
                    class="flex items-center gap-2 rounded-lg p-2.5 bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    :class="assignedSet.has(candidate.kind + '-' + candidate.id) ? 'border-[#4aff7a]/40' : 'border-white/10'">
                    <input type="checkbox"
                        :checked="assignedSet.has(candidate.kind + '-' + candidate.id)"
                        @change="toggleAssignment(candidate)"
                        class="accent-[#4aff7a]" />
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-white/90 truncate block">{{ candidate.name }}</span>
                            <span v-if="candidate.kind === 'employee'"
                                class="text-[10px] uppercase tracking-wide text-white/40 px-1.5 py-0.5 rounded bg-white/10">Employee</span>
                            <span v-else
                                class="text-[10px] uppercase tracking-wide text-[#4aff7a]/70 px-1.5 py-0.5 rounded bg-[#4aff7a]/10">Admin</span>
                        </div>
                        <span class="text-xs text-white/40 block truncate">{{ candidate.email || candidate.phone }}</span>
                    </div>
                </div>
                <div v-if="filteredCandidates.length === 0" class="text-xs text-white/40">No admins or employees found</div>
            </div>
        </div>
        <template #footer>
            <button class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm font-medium"
                @click="openAssign = false">Cancel</button>
            <UiButton color="#4aff7a" text="Save" @click="openAssign = false" />
        </template>
    </UiSidebarModal>
    </div>
</template>

<script setup>
definePageMeta({ layout: 'organization' })

const route = useRoute()
const orgId = computed(() => route.params.organization)

const { $api } = useNuxtApp()
const toast = useToast()

const roles = ref([])
const allPerms = ref([])
const orgModules = ref([])
const rolePerms = ref({})
const roleAdmins = ref({})
const roleEmployees = ref({})
const loading = ref(true)
const loadingPerms = ref(false)
const loadingAdmins = ref(false)
const expandedRole = ref(null)
const openModules = reactive(new Set())
function toggleModuleOpen(key) {
    if (openModules.has(key)) openModules.delete(key)
    else openModules.add(key)
}
const openCreateRole = ref(false)
const creating = ref(false)
const newRole = reactive({ name: '', description: '' })
const allAdmins = ref([])
const allEmployees = ref([])
const openAssign = ref(false)
const assignRoleId = ref(null)
const assignSearch = ref('')

const orgScopeKeys = computed(() => new Set(orgModules.value.map(m => m.key)))

const orgPerms = computed(() =>
    allPerms.value.filter(p => {
        const idx = p.key.lastIndexOf('.')
        const moduleKey = idx > 0 ? p.key.slice(0, idx) : p.group || p.key
        return orgScopeKeys.value.has(moduleKey)
    })
)

// Map each permission to the module (or sub-module) it belongs to.
const permsByModuleKey = computed(() => {
    const map = {}
    for (const p of orgPerms.value) {
        const idx = p.key.lastIndexOf('.')
        const moduleKey = idx > 0 ? p.key.slice(0, idx) : p.group || p.key
        const action = idx > 0 ? p.key.slice(idx + 1) : 'view'
        if (!map[moduleKey]) map[moduleKey] = { key: moduleKey, perms: [] }
        map[moduleKey].perms.push({ ...p, action })
    }
    return map
})

// permId -> { moduleKey, action } for the "manage implies CRUD" toggle logic.
const permMeta = computed(() => {
    const map = {}
    for (const p of allPerms.value) {
        const idx = p.key.lastIndexOf('.')
        const moduleKey = idx > 0 ? p.key.slice(0, idx) : (p.group || p.key)
        const action = idx > 0 ? p.key.slice(idx + 1) : 'view'
        map[p.id] = { moduleKey, action }
    }
    return map
})

// Nested tree of org modules: main modules carry their sub-modules, each with perms.
const moduleTree = computed(() => {
    const byId = {}
    for (const m of orgModules.value) byId[m.id] = { ...m, children: [], perms: permsByModuleKey.value[m.key]?.perms || [] }
    const roots = []
    for (const m of orgModules.value) {
        const node = byId[m.id]
        if (m.parent_id && byId[m.parent_id]) {
            byId[m.parent_id].children.push(node)
        } else {
            roots.push(node)
        }
    }
    return roots.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
})

// Flattened list of all module nodes (main + sub) used for tree rendering.
const modulePerms = computed(() => moduleTree.value.flatMap(m => [m, ...m.children]))

const rolePermSet = computed(() => new Set(rolePerms.value[expandedRole.value] || []))

const allScopeSelected = computed(() =>
    modulePerms.value.length > 0 &&
    modulePerms.value.every(m => m.perms.every(p => rolePermSet.value.has(p.id))))

// Check if a parent module (with children) is fully selected
const isModuleSelected = (mod) => {
    const ownSelected = mod.perms.every(p => rolePermSet.value.has(p.id))
    const childrenSelected = mod.children.every(c => c.perms.every(p => rolePermSet.value.has(p.id)))
    return ownSelected && childrenSelected
}

// Get all permission IDs for a parent module (own + children)
const getModuleAllPermIds = (mod) => [
    ...mod.perms.map(p => p.id),
    ...mod.children.flatMap(c => c.perms.map(p => p.id))
]

async function toggleModuleAll(roleId, mod) {
    const ids = getModuleAllPermIds(mod)
    const assigned = rolePerms.value[roleId] || []
    const set = new Set(assigned)
    const shouldAll = !isModuleSelected(mod)
    for (const id of ids) {
        if (shouldAll && !set.has(id)) {
            try {
                await $api.post(`/admin/roles/${roleId}/permissions`, { permission_id: id })
                set.add(id)
            } catch (err) { /* skip */ }
        } else if (!shouldAll && set.has(id)) {
            try {
                await $api.delete(`/admin/roles/${roleId}/permissions/${id}`)
                set.delete(id)
            } catch (err) { /* skip */ }
        }
    }
    rolePerms.value[roleId] = Array.from(set)
}

const assignedSet = computed(() => {
    const ids = new Set()
    const admins = roleAdmins.value[assignRoleId.value] || []
    const employees = roleEmployees.value[assignRoleId.value] || []
    for (const a of admins) ids.add('admin-' + a.id)
    for (const e of employees) ids.add('employee-' + e.id)
    return ids
})

const assignedUsers = computed(() => {
    const map = {}
    for (const role of roles.value) {
        const list = []
        for (const a of (roleAdmins.value[role.id] || []))
            list.push({ kind: 'admin', id: a.id, name: a.email, email: a.email, phone: a.phone })
        for (const e of (roleEmployees.value[role.id] || []))
            list.push({ kind: 'employee', id: e.id, name: e.email || e.phone, email: e.email, phone: e.phone })
        map[role.id] = list
    }
    return map
})

const assignCandidates = computed(() => {
    const admins = (allAdmins.value || []).map(a => ({
        id: a.id,
        email: a.email,
        phone: a.phone,
        name: a.email,
        kind: 'admin',
    }))
    const adminEmails = new Set(admins.map(a => (a.email || '').trim().toLowerCase()))
    const employees = (allEmployees.value || [])
        .filter(e => !adminEmails.has((e.email || '').trim().toLowerCase()))
        .map(e => ({
            id: e.id,
            email: e.email,
            phone: e.phone,
            name: e.full_name || e.email,
            kind: 'employee',
        }))
    return [...admins, ...employees]
})

const filteredCandidates = computed(() => {
    const q = assignSearch.value.trim().toLowerCase()
    const base = assignCandidates.value
    if (!q) return base
    return base.filter(a =>
        (a.email || '').toLowerCase().includes(q) ||
        (a.phone || '').toLowerCase().includes(q) ||
        (a.name || '').toLowerCase().includes(q))
})

async function fetchModules() {
    try {
        const { data } = await $api.get('/admin/modules', { params: { scope: 'organization', limit: 1000 } })
        if (data?.success) {
            const flatten = (arr) => arr.flatMap(m => [m, ...flatten(m.children || [])])
            orgModules.value = flatten(data.modules || [])
        }
    } catch (err) {
        console.error('Failed to load modules:', err)
    }
}

async function fetchRoles() {
    loading.value = true
    try {
        const { data } = await $api.get('/admin/roles', { params: { organization_id: orgId.value } })
        if (data?.success) roles.value = data.roles || []
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to load roles' })
    } finally {
        loading.value = false
    }
}

async function fetchPermissions() {
    try {
        const { data } = await $api.get('/admin/permissions', { params: { limit: 1000 } })
        if (data?.success) allPerms.value = data.permissions || []
    } catch (err) {
        console.error('Failed to load permissions:', err)
    }
}

async function fetchRolePerms(roleId) {
    if (rolePerms.value[roleId]) return
    loadingPerms.value = true
    try {
        const { data } = await $api.get(`/admin/roles/${roleId}/permissions`)
        if (data?.success) {
            rolePerms.value[roleId] = (data.permissions || []).map(p => p.id)
        }
    } catch (err) {
        console.error('Failed to load role permissions:', err)
    } finally {
        loadingPerms.value = false
    }
}

async function togglePerm(roleId, permId) {
    const has = rolePerms.value[roleId]?.includes(permId)
    const meta = permMeta.value[permId]
    const set = new Set(rolePerms.value[roleId] || [])
    const crud = ['create', 'view', 'edit', 'delete']
    const toRemove = []
    const toAdd = []

    if (has) {
        toRemove.push(permId)
    } else {
        toAdd.push(permId)
        if (meta) {
            const modulePermsArr = permsByModuleKey.value[meta.moduleKey]?.perms || []
            if (meta.action === 'manage') {
                // "Manage" implies CRUD: selecting it also selects create/view/edit/delete.
                for (const a of crud) {
                    const id = modulePermsArr.find(x => x.action === a)?.id
                    if (id && !set.has(id)) toAdd.push(id)
                }
            } else if (crud.includes(meta.action)) {
                // Selecting a CRUD action: if all 4 CRUD are now present, select manage too.
                const allCrud = crud.every(a => {
                    const id = modulePermsArr.find(x => x.action === a)?.id
                    return id ? set.has(id) || id === permId : true
                })
                if (allCrud) {
                    const mId = modulePermsArr.find(x => x.action === 'manage')?.id
                    if (mId && !set.has(mId)) toAdd.push(mId)
                }
            }
        }
    }

    for (const id of toRemove) {
        if (set.has(id)) {
            try { await $api.delete(`/admin/roles/${roleId}/permissions/${id}`) } catch (err) { /* skip */ }
            set.delete(id)
        }
    }
    for (const id of toAdd) {
        if (!set.has(id)) {
            try { await $api.post(`/admin/roles/${roleId}/permissions`, { permission_id: id }) } catch (err) { /* skip */ }
            set.add(id)
        }
    }
    rolePerms.value[roleId] = Array.from(set)
}

function toggleRole(roleId) {
    if (expandedRole.value === roleId) {
        expandedRole.value = null
    } else {
        expandedRole.value = roleId
        fetchRolePerms(roleId)
        fetchRoleAdmins(roleId)
        fetchRoleEmployees(roleId)
    }
}

async function toggleScopeAll(roleId) {
    const ids = modulePerms.value.flatMap(m => m.perms.map(p => p.id))
    const assigned = rolePerms.value[roleId] || []
    const set = new Set(assigned)
    const shouldAll = set.size !== ids.length
    for (const id of ids) {
        if (shouldAll && !set.has(id)) {
            try {
                await $api.post(`/admin/roles/${roleId}/permissions`, { permission_id: id })
                set.add(id)
            } catch (err) { /* skip */ }
        } else if (!shouldAll && set.has(id)) {
            try {
                await $api.delete(`/admin/roles/${roleId}/permissions/${id}`)
                set.delete(id)
            } catch (err) { /* skip */ }
        }
    }
    rolePerms.value[roleId] = Array.from(set)
}

async function fetchAdmins() {
    try {
        const { data } = await $api.get('/admins', { params: { limit: 100, organization_id: orgId.value } })
        if (data?.success) allAdmins.value = (data.admins || []).filter(a => !a.is_super_admin)
    } catch (err) {
        console.error('Failed to load admins:', err)
    }
}

async function fetchEmployees() {
    try {
        const { data } = await $api.get('/employees/all', { params: { organization_id: orgId.value } })
        if (data?.success) allEmployees.value = data.employees || []
    } catch (err) {
        console.error('Failed to load employees:', err)
    }
}

async function fetchRoleAdmins(roleId) {
    if (roleAdmins.value[roleId]) return
    loadingAdmins.value = true
    try {
        const { data } = await $api.get(`/admin/roles/${roleId}/admins`)
        if (data?.success) roleAdmins.value[roleId] = (data.admins || []).filter(a => !a.is_super_admin)
    } catch (err) {
        console.error('Failed to load role admins:', err)
    } finally {
        loadingAdmins.value = false
    }
}

async function fetchRoleEmployees(roleId) {
    if (roleEmployees.value[roleId]) return
    loadingAdmins.value = true
    try {
        const { data } = await $api.get(`/admin/roles/${roleId}/employees`)
        if (data?.success) roleEmployees.value[roleId] = data.employees || []
    } catch (err) {
        console.error('Failed to load role employees:', err)
    } finally {
        loadingAdmins.value = false
    }
}

async function unassignUser(roleId, assigned) {
    try {
        if (assigned.kind === 'admin') {
            await $api.delete(`/admin/admins/${assigned.id}/roles/${roleId}`)
            roleAdmins.value[roleId] = (roleAdmins.value[roleId] || []).filter(a => a.id !== assigned.id)
        } else {
            await $api.delete(`/admin/employees/${assigned.id}/roles/${roleId}`)
            roleEmployees.value[roleId] = (roleEmployees.value[roleId] || []).filter(e => e.id !== assigned.id)
        }
        toast.success({ title: 'Success', message: 'User removed from role' })
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to remove user' })
    }
}

function openAssignModal(roleId) {
    assignRoleId.value = roleId
    assignSearch.value = ''
    openAssign.value = true
    if (!roleAdmins.value[roleId]) fetchRoleAdmins(roleId)
    if (!roleEmployees.value[roleId]) fetchRoleEmployees(roleId)
}

async function toggleAssignment(candidate) {
    const roleId = assignRoleId.value
    const key = candidate.kind + '-' + candidate.id
    const has = assignedSet.value.has(key)
    const payload = { role_id: roleId, organization_id: orgId.value }
    try {
        if (candidate.kind === 'admin') {
            if (has) {
                await $api.delete(`/admin/admins/${candidate.id}/roles/${roleId}`)
                roleAdmins.value[roleId] = (roleAdmins.value[roleId] || []).filter(a => a.id !== candidate.id)
            } else {
                await $api.post(`/admin/admins/${candidate.id}/roles`, payload)
                if (!roleAdmins.value[roleId]) roleAdmins.value[roleId] = []
                const admin = allAdmins.value.find(a => a.id === candidate.id)
                if (admin) roleAdmins.value[roleId].push(admin)
            }
        } else {
            if (has) {
                await $api.delete(`/admin/employees/${candidate.id}/roles/${roleId}`)
                roleEmployees.value[roleId] = (roleEmployees.value[roleId] || []).filter(e => e.id !== candidate.id)
            } else {
                await $api.post(`/admin/employees/${candidate.id}/roles`, payload)
                if (!roleEmployees.value[roleId]) roleEmployees.value[roleId] = []
                const emp = allEmployees.value.find(e => e.id === candidate.id)
                if (emp) roleEmployees.value[roleId].push({ id: emp.id, email: emp.email, phone: emp.phone })
            }
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to update role assignment' })
    }
}

async function createRole() {
    if (!newRole.name) return toast.error({ title: 'Error', message: 'Role name is required' })
    creating.value = true
    try {
        const { data } = await $api.post('/admin/roles', {
            name: newRole.name,
            description: newRole.description,
            organization_id: orgId.value,
        })
        if (data?.success) {
            toast.success({ title: 'Success', message: 'Role created' })
            openCreateRole.value = false
            newRole.name = ''
            newRole.description = ''
            await fetchRoles()
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to create role' })
    } finally {
        creating.value = false
    }
}

async function deleteRole(roleId) {
    if (!confirm('Delete this role?')) return
    try {
        const { data } = await $api.delete(`/admin/roles/${roleId}`)
        if (data?.success) {
            toast.success({ title: 'Success', message: 'Role deleted' })
            if (expandedRole.value === roleId) expandedRole.value = null
            await fetchRoles()
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to delete role' })
    }
}

onMounted(() => { fetchModules(); fetchRoles(); fetchPermissions(); fetchAdmins(); fetchEmployees() })
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
    overflow: hidden;
    transition: height 0.25s ease;
}
.collapse-enter-from,
.collapse-leave-to {
    height: 0;
}
</style>
