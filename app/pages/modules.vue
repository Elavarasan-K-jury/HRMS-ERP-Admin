<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">Modules</h2>
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 rounded-lg bg-white/5 border border-white/15 p-0.5">
                    <button v-for="f in scopeFilters" :key="f.value" @click="scopeFilter = f.value"
                        class="px-3 py-1 text-xs rounded-md transition-colors"
                        :class="scopeFilter === f.value ? 'bg-[#4aff7a] text-black font-medium' : 'text-white/60 hover:text-white'">
                        {{ f.label }}
                    </button>
                </div>
                <FormInput v-model="moduleSearch" color="#fff" size="sm" rounded="lg" placeholder="Search modules"
                    class="w-48" />
                <UiButton @click="fetchModules" color="#fff" text="Reload" prepend-icon="ion:refresh" />
                <UiButton @click="openCreate" color="#4aff7a" text="Add Module" prepend-icon="ion:add-circle" />
            </div>
        </div>

        <div v-if="loading" class="text-center text-white/60 py-12">Loading modules...</div>

        <template v-else>
            <div v-for="group in groupedModules" :key="group.scope">
                <h3 v-if="scopeFilter === 'all'" class="text-sm font-semibold text-white/70 uppercase tracking-wide mb-2">
                    {{ group.scope === 'super_admin' ? 'Super Admin' : 'Organization' }}
                    <span
                        class="ml-2 text-xs text-white/40 font-normal normal-case">{{ group.items.length }} modules</span>
                </h3>

                <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
                    <div v-for="module in group.items" :key="module.id"
                        class="rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg p-4 flex flex-col">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex items-center gap-3 min-w-0">
                                <div
                                    class="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                    <Icon v-if="module.icon" :name="module.icon" class="w-5 h-5 text-white/70" />
                                    <Icon v-else name="ion:grid-outline" class="w-5 h-5 text-white/70" />
                                </div>
                                <div class="min-w-0">
                                    <div class="text-sm font-semibold text-white/90 truncate">{{ module.name }}</div>
                                    <div class="text-xs text-white/40 font-mono truncate">{{ module.key }}</div>
                                </div>
                            </div>
                            <span v-if="!module.is_active"
                                class="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full shrink-0">Inactive</span>
                            <span v-else
                                class="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full shrink-0">Active</span>
                        </div>

                        <!-- Sub-modules -->
                        <div v-if="module.children && module.children.length" class="mt-3 space-y-1.5">
                            <div v-for="sub in module.children" :key="sub.id"
                                class="flex items-center justify-between gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
                                <div class="flex items-center gap-2 min-w-0">
                                    <Icon name="ion:git-branch" class="w-4 h-4 text-white/40 shrink-0" />
                                    <div class="min-w-0">
                                        <div class="text-xs font-medium text-white/85 truncate">{{ sub.name }}</div>
                                        <div class="text-[10px] text-white/35 font-mono truncate">{{ sub.key }}</div>
                                    </div>
                                    <span v-if="!sub.is_active"
                                        class="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full shrink-0">Inactive</span>
                                </div>
                                <div class="flex items-center gap-1 shrink-0">
                                    <button @click="openEdit(sub)"
                                        class="px-1.5 py-0.5 rounded border border-white/15 text-white/60 hover:bg-white/10 transition-colors text-[10px]"
                                        title="Edit">Edit</button>
                                    <button @click="deleteModule(sub)"
                                        class="px-1.5 py-0.5 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-[10px]"
                                        title="Delete">Delete</button>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                            <div class="flex items-center gap-2 text-xs text-white/40">
                                <span>Sort {{ module.sort_order }}</span>
                                <button @click="toggleActive(module)" :title="module.is_active ? 'Disable' : 'Enable'"
                                    class="px-2 py-0.5 rounded-md border border-white/15 hover:bg-white/10 transition-colors"
                                    :class="module.is_active ? 'text-[#4aff7a]' : 'text-white/50'">
                                    {{ module.is_active ? 'Enabled' : 'Disabled' }}
                                </button>
                                <button @click="openCreate(null, module)"
                                    class="px-2 py-0.5 rounded-md border border-white/15 text-white/70 hover:bg-white/10 transition-colors"
                                    title="Add sub-module">+ Sub</button>
                            </div>
                            <div class="flex items-center gap-1">
                                <button @click="openEdit(module)"
                                    class="px-2 py-0.5 rounded-md border border-white/15 text-white/70 hover:bg-white/10 transition-colors text-xs"
                                    title="Edit">Edit</button>
                                <button @click="deleteModule(module)"
                                    class="px-2 py-0.5 rounded-md border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                                    title="Delete">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="modules.length === 0" class="text-center text-white/40 py-12">No modules found</div>
        </template>
    </div>

    <UiSidebarModal v-model="openCreateModal" :title="modalTitle">
        <div class="flex flex-col gap-4 p-4">

            <!-- Create mode switcher -->
            <div v-if="!editing" class="flex items-center gap-1 rounded-lg bg-white/5 border border-white/15 p-0.5">
                <button type="button" @click="onModeChange('parent')"
                    class="flex-1 px-3 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5"
                    :class="createMode === 'parent' ? 'bg-[#4aff7a] text-black font-medium' : 'text-white/60 hover:text-white'">
                    <Icon name="ion:albums-outline" class="w-4 h-4" /> Parent Module
                </button>
                <button type="button" @click="onModeChange('sub')"
                    class="flex-1 px-3 py-1.5 text-xs rounded-md transition-colors flex items-center justify-center gap-1.5"
                    :class="createMode === 'sub' ? 'bg-[#4aff7a] text-black font-medium' : 'text-white/60 hover:text-white'">
                    <Icon name="ion:git-branch-outline" class="w-4 h-4" /> Sub-Module
                </button>
            </div>

            <!-- Parent / placement picker -->
            <div v-if="createMode === 'sub' || editing" class="flex flex-col gap-1">
                <label class="text-xs text-white/50 uppercase flex items-center justify-between">
                    <span>Parent module</span>
                    <span class="normal-case text-[#4aff7a]/80 text-[10px]">sub-module</span>
                </label>
                <select v-model="form.parent_id" :disabled="editing" @change="onParentChange"
                    class="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90 disabled:opacity-50">
                    <option value="">— Select a parent module —</option>
                    <optgroup v-for="g in scopeGroupsForSelect" :key="g.scope" :label="g.label">
                        <option v-for="m in g.items" :key="m.id" :value="m.id">{{ m.name }}</option>
                    </optgroup>
                </select>
                <p class="text-[10px] text-white/35">Top-level modules appear as headings; sub-modules nest under them.</p>
            </div>

            <!-- === PARENT MODULE (top-level) : create OR edit with multiple sub-modules === -->
            <template v-if="!editing && createMode === 'parent'">
                <div class="rounded-lg border border-[#4aff7a]/30 bg-[#4aff7a]/5 px-3 py-2 text-[11px] text-white/70">
                    <Icon name="ion:albums-outline" class="w-3.5 h-3.5 inline mr-1 text-[#4aff7a]" />
                    You're creating a <b class="text-white">top-level (parent) module</b>. Optionally add one or more
                    <b class="text-white">sub-modules</b> below — all created in a single step.
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[10px] text-white/40 uppercase">Permission actions</label>
                    <div class="flex flex-wrap items-center gap-4">
                        <label v-for="a in MODULE_ACTIONS" :key="a"
                            class="flex items-center gap-1.5 cursor-pointer text-xs text-white/80">
                            <input type="checkbox" :checked="form.actions.includes(a)" @change="toggleAction(form, a)"
                                class="accent-[#4aff7a]" />
                            <span class="capitalize">{{ a }}</span>
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Module key</label>
                        <FormInput v-model="form.key" color="#fff" size="lg" rounded="lg" placeholder="e.g. expenses"
                            :disabled="editing" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Module name</label>
                        <FormInput v-model="form.name" color="#fff" size="lg" rounded="lg" placeholder="e.g. Expenses"
                            @input="onParentNameChange" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Scope</label>
                        <select v-model="form.scope" :disabled="editing"
                            class="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90 disabled:opacity-50">
                            <option value="organization">Organization</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Sort order</label>
                        <input v-model.number="form.sort_order" type="number"
                            class="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90" />
                    </div>
                </div>

                <FormInput v-model="form.icon" color="#fff" size="lg" rounded="lg"
                    placeholder="Icon (e.g. ion:cash-outline)" />

                <!-- Sub-module builder (works for both create and edit) -->
                <div class="flex flex-col gap-2 rounded-lg bg-white/5 border border-white/15 p-3">
                    <div class="flex items-center justify-between">
                        <label class="text-xs text-white/50 uppercase">
                            Sub-modules <span class="normal-case text-[10px] text-white/30">(optional)</span>
                        </label>
                        <button type="button" @click="addSubModule"
                            class="text-xs text-[#4aff7a] hover:text-white transition-colors flex items-center gap-1">
                            <Icon name="ion:add" class="w-4 h-4" /> Add sub-module
                        </button>
                    </div>

                    <div v-if="form.subModules.length === 0" class="text-[11px] text-white/35">
                        {{ editing ? 'No sub-modules — this module will have none.' : 'No sub-modules yet — only the top-level module will be created.' }}
                    </div>

                    <div v-for="(sub, i) in form.subModules" :key="sub.id || i"
                        class="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 p-2">
                        <Icon name="ion:git-branch" class="w-4 h-4 text-white/40 shrink-0" />
                        <div class="flex flex-1 flex-col gap-1">
                            <FormInput v-model="sub.name" color="#fff" size="sm" rounded="md" placeholder="Sub-module name"
                                @input="onSubModuleNameChange(i)" />
                            <FormInput v-model="sub.key" color="#fff" size="sm" rounded="md"
                                placeholder="key (e.g. salary_components)" />
                            <div class="text-[10px] text-[#4aff7a]/80 font-mono">
                                {{ form.key || 'parent' }}.{{ sub.key || 'child_key' }}
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <UiSwitch v-model="sub.is_active" size="sm" />
                            <span class="text-xs text-white/60">{{ sub.is_active ? 'Active' : 'Inactive' }}</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-2 px-1">
                            <span class="text-[10px] text-white/40 uppercase">Perm actions</span>
                            <label v-for="a in MODULE_ACTIONS" :key="a"
                                class="flex items-center gap-1 cursor-pointer text-[11px] text-white/70">
                                <input type="checkbox" :checked="sub.actions.includes(a)" @change="toggleAction(sub, a)"
                                    class="accent-[#4aff7a]" />
                                <span class="capitalize">{{ a }}</span>
                            </label>
                        </div>
                        <button v-if="sub.id" type="button" @click="toggleRemoveMarked(i)"
                            class="shrink-0 text-xs"
                            :class="sub._remove ? 'text-white/80' : 'text-red-400 hover:text-red-300'">
                            {{ sub._remove ? 'Keep' : 'Remove' }}
                        </button>
                        <button v-else type="button" @click="removeSubModule(i)"
                            class="shrink-0 text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </div>
                    <p class="text-[10px] text-white/35">Each module gets the selected permission actions (create/view/edit/delete/manage).</p>
                </div>
            </template>

            <!-- === PARENT MODULE (edit existing top-level, managed sub-modules) === -->
            <template v-else-if="editing && createMode === 'parent'">
                <div class="rounded-lg border border-[#4aff7a]/30 bg-[#4aff7a]/5 px-3 py-2 text-[11px] text-white/70">
                    <Icon name="ion:git-network-outline" class="w-3.5 h-3.5 inline mr-1 text-[#4aff7a]" />
                    You're editing a <b class="text-white">top-level module</b>. Add, update or remove its
                    <b class="text-white">sub-modules</b> below — all saved at once.
                </div>

                <div class="flex flex-col gap-1">
                    <label class="text-[10px] text-white/40 uppercase">Permission actions</label>
                    <div class="flex flex-wrap items-center gap-4">
                        <label v-for="a in MODULE_ACTIONS" :key="a"
                            class="flex items-center gap-1.5 cursor-pointer text-xs text-white/80">
                            <input type="checkbox" :checked="form.actions.includes(a)" @change="toggleAction(form, a)"
                                class="accent-[#4aff7a]" />
                            <span class="capitalize">{{ a }}</span>
                        </label>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Module key</label>
                        <FormInput v-model="form.key" color="#fff" size="lg" rounded="lg" placeholder="e.g. expenses"
                            :disabled="editing" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Module name</label>
                        <FormInput v-model="form.name" color="#fff" size="lg" rounded="lg" placeholder="e.g. Expenses"
                            @input="onParentNameChange" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Scope</label>
                        <select v-model="form.scope" :disabled="editing"
                            class="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90 disabled:opacity-50">
                            <option value="organization">Organization</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs text-white/50 uppercase">Sort order</label>
                        <input v-model.number="form.sort_order" type="number"
                            class="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90" />
                    </div>
                </div>

                <FormInput v-model="form.icon" color="#fff" size="lg" rounded="lg"
                    placeholder="Icon (e.g. ion:cash-outline)" />

                <!-- Sub-module builder (works for both create and edit) -->
                <div class="flex flex-col gap-2 rounded-lg bg-white/5 border border-white/15 p-3">
                    <div class="flex items-center justify-between">
                        <label class="text-xs text-white/50 uppercase">
                            Sub-modules <span class="normal-case text-[10px] text-white/30">(optional)</span>
                        </label>
                        <button type="button" @click="addSubModule"
                            class="text-xs text-[#4aff7a] hover:text-white transition-colors flex items-center gap-1">
                            <Icon name="ion:add" class="w-4 h-4" /> Add sub-module
                        </button>
                    </div>

                    <div v-if="form.subModules.length === 0" class="text-[11px] text-white/35">
                        {{ editing ? 'No sub-modules — this module will have none.' : 'No sub-modules yet — only the top-level module will be created.' }}
                    </div>

                    <div v-for="(sub, i) in form.subModules" :key="sub.id || i"
                        class="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 p-2">
                        <Icon name="ion:git-branch" class="w-4 h-4 text-white/40 shrink-0" />
                        <div class="flex flex-1 flex-col gap-1">
                            <FormInput v-model="sub.name" color="#fff" size="sm" rounded="md" placeholder="Sub-module name"
                                @input="onSubModuleNameChange(i)" />
                            <FormInput v-model="sub.key" color="#fff" size="sm" rounded="md"
                                placeholder="key (e.g. salary_components)" />
                            <div class="text-[10px] text-[#4aff7a]/80 font-mono">
                                {{ form.key || 'parent' }}.{{ sub.key || 'child_key' }}
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <UiSwitch v-model="sub.is_active" size="sm" />
                            <span class="text-xs text-white/60">{{ sub.is_active ? 'Active' : 'Inactive' }}</span>
                        </div>
                        <div class="flex flex-wrap items-center gap-2 px-1">
                            <span class="text-[10px] text-white/40 uppercase">Perm actions</span>
                            <label v-for="a in MODULE_ACTIONS" :key="a"
                                class="flex items-center gap-1 cursor-pointer text-[11px] text-white/70">
                                <input type="checkbox" :checked="sub.actions.includes(a)" @change="toggleAction(sub, a)"
                                    class="accent-[#4aff7a]" />
                                <span class="capitalize">{{ a }}</span>
                            </label>
                        </div>
                        <button v-if="sub.id" type="button" @click="toggleRemoveMarked(i)"
                            class="shrink-0 text-xs"
                            :class="sub._remove ? 'text-white/80' : 'text-red-400 hover:text-red-300'">
                            {{ sub._remove ? 'Keep' : 'Remove' }}
                        </button>
                        <button v-else type="button" @click="removeSubModule(i)"
                            class="shrink-0 text-red-400 hover:text-red-300 text-xs">Remove</button>
                    </div>
                    <p class="text-[10px] text-white/35">Each module gets the selected permission actions (create/view/edit/delete/manage).</p>
                </div>
            </template>

            <!-- === SUB-MODULE (single, under a chosen parent) : create OR edit === -->
            <template v-else>
                <div class="rounded-lg border border-[#4aff7a]/30 bg-[#4aff7a]/5 px-3 py-2 text-[11px] text-white/70">
                    <Icon name="ion:git-branch-outline" class="w-3.5 h-3.5 inline mr-1 text-[#4aff7a]" />
                    {{ editing ? 'Editing' : 'Creating' }} a <b class="text-white">sub-module</b> under
                    <b class="text-white">{{ selectedParentName }}</b>. Its key will be auto-prefixed.
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs text-white/50 uppercase">Sub-module key</label>
                    <FormInput v-model="form.key" color="#fff" size="lg" rounded="lg"
                        placeholder="e.g. salary_components" :disabled="editing" />
                    <div class="text-[10px] text-[#4aff7a]/80 font-mono">
                        {{ selectedParentKey }}.{{ form.key || 'child_key' }}
                    </div>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs text-white/50 uppercase">Sub-module name</label>
                    <FormInput v-model="form.name" color="#fff" size="lg" rounded="lg"
                        placeholder="e.g. Salary Components" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs text-white/50 uppercase">Icon</label>
                    <FormInput v-model="form.icon" color="#fff" size="lg" rounded="lg"
                        placeholder="Icon (e.g. ion:cash-outline)" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs text-white/50 uppercase">Sort order</label>
                    <input v-model.number="form.sort_order" type="number"
                        class="bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white/90" />
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-xs text-white/50 uppercase">Status</label>
                    <div class="flex items-center gap-2">
                        <UiSwitch v-model="form.is_active" size="md" />
                        <span class="text-sm text-white/60">{{ form.is_active ? 'Active' : 'Inactive' }}</span>
                    </div>
                </div>
                <div class="flex flex-col gap-1">
                    <label class="text-[10px] text-white/40 uppercase">Permission actions</label>
                    <div class="flex flex-wrap items-center gap-4">
                        <label v-for="a in MODULE_ACTIONS" :key="a"
                            class="flex items-center gap-1.5 cursor-pointer text-xs text-white/80">
                            <input type="checkbox" :checked="form.actions.includes(a)" @change="toggleAction(form, a)"
                                class="accent-[#4aff7a]" />
                            <span class="capitalize">{{ a }}</span>
                        </label>
                    </div>
                </div>
            </template>

            <UiButton @click="editing ? updateModule() : createModule()" color="#4aff7a"
                :text="submitLabel" :loading="saving" />
        </div>
    </UiSidebarModal>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

