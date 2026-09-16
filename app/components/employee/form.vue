<template>
    <div class="w-full h-full flex items-center justify-center" v-if="loader">
        <Loader />
    </div>
    <div v-else class="grid grid-cols-12 gap-2">
        <span class="col-span-12 grid grid-cols-12 items-center gap-2 pb-2 border-b border-white/10">
            <span class="col-span-8 flex items-center gap-2 text-lg font-semibold text-white/85">
                <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/25">
                    <Icon name="lucide:id-card" class="w-4 h-4 text-blue-400" />
                </span>
                Employee Details
            </span>
            <FormSelect v-model="type" placeholder="Select type" :options="['EMPLOYEE', 'ADMIN']" class="col-span-4"
                color="#fff" />
        </span>
        <!-- 📷 Profile Photo -->
        <div class="col-span-12 flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div class="relative shrink-0 group">
                <img v-if="photoPreview" :src="photoPreview" alt="profile"
                    class="h-16 w-16 rounded-full object-cover border-2 border-white/20" />
                <div v-else
                    class="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500/30 to-slate-700/40 border border-emerald-300/20 flex items-center justify-center">
                    <Icon name="ion:person" class="text-2xl text-emerald-200/80" />
                </div>
                <label class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    :title="photoUploading ? 'Uploading…' : 'Upload profile photo'">
                    <Icon v-if="photoUploading" name="ion:sync" class="h-5 w-5 text-white animate-spin" />
                    <Icon v-else name="ion:camera" class="h-5 w-5 text-white" />
                    <input type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
                </label>
            </div>
            <div class="min-w-0">
                <p class="text-sm font-medium text-white/85">Profile Photo</p>
                <p class="text-xs text-white/50">Click the camera to upload or replace the employee's photo.</p>
            </div>
            <button v-if="profile_image_file_id || profile_image || localPhotoPreview" @click="removePhoto"
                class="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-400 cursor-pointer rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-1.5 hover:bg-red-400/20 transition-all">
                <Icon name="ion:trash-outline" class="w-3.5 h-3.5" /> Remove
            </button>
        </div>
        <!-- 🧑 Basic Information -->
        <span class="col-span-12 mt-3 flex items-center gap-2 pb-1 border-b border-white/10">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/25">
                <Icon name="lucide:user-round" class="w-4 h-4 text-blue-400" />
            </span>
            <h3 class="text-lg font-semibold text-white/85">Basic Information</h3>
        </span>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                First Name:
            </p>
            <FormInput v-model="first_name" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md" rounded="lg"
                placeholder="First Name" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Last Name:
            </p>
            <FormInput v-model="last_name" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md" rounded="lg"
                placeholder="Last Name" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Display Name:
            </p>
            <FormInput v-model="display_name" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md"
                rounded="lg" placeholder="Preferred name to display" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Full Name:
            </p>
            <FormInput :model-value="fullNamePreview" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md"
                rounded="lg" placeholder="Auto-generated from first + last name" disabled readonly />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Gender:
            </p>
            <FormSelect id="gender" class="w-full" color="#fff" prepend-icon="bx:bx-user" v-model="gender"
                :options="['MALE', 'FEMALE', 'OTHER']" searchable size="md" rounded="lg" placeholder="Gender" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Date of Birth:
            </p>
            <FormInput v-model="dateOfBirth" type="date" class="w-full" prepend-icon="bx:bx-calendar" color="#fff"
                size="md" rounded="lg" placeholder="Date of Birth" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Marital Status:
            </p>
            <FormSelect v-model="marital_status" class="w-full" color="#fff" prepend-icon="lucide:rings"
                :options="['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']" searchable size="md" rounded="lg"
                placeholder="Marital Status" clearable />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Blood Group:
            </p>
            <FormSelect v-model="blood_group" class="w-full" color="#fff" prepend-icon="lucide:droplets"
                :options="['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']" searchable size="md" rounded="lg"
                placeholder="Blood Group" clearable />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Nationality:
            </p>
            <FormInput v-model="nationality" class="w-full" prepend-icon="lucide:globe" color="#fff" size="md"
                rounded="lg" placeholder="Nationality" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Physically Handicapped:
            </p>
            <div
                class="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span class="text-sm text-white/80">Has a physical disability</span>
                <UiSwitch v-model="physically_handicapped" color="#4aff7a" size="md" />
            </div>
        </div>

        <!-- 📞 Contact Information -->
        <span class="col-span-12 mt-3 flex items-center gap-2 pb-1 border-b border-white/10">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/25">
                <Icon name="lucide:phone" class="w-4 h-4 text-blue-400" />
            </span>
            <h3 class="text-lg font-semibold text-white/85">Contact Information</h3>
        </span>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Work Email (Login):
            </p>
            <FormInput v-model="email" class="w-full" prepend-icon="heroicons:envelope" color="#fff" size="md"
                rounded="lg" placeholder="Work Email (Login)" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Personal Email:
            </p>
            <FormInput v-model="personal_email" class="w-full" prepend-icon="heroicons:envelope-open" color="#fff"
                size="md" rounded="lg" placeholder="Personal Email" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Personal Number (Login):
            </p>
            <FormInput v-model="phone" class="w-full" prepend-icon="heroicons:phone" color="#fff" size="md"
                rounded="lg" placeholder="Personal Number (Login)" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Work Number:
            </p>
            <FormInput v-model="alt_phone" class="w-full" prepend-icon="heroicons:phone" color="#fff" size="md"
                rounded="lg" placeholder="Work Number" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Joining Date:
            </p>
            <FormInput v-model="joining_date" type="date" class="w-full" prepend-icon="bx:bx-calendar" color="#fff"
                size="md" rounded="lg" placeholder="Joining Date" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80">Employee Number Series:</p>
            <FormSelect v-model="number_series_id" :options="numberSeriesOptions" searchable size="md" rounded="lg"
                color="#fff" prepend-icon="ion:key-outline" placeholder="Use default category number" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80">Employee Number:</p>
            <FormInput v-model="employee_code" class="w-full" prepend-icon="ion:keypad-outline"
                placeholder="Auto-generated from series" color="#fff" size="md" rounded="lg"
                disabled readonly />
            <p v-if="seriesPreviewHelper" class="mt-1 text-xs text-white/55">Next from series: <span class="font-mono text-emerald-300">{{ seriesPreviewHelper }}</span></p>
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Employee Category:
            </p>
            <FormSelect id="emp_category" class="w-full" color="#fff" prepend-icon="bx:bx-buildings"
                v-model="employee_category" :options="empCategories" searchable size="md" rounded="lg"
                placeholder="Employee Category" />
        </div>
        <div v-if="showProbationField" class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Policy:
            </p>
            <FormSelect id="probation_policy" class="w-full" color="#fff" prepend-icon="lucide:clock"
                v-model="probation_policy_id" :options="probationPolicyOptions" searchable size="md" rounded="lg"
                placeholder="Auto from category / no policy" clearable />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Designation:
            </p>
            <FormSelect id="designation" class="w-full" color="#fff" prepend-icon="bx:bx-buildings"
                v-model="employee_designation" :options="designations" searchable size="md" rounded="lg"
                placeholder="Designation" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Reporting Manager:
            </p>
            <FormSelect id="manager_id" class="w-full" color="#fff" prepend-icon="lucide:user-plus"
                v-model="manager_id" :options="managerOptions" searchable size="md" rounded="lg"
                placeholder="Select Reporting Manager" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Department Name">
                Branch:
            </p>
            <FormSelect id="branch_id" class="w-full" color="#fff" prepend-icon="lucide:building-2"
                v-model="branch_id" :options="branchOptions" searchable size="md" rounded="lg"
                placeholder="Select Branch" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Location">
                Location:
            </p>
            <FormSelect id="location_id" class="w-full" color="#fff" prepend-icon="ion:location-outline"
                v-model="location_id" :options="locationOptions" searchable size="md" rounded="lg"
                placeholder="Select Location" />
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Pay Grade">
                Pay Grade:
            </p>
            <FormSelect id="pay_grade" class="w-full" color="#fff" prepend-icon="heroicons:currency-dollar"
                v-model="pay_grade_id" :options="payGradeOptions" searchable size="md" rounded="lg"
                placeholder="Select Pay Grade" clearable />
            <p v-if="selectedPayGradeDescription" class="mt-1.5 w-full rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200/90 leading-relaxed">
                <Icon name="lucide:info" class="w-3.5 h-3.5 inline-block -mt-0.5 mr-1" />
                {{ selectedPayGradeDescription }}
            </p>
        </div>
        <div class="col-span-6 w-full flex flex-col items-start">
            <p class="text-md text-white/80">
                Notice Period Policy:
            </p>
            <FormSelect id="notice_period_policy" class="w-full" color="#fff" prepend-icon="lucide:clock"
                v-model="notice_period_policy_id" :options="noticePeriodPolicyOptions" searchable size="md" rounded="lg"
                placeholder="Select Notice Period Policy" clearable />
            <p v-if="noticePeriodPolicyLoading" class="mt-1 text-xs text-white/45">
                <Icon name="lucide:loader-2" class="w-3 h-3 inline animate-spin mr-1" /> Loading policies...
            </p>
            <p v-else-if="noticePeriodPolicyOptions.length === 0 && !notice_period_policy_id" class="mt-1 text-xs text-white/45">
                No notice period policies available for this organization
            </p>
        </div>
        <!-- 🏠 Address Information -->
        <span class="col-span-12 mt-3 flex items-center gap-2 pb-1 border-b border-white/10">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/25">
                <Icon name="lucide:home" class="w-4 h-4 text-blue-400" />
            </span>
            <h3 class="text-lg font-semibold text-white/85">Address Information</h3>
        </span>

        <!-- Current Address -->
        <div class="col-span-12 md:col-span-6">
            <div
                class="grid rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent p-4 grid-cols-12 gap-3 backdrop-blur-xl shadow-lg">
                <div class="col-span-12 flex items-center justify-between pb-1">
                    <h4 class="text-sm font-semibold text-white/85">Current Address</h4>
                </div>
                <div class="col-span-12 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Address Line 1:</p>
                    <FormInput v-model="current_address.address_line1" class="w-full" prepend-icon="lucide:home"
                        color="#fff" size="sm" rounded="lg" placeholder="House no., street, area" />
                </div>
                <div class="col-span-12 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Address Line 2:</p>
                    <FormInput v-model="current_address.address_line2" class="w-full" prepend-icon="lucide:home"
                        color="#fff" size="sm" rounded="lg" placeholder="Apartment, landmark" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">City:</p>
                    <FormInput v-model="current_address.city" class="w-full" prepend-icon="lucide:building-2"
                        color="#fff" size="sm" rounded="lg" placeholder="City" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">State:</p>
                    <FormInput v-model="current_address.state" class="w-full" prepend-icon="lucide:map"
                        color="#fff" size="sm" rounded="lg" placeholder="State" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Country:</p>
                    <FormInput v-model="current_address.country" class="w-full" prepend-icon="lucide:globe"
                        color="#fff" size="sm" rounded="lg" placeholder="Country" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Postal Code:</p>
                    <FormInput v-model="current_address.postal_code" class="w-full" prepend-icon="lucide:hash"
                        color="#fff" size="sm" rounded="lg" placeholder="Postal Code" />
                </div>
            </div>
        </div>

        <!-- Permanent Address -->
        <div class="col-span-12 md:col-span-6">
            <div
                class="grid rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent p-4 grid-cols-12 gap-3 backdrop-blur-xl shadow-lg">
                <div class="col-span-12 flex items-center justify-between pb-1">
                    <h4 class="text-sm font-semibold text-white/85">Permanent Address</h4>
                    <label class="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                        <UiSwitch v-model="same_as_current_address" color="#4aff7a" size="sm" />
                        Same as Current Address
                    </label>
                </div>
                <div class="col-span-12 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Address Line 1:</p>
                    <FormInput v-model="permanent_address.address_line1" class="w-full" prepend-icon="lucide:home"
                        color="#fff" size="sm" rounded="lg" placeholder="House no., street, area" />
                </div>
                <div class="col-span-12 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Address Line 2:</p>
                    <FormInput v-model="permanent_address.address_line2" class="w-full" prepend-icon="lucide:home"
                        color="#fff" size="sm" rounded="lg" placeholder="Apartment, landmark" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">City:</p>
                    <FormInput v-model="permanent_address.city" class="w-full" prepend-icon="lucide:building-2"
                        color="#fff" size="sm" rounded="lg" placeholder="City" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">State:</p>
                    <FormInput v-model="permanent_address.state" class="w-full" prepend-icon="lucide:map"
                        color="#fff" size="sm" rounded="lg" placeholder="State" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Country:</p>
                    <FormInput v-model="permanent_address.country" class="w-full" prepend-icon="lucide:globe"
                        color="#fff" size="sm" rounded="lg" placeholder="Country" />
                </div>
                <div class="col-span-6 w-full flex flex-col items-start">
                    <p class="text-md text-white/80">Postal Code:</p>
                    <FormInput v-model="permanent_address.postal_code" class="w-full" prepend-icon="lucide:hash"
                        color="#fff" size="sm" rounded="lg" placeholder="Postal Code" />
                </div>
            </div>
        </div>

        <!-- 📝 Professional Information -->
        <span class="col-span-12 mt-3 flex items-center gap-2 pb-1 border-b border-white/10">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/25">
                <Icon name="lucide:align-left" class="w-4 h-4 text-blue-400" />
            </span>
            <h3 class="text-lg font-semibold text-white/85">Professional Information</h3>
        </span>
        <div class="col-span-12 w-full flex flex-col items-start">
            <p class="text-md text-white/80" for="Professional Summary">
                Professional Summary:
            </p>
            <InputArea v-model="professional_summary" color="#fff" placeholder="Brief summary of the employee's professional background..."
                rows="4" />
        </div>

        <!-- 🪪 Employment Status -->
        <div class="col-span-12 mt-2">
            <div
                class="relative grid grid-cols-12 gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent p-4 backdrop-blur-xl shadow-lg">
                <div class="col-span-12 flex items-center gap-2 pb-1">
                    <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/25">
                        <Icon name="lucide:badge-check" class="w-4 h-4 text-emerald-400" />
                    </span>
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-white/80">Employment Status</h3>
                </div>
                <div
                    class="col-span-12 sm:col-span-6 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-all duration-300"
                    :class="is_active ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-red-400/25 bg-red-400/5'">
                    <div class="flex items-center gap-3">
                        <span class="flex items-center justify-center w-10 h-10 rounded-full"
                            :class="is_active ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'">
                            <Icon :name="is_active ? 'lucide:activity' : 'lucide:pause-circle'" class="w-5 h-5" />
                        </span>
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-white/90">Active Status</span>
                            <span class="text-xs" :class="is_active ? 'text-emerald-300' : 'text-red-300'">
                                {{ is_active ? 'Employee is active in the organization' : 'Employee is inactive / disabled' }}
                            </span>
                        </div>
                    </div>
                    <UiSwitch v-model="is_active" color="#4aff7a" size="md" />
                </div>
                <div class="col-span-12 sm:col-span-6 flex flex-col items-start gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p class="text-md text-white/80" for="Worker Type">Worker Type</p>
                    <FormSelect id="worker_type" class="w-full" color="#fff" prepend-icon="lucide:briefcase"
                        v-model="workerTypeSelection" :options="workerTypeOptions" searchable size="md" rounded="lg"
                        placeholder="Select worker type" />
                    <p class="text-xs text-white/45">
                        Worker type (e.g. permanent) is independent of probation — a permanent worker can still be on probation.
                    </p>
                </div>
            </div>
        </div>
        <div class="col-span-12 mt-3 flex items-center gap-2 pb-1 border-b border-white/10">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/25">
                <Icon name="lucide:git-branch" class="w-4 h-4 text-blue-400" />
            </span>
            <h3 class="text-lg font-semibold text-white/85">Department Details</h3>
        </div>
        <div class="col-span-12">
            <div
                class="grid rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent p-3 grid-cols-12 gap-3 backdrop-blur-xl shadow-lg">
                <template v-for="(department, index) in employee_department" @key="index">
                    <!-- <pre>{{ departments }}</pre> -->
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80" for="Department Name">
                            Department:
                        </label>
                        <FormSelect @select="onDeptSelect(index)" id="department" class="w-full"
                            color="#fff" prepend-icon="ion:git-branch-outline" v-model="department.department"
                            :options="departments" searchable size="md" rounded="lg" placeholder="Department" />
                    </div>
                    <div v-if="getSubDeptOptions(index).length > 0" class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80" for="Sub Department">
                            Sub Department:
                        </label>
                        <FormSelect id="sub_department" class="w-full" color="#fff" prepend-icon="ion:git-branch-outline"
                            @select="onSubDeptSelect(index, $event)" v-model="department.sub_department" :options="getSubDeptOptions(index)" searchable size="md"
                            rounded="lg" placeholder="Select Sub Department" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80" for="Department Code">
                            Reporting To:
                        </label>
                        <FormSelect id="reporting_to" class="w-full" color="#fff" prepend-icon="lucide:user"
                            v-model="department.reporting_to" :options="department.employees_list" searchable size="md"
                            rounded="lg" placeholder="Reporting To" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <p class="text-md text-white/80" for="Department Name">
                            Start Date:
                        </p>
                        <FormInput v-model="department.start_date" type="date" class="w-full"
                            prepend-icon="bx:bx-calendar" color="#fff" size="md" rounded="lg"
                            placeholder="Start Date" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <p class="text-md text-white/80" for="Department Name">
                            End Date:
                        </p>
                        <FormInput v-model="department.end_date" type="date" class="w-full"
                            prepend-icon="bx:bx-calendar" color="#fff" size="md" rounded="lg" placeholder="End Date" />
                    </div>
                    <div class="col-span-12 flex flex-row justify-end items-center gap-2">
                        <span v-if="employee_department.length > 1" @click="employeesStore.removeDepartment(index)"
                            class="flex items-center gap-1 text-xs font-medium text-red-400 cursor-pointer rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-1.5 hover:bg-red-400/20 transition-all">
                            <Icon name="lucide:trash-2" class="w-3.5 h-3.5" /> Remove
                        </span>
                        <span @click="employeesStore.addNewDepartment()"
                            class="flex items-center gap-1 text-xs font-medium text-emerald-400 cursor-pointer rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 hover:bg-emerald-400/20 transition-all">
                            <Icon name="lucide:plus" class="w-3.5 h-3.5" /> Add Another
                        </span>
                    </div>
                    <div v-if="index !== employee_department.length - 1 && employee_department.length > 1"
                        class="col-span-12 h-[1px] bg-white/10"></div>
                </template>
            </div>
        </div>
        <!-- 👥 Relationships -->
        <span class="col-span-12 mt-3 flex items-center gap-2 pb-1 border-b border-white/10">
            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 border border-blue-400/25">
                <Icon name="lucide:users" class="w-4 h-4 text-blue-400" />
            </span>
            <h3 class="text-lg font-semibold text-white/85">Relationships</h3>
        </span>
        <div class="col-span-12">
            <div
                class="grid rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-transparent p-3 grid-cols-12 gap-3 backdrop-blur-xl shadow-lg">
                <template v-for="(rel, index) in relationships" :key="rel._key">
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">Relationship: <span class="text-red-400">*</span></label>
                        <FormSelect class="w-full" color="#fff" prepend-icon="lucide:users"
                            v-model="rel.relationship" :options="relationshipTypeOptions" size="md" rounded="lg"
                            placeholder="Select Relationship" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">Gender:</label>
                        <FormSelect class="w-full" color="#fff" prepend-icon="bx:bx-user"
                            v-model="rel.gender" :options="genderOptions" size="md" rounded="lg"
                            placeholder="Select Gender" clearable />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">First Name: <span class="text-red-400">*</span></label>
                        <FormInput v-model="rel.first_name" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md"
                            rounded="lg" placeholder="First Name" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">Last Name:</label>
                        <FormInput v-model="rel.last_name" class="w-full" prepend-icon="bx:bx-user" color="#fff" size="md"
                            rounded="lg" placeholder="Last Name" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">Email:</label>
                        <FormInput v-model="rel.email" class="w-full" prepend-icon="heroicons:envelope" color="#fff"
                            size="md" rounded="lg" placeholder="Email" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">Mobile:</label>
                        <FormInput v-model="rel.phone" class="w-full" prepend-icon="heroicons:phone" color="#fff"
                            size="md" rounded="lg" placeholder="Mobile" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">Profession:</label>
                        <FormInput v-model="rel.profession" class="w-full" prepend-icon="lucide:briefcase" color="#fff"
                            size="md" rounded="lg" placeholder="Profession" />
                    </div>
                    <div class="col-span-6 w-full flex flex-col items-start">
                        <label class="text-md text-white/80">Date of Birth:</label>
                        <FormInput v-model="rel.date_of_birth" type="date" class="w-full" prepend-icon="bx:bx-calendar"
                            color="#fff" size="md" rounded="lg" placeholder="Date of Birth" />
                    </div>
                    <div class="col-span-12 flex flex-row justify-end items-center gap-2">
                        <span @click="employeesStore.removeRelationship(index)"
                            class="flex items-center gap-1 text-xs font-medium text-red-400 cursor-pointer rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-1.5 hover:bg-red-400/20 transition-all">
                            <Icon name="lucide:trash-2" class="w-3.5 h-3.5" /> Remove
                        </span>
                    </div>
                    <div v-if="index !== relationships.length - 1 && relationships.length > 1"
                        class="col-span-12 h-[1px] bg-white/10"></div>
                </template>
                <div class="col-span-12 flex justify-end">
                    <span @click="employeesStore.addRelationship()"
                        class="flex items-center gap-1 text-xs font-medium text-emerald-400 cursor-pointer rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 hover:bg-emerald-400/20 transition-all">
                        <Icon name="lucide:plus" class="w-3.5 h-3.5" /> Add Relationship
                    </span>
                </div>
            </div>
        </div>
        <div v-if="probationPreview || probation_start_date || probation_end_date" class="col-span-12">
            <div
                class="grid rounded-xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/[0.08] via-white/[0.04] to-transparent p-4 grid-cols-12 gap-3 backdrop-blur-xl shadow-lg">
                <div class="col-span-12 flex items-center gap-2 pb-1">
                    <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/25">
                        <Icon name="lucide:hourglass" class="w-4 h-4 text-emerald-400" />
                    </span>
                    <h3 class="text-sm font-semibold uppercase tracking-wider text-emerald-300">Employment Period</h3>
                </div>
                <div class="col-span-6 sm:col-span-3 text-sm text-white/80">
                    <span class="block text-xs text-white/50">Policy</span>
                    <span class="font-medium text-white/90">{{ probationPreview?.policy_name || '—' }}</span>
                </div>
                <div class="col-span-6 sm:col-span-3 text-sm text-white/80">
                    <span class="block text-xs text-white/50">Start Date</span>
                    <FormInput v-model="probation_start_date" type="date" class="w-full mt-1"
                        prepend-icon="bx:bx-calendar" color="#fff" size="sm" rounded="lg" placeholder="Period start" />
                </div>
                <div class="col-span-6 sm:col-span-3 text-sm text-white/80">
                    <span class="block text-xs text-white/50">End Date</span>
                    <FormInput v-model="probation_end_date" type="date" class="w-full mt-1"
                        prepend-icon="bx:bx-calendar" color="#fff" size="sm" rounded="lg" placeholder="Period end" />
                </div>
                <div class="col-span-6 sm:col-span-3 text-sm text-white/80">
                    <span class="block text-xs text-white/50">Extension allowed</span>
                    <span class="font-medium text-white/90">
                        {{ probationPreview?.max_duration_value > 0 ? `up to ${probationPreview.max_duration_value} ${(probationPreview.max_duration_unit || 'MONTHS').toLowerCase()}` : 'None' }}
                    </span>
                    <span v-if="probationPreview?.end_date" class="block text-[11px] text-white/45 mt-1">
                        Auto: {{ probationPreview.start_date }} → {{ probationPreview.end_date }}
                    </span>
                </div>
            </div>
        </div>
        <div v-else-if="joining_date" class="col-span-12">
            <div
                class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50 backdrop-blur-xl">
                <Icon name="lucide:info" class="w-4 h-4" />
                No employment policy selected for this employee yet.
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useEmpCategoryStore } from '../../stores/organization/empCategory.store';
import { useDesignationStore } from '../../stores/organization/designation.store';
import { useDepartmentStore } from '../../stores/organization/department.store';
import { useEmployeesStore } from '../../stores/organization/employee.store';
import { useBranchStore } from '../../stores/organization/branch.store';
import { useLocationStore } from '../../stores/organization/location.store';
import { useProbationPolicyStore } from '../../stores/organization/probationPolicy.store';
import { usePayGradeStore } from '../../stores/organization/payGrade.store';
import { useNoticePeriodStore } from '../../stores/organization/noticePeriod.store';
import { calculateProbationEndDate } from '../../utils/probationDate.js'
import { resolveMediaUrl, uploadMediaFile } from '../../utils/media'
import { useAuthStore } from '../../stores/shared/auth.store'
import Loader from '../ui/loader.vue'
import { storeToRefs } from 'pinia';
const empCategoryStore = useEmpCategoryStore()
const designationStore = useDesignationStore()
const employeesStore = useEmployeesStore()
const departmentStore = useDepartmentStore()
const branchStore = useBranchStore()
const locationStore = useLocationStore()
const probationPolicyStore = useProbationPolicyStore()
const payGradeStore = usePayGradeStore()
const noticePeriodStore = useNoticePeriodStore()

