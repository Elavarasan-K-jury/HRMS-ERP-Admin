<template>
    <div class="h-full flex flex-col gap-4">
        <!-- Header -->
        <div class="rounded-xl p-5 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-semibold text-white/90 uppercase tracking-wide">Expense & Travel Policies</h2>
                <p class="text-xs text-white/55 max-w-xl mt-1">Create and manage expense policies, approval chains and category attachments</p>
            </div>
            <div class="flex items-center gap-2">
                <UiButton @click="openCreate" color="#4aff7a" text="Add Expense Policy" prepend-icon="ion:add-circle" :disabled="store.saving" />
                <UiButton @click="refresh" color="#fff" text="Reload" prepend-icon="ion:refresh" :disabled="store.loading" />
            </div>
        </div>

        <!-- Search -->
        <div class="flex items-center gap-3">
            <UiSearch v-model="searchQuery" placeholder="Search policies..." class="w-64" color="#fff" @search="onSearch" @clear="onSearch('')" />
        </div>

        <!-- Empty / List + Detail -->
        <div v-if="!store.policies?.length && !store.loading" class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center justify-center gap-2 text-white/70">
            <Icon name="ion:document-text-outline" class="w-8 h-8 opacity-60" />
            <span>No policies found. Create your first expense policy.</span>
            <UiButton @click="openCreate" color="#4aff7a" text="Add Expense Policy" prepend-icon="ion:add-circle" size="sm" class="mt-2" />
        </div>

        <div v-else class="grid grid-cols-12 gap-3 flex-1 min-h-0">
            <!-- Sidebar -->
            <div class="col-span-12 lg:col-span-4 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
                <div class="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Policies ({{ store.policies?.length || 0 }})</p>
                    <UiSearch v-model="searchQuery" placeholder="Search..." class="w-32" color="#fff" @search="onSearch" @clear="onSearch('')" />
                </div>
                <div class="flex-1 overflow-y-auto p-1.5 space-y-1">
                    <template v-if="store.loading">
                        <div v-for="i in 4" :key="i" class="animate-pulse p-3">
                            <div class="skeleton w-32 h-4 mb-2" />
                            <div class="skeleton w-20 h-3" />
                        </div>
                    </template>
                    <button v-for="p in filteredPolicies" :key="p.id" type="button"
                        class="w-full text-left rounded-lg px-3 py-3 transition-colors border"
                        :class="selected?.id === p.id ? 'bg-emerald-500/15 border-emerald-400/40' : 'border-transparent hover:bg-white/5'"
                        @click="selectPolicy(p)">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold truncate" :class="selected?.id === p.id ? 'text-emerald-200' : 'text-white/90'">{{ p.name }}</span>
                            <span v-if="!p.is_active" class="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">Inactive</span>
                        </div>
                        <p class="text-xs text-white/45 truncate">{{ p.base_currency }} • {{ p.approval_required ? (p.approval_mode === 'SAME_FOR_ALL' ? 'Same chain' : 'By category') : 'No approval' }}</p>
                        <p class="text-xs text-white/30 mt-0.5">{{ p.category_count }} categories • {{ p.employee_count }} employees</p>
                        <p v-if="p.description" class="text-xs text-white/30 truncate mt-0.5">{{ p.description }}</p>
                    </button>
                </div>
            </div>

            <!-- Detail -->
            <div class="col-span-12 lg:col-span-8 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col">
                <template v-if="selected">
                    <div class="px-5 py-4 border-b border-white/10 bg-white/5 flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <h3 class="text-lg font-semibold text-white/90 truncate">{{ selected.name }}</h3>
                                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="selected.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'">{{ selected.is_active ? 'Active' : 'Inactive' }}</span>
                            </div>
                            <p class="text-xs text-white/50 mt-1">{{ selected.base_currency }} • Payout: {{ selected.payout_mode || '—' }} • {{ selected.allow_future_date_claims ? 'Future dates allowed' : 'No future dates' }}</p>
                            <p v-if="selected.description" class="text-sm text-white/60 mt-1">{{ selected.description }}</p>
                        </div>
                        <span class="relative shrink-0">
                            <button type="button" class="p-1.5 rounded-lg" :class="menuOpen ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'" @click.stop="menuOpen = !menuOpen">
                                <Icon name="lucide:more-horizontal" class="w-5 h-5" />
                            </button>
                            <div v-if="menuOpen" class="absolute right-0 top-full z-40 mt-1 w-44 rounded-lg border border-white/10 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl p-1">
                                <button type="button" class="menu-item" @click="openEdit(selected)"><Icon name="lucide:pencil" class="w-4 h-4" /> Edit</button>
                                <button type="button" class="menu-item" @click="toggleStatus(selected)"><Icon :name="selected.is_active ? 'lucide:pause-circle' : 'lucide:play-circle'" class="w-4 h-4" /> {{ selected.is_active ? 'Deactivate' : 'Activate' }}</button>
                                <div class="my-1 border-t border-white/10" />
                                <button type="button" class="menu-item-danger" @click="confirmDelete(selected)"><Icon name="lucide:trash-2" class="w-4 h-4" /> Delete</button>
                            </div>
                        </span>
                    </div>

                    <div class="p-5 space-y-4 overflow-y-auto">
                        <!-- Sub-tabs -->
                        <div class="flex items-center gap-1 border-b border-white/10 -mx-5 px-5 pb-0">
                            <button v-for="t in detailTabs" :key="t.value" type="button"
                                class="px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors"
                                :class="detailTab === t.value ? 'text-emerald-300 border-emerald-400' : 'text-white/50 border-transparent hover:text-white/70'"
                                @click="detailTab = t.value">{{ t.label }}</button>
                        </div>

                        <!-- Summary Tab -->
                        <template v-if="detailTab === 'summary'">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <p class="text-[11px] uppercase tracking-wider text-white/40">Base Currency</p>
                                <p class="text-sm font-medium text-white/90 mt-1">{{ selected.base_currency }}</p>
                            </div>
                            <div class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <p class="text-[11px] uppercase tracking-wider text-white/40">Approval</p>
                                <p class="text-sm font-medium" :class="selected.approval_required ? 'text-emerald-300' : 'text-white/50'">{{ selected.approval_required ? (selected.approval_mode === 'SAME_FOR_ALL' ? 'Required • Same for all' : 'Required • By category') : 'Not required' }}</p>
                            </div>
                            <div class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <p class="text-[11px] uppercase tracking-wider text-white/40">Payout Mode</p>
                                <p class="text-sm font-medium text-white/80">{{ selected.payout_mode || '—' }}</p>
                            </div>
                            <div class="rounded-lg bg-white/5 border border-white/10 p-3">
                                <p class="text-[11px] uppercase tracking-wider text-white/40">Future Date Claims</p>
                                <p class="text-sm font-medium" :class="selected.allow_future_date_claims ? 'text-emerald-300' : 'text-white/50'">{{ selected.allow_future_date_claims ? 'Allowed' : 'Not allowed' }}</p>
                            </div>
                        </div>

                        <!-- Approval Chain -->
                        <div v-if="selected.approval_required && selected.approval_mode === 'SAME_FOR_ALL'" class="rounded-lg border border-white/10 bg-white/5 p-4">
                            <h4 class="text-sm font-semibold text-white/80 mb-3">Approval Chain (Same for all categories)</h4>
                            <div v-if="!selected.approval_levels?.length" class="text-xs text-white/40">No levels configured. Edit policy to add levels.</div>
                            <div v-else class="space-y-2">
                                <div v-for="(l, idx) in selected.approval_levels" :key="l.id || idx" class="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                                    <span class="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/20 flex items-center justify-center text-xs font-bold text-emerald-300">{{ idx + 1 }}</span>
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{{ l.approver_type }}</span>
                                    <span class="text-sm text-white/80 flex-1 truncate">{{ l.approver_name || l.approver_id }}</span>
                                    <span v-if="l.auto_approve" class="text-xs text-amber-300">Auto {{ l.auto_approve_days }}d</span>
                                </div>
                            </div>
                            <p v-if="selected.approval_mode === 'BY_CATEGORY'" class="text-xs text-white/40 mt-2">Approval chain varies by category — configure under each expense category.</p>
                        </div>
                        <div v-else-if="selected.approval_required && selected.approval_mode === 'BY_CATEGORY'" class="rounded-lg border border-amber-400/20 bg-amber-500/10 p-4">
                            <p class="text-sm text-amber-200">Approval chain varies by expense categories.</p>
                            <p class="text-xs text-white/50 mt-1">Approval chain has to be configured under the expense categories.</p>
                        </div>

                        <!-- Policy Categories -->
                        <div class="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="text-sm font-semibold text-white/80">Expense Categories</h4>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-white/40">{{ store.policyCategories.length }} attached</span>
                                    <UiButton @click="openAddCategory" color="#4aff7a" text="Add Category" prepend-icon="ion:add-circle" size="sm" />
                                </div>
                            </div>

                            <div v-if="store.policyCategoriesLoading" class="py-6 flex justify-center">
                                <Icon name="lucide:loader-circle" class="w-5 h-5 animate-spin text-white/40" />
                            </div>
                            <div v-else-if="!store.policyCategories.length" class="py-8 flex flex-col items-center gap-2 text-white/40">
                                <Icon name="ion:pricetags-outline" class="w-8 h-8 opacity-40" />
                                <p class="text-xs">No expense categories added to this policy.</p>
                                <UiButton @click="openAddCategory" color="#4aff7a" text="Add Category" prepend-icon="ion:add-circle" size="sm" class="mt-1" />
                            </div>
                            <div v-else class="overflow-x-auto rounded-lg border border-white/10">
                                <table class="min-w-full text-sm text-white/90">
                                    <thead class="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Expense Category</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Usage Type</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Expense Code</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Expense Limit</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Expense Rules</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Approval</th>
                                            <th class="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="cat in store.policyCategories" :key="cat.id" class="border-b border-white/5 hover:bg-white/5">
                                            <td class="px-3 py-2">
                                                <div class="flex items-center gap-2">
                                                    <span class="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                                                        <Icon :name="cat.icon || 'ion:pricetag-outline'" class="w-4 h-4 text-white/60" />
                                                    </span>
                                                    <span class="font-medium text-white/85">{{ cat.name }}</span>
                                                </div>
                                            </td>
                                            <td class="px-3 py-2"><span class="inline-flex px-2 py-0.5 rounded-full text-xs bg-white/10 border border-white/10 text-white/60">{{ cat.usage_type_name || '—' }}</span></td>
                                            <td class="px-3 py-2 font-mono text-xs text-white/60">{{ cat.expense_code }}</td>
                                            <td class="px-3 py-2 text-xs" :class="getLimitText(cat) === 'No upper limit' ? 'text-white/40' : 'text-emerald-300'">{{ getLimitText(cat) }}</td>
                                            <td class="px-3 py-2">
                                                <button type="button" class="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2" @click="openRules(cat)">Update Rules</button>
                                            </td>
                                            <td class="px-3 py-2">
                                                <template v-if="selected?.approval_required && selected?.approval_mode === 'BY_CATEGORY'">
                                                    <button type="button" class="text-xs text-sky-300 hover:text-sky-200 underline underline-offset-2" @click="openCategoryApproval(cat)">Configure</button>
                                                </template>
                                                <template v-else-if="selected?.approval_required && selected?.approval_mode === 'SAME_FOR_ALL'">
                                                    <span class="text-xs text-white/40">Uses policy-level chain</span>
                                                </template>
                                                <template v-else>
                                                    <span class="text-xs text-white/30">—</span>
                                                </template>
                                            </td>
                                            <td class="px-3 py-2 text-right">
                                                <button type="button" @click="removeCategory(cat)" class="p-1 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-300" title="Remove">
                                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <UiButton @click="openEdit(selected)" color="#fff" text="Edit" prepend-icon="lucide:pencil" size="sm" />
                            <UiButton @click="toggleStatus(selected)" :color="selected.is_active ? '#fbbf24' : '#4aff7a'" :text="selected.is_active ? 'Deactivate' : 'Activate'" :prepend-icon="selected.is_active ? 'lucide:pause-circle' : 'lucide:play-circle'" size="sm" />
                        </div>
                        </template>

                        <!-- Employees Tab -->
                        <template v-if="detailTab === 'employees'">
                            <div class="flex items-center justify-between mb-3">
                                <p class="text-sm font-semibold text-white/80">Assigned Employees ({{ store.policyEmployeesTotal }})</p>
                                <UiButton @click="openAssignEmployees" color="#4aff7a" text="Assign Employees" prepend-icon="ion:add-circle" size="sm" />
                            </div>

                            <div class="relative mb-3">
                                <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input v-model="empSearchQuery" type="text" placeholder="Search by name, code or email..."
                                    class="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-emerald-400/50"
                                    @input="onEmpSearch" />
                            </div>

                            <div v-if="store.policyEmployeesLoading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                                <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                                <span class="text-xs">Loading employees...</span>
                            </div>
                            <div v-else-if="!store.policyEmployees.length" class="py-10 flex flex-col items-center gap-2 text-white/40">
                                <Icon name="ion:people-outline" class="w-8 h-8 opacity-30" />
                                <p class="text-sm">No employees assigned to this policy yet.</p>
                                <UiButton @click="openAssignEmployees" color="#4aff7a" text="Assign Employees" prepend-icon="ion:add-circle" size="sm" class="mt-1" />
                            </div>
                            <div v-else class="overflow-x-auto rounded-lg border border-white/10">
                                <table class="min-w-full text-sm text-white/90">
                                    <thead class="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Employee</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Code</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Department</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Designation</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Reports To</th>
                                            <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Location</th>
                                            <th class="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="emp in store.policyEmployees" :key="emp.employee_id" class="border-b border-white/5 hover:bg-white/5">
                                            <td class="px-3 py-2">
                                                <span class="font-medium text-white/85">{{ emp.employee_name }}</span>
                                            </td>
                                            <td class="px-3 py-2 font-mono text-xs text-white/60">{{ emp.employee_number }}</td>
                                            <td class="px-3 py-2 text-xs text-white/60">{{ emp.department || '—' }}</td>
                                            <td class="px-3 py-2 text-xs text-white/60">{{ emp.job_title || '—' }}</td>
                                            <td class="px-3 py-2 text-xs text-white/60">{{ emp.reporting_to || '—' }}</td>
                                            <td class="px-3 py-2 text-xs text-white/60">{{ emp.location || '—' }}</td>
                                            <td class="px-3 py-2 text-right">
                                                <button type="button" @click="confirmRemoveEmployee(emp)" class="p-1 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-300" title="Remove">
                                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Pagination -->
                            <div v-if="store.policyEmployeesTotalPages > 1" class="flex items-center justify-between mt-3">
                                <p class="text-xs text-white/40">Page {{ store.policyEmployeesPage }} of {{ store.policyEmployeesTotalPages }} ({{ store.policyEmployeesTotal }} total)</p>
                                <div class="flex items-center gap-1">
                                    <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="store.policyEmployeesPage <= 1" @click="empPagePrev">Prev</button>
                                    <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="store.policyEmployeesPage >= store.policyEmployeesTotalPages" @click="empPageNext">Next</button>
                                </div>
                            </div>
                        </template>
                    </div>
                </template>
                <div v-else class="flex-1 flex items-center justify-center text-sm text-white/40">Select a policy to view details.</div>
            </div>
        </div>

        <!-- Create / Edit drawer -->
        <UiSidebarModal v-model="formModal" :title="isEditing ? 'Edit Expense Policy' : 'Add Expense Policy'" width="640px">
            <template #default>
                <form @submit.prevent="submitForm" class="flex flex-col gap-5">
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Name of the Policy <span class="text-rose-400">*</span></p>
                        <FormInput v-model="form.name" class="w-full" prepend-icon="ion:document-text-outline" color="#4aff7a" size="md" rounded="lg" placeholder="e.g. General Expense Policy" />
                        <p v-if="formErrors.name" class="mt-1 text-xs text-rose-400">{{ formErrors.name }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Short Description</p>
                        <textarea v-model="form.description" rows="3" class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 resize-none" placeholder="Optional description"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-white/85 mb-1.5">Base Currency for settling the expenses <span class="text-rose-400">*</span></p>
                            <FormSelect v-model="form.base_currency" :options="currencyOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" placeholder="Choose Currency" searchable />
                            <p v-if="formErrors.base_currency" class="mt-1 text-xs text-rose-400">{{ formErrors.base_currency }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-white/85 mb-1.5">Who will define the payout mode of approved expenses?</p>
                            <FormSelect v-model="form.payout_mode" :options="payoutModeOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" placeholder="Select payout mode" clearable />
                        </div>
                    </div>
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.allow_future_date_claims" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Allow Employees to claim Expense for future Date</span>
                    </label>
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" v-model="form.approval_required" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Expense claim requires approval</span>
                    </label>

                    <div v-if="form.approval_required" class="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                        <p class="text-sm font-semibold text-white/85">Is approval chain same for all expense categories under this policy?</p>
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="radio" :value="'SAME_FOR_ALL'" v-model="form.approval_mode" class="mt-1" />
                            <span class="text-sm text-white/70">Yes. Approval chain is same for all expense categories under this policy.</span>
                        </label>
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="radio" :value="'BY_CATEGORY'" v-model="form.approval_mode" class="mt-1" />
                            <span class="text-sm text-white/70">No. Approval chain varies by expense categories.</span>
                        </label>

                        <div v-if="form.approval_mode === 'SAME_FOR_ALL'" class="mt-2 flex flex-col gap-3">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-semibold text-white/80">Approval Chain</p>
                                <UiButton @click="addLevel" color="#4aff7a" text="Add Level" prepend-icon="ion:add-circle" size="sm" />
                            </div>
                            <div v-if="!form.approval_levels.length" class="text-xs text-white/40">No levels yet. Add a level to define approvers.</div>
                            <div v-for="(level, idx) in form.approval_levels" :key="idx" class="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-col gap-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-bold text-emerald-300">LEVEL {{ idx + 1 }}</span>
                                    <button type="button" @click="removeLevel(idx)" class="text-xs text-rose-300 hover:text-rose-200">Remove</button>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <p class="text-xs text-white/60 mb-1">Approver Type</p>
                                        <FormSelect :model-value="typeOption(level.approver_type)" :options="approverTypeOptions" class="w-full" color="#4aff7a" size="sm" rounded="lg" @update:model-value="onTypeChange(level, $event)" />
                                    </div>
                                    <div>
                                        <p class="text-xs text-white/60 mb-1">Approver</p>
                                        <FormSelect :model-value="refOption(level)" :options="approverOptions(level.approver_type)" class="w-full" color="#4aff7a" size="sm" rounded="lg" searchable placeholder="Select role or employee" @update:model-value="onApproverSelect(level, $event)" />
                                    </div>
                                </div>
                                <label class="flex items-center gap-2 text-xs text-white/70">
                                    <input type="checkbox" :checked="level.auto_approve" @change="level.auto_approve = ($event.target).checked" class="w-3 h-3 rounded border-white/20 bg-white/10" />
                                    Auto-approve and skip this level if no action taken in
                                    <input type="number" min="1" :value="level.auto_approve_days" @input="level.auto_approve_days = Number(($event.target).value)" class="w-16 bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-xs text-white" :disabled="!level.auto_approve" />
                                    days
                                </label>
                                <p v-if="levelErrors[idx]" class="text-xs text-rose-400">{{ levelErrors[idx] }}</p>
                            </div>
                            <label class="flex items-start gap-2 text-xs text-white/60">
                                <input type="checkbox" v-model="form.notify_previous_on_reject" class="w-3 h-3 rounded border-white/20 bg-white/10 mt-0.5" />
                                Notify all previous approvers if request is rejected.
                            </label>
                        </div>
                        <div v-else-if="form.approval_mode === 'BY_CATEGORY'" class="rounded-lg bg-amber-500/10 border border-amber-400/20 p-3">
                            <p class="text-xs text-amber-200">Approval chain has to be configured under the expense categories.</p>
                        </div>
                    </div>

                    <div>
                        <p class="text-sm text-white/85 mb-1.5">Status</p>
                        <FormSelect v-model="form.is_active" :options="statusOptions" class="w-full" color="#4aff7a" size="md" rounded="lg" />
                    </div>
                </form>
            </template>
            <template #footer>
                <UiButton @click="formModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="store.saving" />
                <UiButton @click="submitForm" color="#4aff7a" :text="store.saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create')" prepend-icon="ion:save-outline" :disabled="store.saving" />
            </template>
        </UiSidebarModal>

        <UiModal v-model="deleteModal" title="Delete Expense Policy?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to delete <span class="font-semibold text-white">"{{ deleteTarget?.name }}"</span>?</p>
                <p v-if="deleteTarget?.category_count" class="mt-2 text-xs text-amber-300">{{ deleteTarget.category_count }} category(ies) attached — remove them first.</p>
                <p v-else class="mt-2 text-xs text-white/45">This will soft-delete the policy.</p>
            </template>
            <template #footer>
                <UiButton @click="deleteModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doDelete" color="#750d0d" text="Delete" prepend-icon="ion:trash" :disabled="deleting || (deleteTarget?.category_count || 0) > 0" />
            </template>
        </UiModal>

        <!-- Add Category Drawer -->
        <UiSidebarModal v-model="addCategoryModal" title="Add Expense Category" width="560px">
            <template #default>
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-white/60">Choose categories to attach to <span class="font-semibold text-emerald-300">{{ selected?.name }}</span>. Only active categories are shown.</p>
                    <div class="relative">
                        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input v-model="categorySearch" type="text" placeholder="Search by category, code or usage type..."
                            class="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-emerald-400/50" />
                    </div>
                    <div v-if="categoryLoading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                        <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                        <span class="text-xs">Loading categories...</span>
                    </div>
                    <div v-else-if="filteredAvailableCategories.length" class="space-y-1 max-h-[45vh] overflow-y-auto glass-scroll pr-1">
                        <label v-for="c in filteredAvailableCategories" :key="c.id" class="flex items-center gap-3 rounded-lg px-3 py-2.5 border cursor-pointer"
                            :class="selectedCategoryIds.includes(String(c.id)) ? 'bg-emerald-500/15 border-emerald-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10'">
                            <input type="checkbox" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" :checked="selectedCategoryIds.includes(String(c.id))" @change="toggleCategory(c.id)" />
                            <span class="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                <Icon :name="c.icon || 'ion:pricetag-outline'" class="w-4 h-4 text-white/60" />
                            </span>
                            <span class="flex-1 min-w-0">
                                <span class="block text-sm font-medium text-white/85 truncate">{{ c.name }}</span>
                                <span class="block text-xs text-white/45 truncate">{{ c.expense_code }} • {{ c.usage_type_name }}</span>
                            </span>
                        </label>
                    </div>
                    <div v-else class="py-10 flex flex-col items-center gap-2 text-white/40">
                        <Icon name="ion:pricetags-outline" class="w-8 h-8 opacity-30" />
                        <p class="text-sm">{{ categorySearch ? 'No categories match your search.' : 'No available categories. All active categories are already attached or none exist.' }}</p>
                        <p v-if="!categorySearch && !filteredAvailableCategories.length" class="text-xs text-white/30">Create an expense category first.</p>
                    </div>
                </div>
            </template>
            <template #footer>
                <UiButton @click="addCategoryModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="addCategories" color="#4aff7a" text="Add" prepend-icon="ion:add-circle" :disabled="!selectedCategoryIds.length" />
            </template>
        </UiSidebarModal>

        <!-- Rules Drawer -->
        <UiSidebarModal v-model="rulesDrawer" :title="`Rules for ${rulesCategory?.name || ''} expenses in the policy - ${selected?.name || ''}`" width="640px">
            <template #subtitle>
                <span class="text-xs text-white/50">Configure and manage the rules for the expense category in this expense policy.</span>
            </template>
            <template #default>
                <div v-if="rulesLoading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                    <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                    <span class="text-xs">Loading rules...</span>
                </div>
                <form v-else @submit.prevent="saveRules" class="flex flex-col gap-5">
                    <!-- Rule 1: Amount Cap -->
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" v-model="rulesForm.amount_cap_enabled" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Expense amount is capped for given period</span>
                    </label>
                    <div v-if="rulesForm.amount_cap_enabled" class="ml-7 flex flex-col gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <p class="text-xs text-white/60">Limit the expense to:</p>
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <p class="text-xs text-white/60 mb-1">Currency</p>
                                <FormSelect v-model="rulesForm.amount_cap_currency" :options="currencyOptions" class="w-full" color="#4aff7a" size="sm" rounded="lg" />
                            </div>
                            <div>
                                <p class="text-xs text-white/60 mb-1">Amount</p>
                                <FormInput v-model.number="rulesForm.amount_cap_amount" type="number" class="w-full" color="#4aff7a" size="sm" rounded="lg" placeholder="150000" />
                            </div>
                            <div>
                                <p class="text-xs text-white/60 mb-1">Period</p>
                                <FormSelect v-model="rulesForm.amount_cap_period" :options="periodOptions" class="w-full" color="#4aff7a" size="sm" rounded="lg" placeholder="Select period" />
                            </div>
                        </div>
                    </div>

                    <!-- Rule 2: Combination -->
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" v-model="rulesForm.combination_enabled" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Expense cannot be raised along with <span class="font-semibold text-white"> {{ rulesForm.combination_category_id?.label || 'Select Category' }} </span> for the same <span class="font-semibold text-white">{{ rulesForm.combination_period?.label || 'Period' }}</span></span>
                    </label>
                    <div v-if="rulesForm.combination_enabled" class="ml-7 grid grid-cols-2 gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div>
                            <p class="text-xs text-white/60 mb-1">Category</p>
                            <FormSelect v-model="rulesForm.combination_category_id" :options="combinationCategoryOptions" class="w-full" color="#4aff7a" size="sm" rounded="lg" searchable placeholder="Select Category" />
                        </div>
                        <div>
                            <p class="text-xs text-white/60 mb-1">Period</p>
                            <FormSelect v-model="rulesForm.combination_period" :options="periodOptions" class="w-full" color="#4aff7a" size="sm" rounded="lg" placeholder="Select period" />
                        </div>
                    </div>

                    <!-- Rule 3: Instances -->
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" v-model="rulesForm.instances_enabled" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Number of instances this expense can be claimed is limited in given period</span>
                    </label>
                    <div v-if="rulesForm.instances_enabled" class="ml-7 grid grid-cols-2 gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div>
                            <p class="text-xs text-white/60 mb-1">Maximum instances</p>
                            <FormInput v-model.number="rulesForm.max_instances" type="number" class="w-full" color="#4aff7a" size="sm" rounded="lg" placeholder="5" />
                        </div>
                        <div>
                            <p class="text-xs text-white/60 mb-1">Period</p>
                            <FormSelect v-model="rulesForm.instances_period" :options="periodOptions" class="w-full" color="#4aff7a" size="sm" rounded="lg" placeholder="Select period" />
                        </div>
                    </div>

                    <!-- Rule 4: Expiry -->
                    <label class="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" v-model="rulesForm.expiry_enabled" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Mark as expired if submitted beyond <span class="font-mono text-emerald-300">{{ rulesForm.expiry_days || 'X' }}</span> days from the day expense incurred</span>
                    </label>
                    <div v-if="rulesForm.expiry_enabled" class="ml-7 p-3 rounded-lg bg-white/5 border border-white/10">
                        <p class="text-xs text-white/60 mb-1">Days</p>
                        <FormInput v-model.number="rulesForm.expiry_days" type="number" class="w-32" color="#4aff7a" size="sm" rounded="lg" placeholder="30" />
                    </div>

                    <!-- Rule 5: Cost Center -->
                    <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-white/5 border border-white/10">
                        <input type="checkbox" v-model="rulesForm.cost_center_required" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Mandatory to select Project/Cost Center while raising the expense request</span>
                    </label>

                    <!-- Receipts & Additional Notes -->
                    <div class="rounded-lg border border-white/10 bg-white/5 p-4 flex flex-col gap-4">
                        <h4 class="text-sm font-semibold text-white/80">Receipts & Additional Notes</h4>
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" v-model="rulesForm.comment_threshold_enabled" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                            <span class="text-sm text-white/70">Require comment when amount exceeds <span class="inline-flex items-center gap-2"><FormInput v-model.number="rulesForm.comment_threshold_amount" type="number" class="w-24" color="#4aff7a" size="sm" rounded="lg" placeholder="5000" :disabled="!rulesForm.comment_threshold_enabled" /></span></span>
                        </label>
                        <label class="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" v-model="rulesForm.receipt_threshold_enabled" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                            <span class="text-sm text-white/70">Require receipt when amount exceeds <span class="inline-flex items-center gap-2"><FormInput v-model.number="rulesForm.receipt_threshold_amount" type="number" class="w-24" color="#4aff7a" size="sm" rounded="lg" placeholder="5000" :disabled="!rulesForm.receipt_threshold_enabled" /></span></span>
                        </label>
                    </div>

                    <!-- Threshold Approval -->
                    <label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-amber-500/10 border border-amber-400/20">
                        <input type="checkbox" v-model="rulesForm.threshold_approval_enabled" class="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80">Different approval chain when total claim amount exceeds <span class="inline-flex items-center gap-2"><FormSelect v-model="rulesForm.threshold_currency" :options="currencyOptions" class="w-20" color="#4aff7a" size="sm" rounded="lg" :disabled="!rulesForm.threshold_approval_enabled" /><FormInput v-model.number="rulesForm.threshold_amount" type="number" class="w-24" color="#4aff7a" size="sm" rounded="lg" placeholder="10000" :disabled="!rulesForm.threshold_approval_enabled" /></span></span>
                    </label>
                </form>
            </template>
            <template #footer>
                <UiButton @click="rulesDrawer = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="rulesSaving" />
                <UiButton @click="saveRules" color="#4aff7a" text="Save Rules" prepend-icon="ion:save-outline" :disabled="rulesSaving" :loading="rulesSaving" />
            </template>
        </UiSidebarModal>

        <!-- Category Approval Drawer -->
        <UiSidebarModal v-model="approvalDrawer" :title="`Approval Chain for ${approvalCategory?.name || ''} in ${selected?.name || ''}`" width="640px">
            <template #subtitle>
                <span class="text-xs text-white/50">Employees added to this chain will be asked for approval for expenses under this category and policy.</span>
            </template>
            <template #default>
                <div v-if="approvalLoading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                    <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                    <span class="text-xs">Loading approval chain...</span>
                </div>
                <div v-else class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold text-white/80">Approval Chain</p>
                        <UiButton @click="addApprovalLevel" color="#4aff7a" text="Add New Level" prepend-icon="ion:add-circle" size="sm" />
                    </div>
                    <div v-if="!approvalLevels.length" class="text-xs text-white/40">No levels yet. Add a level to define approvers.</div>
                    <div v-for="(level, idx) in approvalLevels" :key="idx" class="rounded-lg border border-white/10 bg-white/5 p-3 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-emerald-300">LEVEL {{ idx + 1 }}</span>
                            <button type="button" @click="removeApprovalLevel(idx)" class="text-xs text-rose-300 hover:text-rose-200">Remove</button>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <p class="text-xs text-white/60 mb-1">Approver Type</p>
                                <FormSelect :model-value="typeOption(level.approver_type)" :options="approverTypeOptions" class="w-full" color="#4aff7a" size="sm" rounded="lg" @update:model-value="onApprovalTypeChange(level, $event)" />
                            </div>
                            <div>
                                <p class="text-xs text-white/60 mb-1">Approver</p>
                                <FormSelect :model-value="refOptionApproval(level)" :options="approverOptions(level.approver_type)" class="w-full" color="#4aff7a" size="sm" rounded="lg" searchable placeholder="Select role or employee" @update:model-value="onApprovalApproverSelect(level, $event)" />
                            </div>
                        </div>
                        <label class="flex items-center gap-2 text-xs text-white/70">
                            <input type="checkbox" :checked="level.auto_approve" @change="level.auto_approve = ($event.target).checked" class="w-3 h-3 rounded border-white/20 bg-white/10" />
                            Auto-approve and skip this level if no action taken in
                            <input type="number" min="1" :value="level.auto_approve_days" @input="level.auto_approve_days = Number(($event.target).value)" class="w-16 bg-white/10 border border-white/15 rounded-lg px-2 py-1 text-xs text-white" :disabled="!level.auto_approve" />
                            days
                        </label>
                        <p v-if="approvalLevelErrors[idx]" class="text-xs text-rose-400">{{ approvalLevelErrors[idx] }}</p>
                    </div>
                </div>
            </template>
            <template #footer>
                <UiButton @click="approvalDrawer = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="approvalSaving" />
                <UiButton @click="saveCategoryApproval" color="#4aff7a" text="Save Approval Chain" prepend-icon="ion:save-outline" :disabled="approvalSaving" :loading="approvalSaving" />
            </template>
        </UiSidebarModal>

        <!-- Assign Employees Drawer -->
        <UiSidebarModal v-model="assignDrawer" title="Assign Employees to Policy" width="640px">
            <template #subtitle>
                <span class="text-xs text-white/50">Select employees to assign to <span class="font-semibold text-emerald-300">{{ selected?.name }}</span>.</span>
            </template>
            <template #default>
                <div class="flex flex-col gap-4">
                    <div class="relative">
                        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input v-model="assignSearch" type="text" placeholder="Search by name, code or email..."
                            class="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-emerald-400/50"
                            @input="onAssignSearch" />
                    </div>

                    <label class="flex items-center gap-2 text-xs text-white/60 cursor-pointer px-1">
                        <input type="checkbox" class="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-emerald-500"
                            :checked="paginatedAssignEmployees.length > 0 && paginatedAssignEmployees.every(e => assignSelectedIds.includes(String(e.id)))"
                            @change="toggleAllAssign" />
                        Select all on page ({{ paginatedAssignEmployees.length }})
                        <span v-if="assignSelectedIds.length" class="text-emerald-300 ml-1">• {{ assignSelectedIds.length }} selected</span>
                    </label>

                    <div v-if="assignLoading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                        <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                        <span class="text-xs">Loading employees...</span>
                    </div>
                    <div v-else-if="!filteredAssignEmployees.length" class="py-10 flex flex-col items-center gap-2 text-white/40">
                        <Icon name="ion:people-outline" class="w-8 h-8 opacity-30" />
                        <p class="text-sm">{{ assignSearch ? 'No employees match your search.' : 'No available employees to assign.' }}</p>
                    </div>
                    <template v-else>
                        <div class="space-y-1">
                            <label v-for="emp in paginatedAssignEmployees" :key="emp.id" class="flex items-center gap-3 rounded-lg px-3 py-2.5 border cursor-pointer"
                                :class="assignSelectedIds.includes(String(emp.id)) ? 'bg-emerald-500/15 border-emerald-400/30' : 'bg-white/5 border-white/10 hover:bg-white/10'">
                                <input type="checkbox" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500"
                                    :checked="assignSelectedIds.includes(String(emp.id))" @change="toggleAssignEmployee(emp.id)" />
                                <span class="flex-1 min-w-0">
                                    <span class="block text-sm font-medium text-white/85 truncate">{{ emp.full_name || emp.fullName }}</span>
                                    <span class="block text-xs text-white/45 truncate">{{ emp.employeeCode || '' }} • {{ emp.department || '' }}</span>
                                </span>
                            </label>
                        </div>
                        <div v-if="assignTotalPages > 1" class="flex items-center justify-between pt-1">
                            <p class="text-xs text-white/40">Page {{ assignPage }} of {{ assignTotalPages }} ({{ filteredAssignEmployees.length }} total)</p>
                            <div class="flex items-center gap-1">
                                <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="assignPage <= 1" @click="assignPagePrev">Prev</button>
                                <button type="button" class="px-2.5 py-1.5 text-xs rounded-lg border border-white/15 text-white/60 hover:bg-white/10 disabled:opacity-30" :disabled="assignPage >= assignTotalPages" @click="assignPageNext">Next</button>
                            </div>
                        </div>
                    </template>
                </div>
            </template>
            <template #footer>
                <UiButton @click="assignDrawer = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" :disabled="assignSaving" />
                <UiButton @click="doAssignEmployees" color="#4aff7a" :text="assignSaving ? 'Assigning...' : `Assign (${assignSelectedIds.length})`" prepend-icon="ion:add-circle" :disabled="assignSaving || !assignSelectedIds.length" :loading="assignSaving" />
            </template>
        </UiSidebarModal>

        <!-- Remove Employee Confirmation -->
        <UiModal v-model="removeModal" title="Remove Employee from Policy?" size="sm">
            <template #default>
                <p class="text-white/85 text-sm">Are you sure you want to remove <span class="font-semibold text-white">"{{ removeTarget?.employee_name }}"</span> from this policy?</p>
                <p class="mt-2 text-xs text-white/45">This employee will no longer be bound by this expense policy.</p>
            </template>
            <template #footer>
                <UiButton @click="removeModal = false" color="#fff" text="Cancel" prepend-icon="ion:close-circle" />
                <UiButton @click="doRemoveEmployee" color="#750d0d" text="Remove" prepend-icon="ion:trash" :disabled="removing" :loading="removing" />
            </template>
        </UiModal>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useExpensePolicyStore } from '~/stores/organization/expensePolicy.store'
import { useExpenseCategoryStore } from '~/stores/organization/expenseCategory.store'
import { useAuthStore } from '~/stores/shared/auth.store'

const props = defineProps({ organizationId: { type: String, required: true } })
const store = useExpensePolicyStore()
const authStore = useAuthStore()
const categoryStore = useExpenseCategoryStore()

const searchQuery = ref('')
const menuOpen = ref(false)
const formModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const deleteModal = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

// Sub-tabs: Summary | Employees
const detailTab = ref('summary')
const detailTabs = [
    { label: 'Summary', value: 'summary' },
    { label: 'Employees', value: 'employees' },
]

// Category attachment
const addCategoryModal = ref(false)
const selectedCategoryIds = ref([])
const categorySearch = ref('')
const availableCategories = ref([])
const categoryLoading = ref(false)
const removeCategoryLoading = ref(false)

// Employee assignment
const assignDrawer = ref(false)
const assignSearch = ref('')
const assignAllEmployees = ref([])
const assignSelectedIds = ref([])
const assignLoading = ref(false)
const assignSaving = ref(false)
const assignPage = ref(1)
const assignLimit = 15
const empSearchQuery = ref('')
const removeTarget = ref(null)
const removeModal = ref(false)
const removing = ref(false)

const form = ref({
    name: '',
    description: '',
    base_currency: null,
    payout_mode: null,
    allow_future_date_claims: false,
    approval_required: false,
    approval_mode: 'SAME_FOR_ALL',
    is_active: { value: true, label: 'Active' },
    approval_levels: [],
    notify_previous_on_reject: false,
})
const formErrors = ref({})
const levelErrors = ref({})

const currencyOptions = [
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
]
const payoutModeOptions = [
    { value: 'FINANCE_TEAM', label: 'Finance Team' },
    { value: 'REPORTING_MANAGER', label: 'Reporting Manager' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'EMPLOYEE', label: 'Employee' },
]
const statusOptions = [{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]
const approverTypeOptions = [{ value: 'ROLE', label: 'Role' }, { value: 'EMPLOYEE', label: 'Employee' }]

const roles = ref([])
const employees = ref([])

const filteredPolicies = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return store.policies || []
    return (store.policies || []).filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
})
const selected = computed(() => store.selectedPolicy)