const { $api } = useNuxtApp()
const toast = useToast()

const modules = ref([])
const loading = ref(true)
const moduleSearch = ref('')
const scopeFilter = ref('all')
const scopeFilters = [
    { label: 'All', value: 'all' },
    { label: 'Super Admin', value: 'super_admin' },
    { label: 'Organization', value: 'organization' },
]
const openCreateModal = ref(false)
const saving = ref(false)
const edit = ref(null)
const editing = computed(() => edit.value !== null && (edit.value.parent_id ? true : true))
const createMode = ref('parent')
const MODULE_ACTIONS = ['create', 'view', 'edit', 'delete', 'manage']
const form = reactive({ key: '', name: '', icon: '', scope: 'organization', sort_order: 0, parent_id: '', subModules: [], is_active: true, actions: [...MODULE_ACTIONS] })

const topLevelModules = computed(() => modules.value.filter(m => !m.parent_id))

const scopeGroupsForSelect = computed(() => [
    {
        scope: 'super_admin', label: 'Super Admin',
        items: modules.value.filter(m => !m.parent_id && m.scope === 'super_admin'),
    },
    {
        scope: 'organization', label: 'Organization',
        items: modules.value.filter(m => !m.parent_id && m.scope !== 'super_admin'),
    },
])

const selectedParentName = computed(() => {
    const m = modules.value.find(x => x.id === form.parent_id)
    return m ? m.name : 'the selected module'
})