const loader = ref(false)

const {
    type,
    is_active,
    first_name,
    last_name,
    email,
    phone,
    alt_phone,
    gender,
    dateOfBirth,
    joining_date,
    display_name,
    marital_status,
    blood_group,
    physically_handicapped,
    nationality,
    personal_email,
    professional_summary,
    current_address,
    permanent_address,
    same_as_current_address,
    employee_category,
    employee_designation,
    probation_policy_id,
    probation_start_date,
    probation_end_date,
    is_permanent,
    worker_type,
    manager_id,
    branch_id,
    location_id,
    employee_department,
    all_employees,
    number_series,
    number_series_id,
    employee_code,
    profile_image,
    profile_image_file_id,
    pay_grade_id,
    notice_period_policy_id,
    relationships,
} = storeToRefs(employeesStore)

const photoUploading = ref(false)
const localPhotoPreview = ref('')

const photoPreview = computed(() => {
    if (localPhotoPreview.value) return localPhotoPreview.value
    if (profile_image_file_id.value) return resolveMediaUrl(`/file/${profile_image_file_id.value}`)
    if (profile_image.value) return resolveMediaUrl(profile_image.value)
    return ''
})

const onPhotoChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!/^image\//.test(file.type)) {
        useToast().error({ title: 'Invalid file', message: 'Please upload an image file.', timeout: 2000 })
        return
    }
    if (localPhotoPreview.value) URL.revokeObjectURL(localPhotoPreview.value)
    localPhotoPreview.value = URL.createObjectURL(file)
    photoUploading.value = true
    try {
        const auth = useAuthStore()
        const orgId = organization_id.value || auth.organization
        const fileId = await uploadMediaFile(file, {
            organizationId: orgId,
            storePath: `organizations/${orgId}/employees`,
        })
        if (!fileId) throw new Error('Upload failed')
        profile_image_file_id.value = fileId
        profile_image.value = null
        useToast().success({ title: 'Success!', message: 'Photo ready to save.', timeout: 1500 })
    } catch (err) {
        console.error('[employee-form] photo upload error:', err)
        localPhotoPreview.value = ''
        useToast().error({ title: 'Failed', message: 'Could not upload photo.', timeout: 3000 })
    } finally {
        photoUploading.value = false
    }
}