function onSearch(term) { searchQuery.value = term; store.fetchPolicies(props.organizationId, { search: term, page: 1 }) }
function selectPolicy(p) { store.selectPolicy(p.id); menuOpen.value = false }
function refresh() { store.fetchPolicies(props.organizationId) }

// Category handling
const filteredAvailableCategories = computed(() => {
    const q = categorySearch.value.trim().toLowerCase()
    if (!q) return availableCategories.value
    return availableCategories.value.filter(c => (c.name || '').toLowerCase().includes(q) || (c.expense_code || '').toLowerCase().includes(q) || (c.usage_type_name || '').toLowerCase().includes(q))
})

async function openAddCategory() {
    if (!selected.value) return
    addCategoryModal.value = true
    selectedCategoryIds.value = []
    categorySearch.value = ''
    await fetchAvailableCategories()
}

async function fetchAvailableCategories() {
    categoryLoading.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get('/expense-categories', { params: { organization_id: props.organizationId, limit: 100, is_active_only: 'true' } })
        const all = (data?.expense_categories || []).map(c => ({
            id: c.id, name: c.name, expense_code: c.expense_code, usage_type_name: c.usage_type_name, icon: c.icon, is_active: c.is_active,
        }))
        const attachedIds = new Set((store.policyCategories || []).map(pc => String(pc.expense_category_id)))
        availableCategories.value = all.filter(c => !attachedIds.has(String(c.id)))
    } catch (e) {
        console.error('[policyCategories] fetch available error:', e)
        availableCategories.value = []
    } finally {
        categoryLoading.value = false
    }
}

