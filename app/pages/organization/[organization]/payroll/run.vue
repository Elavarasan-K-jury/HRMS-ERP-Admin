<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-4 custom-scroll">
        <!-- 🏔️ Header Section -->
        <div
            class="rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center md:justify-between gap-6 relative overflow-hidden group">
            <div
                class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                <Icon name="ion:wallet-outline" class="text-8xl text-white" />
            </div>

            <div class="flex items-center gap-5 relative z-10">
                <div
                    class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#4aff7a] to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Icon name="ion:wallet" class="text-3xl text-black" />
                </div>
                <div>
                    <h1 class="text-3xl font-black tracking-tight text-white uppercase italic">
                        Payroll <span class="text-[#4aff7a]">Run</span>
                    </h1>
                    <p class="text-sm text-white/40 font-medium flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-[#4aff7a] animate-pulse"></span>
                        {{ month.label }} {{ year.value }} • Processing Active
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3 relative z-10">
                <UiButton color="#fff" text="Refresh Data" prepend-icon="ion:refresh" :loading="loading"
                    @click="fetchPayroll" class="!rounded-xl shadow-lg shadow-[#fff]/10" />
                <UiButton color="#4aff7a" text="Run Payroll" prepend-icon="ion:cash" @click="runPayroll"
                    :loading="loading" class="!rounded-xl shadow-lg shadow-[#4aff7a]/10" />
            </div>
        </div>

        <!-- 📊 Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(stat, idx) in statsCards" :key="idx"
                class="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#4aff7a]/30 transition-all duration-300 group backdrop-blur-md relative overflow-hidden">
                <div
                    class="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                    <Icon :name="stat.icon" class="text-8xl" />
                </div>
                <div class="flex items-center justify-between mb-3 relative z-10">
                    <div :class="stat.iconBg"
                        class="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:rotate-12">
                        <Icon :name="stat.icon" />
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-white/40">{{ stat.label }}</span>
                </div>
                <div class="flex flex-col relative z-10">
                    <span class="text-2xl font-black text-white tracking-tight">{{ stat.value }}</span>
                    <span class="text-xs text-white/30 mt-1 font-medium">{{ stat.subtext }}</span>
                </div>
            </div>
        </div>

        <!-- 🛠️ Controls & Tabs -->
        <div
            class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
            <div class="w-full lg:w-auto">
                <UiTabs v-model="activeTab" :tabs="tabs" color="#4aff7a" />
            </div>

            <div class="flex gap-4 items-center w-full lg:w-auto">
                <div class="flex-1 lg:w-[180px]">
                    <FormSelect placeholder="Month" fullWidth color="#fff" v-model="month" :options="monthOptions" />
                </div>
                <div class="flex-1 lg:w-[140px]">
                    <FormSelect placeholder="Year" fullWidth color="#fff" v-model="year" :options="yearOptions" />
                </div>
            </div>
        </div>

        <!-- 📑 Main Table Container -->
        <div
            class="flex-1 min-h-[500px] border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl relative flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
            <!-- Table Header Helper (Always visible) -->
            <div
                class="absolute top-0 left-0 z-[35] w-[300px] bg-white border-b border-r border-white/10 p-4 flex items-center h-[73px]">
                <div class="flex items-center gap-3 text-[#4aff7a] uppercase tracking-[0.2em] text-[15px] font-black">
                    <div class="w-1 h-4 bg-[#4aff7a] rounded-full"></div>
                    <span>Employee Roster</span>
                </div>
            </div>

            <div class="flex-1 overflow-auto custom-scroll relative">
                <table class="w-full border-separate border-spacing-0">
                    <thead class="sticky top-0 z-30">
                        <tr class="bg-white/10 backdrop-blur-2xl">
                            <th
                                class="sticky left-0 z-40 bg-white/10 border-b border-r border-white/10 p-4 text-left min-w-[300px] backdrop-blur-2xl h-[73px]">
                                <!-- Spacer for the helper div above -->
                            </th>

                            <!-- Attendance Headers -->
                            <template v-if="activeTab === 0">
                                <th v-for="day in daysInMonth" :key="day"
                                    class="border-b border-white/10 p-3 text-center min-w-[50px] transition-all duration-300 hover:bg-white/10 backdrop-blur-md"
                                    :class="isWeekend(day) ? 'bg-rose-500/15' : ''">
                                    <div class="text-[10px] text-white/40 uppercase font-black tracking-tighter">{{
                                        getDayName(day) }}
                                    </div>
                                    <div class="text-sm font-bold mt-0.5"
                                        :class="isWeekend(day) ? 'text-rose-400' : 'text-white'">{{ day }}</div>
                                </th>
                            </template>

                            <!-- Leaves Headers -->
                            <template v-else-if="activeTab === 1">
                                <th
                                    class="border-b border-white/10 p-5 text-left min-w-[200px] text-xs font-black uppercase tracking-widest text-white/40">
                                    Leave Category</th>
                                <th
                                    class="border-b border-white/10 p-5 text-center min-w-[120px] text-xs font-black uppercase tracking-widest text-white/40">
                                    Duration</th>
                                <th
                                    class="border-b border-white/10 p-5 text-left min-w-[400px] text-xs font-black uppercase tracking-widest text-white/40">
                                    Remarks & Timeline</th>
                            </template>

                            <!-- Expenses Headers -->
                            <template v-else-if="activeTab === 2">
                                <th
                                    class="border-b border-white/10 p-5 text-left min-w-[200px] text-xs font-black uppercase tracking-widest text-white/40">
                                    Expense Type</th>
                                <th
                                    class="border-b border-white/10 p-5 text-right min-w-[150px] text-xs font-black uppercase tracking-widest text-white/40">
                                    Claim Amount</th>
                                <th
                                    class="border-b border-white/10 p-5 text-left min-w-[300px] text-xs font-black uppercase tracking-widest text-white/40">
                                    Narrative</th>
                                <th
                                    class="border-b border-white/10 p-5 text-center min-w-[150px] text-xs font-black uppercase tracking-widest text-white/40">
                                    Authorization</th>
                            </template>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        <tr v-for="emp in payrollList" :key="emp.id"
                            class="group hover:bg-white/[0.08] transition-all duration-300">
                            <!-- Fixed Employee Column -->
                            <td
                                class="sticky w-[300px] !max-w-[300px] left-0 z-20 bg-white/5 backdrop-blur-2xl p-4 border-r border-white/10 transition-all group-hover:bg-white/10 group-hover:shadow-[20px_0_30px_-10px_rgba(0,0,0,0.3)]">
                                <div class="flex items-center gap-4">
                                    <div class="relative">
                                        <div
                                            class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-black text-lg text-white group-hover:scale-105 transition-transform">
                                            {{ getInitials(emp.full_name) }}
                                        </div>
                                        <div
                                            class="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md">
                                            <div
                                                class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="overflow-hidden">
                                        <div class="font-bold text-white text-base truncate">{{ emp.full_name }}</div>
                                        <div class="flex flex-col gap-0.5 mt-1">
                                            <div
                                                class="flex items-center gap-1.5 text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                                                <Icon name="ion:card-outline" />
                                                {{ emp.employee_code || 'EMP-???' }}
                                            </div>
                                            <div
                                                class="flex items-center gap-1.5 text-[11px] text-[#4aff7a]/70 truncate">
                                                <Icon name="ion:mail-outline" />
                                                {{ emp.email }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- Attendance Data Cells -->
                            <template v-if="activeTab === 0">
                                <td v-for="day in daysInMonth" :key="day"
                                    class="p-2 text-center border-r border-white/5 transition-colors group-hover:bg-white/[0.02] relative"
                                    :class="isWeekend(day) ? 'bg-rose-500/5' : ''">
                                    <div :class="getAttendanceClass(getCachedStatus(emp.id, day))"
                                        class="w-9 h-9 rounded-full mx-auto flex flex-col items-center justify-center text-[11px] font-black transition-all hover:scale-110 cursor-pointer shadow-sm relative group/att">
                                        {{ getStatusInitial(getCachedStatus(emp.id, day)) }}
                                        <button v-if="getCachedStatus(emp.id, day) != 'PRESENT'"
                                            @click.stop="openEditModal(emp, day)"
                                            class="absolute -top-1 -right-1 w-4 h-4 bg-[#4aff7a] rounded-full items-center justify-center hidden group-hover/att:flex shadow-lg shadow-[#4aff7a]/30 hover:scale-125 transition-all z-10"
                                            title="Edit Attendance">
                                            <Icon name="ion:pencil" class="text-[8px] text-black" />
                                        </button>
                                    </div>
                                </td>
                            </template>

                            <!-- Leaves Data Cells -->
                            <template v-else-if="activeTab === 1">
                                <td colspan="3" class="p-0">
                                    <div v-if="getLeaves(emp).length === 0" class="p-8 text-center">
                                        <Icon name="ion:leaf-outline" class="text-3xl text-white/10 mb-2" />
                                        <div class="text-xs text-white/20 italic font-medium">Clear Slate - No leaves
                                            recorded</div>
                                    </div>
                                    <table v-else
                                        class="w-full text-xs bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
                                        <tr v-for="(leave, idx) in getLeaves(emp)" :key="idx"
                                            :class="idx !== 0 ? 'border-t border-white/10' : ''"
                                            class="hover:bg-white/10 transition-colors">
                                            <td class="p-5 min-w-[200px]">
                                                <div class="flex items-center gap-2">
                                                    <div class="w-2 h-2 rounded-full bg-sky-400"></div>
                                                    <span class="font-bold text-white tracking-wide uppercase">{{
                                                        leave.type }}</span>
                                                </div>
                                            </td>
                                            <td class="p-5 min-w-[120px] text-center">
                                                <span
                                                    class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-black">{{
                                                        leave.days }} Days</span>
                                            </td>
                                            <td class="p-5 min-w-[400px]">
                                                <p class="text-white/50 leading-relaxed max-w-[350px]">{{
                                                    leave.description }}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </template>

                            <!-- Expenses Data Cells -->
                            <template v-else-if="activeTab === 2">
                                <td colspan="4" class="p-0">
                                    <div v-if="!emp.my_expenses || emp.my_expenses.length === 0"
                                        class="p-8 text-center">
                                        <Icon name="ion:cash-outline" class="text-3xl text-white/10 mb-2" />
                                        <div class="text-xs text-white/20 italic font-medium">No financial claims
                                            processed</div>
                                    </div>
                                    <table v-else class="w-full text-xs bg-white/5 backdrop-blur-sm overflow-hidden">
                                        <tr v-for="(expense, idx) in emp.my_expenses" :key="expense.id"
                                            :class="idx !== 0 ? 'border-t border-white/10' : ''"
                                            class="hover:bg-white/10 transition-colors">
                                            <td class="p-5 min-w-[200px]">
                                                <div class="flex items-center gap-3">
                                                    <div
                                                        class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                        <Icon :name="getExpenseIcon(expense.type)" />
                                                    </div>
                                                    <span class="font-bold text-white uppercase tracking-wider">{{
                                                        expense.type }}</span>
                                                </div>
                                            </td>
                                            <td class="p-5 min-w-[150px] text-right">
                                                <div class="text-base font-black text-emerald-400">₹{{
                                                    expense.amount.toLocaleString() }}</div>
                                            </td>
                                            <td class="p-5 min-w-[300px]">
                                                <p class="text-white/40 italic">{{ expense.description }}</p>
                                            </td>
                                            <td class="p-5 min-w-[150px] text-center">
                                                <div :class="getStatusBadgeClass(expense.status)"
                                                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-tighter shadow-sm">
                                                    <div class="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                    {{ expense.status }}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && payrollList.length === 0"
                class="flex flex-col items-center justify-center p-20 text-white/20 animate-in fade-in zoom-in duration-500">
                <div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Icon name="ion:document-text-outline" class="text-6xl opacity-30" />
                </div>
                <h3 class="text-xl font-black text-white/60 mb-2">No Records Found</h3>
                <p class="text-sm max-w-[300px] text-center font-medium">Adjust your filters or reload the page to see
                    payroll data
                    for the selected period.</p>
                <UiButton color="#4aff7a" text="Try Again" prepend-icon="ion:refresh" @click="fetchPayroll"
                    class="mt-8" />
            </div>

            <!-- Loading Overlay -->
            <transition name="fade">
                <div v-if="loading"
                    class="absolute inset-0 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <div class="relative">
                        <div
                            class="w-20 h-20 rounded-full border-2 border-[#4aff7a]/20 border-t-[#4aff7a] animate-spin">
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <Icon name="ion:wallet" class="text-2xl text-[#4aff7a] animate-pulse" />
                        </div>
                    </div>
                    <p class="mt-6 text-[#4aff7a] font-black uppercase tracking-[0.3em] text-xs animate-pulse">
                        Calculating
                        Payroll...</p>
                </div>
            </transition>
        </div>
    </div>

    <!-- Edit Attendance Sidebar Modal -->
    <UiSidebarModal v-model="sidebarOpen" :title="'Edit Attendance – ' + (selectedAttendance?.date || '')"
        width="500px">
        <template #default>
            <div class="space-y-5 p-1 text-white/90" v-if="selectedAttendance">
                <!-- Employee Info -->
                <section class="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-1">Employee</h3>
                            <p class="font-bold text-lg">{{ selectedAttendance.employee?.first_name }} {{
                                selectedAttendance.employee?.last_name }}</p>
                        </div>
                        <div class="text-right">
                            <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-1">Date</h3>
                            <p class="font-mono text-sm text-white/70">{{ selectedAttendance.date }}</p>
                        </div>
                    </div>
                </section>

                <!-- Status Selection -->
                <section>
                    <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Status</h3>
                    <div class="grid grid-cols-3 gap-2">
                        <button v-for="status in attendanceStatusOptions" :key="status.value"
                            @click="selectedAttendance.status = status.value"
                            :class="selectedAttendance.status === status.value ? 'ring-2 ring-[#4aff7a] bg-[#4aff7a]/10' : ''"
                            class="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-center">
                            <span class="block text-xs font-bold">{{ status.label }}</span>
                        </button>
                    </div>
                </section>

                <!-- Work Mode -->
                <section>
                    <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Work Mode</h3>
                    <div class="flex gap-2">
                        <button v-for="mode in workModeOptions" :key="mode.value"
                            @click="selectedAttendance.mode = mode.value"
                            :class="selectedAttendance.mode === mode.value ? 'ring-2 ring-[#4aff7a] bg-[#4aff7a]/10' : ''"
                            class="flex-1 p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-center text-xs font-bold">
                            {{ mode.label }}
                        </button>
                    </div>
                </section>

                <!-- Check In / Check Out -->
                <section class="grid grid-cols-2 gap-3">
                    <div>
                        <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Check In</h3>
                        <FormInput v-model="selectedAttendance.check_in" type="time" placeholder="00:00" color="#fff" />
                    </div>
                    <div>
                        <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Check Out</h3>
                        <FormInput v-model="selectedAttendance.check_out" type="time" placeholder="00:00"
                            color="#fff" />
                    </div>
                </section>

                <!-- Hours -->
                <section class="grid grid-cols-2 gap-3">
                    <div>
                        <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Gross Hours</h3>
                        <FormInput v-model.number="selectedAttendance.gross_hours" type="number" step="0.1"
                            placeholder="0.0" color="#fff" />
                    </div>
                    <div>
                        <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Effective Hours</h3>
                        <FormInput v-model.number="selectedAttendance.effective_hours" type="number" step="0.1"
                            placeholder="0.0" color="#fff" />
                    </div>
                </section>

                <!-- Late Arrival -->
                <section>
                    <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Late Arrival (minutes)</h3>
                    <FormInput v-model.number="selectedAttendance.late_arrival_minutes" type="number" placeholder="0"
                        color="#fff" />
                </section>

                <!-- Is Holiday & Notes -->
                <section class="grid grid-cols-2 gap-3">
                    <div class="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                        <UiSwitch color="#fff" v-model="selectedAttendance.is_holiday" />
                        <span class="text-xs font-bold">Is Holiday</span>
                    </div>
                    <div>
                        <h3 class="text-[10px] uppercase tracking-wide text-white/40 mb-2">Notes</h3>
                        <FormInput v-model="selectedAttendance.notes" placeholder="Optional notes..." color="#fff" />
                    </div>
                </section>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end gap-3">
                <UiButton color="#fff" text="Cancel" @click="sidebarOpen = false" />
                <UiButton color="#4aff7a" text="Save Changes" prepend-icon="ion:checkmark" @click="saveAttendance"
                    :loading="savingAttendance" />
            </div>
        </template>
    </UiSidebarModal>

    <!-- Full Screen Payroll Calculation Modal -->
    <Teleport to="body">
        <div v-if="payrollModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="payrollModalOpen = false"></div>

            <!-- Modal Content -->
            <div
                class="relative w-[95vw] h-[95vh] bg-white/10 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#4aff7a] to-emerald-600 flex items-center justify-center">
                            <Icon name="ion:cash" class="text-2xl text-black" />
                        </div>
                        <div>
                            <h2 class="text-2xl font-black text-white uppercase">Payroll Calculation</h2>
                            <p class="text-sm text-white/50">{{ month.label }} {{ year.value }}</p>
                        </div>
                    </div>
                    <button @click="payrollModalOpen = false"
                        class="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <Icon name="ion:close" class="text-2xl text-white/70" />
                    </button>
                </div>

                <!-- Body -->
                <div class="flex-1 overflow-y-auto p-6 custom-scroll">
                    <div v-if="runPayrollList.length === 0" class="text-center py-20">
                        <Icon name="ion:document-text-outline" class="text-6xl text-white/20 mb-4" />
                        <p class="text-white/50 text-lg">No payroll data available</p>
                        <p class="text-white/30 text-sm">Click "Run Payroll" to calculate</p>
                    </div>

                    <div v-else class="space-y-6">
                        <div v-for="emp in runPayrollList" :key="emp.id"
                            class="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <!-- Employee Header -->
                            <div class="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {{ emp.full_name?.charAt(0) || emp.employee_code?.charAt(0) || '?' }}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-white">{{ emp.full_name || emp.employee_name ||
                                            'Unknown'
                                            }}</h3>
                                        <p class="text-xs text-white/50">{{ emp.employee_code || emp.id }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-black text-[#4aff7a]">₹{{ formatCurrency(emp.net_pay || 0)
                                        }}
                                    </p>
                                    <p class="text-xs text-white/50">Net Pay</p>
                                </div>
                            </div>

                            <!-- Content Grid -->
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                                <!-- Attendance -->
                                <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 class="text-[10px] uppercase tracking-wide text-white/40 mb-3">Attendance</h4>
                                    <div class="space-y-2 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Total Days</span>
                                            <span class="text-white font-bold">{{ emp.attendance?.total_days || 0
                                                }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Present</span>
                                            <span class="text-emerald-400 font-bold">{{ emp.attendance?.present_days ||
                                                0
                                                }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Absent</span>
                                            <span class="text-rose-400 font-bold">{{ emp.attendance?.absent_days || 0
                                                }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Effective Hours</span>
                                            <span class="text-white font-bold">{{ emp.attendance?.effective_hours || 0
                                                }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Salary Components -->
                                <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 class="text-[10px] uppercase tracking-wide text-white/40 mb-3">Salary</h4>
                                    <div class="space-y-2 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Gross</span>
                                            <span class="text-white font-bold">₹{{ formatCurrency(emp.gross_monthly ||
                                                0)
                                                }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Earnings</span>
                                            <span class="text-emerald-400 font-bold">₹{{
                                                formatCurrency(emp.total_earnings
                                                    || 0) }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Deductions</span>
                                            <span class="text-rose-400 font-bold">₹{{
                                                formatCurrency(emp.total_deductions ||
                                                    0) }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Benefits</span>
                                            <span class="text-sky-400 font-bold">₹{{ formatCurrency(emp.total_benefits
                                                || 0)
                                                }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Net Salary</span>
                                            <span class="text-sky-400 font-bold">₹{{ formatCurrency((emp.total_earnings
                                                -
                                                emp.total_deductions)
                                                || 0)
                                                }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Leave -->
                                <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 class="text-[10px] uppercase tracking-wide text-white/40 mb-3">Leaves</h4>
                                    <div class="space-y-2 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Total Days</span>
                                            <span class="text-white font-bold">{{ emp.leave?.total_leave_days || 0
                                                }}</span>
                                        </div>
                                        <div v-if="emp.leave?.leaves?.length">
                                            <div v-for="leave in emp.leave.leaves" :key="leave.leave_type"
                                                class="flex justify-between">
                                                <span class="text-white/60 text-xs">{{ leave.leave_type }}</span>
                                                <span class="text-white font-bold text-xs">{{ leave.days }}</span>
                                            </div>
                                        </div>
                                        <div v-else class="text-white/30 text-xs italic">No leaves</div>
                                    </div>
                                </div>

                                <!-- Expenses -->
                                <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <h4 class="text-[10px] uppercase tracking-wide text-white/40 mb-3">Expenses</h4>
                                    <div class="space-y-2 text-sm">
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Claimed</span>
                                            <span class="text-white font-bold">₹{{
                                                formatCurrency(emp.expenses?.total_claimed || 0) }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Approved</span>
                                            <span class="text-emerald-400 font-bold">₹{{
                                                formatCurrency(emp.expenses?.total_approved || 0) }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-white/60">Reimbursement</span>
                                            <span class="text-sky-400 font-bold">₹{{
                                                formatCurrency(emp.expense_reimbursement || 0) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Salary Components Detail -->
                            <div v-if="emp.salary_components?.length" class="p-4 border-t border-white/10">
                                <h4 class="text-[10px] uppercase tracking-wide text-white/40 mb-3">Salary Components
                                </h4>
                                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    <div v-for="comp in emp.salary_components" :key="comp.component_key"
                                        class="bg-white/5 rounded-lg p-2 border border-white/10">
                                        <p class="text-xs text-white/60 truncate">{{ comp.component_name }}</p>
                                        <p class="text-sm font-bold"
                                            :class="comp.component_type === 'EARNING' ? 'text-emerald-400' : comp.component_type === 'DEDUCTION' ? 'text-rose-400' : 'text-sky-400'">
                                            ₹{{ formatCurrency(comp.monthly_amount || 0) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                    <div class="text-sm text-white/50">
                        Showing {{ runPayrollList.length }} employees
                    </div>
                    <div class="flex gap-3">
                        <UiButton color="#fff" text="Close" @click="payrollModalOpen = false" />
                        <UiButton color="#4aff7a" text="Export Report" prepend-icon="ion:download" />
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { usePayrollStore } from '../../../../stores/organization/payroll.store';
import { useAuthStore } from '../../../../stores/shared/auth.store';
import { storeToRefs } from 'pinia';

definePageMeta({
    layout: 'organization',
});

const payroll = usePayrollStore()
const auth = useAuthStore()
const toast = useToast()
const {
    year,
    month,
    monthOptions,
    loading
} = storeToRefs(payroll)

const activeTab = ref(0)
const tabs = [
    { label: 'Attendance & Regularisation', icon: 'ion:calendar-outline' },
    { label: 'Leaves', icon: 'ion:leaf-outline' },
    { label: 'Expenses', icon: 'ion:cash-outline' },
]

const sidebarOpen = ref(false)
const selectedAttendance = ref(null)

const attendanceStatusOptions = [
    { value: 'PRESENT', label: 'Present', initial: 'P' },
    { value: 'ABSENT', label: 'Absent', initial: 'A' },
    { value: 'HALF_DAY', label: 'Half Day', initial: 'HD' },
    { value: 'HOLIDAY', label: 'Holiday', initial: 'H' },
    { value: 'LATE', label: 'Late', initial: 'L' },
    { value: 'PENDING', label: 'Pending', initial: 'PND' },
]

const workModeOptions = [
    { value: 'OFFICE', label: 'Office' },
    { value: 'REMOTE', label: 'Remote' },
    { value: 'HYBRID', label: 'Hybrid' },
]

const savingAttendance = ref(false)
const payrollModalOpen = ref(false)

const openEditModal = (emp, day) => {
    const y = year.value.value
    const m = month.value.value
    const record = emp.attendance?.find(a => {
        const d = new Date(a.day)
        return d.getDate() === day && (d.getMonth() + 1) === m && d.getFullYear() === y
    })

    const date = new Date(y, m - 1, day)
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })

    selectedAttendance.value = {
        employee: emp,
        day: day,
        date: formattedDate,
        status: record?.status || 'PRESENT',
        check_in: record?.check_in || '',
        check_out: record?.check_out || '',
        gross_hours: record?.gross_hours || null,
        effective_hours: record?.effective_hours || null,
        late_arrival_minutes: record?.late_arrival_minutes || null,
        mode: record?.mode || 'OFFICE',
        is_holiday: record?.is_holiday || false,
        notes: record?.notes || '',
        location: record?.location || null,
        record: record
    }
    sidebarOpen.value = true
}

const updateStatus = (newStatus) => {
    if (selectedAttendance.value) {
        selectedAttendance.value.status = newStatus
    }
}

const saveAttendance = async () => {
    if (!selectedAttendance.value) return

    const { employee, day, status, check_in, check_out, gross_hours, effective_hours, late_arrival_minutes, mode, is_holiday, notes, location } = selectedAttendance.value
    const y = year.value.value
    const m = month.value.value

    const formattedDate = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const payload = {
        organization_id: auth.organization,
        employee_id: employee.id,
        date: formattedDate,
        status: status,
    }

    if (check_in) payload.check_in = check_in
    if (check_out) payload.check_out = check_out
    if (gross_hours) payload.gross_hours = gross_hours
    if (effective_hours) payload.effective_hours = effective_hours
    if (late_arrival_minutes) payload.late_arrival_minutes = late_arrival_minutes
    if (mode) payload.mode = mode
    if (is_holiday) payload.is_holiday = is_holiday
    if (notes) payload.notes = notes
    if (location) payload.location = location

    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.post('/attendance', payload)

        if (data.success) {
            toast.success({ title: 'Success', message: data.message || 'Attendance updated successfully' })

            const empIndex = payrollList.value.findIndex(e => e.id === employee.id)
            if (empIndex !== -1) {
                const attIndex = payrollList.value[empIndex].attendance?.findIndex(a => {
                    const d = new Date(a.day)
                    return d.getDate() === day && (d.getMonth() + 1) === m && d.getFullYear() === y
                })

                if (attIndex !== -1) {
                    payrollList.value[empIndex].attendance[attIndex] = {
                        ...payrollList.value[empIndex].attendance[attIndex],
                        status,
                        check_in,
                        check_out,
                        gross_hours,
                        effective_hours,
                        late_arrival_minutes,
                        mode,
                        is_holiday,
                        notes
                    }
                } else {
                    payrollList.value[empIndex].attendance.push({
                        day: formattedDate,
                        status,
                        check_in,
                        check_out,
                        gross_hours,
                        effective_hours,
                        late_arrival_minutes,
                        mode,
                        is_holiday,
                        notes
                    })
                }
            }

            sidebarOpen.value = false
        } else {
            toast.error({ title: 'Error', message: data.message || 'Failed to update attendance' })
        }
    } catch (error) {
        console.error('Attendance API Error:', error)
        toast.error({ title: 'Error', message: error.response?.data?.message || 'Failed to update attendance' })
    }
}

const yearOptions = computed(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    const startYear = 2024;
    for (let i = startYear; i <= currentYear + 1; i++) {
        years.push({
            value: i,
            label: i
        });
    }
    return years;
})

const daysInMonth = computed(() => {
    const y = year.value.value;
    const m = month.value.value;
    return new Date(y, m, 0).getDate();
});

const payrollList = computed(() => payroll.payrollList)
const runPayrollList = computed(() => payroll.runPayrollList)

const attendanceCache = computed(() => {
    const y = year.value.value
    const m = month.value.value
    const cache = new Map()

    payrollList.value.forEach(emp => {
        if (!emp.attendance) return
        emp.attendance.forEach(a => {
            const d = new Date(a.day)
            if (d.getFullYear() === y && (d.getMonth() + 1) === m) {
                const key = `${emp.id}-${d.getDate()}`
                cache.set(key, a.status)
            }
        })
    })
    return cache
})

const getCachedStatus = (empId, day) => {
    return attendanceCache.value.get(`${empId}-${day}`) || 'N/A'
}

const fetchPayroll = async () => {
    await payroll.fetchSystemCalculatedPayroll()
}

const runPayroll = async () => {
    const result = await payroll.calculatePayroll()
    if (result.success) {
        payrollModalOpen.value = true
    }
}

// Computed Stats for UI
const statsCards = computed(() => {
    const list = payrollList.value || []
    const totalEmployees = list.length

    let totalExpenses = 0
    let totalAttendance = 0
    let totalWorkingSlots = 0

    list.forEach(emp => {
        if (emp.my_expenses) {
            totalExpenses += emp.my_expenses.filter(ex => ex.status === 'APPROVED').reduce((sum, ex) => sum + ex.amount, 0)
        }
        if (emp.attendance) {
            totalAttendance += emp.attendance.filter(a => a.status === 'PRESENT').length
            totalWorkingSlots += emp.attendance.length
        }
    })

    const attendanceRate = totalWorkingSlots > 0 ? Math.round((totalAttendance / totalWorkingSlots) * 100) : 0

    return [
        {
            label: 'Total Employees',
            value: totalEmployees,
            subtext: 'Active workforce',
            icon: 'ion:people',
            iconBg: 'bg-indigo-500/20 text-indigo-400'
        },
        {
            label: 'Attendance Rate',
            value: `${attendanceRate}%`,
            subtext: 'Avg monthly presence',
            icon: 'ion:stats-chart',
            iconBg: 'bg-blue-500/20 text-blue-400'
        },
        {
            label: 'Approved Claims',
            value: `₹${totalExpenses.toLocaleString()}`,
            subtext: 'To be reimbursed',
            icon: 'ion:cash',
            iconBg: 'bg-emerald-500/20 text-emerald-400'
        },
        {
            label: 'Pending Reviews',
            value: list.reduce((count, emp) => count + (emp.my_expenses?.filter(ex => ex.status === 'PENDING').length || 0), 0),
            subtext: 'Expenses to approve',
            icon: 'ion:time-outline',
            iconBg: 'bg-amber-500/20 text-amber-400'
        }
    ]
})

onMounted(async () => {
    await fetchPayroll()
});

watch([() => year.value.value, () => month.value.value], async () => {
    await fetchPayroll()
})

// Helper Functions
const getInitials = (name) => {
    if (!name) return '??'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

const getDayName = (day) => {
    const y = year.value.value;
    const m = month.value.value;
    const date = new Date(y, m - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

const isWeekend = (day) => {
    const y = year.value.value;
    const m = month.value.value;
    const date = new Date(y, m - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
}

const getAttendanceStatus = (emp, day) => {
    if (!emp.attendance) return 'N/A';
    const y = year.value.value;
    const m = month.value.value;
    const record = emp.attendance.find(a => {
        const d = new Date(a.day);
        return d.getDate() === day && (d.getMonth() + 1) === m && d.getFullYear() === y;
    });
    return record ? record.status : 'N/A';
}

const getStatusInitial = (status) => {
    switch (status) {
        case 'PRESENT': return 'P';
        case 'ABSENT': return 'A';
        case 'HALF_DAY': return 'HD';
        case 'LATE': return 'L';
        case 'LEAVE': return 'LV';
        case 'HOLIDAY': return 'H';
        case 'WEEKOFF': return 'W';
        default: return '—';
    }
}

const getAttendanceClass = (status) => {
    switch (status) {
        case 'PRESENT': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5';
        case 'ABSENT': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
        case 'HALF_DAY': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
        case 'LATE': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
        case 'LEAVE': return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
        case 'HOLIDAY': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
        case 'WEEKOFF': return 'bg-white/5 text-white/40 border border-white/10';
        default: return 'bg-white/5 text-white/20 border border-white/5';
    }
}

// const getAttendanceTooltip = (emp, day) => {
//     const status = getAttendanceStatus(emp, day);
//     return `${day} ${month.value.label}: ${status}`;
// }

const getLeaves = (emp) => {
    if (!emp.attendance) return [];
    const leaveDays = emp.attendance.filter(a => a.status === 'LEAVE');
    if (leaveDays.length > 0) {
        return [{
            type: 'Annual Leave',
            days: leaveDays.length,
            description: `Planned time off taken across ${leaveDays.length} working days this month.`
        }];
    }
    return [];
}

const getExpenseIcon = (type) => {
    switch (type) {
        case 'TRAVEL': return 'ion:airplane-outline';
        case 'FOOD': return 'ion:fast-food-outline';
        case 'ACCOMMODATION': return 'ion:bed-outline';
        case 'STATIONERY': return 'ion:pencil-outline';
        default: return 'ion:receipt-outline';
    }
}

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'APPROVED': return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
        case 'PENDING': return 'border-amber-500/40 bg-amber-500/10 text-amber-400';
        case 'REJECTED': return 'border-rose-500/40 bg-rose-500/10 text-rose-400';
        default: return 'border-white/20 bg-white/5 text-white/60';
    }
}

const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '0'
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
};
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 99px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Glass table fix */
th,
td {
    background-clip: padding-box;
}

/* Force shadow on sticky column */
.shadow-2xl {
    box-shadow: 10px 0 30px -10px rgba(0, 0, 0, 0.5);
}
</style>