const removePhoto = () => {
    if (localPhotoPreview.value) URL.revokeObjectURL(localPhotoPreview.value)
    localPhotoPreview.value = ''
    profile_image_file_id.value = null
    profile_image.value = null
}

const fullNamePreview = computed(() => {
    const f = (first_name.value || '').trim()
    const l = (last_name.value || '').trim()
    return f || l ? `${f} ${l}`.trim() : ''
})

const workerTypeOptions = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERN', label: 'Intern' },
    { value: 'PERMANENT', label: 'Permanent' },
]

const relationshipTypeOptions = [
    { value: 'CHILD', label: 'Child' },
    { value: 'FATHER', label: 'Father' },
    { value: 'FATHER_IN_LAW', label: 'Father-in-law' },
    { value: 'MOTHER', label: 'Mother' },
    { value: 'MOTHER_IN_LAW', label: 'Mother-in-law' },
    { value: 'OTHERS', label: 'Others' },
    { value: 'PARTNER', label: 'Partner' },
    { value: 'SPOUSE', label: 'Spouse' },
    { value: 'SELF', label: 'Self' },
    { value: 'SIBLING', label: 'Sibling' },
]

const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
]

const workerTypeSelection = computed({
    get: () => workerTypeOptions.find(o => o.value === worker_type.value) || null,
    set: (v) => { worker_type.value = v?.value ?? 'FULL_TIME' },
})