function toggleCategory(id) {
    const strId = String(id)
    if (selectedCategoryIds.value.includes(strId)) selectedCategoryIds.value = selectedCategoryIds.value.filter(x => x !== strId)
    else selectedCategoryIds.value = [...selectedCategoryIds.value, strId]
}

async function addCategories() {
    if (!selected.value || !selectedCategoryIds.value.length) return
    try {
        await store.addPolicyCategories(selected.value.id, selectedCategoryIds.value)
        addCategoryModal.value = false
        selectedCategoryIds.value = []
    } catch {}
}

async function removeCategory(cat) {
    if (!selected.value) return
    if (!confirm(`Remove "${cat.name}" from this policy?`)) return
    removeCategoryLoading.value = true
    try {
        const catId = cat.expense_category_id || cat.id
        await store.removePolicyCategory(selected.value.id, catId)
        // Clean up rulesMap for removed category
        delete rulesMap.value[catId]
        delete rulesMap.value[cat.id]
    } catch {} finally { removeCategoryLoading.value = false }
}

// Rules handling
const rulesDrawer = ref(false)
const rulesCategory = ref(null)
const rulesLoading = ref(false)
const rulesSaving = ref(false)
const rulesMap = ref({})
const rulesForm = ref({
    amount_cap_enabled: false,
    amount_cap_currency: null,
    amount_cap_amount: null,
    amount_cap_period: null,
    combination_enabled: false,
    combination_category_id: null,
    combination_period: null,
    instances_enabled: false,
    max_instances: null,
    instances_period: null,
    expiry_enabled: false,
    expiry_days: null,
    cost_center_required: false,
    comment_threshold_enabled: false,
    comment_threshold_amount: null,
    receipt_threshold_enabled: false,
    receipt_threshold_amount: null,
    threshold_approval_enabled: false,
    threshold_currency: null,
    threshold_amount: null,
})