const selectedParentKey = computed(() => {
    const m = modules.value.find(x => x.id === form.parent_id)
    return m ? m.key : 'parent'
})

const isEditing = computed(() => edit.value !== null)
const modalTitle = computed(() => {
    if (!isEditing.value) return createMode.value === 'sub' ? 'Add Sub-Module' : 'Add Module'
    return 'Edit Module'
})
const submitLabel = computed(() => {
    if (!isEditing.value) return createMode.value === 'sub' ? 'Create Sub-Module' : 'Create Module & Sub-Modules'
    return form.parent_id ? 'Save Sub-Module' : 'Save Module & Sub-Modules'
})

const filteredModules = computed(() => {
    let list = modules.value
    if (scopeFilter.value !== 'all') {
        list = list.filter(m => (m.scope === 'super_admin' ? 'super_admin' : 'organization') === scopeFilter.value)
    }
    const q = moduleSearch.value.trim().toLowerCase()
    if (!q) return list
    return list.filter(m =>
        (m.name || '').toLowerCase().includes(q) || (m.key || '').toLowerCase().includes(q))
})

const groupedModules = computed(() => {
    const byScope = {}
    for (const m of filteredModules.value) {
        const scope = m.scope === 'super_admin' ? 'super_admin' : 'organization'
        if (!byScope[scope]) byScope[scope] = []
        byScope[scope].push(m)
    }
    return Object.keys(byScope).sort((a, b) => a === 'super_admin' ? -1 : 1).map(scope => ({
        scope,
        items: byScope[scope].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    }))
})

