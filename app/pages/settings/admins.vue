<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">Admins</h2>
            <div class="flex items-center gap-2">
                <FormInput v-model="search" color="#fff" size="sm" rounded="lg" placeholder="Search email / phone"
                    class="w-48" @keyup.enter="searchAdmins" />
                <UiButton @click="searchAdmins" color="#fff" text="Search" prepend-icon="ion:search" />
                <UiButton @click="fetchAdmins" color="#fff" text="Reload" prepend-icon="ion:refresh" />
                <UiButton @click="openCreate = true" color="#4aff7a" text="Add Admin" prepend-icon="ion:add-circle" />
            </div>
        </div>

        <div v-if="loading" class="text-center text-white/60 py-12">Loading admins...</div>

        <div v-else class="rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-white/10 text-white/60 text-xs uppercase">
                        <th class="text-left px-4 py-3">Email</th>
                        <th class="text-left px-4 py-3">Phone</th>
                        <th class="text-left px-4 py-3">Type</th>
                        <th class="text-left px-4 py-3">Roles</th>
                        <th class="text-left px-4 py-3">Created</th>
                        <th class="text-left px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="admin in admins" :key="admin.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="px-4 py-3 text-white/90">{{ admin.email || '-' }}</td>
                        <td class="px-4 py-3 text-white/70">{{ admin.phone || '-' }}</td>
                        <td class="px-4 py-3">
                            <span v-if="admin.is_super_admin"
                                class="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Super Admin</span>
                            <span v-else class="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">Org Admin</span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex flex-wrap gap-1">
                                <span v-for="role in adminRoles[admin.id] || []" :key="role.id"
                                    class="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{{ role.name }}</span>
                                <span v-if="!((adminRoles[admin.id] || []).length)"
                                    class="text-xs text-white/40">No roles</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-white/50 whitespace-nowrap">{{ formatDate(admin.created_at) }}</td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <UiButton @click="openRoleManager(admin)" color="#fff" size="sm"
                                    text="Manage Roles" prepend-icon="ion:key-outline" />
                                <UiButton v-if="!admin.is_super_admin" @click="deleteAdmin(admin)" color="#ff5c5c"
                                    size="sm" text="Delete" prepend-icon="ion:trash-outline" />
                            </div>
                        </td>
                    </tr>
                    <tr v-if="admins.length === 0">
                        <td colspan="6" class="text-center text-white/40 py-12">No admins found</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-2">
            <UiButton @click="prevPage" :disabled="page <= 1" color="#fff" text="Prev" />
            <span class="text-sm text-white/60">Page {{ page }} / {{ totalPages }}</span>
            <UiButton @click="nextPage" :disabled="page >= totalPages" color="#fff" text="Next" />
        </div>
    </div>

    <UiSidebarModal v-model="openCreate" title="Create Admin">
        <div class="flex flex-col gap-4 p-4">
            <FormInput v-model="newAdmin.email" color="#fff" size="lg" rounded="lg" placeholder="Email" type="email" />
            <FormInput v-model="newAdmin.phone" color="#fff" size="lg" rounded="lg" placeholder="Phone" />
            <UiButton @click="createAdmin" color="#4aff7a" text="Create" :loading="creating" />
        </div>
    </UiSidebarModal>

    <UiSidebarModal v-model="openRoles" :title="`Roles — ${selectedAdmin?.email || ''}`">
        <div class="flex flex-col gap-4 p-4">
            <p class="text-xs text-white/50">Tick the roles to assign. Global roles are created under Settings → Roles
                &amp; Permissions. Assign a Global role plus an Organization role to make an internal super admin.</p>
            <div v-if="loadingRoles" class="text-xs text-white/40">Loading roles...</div>
            <div v-else class="flex flex-col gap-3">
                <div>
                    <h4 class="text-xs font-semibold text-white/50 uppercase mb-1">Global Roles</h4>
                    <div class="flex flex-col gap-2">
                        <label v-for="role in globalRoles" :key="role.id"
                            class="flex items-center gap-2 cursor-pointer rounded-lg p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            :class="assignedRoleSet.has(role.id) ? 'border-[#4aff7a]/40' : ''">
                            <input type="checkbox" :checked="assignedRoleSet.has(role.id)"
                                @change="toggleRole(role.id)"
                                class="accent-[#4aff7a]" />
                            <div>
                                <span class="text-sm text-white/90">{{ role.name }}</span>
                                <span v-if="role.is_system"
                                    class="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">System</span>
                                <p v-if="role.description" class="text-xs text-white/40">{{ role.description }}</p>
                            </div>
                        </label>
                        <div v-if="globalRoles.length === 0" class="text-xs text-white/40">No global roles</div>
                    </div>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-white/50 uppercase mb-1">Organization Roles</h4>
                    <div class="flex flex-col gap-2">
                        <label v-for="role in orgRoles" :key="role.id"
                            class="flex items-center gap-2 cursor-pointer rounded-lg p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            :class="assignedRoleSet.has(role.id) ? 'border-[#4aff7a]/40' : ''">
                            <input type="checkbox" :checked="assignedRoleSet.has(role.id)"
                                @change="toggleRole(role.id)"
                                class="accent-[#4aff7a]" />
                            <div>
                                <span class="text-sm text-white/90">{{ role.name }}</span>
                                <span v-if="role.is_system"
                                    class="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">System</span>
                                <p v-if="role.description" class="text-xs text-white/40">{{ role.description }}</p>
                            </div>
                        </label>
                        <div v-if="orgRoles.length === 0" class="text-xs text-white/40">No organization roles</div>
                    </div>
                </div>
            </div>
        </div>
    </UiSidebarModal>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