const periodOptions = [
    { value: 'DAY', label: 'Day' },
    { value: 'WEEK', label: 'Week' },
    { value: 'MONTH', label: 'Month' },
    { value: 'QUARTER', label: 'Quarter' },
    { value: 'HALF_YEAR', label: 'Half Year' },
    { value: 'YEAR', label: 'Year' },
    { value: 'TENURE', label: 'Tenure' },
]

const combinationCategoryOptions = computed(() => {
    const all = categoryStore.categories || []
    const currentId = rulesCategory.value?.expense_category_id || rulesCategory.value?.id
    return all.filter(c => String(c.id) !== String(currentId) && c.is_active).map(c => ({ value: c.id, label: `${c.name} (${c.usage_type_name})` }))
})

function getLimitText(cat) {
    const rule = rulesMap.value[cat.expense_category_id] || rulesMap.value[cat.id]
    if (!rule) return '—'
    if (!rule.amount_cap_enabled) return 'No upper limit'
    const amt = rule.amount_cap_amount ?? 0
    const cur = rule.amount_cap_currency || selected.value?.base_currency || 'INR'
    const per = rule.amount_cap_period || 'MONTH'
    return `Max. ${cur} ${amt} per ${per.charAt(0) + per.slice(1).toLowerCase().replace('_', ' ')}`
}