async function fetchModules() {
    loading.value = true
    try {
        const { data } = await $api.get('/admin/modules', { params: { limit: 100 } })
        if (data?.success) modules.value = data.modules || []
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to load modules' })
    } finally {
        loading.value = false
    }
}

function resetForm() {
    form.key = ''
    form.name = ''
    form.icon = ''
    form.scope = 'organization'
    form.sort_order = 0
    form.parent_id = ''
    form.subModules = []
    form.is_active = true
    form.actions = [...MODULE_ACTIONS]
}

function toggleAction(target, action) {
    const arr = Array.isArray(target.actions) ? target.actions : []
    if (arr.includes(action)) {
        target.actions = arr.filter(a => a !== action)
    } else {
        target.actions = [...arr, action]
    }
}

function onModeChange(mode) {
    createMode.value = mode
    if (mode === 'parent') form.parent_id = ''
    else form.parent_id = form.parent_id || ''
    form.subModules = []
}

function slugify(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 64);
}

function addSubModule() {
    form.subModules.push({ id: null, name: '', key: '', is_active: true, actions: [...MODULE_ACTIONS] })
}

function onSubModuleNameChange(index) {
    const sub = form.subModules[index];
    if (sub.name && !sub.key) {
        sub.key = slugify(sub.name);
    }
}