const { $api } = useNuxtApp()
const toast = useToast()

const admins = ref([])
const roles = ref([])
const adminRoles = ref({})
const loading = ref(true)
const loadingRoles = ref(false)
const page = ref(1)
const totalPages = ref(1)
const search = ref('')

const openCreate = ref(false)
const creating = ref(false)
const newAdmin = reactive({ email: '', phone: '' })

const openRoles = ref(false)
const selectedAdmin = ref(null)
const assignedRoleSet = computed(() => new Set(adminRoles.value[selectedAdmin.value?.id]?.map(r => r.id) || []))

const globalRoles = computed(() => roles.value.filter(r => !r.organization_id))
const orgRoles = computed(() => roles.value.filter(r => r.organization_id))

async function fetchAdmins() {
    loading.value = true
    try {
        const params = { page: page.value, limit: 20 }
        if (search.value) params.search = search.value
        const { data } = await $api.get('/admins', { params })
        if (data?.success) {
            admins.value = data.admins || []
            totalPages.value = data.total_pages || 1
            for (const a of admins.value) fetchAdminRoles(a.id)
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to load admins' })
    } finally {
        loading.value = false
    }
}

async function fetchAdminRoles(adminId) {
    if (adminRoles.value[adminId]) return
    try {
        const { data } = await $api.get(`/admin/admins/${adminId}/roles`)
        if (data?.success) adminRoles.value[adminId] = data.roles || []
    } catch (err) {
        adminRoles.value[adminId] = []
    }
}

async function fetchRoles() {
    try {
        const { data } = await $api.get('/admin/roles', { params: { limit: 100 } })
        if (data?.success) roles.value = data.roles || []
    } catch (err) {
        console.error('Failed to load roles:', err)
    }
}

function searchAdmins() {
    page.value = 1
    fetchAdmins()
}

function prevPage() {
    if (page.value > 1) { page.value--; fetchAdmins() }
}
function nextPage() {
    if (page.value < totalPages.value) { page.value++; fetchAdmins() }
}

async function createAdmin() {
    if (!newAdmin.email || !newAdmin.phone) return toast.error({ title: 'Error', message: 'Email and phone are required' })
    creating.value = true
    try {
        const { data } = await $api.post('/admins', { email: newAdmin.email, phone: newAdmin.phone })
        if (data?.success) {
            toast.success({ title: 'Success', message: 'Admin created' })
            openCreate.value = false
            newAdmin.email = ''
            newAdmin.phone = ''
            await fetchAdmins()
        }
    } catch (err) {
        toast.error({ title: 'Error', message: err?.response?.data?.error || 'Failed to create admin' })
    } finally {
        creating.value = false
    }
}

async function deleteAdmin(admin) {
    if (!confirm(`Delete admin ${admin.email}?`)) return
    try {
        const { data } = await $api.delete(`/admins/${admin.id}`)
        if (data?.success) {
            toast.success({ title: 'Success', message: 'Admin deleted' })
            await fetchAdmins()
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to delete admin' })
    }
}

async function openRoleManager(admin) {
    selectedAdmin.value = admin
    openRoles.value = true
    loadingRoles.value = true
    try {
        if (!adminRoles.value[admin.id]) await fetchAdminRoles(admin.id)
    } finally {
        loadingRoles.value = false
    }
}

async function toggleRole(roleId) {
    const adminId = selectedAdmin.value.id
    const has = assignedRoleSet.value.has(roleId)
    try {
        const payload = { role_id: roleId }
        const role = roles.value.find(r => r.id === roleId)
        if (role?.organization_id) payload.organization_id = role.organization_id

        if (has) {
            await $api.delete(`/admin/admins/${adminId}/roles/${roleId}`)
            adminRoles.value[adminId] = adminRoles.value[adminId].filter(r => r.id !== roleId)
        } else {
            await $api.post(`/admin/admins/${adminId}/roles`, payload)
            const roleData = roles.value.find(r => r.id === roleId)
            if (roleData) {
                if (!adminRoles.value[adminId]) adminRoles.value[adminId] = []
                adminRoles.value[adminId].push(roleData)
            }
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to update role' })
    }
}

function formatDate(iso) {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

onMounted(() => { fetchAdmins(); fetchRoles() })
</script>