async function openRules(cat) {
    rulesCategory.value = cat
    rulesDrawer.value = true
    rulesLoading.value = true
    try {
        const catId = cat.expense_category_id || cat.id
        const policyId = selected.value.id
        console.log('[openRules] Fetching rules for policy:', policyId, 'category:', catId)
        const rule = await store.fetchCategoryRules(policyId, catId)
        console.log('[openRules] Fetched rule:', rule)
        // Store in map for table display
        rulesMap.value[cat.expense_category_id] = rule
        rulesMap.value[cat.id] = rule
        rulesForm.value = {
            amount_cap_enabled: !!rule.amount_cap_enabled,
            amount_cap_currency: rule.amount_cap_currency ? { value: rule.amount_cap_currency, label: rule.amount_cap_currency } : { value: selected.value?.base_currency || 'INR', label: selected.value?.base_currency || 'INR' },
            amount_cap_amount: rule.amount_cap_amount || null,
            amount_cap_period: rule.amount_cap_period ? { value: rule.amount_cap_period, label: rule.amount_cap_period } : null,
            combination_enabled: !!rule.combination_enabled,
            combination_category_id: rule.combination_category_id ? { value: rule.combination_category_id, label: rule.combination_category_id } : null,
            combination_period: rule.combination_period ? { value: rule.combination_period, label: rule.combination_period } : null,
            instances_enabled: !!rule.instances_enabled,
            max_instances: rule.max_instances || null,
            instances_period: rule.instances_period ? { value: rule.instances_period, label: rule.instances_period } : null,
            expiry_enabled: !!rule.expiry_enabled,
            expiry_days: rule.expiry_days || null,
            cost_center_required: !!rule.cost_center_required,
            comment_threshold_enabled: !!rule.comment_threshold_enabled,
            comment_threshold_amount: rule.comment_threshold_amount || null,
            receipt_threshold_enabled: !!rule.receipt_threshold_enabled,
            receipt_threshold_amount: rule.receipt_threshold_amount || null,
            threshold_approval_enabled: !!rule.threshold_approval_enabled,
            threshold_currency: rule.threshold_currency ? { value: rule.threshold_currency, label: rule.threshold_currency } : { value: selected.value?.base_currency || 'INR', label: selected.value?.base_currency || 'INR' },
            threshold_amount: rule.threshold_amount || null,
        }
        console.log('[openRules] Form populated:', JSON.parse(JSON.stringify(rulesForm.value)))
        // Resolve combination category label
        if (rule.combination_category_id) {
            const comboCat = categoryStore.categories.find(c => String(c.id) === String(rule.combination_category_id))
            if (comboCat) rulesForm.value.combination_category_id = { value: comboCat.id, label: `${comboCat.name} (${comboCat.usage_type_name})` }
        }
    } catch (err) {
        console.error('[openRules] Error fetching rules:', err)
        const toast = useToast()
        toast.error({ title: 'Error!', message: 'Failed to load rules. ' + (err?.message || ''), timeout: 3000 })
        rulesForm.value = {
            amount_cap_enabled: false, amount_cap_currency: { value: selected.value?.base_currency || 'INR', label: selected.value?.base_currency || 'INR' }, amount_cap_amount: null, amount_cap_period: null,
            combination_enabled: false, combination_category_id: null, combination_period: null,
            instances_enabled: false, max_instances: null, instances_period: null,
            expiry_enabled: false, expiry_days: null, cost_center_required: false,
            comment_threshold_enabled: false, comment_threshold_amount: null, receipt_threshold_enabled: false, receipt_threshold_amount: null,
            threshold_approval_enabled: false, threshold_currency: { value: selected.value?.base_currency || 'INR', label: selected.value?.base_currency || 'INR' }, threshold_amount: null,
        }
    } finally {
        rulesLoading.value = false
    }
}