function removeSubModule(index) {
    form.subModules.splice(index, 1)
}

function toggleRemoveMarked(index) {
    form.subModules[index]._remove = !form.subModules[index]._remove
}

function onParentNameChange() {
    if (form.name && !form.key) {
        form.key = slugify(form.name);
    }
}

function openCreate(parentId = '', parentModule = null) {
    edit.value = null
    resetForm()
    createMode.value = parentId || parentModule ? 'sub' : 'parent'
    form.parent_id = parentId || (parentModule ? parentModule.id : '')
    if (parentModule) form.scope = parentModule.scope
    openCreateModal.value = true
}

function openEdit(module) {
    edit.value = module
    createMode.value = module.parent_id ? 'sub' : 'parent'
    form.key = module.parent_id ? module.key.split('.').pop() : module.key
    form.name = module.name
    form.icon = module.icon || ''
    form.scope = module.scope
    form.sort_order = module.sort_order ?? 0
    form.parent_id = module.parent_id || ''
    form.is_active = module.is_active ?? true
    form.actions = Array.isArray(module.actions) && module.actions.length ? [...module.actions] : [...MODULE_ACTIONS]
    // Populate the sub-module builder with existing children when editing a parent.
    form.subModules = (module.children || []).map(c => ({
        id: c.id,
        name: c.name,
        key: c.parent_id ? c.key.split('.').pop() : c.key,
        is_active: c.is_active ?? true,
        actions: Array.isArray(c.actions) && c.actions.length ? [...c.actions] : [...MODULE_ACTIONS],
    }))
    openCreateModal.value = true
}