watch(same_as_current_address, (checked) => {
    if (!checked) return
    permanent_address.value = {
        address_line1: current_address.value.address_line1,
        address_line2: current_address.value.address_line2,
        city: current_address.value.city,
        state: current_address.value.state,
        country: current_address.value.country,
        postal_code: current_address.value.postal_code,
    }
})

const organization_id = computed(() => employeesStore.organization_id)
const empCategories = computed(() => empCategoryStore.category_list)
const designations = computed(() => designationStore.designation_list)

const extractValue = (val) => {
    if (!val) return null
    if (typeof val === 'object' && val.value) return val.value
    return val
}

// 👉 Cascade: only show policies that match the selected category's employment
// type AND govern the selected category (fallback: policies with no category
// restrictions are always eligible).
const selectedCategoryType = computed(() => {
    const catId = extractValue(employee_category.value)
    const cat = (empCategories.value || []).find(c => c.value === catId)
    return cat?.employment_type || null
})

const probationPolicyOptions = computed(() => {
    const policies = probationPolicyStore.policies || []
    const catId = extractValue(employee_category.value)
    const empType = selectedCategoryType.value
    return policies
        .filter(p => p.is_active !== false)
        .filter(p => !empType || !p.policy_type || p.policy_type === empType)
        .filter(p => !p.employee_category_ids?.length || (catId && p.employee_category_ids.includes(String(catId))))
        .map(p => ({ value: p.id, label: p.name }))
})