async function saveRules() {
    if (!selected.value || !rulesCategory.value) return
    rulesSaving.value = true
    try {
        const payload = {
            amount_cap_enabled: !!rulesForm.value.amount_cap_enabled,
            amount_cap_currency: rulesForm.value.amount_cap_currency?.value || rulesForm.value.amount_cap_currency || (selected.value?.base_currency || 'INR'),
            amount_cap_amount: rulesForm.value.amount_cap_enabled ? Number(rulesForm.value.amount_cap_amount) : null,
            amount_cap_period: rulesForm.value.amount_cap_enabled ? (rulesForm.value.amount_cap_period?.value || rulesForm.value.amount_cap_period) : null,
            combination_enabled: !!rulesForm.value.combination_enabled,
            combination_category_id: rulesForm.value.combination_enabled ? (rulesForm.value.combination_category_id?.value || rulesForm.value.combination_category_id) : null,
            combination_period: rulesForm.value.combination_enabled ? (rulesForm.value.combination_period?.value || rulesForm.value.combination_period) : null,
            instances_enabled: !!rulesForm.value.instances_enabled,
            max_instances: rulesForm.value.instances_enabled ? Number(rulesForm.value.max_instances) : null,
            instances_period: rulesForm.value.instances_enabled ? (rulesForm.value.instances_period?.value || rulesForm.value.instances_period) : null,
            expiry_enabled: !!rulesForm.value.expiry_enabled,
            expiry_days: rulesForm.value.expiry_enabled ? Number(rulesForm.value.expiry_days) : null,
            cost_center_required: !!rulesForm.value.cost_center_required,
            comment_threshold_enabled: !!rulesForm.value.comment_threshold_enabled,
            comment_threshold_amount: rulesForm.value.comment_threshold_enabled ? Number(rulesForm.value.comment_threshold_amount) : null,
            receipt_threshold_enabled: !!rulesForm.value.receipt_threshold_enabled,
            receipt_threshold_amount: rulesForm.value.receipt_threshold_enabled ? Number(rulesForm.value.receipt_threshold_amount) : null,
            threshold_approval_enabled: !!rulesForm.value.threshold_approval_enabled,
            threshold_currency: rulesForm.value.threshold_approval_enabled ? (rulesForm.value.threshold_currency?.value || rulesForm.value.threshold_currency) : null,
            threshold_amount: rulesForm.value.threshold_approval_enabled ? Number(rulesForm.value.threshold_amount) : null,
        }
        await store.saveCategoryRules(selected.value.id, rulesCategory.value.expense_category_id || rulesCategory.value.id, payload)
        // Update map for table
        rulesMap.value[rulesCategory.value.expense_category_id] = { ...payload, amount_cap_amount: payload.amount_cap_amount, amount_cap_currency: payload.amount_cap_currency, amount_cap_period: payload.amount_cap_period, amount_cap_enabled: payload.amount_cap_enabled }
        rulesMap.value[rulesCategory.value.id] = rulesMap.value[rulesCategory.value.expense_category_id]
        rulesDrawer.value = false
    } catch (err) {
        console.error('[saveRules] Error:', err)
        const toast = useToast()
        toast.error({ title: 'Error!', message: 'Failed to save rules. ' + (err?.message || ''), timeout: 3000 })
    } finally { rulesSaving.value = false }
}