async function createModule() {
    // For a top-level module, the key/name refer to the parent.
    if (!form.key || !form.name) return toast.error({ title: 'Error', message: 'Key and name are required' })
    const subs = form.subModules.filter(s => s.key && s.name)
    saving.value = true
    try {
        // Single sub-module under a chosen parent.
        if (form.parent_id) {
            const { data } = await $api.post('/admin/modules', {
                key: form.key, name: form.name, icon: form.icon, sort_order: form.sort_order, parent_id: form.parent_id, is_active: form.is_active,
                actions: form.actions,
            })
            if (!data?.success) throw new Error(data?.error || 'Failed to create sub-module')
            toast.success({ title: 'Success', message: 'Sub-module created' })
        } else {
            // Create parent, then create all sub-modules (batch) under it.
            const { data: parent } = await $api.post('/admin/modules', {
                key: form.key, name: form.name, icon: form.icon, scope: form.scope, sort_order: form.sort_order, is_active: form.is_active,
                actions: form.actions,
            })
            if (!parent?.success) throw new Error(parent?.error || 'Failed to create module')
            const parentId = parent.module?.id
            for (const sub of subs) {
                await $api.post('/admin/modules', {
                    key: sub.key, name: sub.name, icon: '', sort_order: 0, parent_id: parentId, is_active: sub.is_active ?? true,
                    actions: sub.actions,
                })
            }
            toast.success({
                title: 'Success',
                message: subs.length ? `Module + ${subs.length} sub-module${subs.length > 1 ? 's' : ''} created` : 'Module created',
            })
        }
        openCreateModal.value = false
        await fetchModules()
    } catch (err) {
        toast.error({ title: 'Error', message: err?.response?.data?.error || err.message || 'Failed to create module' })
    } finally {
        saving.value = false
    }
}