// Show the Probation Policy field only when the selected category has
// applicable policies (or a policy is already assigned, e.g. when editing).
const showProbationField = computed(() => {
    const hasOptions = probationPolicyOptions.value.length > 0
    const alreadyAssigned = Boolean(extractValue(probation_policy_id.value))
    return hasOptions || alreadyAssigned
})

const selectedPolicy = computed(() => {
    const id = extractValue(probation_policy_id.value)
    return (probationPolicyStore.policies || []).find(p => p.id === id) || null
})

// Live preview of the computed probation period.
const probationPreview = computed(() => {
    const policy = selectedPolicy.value
    const joining = joining_date.value
    if (!policy || !joining) return null
    const end = calculateProbationEndDate(joining, policy.duration_value, policy.duration_unit, policy.end_date_after_completion)
    const start = `${joining}T00:00:00`
    return {
        policy_name: policy.name,
        start_date: new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        end_date: end ? new Date(end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
        max_duration_value: policy.max_duration_value ?? 0,
        max_duration_unit: policy.max_duration_unit || 'MONTHS',
    }
})

// Reset the policy when category changes and the current one is no longer valid.
watch(employee_category, () => {
    const current = extractValue(probation_policy_id.value)
    if (!current) return
    const stillEligible = probationPolicyOptions.value.some(o => o.value === current)
    if (!stillEligible) probation_policy_id.value = null
})

// Auto-suggest a number series matching the selected category's employment type.
watch(selectedCategoryType, (empType) => {
    if (employeesStore.employee_id) return
    if (!empType) return
    const matching = (number_series.value || [])
        .filter(s => s.is_active && s.policy_type === empType)
    if (!matching.length) return
    const currentId = typeof number_series_id.value === 'object' && number_series_id.value?.value
        ? number_series_id.value.value
        : number_series_id.value
    if (currentId && matching.some(s => s.id === currentId)) return
    const pick = matching[0]
    number_series_id.value = { value: pick.id, label: `${pick.name} (${pick.preview})` }
    employeesStore.series_preset_id = pick.id
})

// Worker type drives the permanent flag, but probation stays independent — a
// permanent worker can still be on probation, so we never clear probation fields.
watch(worker_type, (wt) => {
    is_permanent.value = wt === 'PERMANENT'
})

// Auto-fill probation start/end dates from joining date + policy, unless the
// user has already chosen them manually. Only auto-fills for new employees so
// that loaded edit values are never clobbered.
watch([joining_date, probation_policy_id], ([joining, policy]) => {
    if (!joining) return
    if (employeesStore.employee_id) return
    const p = probationPolicyStore.policies.find(x => x.id === extractValue(policy))
    if (!p) return
    if (!probation_start_date.value) probation_start_date.value = joining
    if (!probation_end_date.value) {
        const end = calculateProbationEndDate(joining, p.duration_value, p.duration_unit, p.end_date_after_completion)
        probation_end_date.value = end || null
    }
})
const branchOptions = computed(() => branchStore.branch_select)
const locationOptions = computed(() => {
    const branchesById = {}
    branchStore.branch_select.forEach(b => { branchesById[b.value] = b.label })
    return (locationStore.locations || []).map(loc => {
        let label = loc.formatted_address || 'Location'
        if (loc.entity_type === 'branch' && branchesById[loc.entity_id]) {
            label = `${branchesById[loc.entity_id]} — ${label}`
        } else if (loc.entity_type === 'organization') {
            label = `Organization${loc.is_headquarters ? ' (HQ)' : ''} — ${label}`
        }
        return { value: loc.id, label }
    })
})

const payGradeOptions = computed(() => {
    return (payGradeStore.payGrades || [])
        .filter(p => p.name)
        .map(p => ({ value: p.id, label: p.name, description: p.description }))
})

const selectedPayGradeDescription = computed(() => {
    const id = pay_grade_id.value && typeof pay_grade_id.value === 'object'
        ? pay_grade_id.value.value
        : pay_grade_id.value
    if (!id) return ''
    const grade = (payGradeStore.payGrades || []).find(p => String(p.id) === String(id))
    return grade?.description || ''
})

const loadPayGrades = async () => {
    const orgId = employeesStore.organization_id
    if (!orgId) return
    if (!payGradeStore.payGrades.length) {
        await payGradeStore.fetchPayGrades(orgId).catch(() => {})
    }
}

const noticePeriodPolicyLoading = ref(false)

const noticePeriodPolicyOptions = computed(() => {
    return (noticePeriodStore.policies || [])
        .map(p => {
            const label = p.title || p.name || ''
            const duration = p.duration_value ? ` (${p.duration_value} ${p.duration_unit === 'MONTHS' ? 'M' : 'D'})` : ''
            return { value: p.id, label: `${label}${duration}` }
        })
})

const loadNoticePeriodPolicies = async () => {
    const orgId = employeesStore.organization_id
    if (!orgId) return
    noticePeriodPolicyLoading.value = true
    try {
        await noticePeriodStore.fetchPolicies(orgId)
    } catch (e) {
        console.error('[employee-form] Failed to load notice period policies:', e)
    } finally {
        noticePeriodPolicyLoading.value = false
    }
}

// Auto-select default notice period policy for NEW employees only
const autoSelectDefaultNoticePeriodPolicy = () => {
    if (employeesStore.employee_id) return // skip for edit
    const policies = noticePeriodStore.policies || []
    const defaultPolicy = policies.find(p => p.is_default)
    if (defaultPolicy && !notice_period_policy_id.value) {
        notice_period_policy_id.value = { value: defaultPolicy.id, label: defaultPolicy.title || defaultPolicy.name }
    }
}

watch(noticePeriodStore.policies, () => {
    autoSelectDefaultNoticePeriodPolicy()
})

// Auto-select the location from the selected branch (or the org HQ location by
// default). Only seeds the default when no location is chosen yet, so an
// explicitly stored location is preserved when editing.
const syncLocationFromBranch = () => {
    const locations = locationStore.locations || []
    const branchValue = branch_id.value && typeof branch_id.value === 'object'
        ? branch_id.value.value
        : branch_id.value
    let target = null
    if (branchValue) {
        target = locations.find(l => l.entity_type === 'branch' && String(l.entity_id) === String(branchValue))
    }
    if (!target) {
        target = locations.find(l => l.entity_type === 'organization' && (!l.entity_id || l.entity_id === ''))
    }
    location_id.value = target ? locationOptions.value.find(o => o.value === target.id) || null : null
}

watch(branch_id, () => {
    if (!locationStore.locations || !locationStore.locations.length) return
    syncLocationFromBranch()
})

const numberSeriesOptions = computed(() => {
    const empType = selectedCategoryType.value
    return (number_series.value || [])
        .filter(series => series.is_active)
        .filter(series => !empType || !series.policy_type || series.policy_type === empType)
        .map(series => ({
            value: series.id,
            label: `${series.name} (${series.preview})`,
        }))
})

const selectedNumberSeries = computed(() => {
    const id = typeof number_series_id.value === 'object' && number_series_id.value?.value
        ? number_series_id.value.value
        : number_series_id.value
    return (number_series.value || []).find(series => series.id === id)
})

const seriesPreviewHelper = computed(() => {
    const series = selectedNumberSeries.value
    if (!series) return ''
    return `${series.prefix || ''}${String(series.next_number || 1).padStart(series.digits || 1, '0')}${series.suffix || ''}`
})

const generateFromSeries = (series) =>
    `${series.prefix || ''}${String(series.next_number || 1).padStart(series.digits || 1, '0')}${series.suffix || ''}`

watch(() => selectedNumberSeries.value?.id, (id, oldId) => {
    if (!id) return
    if (employeesStore.employee_id) return
    const series = selectedNumberSeries.value
    if (!series) return
    if (id === oldId) return
    const generated = generateFromSeries(series)
    if (employee_code.value !== generated) {
        employee_code.value = generated
    }
})

const managerOptions = computed(() => {
    return (all_employees.value || [])
        .filter(e => e.id !== employeesStore.employee_id)
        .map(e => ({
            value: e.id,
            label: `${e.full_name}${e.designation ? ' — ' + e.designation.name : ''}`
        }))
})

const departments = computed(() => {
    const selectedDepartmentValues = employee_department.value
        .map(d => d.department?.value)
        .filter(Boolean)

    return departmentStore.department_select
        .filter(d => !d.parent_id)
        .map(e => ({
            value: e.value,
            label: e.label,
            disabled: selectedDepartmentValues.includes(e.value)
        }))
})

const getDepartmentId = (dept) => {
    if (!dept) return null
    if (typeof dept === 'object' && dept.value) return dept.value
    return dept
}

// Helper: always extract id from FormSelect option or raw string
const extractId = (val) => {
    if (!val) return null
    if (typeof val === 'object' && val.value) return val.value
    return val
}

const onDeptSelect = (index) => {
    const dept = employee_department.value[index]
    dept.sub_department = null
    getEmployeeListFOrDepartment(index)
}

const onSubDeptSelect = (index, selected) => {
    const dept = employee_department.value[index]
    if (selected && typeof selected === 'object') {
        dept.sub_department = selected
    } else if (selected) {
        const subOpts = getSubDeptOptions(index)
        const found = subOpts.find(o => o.value === selected || o.label === selected)
        if (found) dept.sub_department = found
    }
    getEmployeeListFOrDepartment(index)
}

const getSubDeptOptions = (index) => {
    const dept = employee_department.value[index]
    const deptId = dept?.department?.value || (typeof dept?.department === 'string' ? dept.department : null)
    if (!deptId) return []
    const found = departmentStore.department_select.find(d => d.value === deptId)
    if (found?.children?.length) {
        return found.children.map(c => ({ value: c.id, label: c.name }))
    }
    return departmentStore.department_select
        .filter(d => d.parent_id === deptId && d.value !== deptId)
        .map(d => ({ value: d.value, label: d.label.replace(/^—+\s*/, '') }))
}

const getEmployeeListFOrDepartment = async (index) => {
    const department = employee_department.value[index]
    const deptId = extractId(department.sub_department) || getDepartmentId(department.department)
    if (!deptId) return
    const data = await departmentStore.fetchDepartmentEmployees(organization_id.value, deptId)
    employee_department.value[index].employees_list = data.employees.map(e => ({
        value: e.id,
        label: `${e.full_name} ${e.isHead ? '(Head)' : ''}`
    }))
    if (department.reporting_to) {
        employee_department.value[index].reporting_to = employee_department.value[index].employees_list.find(e => e.value == department.reporting_to)
    }
}

onMounted(async () => {
    loader.value = true
    await empCategoryStore.fetchAllEmployeeCategories()
    await designationStore.fetchDesignationList()
    await departmentStore.fetchAllDepartments()
    await employeesStore.fetchAllEmployees()
    await employeesStore.fetchNumberSeries()
    await probationPolicyStore.fetchPolicies()
    branchStore.organization_id = organization_id.value
    await branchStore.fetchAllBranches()
    locationStore.organization_id = organization_id.value
    await locationStore.fetchLocations()
    await loadPayGrades()
    await loadNoticePeriodPolicies()
    if (!location_id.value) {
        syncLocationFromBranch()
    }
    if (employee_department.value.length > 0) {
        employee_department.value.forEach(async (d, index) => {
            const rawDept = d.department
            let deptId = null
            if (rawDept && typeof rawDept === 'object' && rawDept.value) {
                deptId = rawDept.value
            } else if (rawDept) {
                deptId = rawDept
            }
            if (deptId) {
                let foundDept = departments.value.find(dept => dept.value == deptId)
                let isSubDept = false
                if (!foundDept) {
                    foundDept = departmentStore.department_select.find(d => d.value == deptId)
                    isSubDept = foundDept?.parent_id != null
                }
                if (foundDept) {
                    if (isSubDept) {
                        const parent = departments.value.find(d => d.value === foundDept.parent_id)
                        if (parent) {
                            employee_department.value[index].department = parent
                            employee_department.value[index].sub_department = {
                                value: foundDept.value,
                                label: foundDept.label.replace(/^—+\s*/, '')
                            }
                        } else {
                            employee_department.value[index].department = foundDept
                        }
                    } else {
                        employee_department.value[index].department = foundDept
                    }
                }
            }
            await getEmployeeListFOrDepartment(index)
        })
    }
    setTimeout(() => {
        loader.value = false
    }, 1000)
});
</script>