// Category Approval handling
const approvalDrawer = ref(false)
const approvalCategory = ref(null)
const approvalLevels = ref([])
const approvalLoading = ref(false)
const approvalSaving = ref(false)
const approvalLevelErrors = ref({})

function refOptionApproval(level) {
    const opts = approverOptions(level.approver_type)
    return opts.find(o => String(o.value) === String(level.approver_id)) || (level.approver_id ? { value: level.approver_id, label: level.approver_name || level.approver_id } : null)
}
function onApprovalTypeChange(level, opt) {
    level.approver_type = opt?.value || opt || 'EMPLOYEE'
    level.approver_id = ''
    level.approver_name = ''
}
function onApprovalApproverSelect(level, opt) {
    level.approver_id = opt?.value || opt || ''
    level.approver_name = opt?.label || ''
}
function addApprovalLevel() {
    approvalLevels.value.push({ level: approvalLevels.value.length + 1, approver_type: 'EMPLOYEE', approver_id: '', approver_name: '', auto_approve: false, auto_approve_days: null })
}
function removeApprovalLevel(idx) {
    approvalLevels.value.splice(idx, 1)
    approvalLevels.value.forEach((l, i) => l.level = i + 1)
}
async function openCategoryApproval(cat) {
    if (!selected.value) return
    if (!selected.value.approval_required || selected.value.approval_mode !== 'BY_CATEGORY') {
        useToast().error({ title: 'Not allowed', message: 'Policy approval mode is not BY_CATEGORY', timeout: 2000 })
        return
    }
    approvalCategory.value = cat
    approvalDrawer.value = true
    approvalLoading.value = true
    approvalLevelErrors.value = {}
    try {
        const levels = await store.fetchCategoryApproval(selected.value.id, cat.expense_category_id || cat.id)
        approvalLevels.value = (levels || []).map(l => ({ ...l }))
        if (!approvalLevels.value.length) {
            approvalLevels.value = [{ level: 1, approver_type: 'EMPLOYEE', approver_id: '', approver_name: '', auto_approve: false, auto_approve_days: null }]
        }
        await loadSelectors()
    } catch (e) {
        approvalLevels.value = [{ level: 1, approver_type: 'EMPLOYEE', approver_id: '', approver_name: '', auto_approve: false, auto_approve_days: null }]
    } finally {
        approvalLoading.value = false
    }
}
async function saveCategoryApproval() {
    if (!selected.value || !approvalCategory.value) return
    approvalLevelErrors.value = {}
    // Validate
    let hasError = false
    approvalLevels.value.forEach((l, idx) => {
        if (!l.approver_id) { approvalLevelErrors.value[idx] = 'Approver is required'; hasError = true }
        else if (l.auto_approve && (!l.auto_approve_days || Number(l.auto_approve_days) <= 0)) { approvalLevelErrors.value[idx] = 'Days must be positive'; hasError = true }
    })
    if (hasError) return
    if (!approvalLevels.value.length) {
        useToast().error({ title: 'Validation', message: 'At least one approval level is required', timeout: 2000 })
        return
    }
    approvalSaving.value = true
    try {
        const payload = approvalLevels.value.map((l, idx) => ({
            level: idx + 1,
            approver_type: l.approver_type,
            approver_id: l.approver_id,
            approver_name: l.approver_name || '',
            auto_approve: !!l.auto_approve,
            auto_approve_days: l.auto_approve ? Number(l.auto_approve_days) : null,
        }))
        await store.saveCategoryApproval(selected.value.id, approvalCategory.value.expense_category_id || approvalCategory.value.id, payload)
        approvalDrawer.value = false
    } catch {} finally { approvalSaving.value = false }
}

function normalizeIsActive(v) { if (v && typeof v === 'object' && 'value' in v) return Boolean(v.value); return Boolean(v) }
function toFormStatus(b) { return b ? { value: true, label: 'Active' } : { value: false, label: 'Inactive' } }
function typeOption(t) { return approverTypeOptions.find(o => o.value === t) || null }
function refOption(level) {
    const opts = approverOptions(level.approver_type)
    return opts.find(o => String(o.value) === String(level.approver_id)) || (level.approver_id ? { value: level.approver_id, label: level.approver_name || level.approver_id } : null)
}
function approverOptions(type) {
    if (type === 'ROLE') return roles.value.map(r => ({ value: r.id, label: r.name }))
    return employees.value.map(e => ({ value: e.id, label: e.full_name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.email }))
}
function onTypeChange(level, opt) {
    level.approver_type = opt?.value || opt || 'EMPLOYEE'
    level.approver_id = ''
    level.approver_name = ''
}
function onApproverSelect(level, opt) {
    level.approver_id = opt?.value || opt || ''
    level.approver_name = opt?.label || ''
}
function addLevel() { form.value.approval_levels.push({ level: form.value.approval_levels.length + 1, approver_type: 'EMPLOYEE', approver_id: '', approver_name: '', auto_approve: false, auto_approve_days: null }) }
function removeLevel(idx) { form.value.approval_levels.splice(idx, 1); form.value.approval_levels.forEach((l, i) => l.level = i + 1) }

const openCreate = async () => {
    isEditing.value = false
    editingId.value = null
    form.value = { name: '', description: '', base_currency: null, payout_mode: null, allow_future_date_claims: false, approval_required: false, approval_mode: 'SAME_FOR_ALL', is_active: toFormStatus(true), approval_levels: [], notify_previous_on_reject: false }
    formErrors.value = {}
    levelErrors.value = {}
    formModal.value = true
    await loadSelectors()
}
const openEdit = async (p) => {
    isEditing.value = true
    editingId.value = p.id
    await loadSelectors()
    form.value = {
        name: p.name,
        description: p.description || '',
        base_currency: p.base_currency ? { value: p.base_currency, label: p.base_currency } : null,
        payout_mode: p.payout_mode ? { value: p.payout_mode, label: p.payout_mode } : null,
        allow_future_date_claims: !!p.allow_future_date_claims,
        approval_required: !!p.approval_required,
        approval_mode: p.approval_mode || 'SAME_FOR_ALL',
        is_active: toFormStatus(!!p.is_active),
        approval_levels: (p.approval_levels || []).map(l => ({ ...l })),
        notify_previous_on_reject: false,
    }
    formErrors.value = {}
    levelErrors.value = {}
    menuOpen.value = false
    formModal.value = true
}
async function loadSelectors() {
    const orgId = props.organizationId || authStore.organization
    try {
        const { $api } = useNuxtApp()
        const [rRes, eRes] = await Promise.allSettled([
            $api.get('/admin/roles', { params: { organization_id: orgId, limit: 100 } }),
            $api.get('/employees/all', { params: { organization_id: orgId } }),
        ])
        roles.value = rRes.status === 'fulfilled' ? (rRes.value.data?.roles || rRes.value.data?.data || []) : []
        employees.value = eRes.status === 'fulfilled' ? (eRes.value.data?.employees || eRes.value.data?.data || []) : []
    } catch {}
}