async function updateModule() {
    if (!form.name) return toast.error({ title: 'Error', message: 'Name is required' })
    if (!form.key) return toast.error({ title: 'Error', message: 'Key is required' })
    saving.value = true
    try {
        // 1. Update the module itself (parent or sub-module).
        const { data } = await $api.put(`/admin/modules/${edit.value.id}`, {
            key: form.key,
            name: form.name,
            icon: form.icon,
            sort_order: form.sort_order,
            parent_id: form.parent_id,
            is_active: form.is_active,
            actions: form.actions,
            reconcile_actions: true,
        })
        if (!data?.success) throw new Error(data?.error || 'Failed to update module')

        // 2. For top-level modules, reconcile the sub-module list in one go.
        if (!form.parent_id) {
            for (const sub of form.subModules) {
                if (!sub.key || !sub.name) continue
                if (sub._remove) {
                    await $api.delete(`/admin/modules/${sub.id}`)
                } else if (sub.id) {
                    await $api.put(`/admin/modules/${sub.id}`, { key: sub.key, name: sub.name, is_active: sub.is_active, actions: sub.actions, reconcile_actions: true })
                } else {
                    await $api.post('/admin/modules', {
                        key: sub.key, name: sub.name, icon: '', sort_order: 0, parent_id: edit.value.id, is_active: sub.is_active ?? true,
                        actions: sub.actions,
                    })
                }
            }
        }

        toast.success({ title: 'Success', message: 'Module updated' })
        openCreateModal.value = false
        edit.value = null
        await fetchModules()
    } catch (err) {
        toast.error({ title: 'Error', message: err?.response?.data?.error || err.message || 'Failed to update module' })
    } finally {
        saving.value = false
    }
}

async function toggleActive(module) {
    try {
        const { data } = await $api.put(`/admin/modules/${module.id}`, { is_active: !module.is_active })
        if (data?.success) {
            toast.success({ title: 'Success', message: 'Module status updated' })
            await fetchModules()
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to update module' })
    }
}

async function deleteModule(module) {
    if (!confirm(`Delete module "${module.name}"? This also removes its sub-modules and permissions.`)) return
    try {
        const { data } = await $api.delete(`/admin/modules/${module.id}`)
        if (data?.success) {
            toast.success({ title: 'Success', message: 'Module deleted' })
            await fetchModules()
        }
    } catch (err) {
        toast.error({ title: 'Error', message: 'Failed to delete module' })
    }
}

onMounted(fetchModules)
</script>