function validate() {
    levelErrors.value = {}
    const e = {}
    if (!form.value.name?.trim()) e.name = 'Policy Name is required'
    if (!form.value.base_currency) e.base_currency = 'Base Currency is required'
    else {
        const cur = form.value.base_currency?.value || form.value.base_currency
        if (!cur) e.base_currency = 'Base Currency is required'
    }
    if (form.value.approval_required && form.value.approval_mode === 'SAME_FOR_ALL' && form.value.approval_levels.length > 0) {
        form.value.approval_levels.forEach((l, idx) => {
            if (!l.approver_id) levelErrors.value[idx] = 'Approver is required'
            else if (l.auto_approve && (!l.auto_approve_days || Number(l.auto_approve_days) <= 0)) levelErrors.value[idx] = 'Days must be positive'
        })
    }
    formErrors.value = e
    return Object.keys(e).length === 0 && Object.keys(levelErrors.value).length === 0
}

const submitForm = async () => {
    levelErrors.value = {}
    if (!validate()) return
    const payload = {
        name: form.value.name.trim(),
        description: form.value.description?.trim() || null,
        base_currency: form.value.base_currency?.value || form.value.base_currency,
        payout_mode: form.value.payout_mode?.value || form.value.payout_mode || null,
        allow_future_date_claims: !!form.value.allow_future_date_claims,
        approval_required: !!form.value.approval_required,
        approval_mode: form.value.approval_required ? form.value.approval_mode : null,
        is_active: normalizeIsActive(form.value.is_active),
    }
    // Only send approval_levels when SAME_FOR_ALL with levels (prevents accidental clearing during BY_CATEGORY saves)
    if (form.value.approval_required && form.value.approval_mode === 'SAME_FOR_ALL') {
        payload.approval_levels = form.value.approval_levels.map((l, idx) => ({
            level: idx + 1,
            approver_type: l.approver_type,
            approver_id: l.approver_id,
            approver_name: l.approver_name || '',
            auto_approve: !!l.auto_approve,
            auto_approve_days: l.auto_approve ? Number(l.auto_approve_days) : null,
        }))
    }
    try {
        if (isEditing.value) await store.updatePolicy(editingId.value, payload)
        else await store.createPolicy(payload)
        formModal.value = false
    } catch {}
}

const toggleStatus = async (p) => { await store.updateStatus(p.id, !p.is_active) }
const confirmDelete = (p) => { deleteTarget.value = p; deleteModal.value = true; menuOpen.value = false }
const doDelete = async () => {
    if (!deleteTarget.value) return
    deleting.value = true
    try { await store.deletePolicy(deleteTarget.value.id); deleteModal.value = false } catch {} finally { deleting.value = false }
}

// Employee assignment functions
const filteredAssignEmployees = computed(() => {
    const q = assignSearch.value.trim().toLowerCase()
    const list = !q ? assignAllEmployees.value : assignAllEmployees.value.filter(e => {
        const name = (e.full_name || e.fullName || '').toLowerCase()
        const code = (e.employeeCode || '').toLowerCase()
        const email = (e.email || '').toLowerCase()
        return name.includes(q) || code.includes(q) || email.includes(q)
    })
    return list
})
const assignTotalPages = computed(() => Math.ceil(filteredAssignEmployees.value.length / assignLimit))
const paginatedAssignEmployees = computed(() => {
    const start = (assignPage.value - 1) * assignLimit
    return filteredAssignEmployees.value.slice(start, start + assignLimit)
})

async function openAssignEmployees() {
    if (!selected.value) return
    assignDrawer.value = true
    assignSearch.value = ''
    assignSelectedIds.value = []
    assignPage.value = 1
    await fetchAvailableEmployees()
}

async function fetchAvailableEmployees() {
    assignLoading.value = true
    try {
        const { $api } = useNuxtApp()
        const params = { organization_id: props.organizationId, limit: 200, is_active_only: 'true' }
        if (assignSearch.value) params.search = assignSearch.value
        const { data } = await $api.get('/employees/all', { params })
        const all = data?.employees || data?.data || []
        // Exclude already-assigned employees
        const assignedIds = new Set((store.policyEmployees || []).map(e => String(e.employee_id)))
        assignAllEmployees.value = all.filter(e => !assignedIds.has(String(e.id))).map(e => ({
            id: e.id,
            full_name: e.full_name || e.fullName || `${e.firstName || ''} ${e.lastName || ''}`.trim(),
            employeeCode: e.employeeCode || e.employee_code || '',
            email: e.email || '',
            department: e.department || e.department_name || '',
        }))
    } catch (e) {
        console.error('[assignEmployees] fetch error:', e)
        assignAllEmployees.value = []
    } finally {
        assignLoading.value = false
    }
}

function toggleAssignEmployee(id) {
    const strId = String(id)
    if (assignSelectedIds.value.includes(strId)) {
        assignSelectedIds.value = assignSelectedIds.value.filter(x => x !== strId)
    } else {
        assignSelectedIds.value = [...assignSelectedIds.value, strId]
    }
}

function toggleAllAssign() {
    const pageIds = paginatedAssignEmployees.value.map(e => String(e.id))
    const allSelected = pageIds.every(id => assignSelectedIds.value.includes(id))
    if (allSelected) {
        assignSelectedIds.value = assignSelectedIds.value.filter(id => !pageIds.includes(id))
    } else {
        const set = new Set(assignSelectedIds.value)
        pageIds.forEach(id => set.add(id))
        assignSelectedIds.value = [...set]
    }
}

function onAssignSearch() {
    assignPage.value = 1
}

function assignPagePrev() { if (assignPage.value > 1) assignPage.value-- }
function assignPageNext() { if (assignPage.value < assignTotalPages.value) assignPage.value++ }

async function doAssignEmployees() {
    if (!selected.value || !assignSelectedIds.value.length) return
    assignSaving.value = true
    try {
        await store.assignEmployees(selected.value.id, assignSelectedIds.value)
        assignDrawer.value = false
        assignSelectedIds.value = []
    } catch {} finally { assignSaving.value = false }
}

function confirmRemoveEmployee(emp) {
    removeTarget.value = emp
    removeModal.value = true
}

async function doRemoveEmployee() {
    if (!selected.value || !removeTarget.value) return
    removing.value = true
    try {
        await store.removePolicyEmployee(selected.value.id, removeTarget.value.employee_id)
        removeModal.value = false
        removeTarget.value = null
    } catch {} finally { removing.value = false }
}

let empSearchDebounce = null
function onEmpSearch() {
    clearTimeout(empSearchDebounce)
    empSearchDebounce = setTimeout(() => {
        if (selected.value) {
            store.fetchPolicyEmployees(selected.value.id, { search: empSearchQuery.value, page: 1 })
        }
    }, 300)
}

function empPagePrev() {
    if (selected.value && store.policyEmployeesPage > 1) {
        store.fetchPolicyEmployees(selected.value.id, { page: store.policyEmployeesPage - 1 })
    }
}

function empPageNext() {
    if (selected.value && store.policyEmployeesPage < store.policyEmployeesTotalPages) {
        store.fetchPolicyEmployees(selected.value.id, { page: store.policyEmployeesPage + 1 })
    }
}

watch(() => props.organizationId, (v) => { if (v) store.fetchPolicies(v) })
watch(selected, (p) => {
    detailTab.value = 'summary'
    if (p?.id) {
        store.fetchPolicyCategories(p.id)
        store.fetchPolicyEmployees(p.id)
    }
})
watch(() => store.selectedId, (id) => {
    detailTab.value = 'summary'
    if (id) {
        store.fetchPolicyCategories(id)
        store.fetchPolicyEmployees(id)
    }
})
onMounted(async () => {
    if (props.organizationId) {
        await store.fetchPolicies(props.organizationId)
        if (store.selectedPolicy?.id) {
            await store.fetchPolicyCategories(store.selectedPolicy.id)
            await store.fetchPolicyEmployees(store.selectedPolicy.id)
        }
    }
})
</script>

<style scoped>
.menu-item { @apply w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors; }
.menu-item-danger { @apply w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-red-400/90 hover:bg-red-500/20 hover:text-red-300 transition-colors; }
.skeleton { height: 0.875rem; border-radius: 9999px; background: linear-gradient(90deg, rgba(255,255,255,.12), rgba(255,255,255,.22), rgba(255,255,255,.12)); animation: shimmer 1.2s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
