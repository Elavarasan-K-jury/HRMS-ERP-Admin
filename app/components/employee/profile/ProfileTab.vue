<template>
    <div class="grid gap-4 md:grid-cols-2">
        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:user-round" class="ic" /> Personal</h2>
                <button v-if="canEdit" class="edit-btn" title="Edit Personal" @click="openSection('personal')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <div class="grid2">
                <div><span class="label">First Name</span>{{ employee.first_name || '—' }}</div>
                <div><span class="label">Last Name</span>{{ employee.last_name || '—' }}</div>
                <div><span class="label">Display Name</span>{{ employee.display_name || '—' }}</div>
                <div><span class="label">Date of Birth</span>{{ employee.date_of_birth || '—' }}</div>
                <div><span class="label">Gender</span>{{ formatGender(employee.gender) }}</div>
                <div><span class="label">Marital Status</span>{{ formatLabel(employee.marital_status) }}</div>
                <div><span class="label">Blood Group</span>{{ formatLabel(employee.blood_group) }}</div>
                <div><span class="label">Nationality</span>{{ formatLabel(employee.nationality) }}</div>
                <div><span class="label">Physically Handicapped</span>{{ employee.physically_handicapped ? 'Yes' : 'No' }}</div>
            </div>
        </section>

        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:contact" class="ic" /> Contact</h2>
                <button v-if="canEdit" class="edit-btn" title="Edit Contact" @click="openSection('contact')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <div class="grid2">
                <div><span class="label">Work Email</span>{{ employee.email || '—' }}</div>
                <div><span class="label">Personal Email</span>{{ employee.personal_email || '—' }}</div>
                <div><span class="label">Personal Number</span>{{ employee.phone || '—' }}</div>
                <div><span class="label">Work Number</span>{{ employee.alt_phone || '—' }}</div>
            </div>
        </section>

        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:map-pin" class="ic" /> Address Information</h2>
                <button v-if="canEdit" class="edit-btn" title="Edit Address" @click="openSection('address')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <div class="addr-block">
                <div>
                    <span class="label">Current Address</span>
                    <p v-if="currentAddress" class="address">{{ currentAddress }}</p>
                    <p v-else class="empty">No current address available.</p>
                </div>
                <div>
                    <span class="label">Permanent Address</span>
                    <p v-if="permanentAddress" class="address">{{ permanentAddress }}</p>
                    <p v-else class="empty">No permanent address available.</p>
                </div>
            </div>
        </section>

        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:align-left" class="ic" /> Professional Summary</h2>
                <button v-if="canEdit" class="edit-btn" title="Edit Summary" @click="openSection('summary')">
                    <Icon name="lucide:pencil" class="ic" />
                </button>
            </div>
            <p v-if="employee.professional_summary" class="summary">{{ employee.professional_summary }}</p>
            <p v-else class="empty">No professional summary available.</p>
        </section>

        <section class="card">
            <div class="hdr-row">
                <h2 class="hdr"><Icon name="lucide:users" class="ic" /> Relationships</h2>
                <button v-if="canEdit" class="edit-btn" title="Manage Relationships" @click="openRelModal">
                    <Icon name="lucide:plus" class="ic" />
                </button>
            </div>
            <div v-if="relLoading" class="rel-loading">
                <Icon name="lucide:loader-2" class="animate-spin" style="width:18px;height:18px;opacity:0.5" />
            </div>
            <div v-else-if="relationships.length === 0" class="empty">No relationships added yet.</div>
            <div v-else class="rel-list">
                <div v-for="rel in relationships" :key="rel.id" class="rel-card">
                    <div class="rel-card-header">
                        <span class="rel-badge">{{ formatRelType(rel.relationship) }}</span>
                        <div v-if="canEdit" class="rel-actions">
                            <button class="rel-action-btn" title="Edit" @click="openRelModal"><Icon name="lucide:pencil" class="ic" /></button>
                            <button class="rel-action-btn rel-action-delete" title="Delete" @click="deleteRelationship(rel)"><Icon name="lucide:trash-2" class="ic" /></button>
                        </div>
                    </div>
                    <div class="rel-card-grid">
                        <div><span class="label">First Name</span>{{ rel.first_name }}</div>
                        <div v-if="rel.last_name"><span class="label">Last Name</span>{{ rel.last_name }}</div>
                        <div v-if="rel.gender"><span class="label">Gender</span>{{ formatGender(rel.gender) }}</div>
                        <div v-if="rel.date_of_birth"><span class="label">Date of Birth</span>{{ formatRelDate(rel.date_of_birth) }}</div>
                        <div v-if="rel.email" class="rel-field-wide"><span class="label">Email</span>{{ rel.email }}</div>
                        <div v-if="rel.phone"><span class="label">Mobile</span>{{ rel.phone }}</div>
                        <div v-if="rel.profession" class="rel-field-wide"><span class="label">Profession</span>{{ rel.profession }}</div>
                    </div>
                </div>
            </div>
        </section>


        <ProfileEducation :docTypes="educationDocTypes" :loading="docLoading" @download="downloadDoc" @edit="editDoc" />

        <ProfileExperience :docTypes="experienceDocTypes" :loading="docLoading" @download="downloadDoc" @edit="editDoc" />

        <ProfileIdentity :docTypes="identityDocTypes" :loading="docLoading" @download="downloadDoc" @edit="editDoc" />
    </div>

    <UiSidebarModal v-model="modalOpen" :title="modalTitle" width="620px">
        <template #default>
            <div v-if="activeSection === 'personal'" class="form-grid">
                <div class="field">
                    <p class="lbl">First Name</p>
                    <FormInput v-model="personal.first_name" class="w-full" color="#fff" prepend-icon="bx:bx-user" size="md" rounded="lg" placeholder="First Name" />
                </div>
                <div class="field">
                    <p class="lbl">Last Name</p>
                    <FormInput v-model="personal.last_name" class="w-full" color="#fff" prepend-icon="bx:bx-user" size="md" rounded="lg" placeholder="Last Name" />
                </div>
                <div class="field">
                    <p class="lbl">Display Name</p>
                    <FormInput v-model="personal.display_name" class="w-full" color="#fff" prepend-icon="bx:bx-user" size="md" rounded="lg" placeholder="Display Name" />
                </div>
                <div class="field">
                    <p class="lbl">Date of Birth</p>
                    <FormInput v-model="personal.date_of_birth" type="date" class="w-full" color="#fff" prepend-icon="bx:bx-calendar" size="md" rounded="lg" placeholder="Date of Birth" />
                </div>
                <div class="field">
                    <p class="lbl">Gender</p>
                    <FormSelect v-model="personal.gender" class="w-full" color="#fff" prepend-icon="bx:bx-user" :options="genderOptions" searchable size="md" rounded="lg" placeholder="Gender" clearable />
                </div>
                <div class="field">
                    <p class="lbl">Marital Status</p>
                    <FormSelect v-model="personal.marital_status" class="w-full" color="#fff" prepend-icon="lucide:rings" :options="maritalOptions" searchable size="md" rounded="lg" placeholder="Marital Status" clearable />
                </div>
                <div class="field">
                    <p class="lbl">Blood Group</p>
                    <FormSelect v-model="personal.blood_group" class="w-full" color="#fff" prepend-icon="lucide:droplets" :options="bloodOptions" searchable size="md" rounded="lg" placeholder="Blood Group" clearable />
                </div>
                <div class="field">
                    <p class="lbl">Nationality</p>
                    <FormInput v-model="personal.nationality" class="w-full" color="#fff" prepend-icon="lucide:globe" size="md" rounded="lg" placeholder="Nationality" />
                </div>
                <div class="field col-span-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div>
                        <p class="text-sm text-white/80">Physically Handicapped</p>
                        <p class="text-xs text-white/45">Has a physical disability</p>
                    </div>
                    <UiSwitch v-model="personal.physically_handicapped" color="#4aff7a" size="md" />
                </div>
            </div>

            <div v-else-if="activeSection === 'contact'" class="form-grid">
                <div class="field">
                    <p class="lbl">Work Email</p>
                    <FormInput v-model="contact.email" type="email" class="w-full" color="#fff" prepend-icon="bx:bx-envelope" size="md" rounded="lg" placeholder="Work Email" />
                </div>
                <div class="field">
                    <p class="lbl">Personal Email</p>
                    <FormInput v-model="contact.personal_email" type="email" class="w-full" color="#fff" prepend-icon="bx:bx-envelope" size="md" rounded="lg" placeholder="Personal Email" />
                </div>
                <div class="field">
                    <p class="lbl">Personal Number</p>
                    <FormInput v-model="contact.phone" type="tel" class="w-full" color="#fff" prepend-icon="bx:bx-phone" size="md" rounded="lg" placeholder="Personal Number" />
                </div>
                <div class="field">
                    <p class="lbl">Work Number</p>
                    <FormInput v-model="contact.alt_phone" type="tel" class="w-full" color="#fff" prepend-icon="bx:bx-phone" size="md" rounded="lg" placeholder="Work Number" />
                </div>
            </div>

            <div v-else-if="activeSection === 'address'" class="form-grid">
                <p class="addr-title col-span-2">Current Address</p>
                <div class="field">
                    <p class="lbl">Address Line 1</p>
                    <FormInput v-model="address.current.address_line1" class="w-full" color="#fff" size="md" rounded="lg" placeholder="House / Street" />
                </div>
                <div class="field">
                    <p class="lbl">Address Line 2</p>
                    <FormInput v-model="address.current.address_line2" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Area / Landmark" />
                </div>
                <div class="field">
                    <p class="lbl">City</p>
                    <FormInput v-model="address.current.city" class="w-full" color="#fff" size="md" rounded="lg" placeholder="City" />
                </div>
                <div class="field">
                    <p class="lbl">State</p>
                    <FormInput v-model="address.current.state" class="w-full" color="#fff" size="md" rounded="lg" placeholder="State" />
                </div>
                <div class="field">
                    <p class="lbl">Country</p>
                    <FormInput v-model="address.current.country" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Country" />
                </div>
                <div class="field">
                    <p class="lbl">Postal Code</p>
                    <FormInput v-model="address.current.postal_code" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Postal Code" />
                </div>
                <div class="field col-span-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div>
                        <p class="text-sm text-white/80">Same as Current Address</p>
                        <p class="text-xs text-white/45">Copy current address to permanent address</p>
                    </div>
                    <UiSwitch v-model="address.same_as_current" color="#4aff7a" size="md" />
                </div>
                <p class="addr-title col-span-2">Permanent Address</p>
                <div class="field">
                    <p class="lbl">Address Line 1</p>
                    <FormInput v-model="address.permanent.address_line1" class="w-full" color="#fff" size="md" rounded="lg" placeholder="House / Street" />
                </div>
                <div class="field">
                    <p class="lbl">Address Line 2</p>
                    <FormInput v-model="address.permanent.address_line2" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Area / Landmark" />
                </div>
                <div class="field">
                    <p class="lbl">City</p>
                    <FormInput v-model="address.permanent.city" class="w-full" color="#fff" size="md" rounded="lg" placeholder="City" />
                </div>
                <div class="field">
                    <p class="lbl">State</p>
                    <FormInput v-model="address.permanent.state" class="w-full" color="#fff" size="md" rounded="lg" placeholder="State" />
                </div>
                <div class="field">
                    <p class="lbl">Country</p>
                    <FormInput v-model="address.permanent.country" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Country" />
                </div>
                <div class="field">
                    <p class="lbl">Postal Code</p>
                    <FormInput v-model="address.permanent.postal_code" class="w-full" color="#fff" size="md" rounded="lg" placeholder="Postal Code" />
                </div>
            </div>

            <div v-else-if="activeSection === 'summary'" class="form-grid">
                <div class="field col-span-2">
                    <p class="lbl">Professional Summary</p>
                    <InputArea v-model="summary" color="#fff" size="md" minHeight="120px" placeholder="Brief summary of the employee's professional background..." />
                </div>
            </div>
        </template>
        <template #footer>
            <div class="w-full flex justify-end gap-3">
                <UiButton :disabled="saving" @click="closeSection" color="#fff" text="Cancel" />
                <UiButton :disabled="saving" @click="saveSection" color="#4aff7a" text="Save Changes" prepend-icon="ion:checkmark-circle" />
            </div>
        </template>
    </UiSidebarModal>

    <UiSidebarModal v-model="relModalOpen" title="Relationships" width="580px">
        <template #default>
            <div v-if="relForms.length === 0" class="empty" style="padding:24px 0;text-align:center">
                No relationships. Click "+ Add Relationship" below to get started.
            </div>
            <div v-for="(form, idx) in relForms" :key="form._key" class="rel-form-card">
                <div class="rel-form-header">
                    <span class="rel-form-num">Relationship {{ idx + 1 }}</span>
                    <button v-if="relForms.length > 1" class="rel-form-remove" title="Remove" @click="removeRelForm(idx)">
                        <Icon name="lucide:trash-2" class="ic" /> Remove
                    </button>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <p class="lbl">Relationship <span class="text-red-400">*</span></p>
                        <FormSelect v-model="form.relationship" class="w-full" color="#fff" prepend-icon="lucide:users"
                            :options="relationshipTypeOptions" size="md" rounded="lg" placeholder="Select Relationship" />
                    </div>
                    <div class="field">
                        <p class="lbl">Gender</p>
                        <FormSelect v-model="form.gender" class="w-full" color="#fff" prepend-icon="bx:bx-user"
                            :options="genderOptionsList" size="md" rounded="lg" placeholder="Select Gender" clearable />
                    </div>
                    <div class="field">
                        <p class="lbl">First Name <span class="text-red-400">*</span></p>
                        <FormInput v-model="form.first_name" class="w-full" color="#fff" prepend-icon="bx:bx-user"
                            size="md" rounded="lg" placeholder="First Name" />
                    </div>
                    <div class="field">
                        <p class="lbl">Last Name</p>
                        <FormInput v-model="form.last_name" class="w-full" color="#fff" prepend-icon="bx:bx-user"
                            size="md" rounded="lg" placeholder="Last Name" />
                    </div>
                    <div class="field">
                        <p class="lbl">Email</p>
                        <FormInput v-model="form.email" type="email" class="w-full" color="#fff" prepend-icon="heroicons:envelope"
                            size="md" rounded="lg" placeholder="Email" />
                    </div>
                    <div class="field">
                        <p class="lbl">Mobile</p>
                        <FormInput v-model="form.phone" type="tel" class="w-full" color="#fff" prepend-icon="heroicons:phone"
                            size="md" rounded="lg" placeholder="Mobile" />
                    </div>
                    <div class="field">
                        <p class="lbl">Profession</p>
                        <FormInput v-model="form.profession" class="w-full" color="#fff" prepend-icon="lucide:briefcase"
                            size="md" rounded="lg" placeholder="Profession" />
                    </div>
                    <div class="field">
                        <p class="lbl">Date of Birth</p>
                        <FormInput v-model="form.date_of_birth" type="date" class="w-full" color="#fff" prepend-icon="bx:bx-calendar"
                            size="md" rounded="lg" placeholder="Date of Birth" />
                    </div>
                </div>
            </div>
            <button class="rel-add-btn" @click="addRelForm">
                <Icon name="lucide:plus" class="ic" /> Add Relationship
            </button>
        </template>
        <template #footer>
            <div class="w-full flex justify-end gap-3">
                <UiButton :disabled="relSaving" @click="closeRelModal" color="#fff" text="Cancel" />
                <UiButton :disabled="relSaving" @click="saveAllRelationships" color="#4aff7a" text="Save" prepend-icon="ion:checkmark-circle" />
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useEmployeesStore } from '../../../stores/organization/employee.store'
import { useEmployeeDocumentStore } from '../../../stores/organization/employeeDocument.store'
import { apiAddressToStore, formatAddress } from '../../../utils/employeeProfile'
import { resolveMediaUrl } from '../../../utils/media'

import ProfileEducation from './ProfileEducation.vue'
import ProfileExperience from './ProfileExperience.vue'
import ProfileIdentity from './ProfileIdentity.vue'

const props = defineProps({
    employee: { type: Object, required: true },
    employeeId: { type: String, default: null },
})

const emit = defineEmits(['updated'])

const canEdit = computed(() => true)

const employeesStore = useEmployeesStore()
const docStore = useEmployeeDocumentStore()

const currentAddress = computed(() => formatAddress(props.employee.current_address))
const permanentAddress = computed(() => formatAddress(props.employee.permanent_address))

function formatGender(g) {
    if (!g) return '—'
    return g.charAt(0) + g.slice(1).toLowerCase()
}

function formatLabel(v) {
    if (!v) return '—'
    const s = String(v).toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

// ---------- Section editing state ----------
const modalOpen = ref(false)
const activeSection = ref(null)
const saving = ref(false)

const genderOptions = ['MALE', 'FEMALE', 'OTHER']
const maritalOptions = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
const bloodOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const personal = ref({ first_name: '', last_name: '', display_name: '', date_of_birth: '', gender: '', marital_status: '', blood_group: '', nationality: '', physically_handicapped: false })
const contact = ref({ email: '', personal_email: '', phone: '', alt_phone: '' })
const address = ref({ current: {}, permanent: {}, same_as_current: false })
const summary = ref('')

const modalTitle = computed(() => ({
    personal: 'Edit Personal Information',
    contact: 'Edit Contact Information',
    address: 'Edit Address Information',
    summary: 'Edit Professional Summary',
}[activeSection.value] || 'Edit Section'))

function toInputDate(dateString) {
    if (!dateString) return ''
    if (dateString instanceof Date) return dateString.toISOString().slice(0, 10)
    if (typeof dateString === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) return dateString.slice(0, 10)
        const parsed = new Date(dateString)
        if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    }
    return ''
}

function openSection(section) {
    const e = props.employee
    if (section === 'personal') {
        personal.value = {
            first_name: e.first_name || '',
            last_name: e.last_name || '',
            display_name: e.display_name || '',
            date_of_birth: toInputDate(e.date_of_birth),
            gender: e.gender || '',
            marital_status: e.marital_status || '',
            blood_group: e.blood_group || '',
            nationality: e.nationality || '',
            physically_handicapped: !!e.physically_handicapped,
        }
    } else if (section === 'contact') {
        contact.value = {
            email: e.email || '',
            personal_email: e.personal_email || '',
            phone: e.phone || '',
            alt_phone: e.alt_phone || '',
        }
    } else if (section === 'address') {
        address.value = {
            current: apiAddressToStore(e.current_address),
            permanent: apiAddressToStore(e.permanent_address),
            same_as_current: false,
        }
    } else if (section === 'summary') {
        summary.value = e.professional_summary || ''
    }
    activeSection.value = section
    modalOpen.value = true
}

function closeSection() {
    modalOpen.value = false
    activeSection.value = null
    saving.value = false
}

// ---------- Change detection (only changed fields are sent) ----------
const norm = (v) => (v == null ? '' : String(v).trim())
const normDate = (v) => (v ? String(v).slice(0, 10) : '')

function sameAddr(a, b) {
    const keys = ['address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code']
    return keys.every(k => norm(a[k]) === norm(b[k]))
}

function buildChanges() {
    const e = props.employee
    const changes = {}

    if (activeSection.value === 'personal') {
        const p = personal.value
        if (norm(p.first_name) !== norm(e.first_name)) changes.firstName = norm(p.first_name) || null
        if (norm(p.last_name) !== norm(e.last_name)) changes.lastName = norm(p.last_name) || null
        if (norm(p.display_name) !== norm(e.display_name)) changes.displayName = norm(p.display_name) || null
        const dob = normDate(p.date_of_birth)
        if (dob !== normDate(e.date_of_birth)) changes.dateOfBirth = dob || null
        if (norm(p.gender) !== norm(e.gender)) changes.gender = norm(p.gender) || null
        if (norm(p.marital_status) !== norm(e.marital_status)) changes.maritalStatus = norm(p.marital_status) || null
        if (norm(p.blood_group) !== norm(e.blood_group)) changes.bloodGroup = norm(p.blood_group) || null
        if (norm(p.nationality) !== norm(e.nationality)) changes.nationality = norm(p.nationality) || null
        if (Boolean(p.physically_handicapped) !== Boolean(e.physically_handicapped)) changes.physicallyHandicapped = Boolean(p.physically_handicapped)
    } else if (activeSection.value === 'contact') {
        const c = contact.value
        if (norm(c.email) !== norm(e.email)) changes.email = norm(c.email) || null
        if (norm(c.personal_email) !== norm(e.personal_email)) changes.personalEmail = norm(c.personal_email) || null
        if (norm(c.phone) !== norm(e.phone)) changes.phone = norm(c.phone)
        if (norm(c.alt_phone) !== norm(e.alt_phone)) changes.altPhone = norm(c.alt_phone) || null
    } else if (activeSection.value === 'address') {
        const a = address.value
        const current = a.same_as_current ? { ...a.current } : a.current
        const permanent = a.same_as_current ? { ...a.current } : a.permanent
        const curOrig = apiAddressToStore(e.current_address)
        const permOrig = apiAddressToStore(e.permanent_address)
        if (!sameAddr(current, curOrig)) changes.currentAddress = employeesStore.addressPayload(current) || null
        if (!sameAddr(permanent, permOrig)) changes.permanentAddress = employeesStore.addressPayload(permanent) || null
    } else if (activeSection.value === 'summary') {
        if (norm(summary.value) !== norm(e.professional_summary)) changes.professionalSummary = norm(summary.value) || null
    }

    return changes
}

function validateChanges(changes) {
    if (changes.phone !== undefined && !/^[0-9]{10}$/.test(changes.phone)) {
        useToast().error({ title: 'Invalid number', message: 'Personal number must be exactly 10 digits.', timeout: 2500 })
        return false
    }
    if (changes.email !== undefined && changes.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(changes.email)) {
        useToast().error({ title: 'Invalid email', message: 'Work email format is invalid.', timeout: 2500 })
        return false
    }
    if (changes.personalEmail !== undefined && changes.personalEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(changes.personalEmail)) {
        useToast().error({ title: 'Invalid email', message: 'Personal email format is invalid.', timeout: 2500 })
        return false
    }
    if (changes.altPhone !== undefined && changes.altPhone && !/^[0-9]{6,15}$/.test(changes.altPhone)) {
        useToast().error({ title: 'Invalid number', message: 'Work number must be 6-15 digits.', timeout: 2500 })
        return false
    }
    return true
}

async function saveSection() {
    if (saving.value) return
    const changes = buildChanges()
    if (Object.keys(changes).length === 0) {
        useToast().info({ title: 'No changes', message: 'No changes were made.', timeout: 1500 })
        closeSection()
        return
    }
    if (!validateChanges(changes)) return
    saving.value = true
    try {
        await employeesStore.updateEmployeeFields(props.employee.id, changes)
        closeSection()
        emit('updated')
    } catch (err) {
        saving.value = false
    }
}

// ---------- Relationships (self-service API) ----------
const relLoading = ref(true)
const relationships = ref([])
const relModalOpen = ref(false)
const relSaving = ref(false)
const relForms = ref([])
const relOriginalIds = ref([])
let relKeySeq = 0

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

const genderOptionsList = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
]

function formatRelType(type) {
    if (!type) return ''
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function formatRelDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d)) return ''
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function blankRelForm() {
    return { _key: ++relKeySeq, _id: null, relationship: '', first_name: '', last_name: '', gender: '', email: '', phone: '', profession: '', date_of_birth: '' }
}

function relToForm(r) {
    return { _key: ++relKeySeq, _id: r.id || null, relationship: r.relationship || '', first_name: r.first_name || '', last_name: r.last_name || '', gender: r.gender || '', email: r.email || '', phone: r.phone || '', profession: r.profession || '', date_of_birth: toInputDate(r.date_of_birth) }
}

function relPayload(form) {
    return {
        relationship: form.relationship,
        first_name: form.first_name.trim(),
        last_name: form.last_name?.trim() || null,
        gender: form.gender || null,
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        profession: form.profession?.trim() || null,
        date_of_birth: form.date_of_birth || null,
    }
}

async function loadRelationships() {
    if (!props.employee?.id) return
    relLoading.value = true
    try {
        const { $api } = useNuxtApp()
        if (props.employeeId) {
            const { data } = await $api.get(`/employees/${props.employeeId}/relationships`)
            relationships.value = data?.relationships || []
        } else {
            const { data } = await $api.get('/employee-profile/my/relationships')
            relationships.value = data?.relationships || []
        }
    } catch (err) {
        console.error('[ProfileTab] Failed to load relationships:', err)
        relationships.value = []
    } finally {
        relLoading.value = false
    }
}

function openRelModal() {
    relForms.value = relationships.value.map(r => relToForm(r))
    if (relForms.value.length === 0) relForms.value.push(blankRelForm())
    relOriginalIds.value = relationships.value.map(r => r.id).filter(Boolean)
    relModalOpen.value = true
}

function closeRelModal() {
    relModalOpen.value = false
    relSaving.value = false
}

function addRelForm() {
    relForms.value.push(blankRelForm())
}

function removeRelForm(idx) {
    if (relForms.value.length <= 1) return
    relForms.value.splice(idx, 1)
}

function validateAllRelForms() {
    for (let i = 0; i < relForms.value.length; i++) {
        const f = relForms.value[i]
        if (!f.relationship) {
            useToast().error({ title: 'Required', message: `Relationship ${i + 1}: please select a relationship type.`, timeout: 3000 })
            return false
        }
        if (!f.first_name?.trim()) {
            useToast().error({ title: 'Required', message: `Relationship ${i + 1}: first name is required.`, timeout: 3000 })
            return false
        }
        if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) {
            useToast().error({ title: 'Invalid email', message: `Relationship ${i + 1}: email format is invalid.`, timeout: 3000 })
            return false
        }
    }
    return true
}

async function saveAllRelationships() {
    if (relSaving.value) return
    if (!validateAllRelForms()) return
    relSaving.value = true
    try {
        const { $api } = useNuxtApp()
        const base = props.employeeId
            ? `/employees/${props.employeeId}/relationships`
            : '/employee-profile/my/relationships'
        const currentIds = relForms.value.map(f => f._id).filter(Boolean)
        const toDelete = relOriginalIds.value.filter(id => !currentIds.includes(id))
        for (const id of toDelete) {
            await $api.delete(`${base}/${id}`)
        }
        for (const f of relForms.value) {
            if (f._id) {
                await $api.put(`${base}/${f._id}`, relPayload(f))
            } else {
                await $api.post(base, relPayload(f))
            }
        }
        useToast().success({ title: 'Saved', message: 'Relationships saved successfully.', timeout: 1500 })
        closeRelModal()
        await loadRelationships()
    } catch (err) {
        relSaving.value = false
        const msg = err?.response?.data?.error || err.message || 'Failed to save relationships'
        useToast().error({ title: 'Error', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
    }
}

async function deleteRelationship(rel) {
    const name = `${rel.first_name}${rel.last_name ? ' ' + rel.last_name : ''}`
    const confirmed = window.confirm(`Remove relationship "${name}"?`)
    if (!confirmed) return
    try {
        const { $api } = useNuxtApp()
        const base = props.employeeId
            ? `/employees/${props.employeeId}/relationships`
            : '/employee-profile/my/relationships'
        await $api.delete(`${base}/${rel.id}`)
        useToast().success({ title: 'Removed', message: 'Relationship removed.', timeout: 1500 })
        await loadRelationships()
    } catch (err) {
        const msg = err?.response?.data?.error || err.message || 'Failed to delete relationship'
        useToast().error({ title: 'Error', message: String(msg).replace(/^\d+ [A-Z_]+:\s*/, ''), timeout: 3000 })
    }
}

// ---------- Employee Documents ----------
const docLoading = ref(true)

const EDUCATION_KEYWORDS = ['education', 'qualification', 'certificate', 'degree', 'academic', 'training', 'course', 'diploma']
const IDENTITY_KEYWORDS = ['identity', 'proof', 'id', 'aadhaar', 'aadhar', 'pan', 'passport', 'verification', 'photo id', 'driving', 'voter']
const EXPERIENCE_KEYWORDS = ['experience', 'employment', 'work history', 'career', 'references', 'recommendation']

const groupedDocs = ref({})

const educationDocTypes = computed(() => {
    const result = []
    for (const group of Object.values(groupedDocs.value)) {
        if (EDUCATION_KEYWORDS.some(kw => group.folderName.toLowerCase().includes(kw))) {
            result.push(...group.types)
        }
    }
    return result
})

const identityDocTypes = computed(() => {
    const result = []
    for (const group of Object.values(groupedDocs.value)) {
        if (IDENTITY_KEYWORDS.some(kw => group.folderName.toLowerCase().includes(kw))) {
            result.push(...group.types)
        }
    }
    return result
})

const experienceDocTypes = computed(() => {
    const result = []
    for (const group of Object.values(groupedDocs.value)) {
        if (EXPERIENCE_KEYWORDS.some(kw => group.folderName.toLowerCase().includes(kw))) {
            result.push(...group.types)
        }
    }
    return result
})

async function loadDocuments() {
    if (!props.employee?.id || !props.employee?.organization_id) return
    docLoading.value = true
    try {
        docStore.organizationId = props.employee.organization_id
        let verifiedDocs
        if (props.employeeId) {
            verifiedDocs = await docStore.fetchVerifiedDocuments({ employee_id: props.employeeId, limit: 50 })
        } else {
            verifiedDocs = await docStore.fetchMyVerifiedDocuments({ limit: 50 })
        }

        const groups = {}
        for (const doc of verifiedDocs) {
            const folderName = doc.folder_name || 'Uncategorized'
            if (!groups[folderName]) {
                groups[folderName] = {
                    folderId: doc.folder_id || null,
                    folderName,
                    types: [],
                }
            }
            const existing = groups[folderName].types.find(t => t.typeId === doc.document_type_id)
            if (existing) {
                existing.submissions.push(doc)
                continue
            }
            groups[folderName].types.push({
                typeId: doc.document_type_id,
                typeName: doc.document_type_name,
                assignmentId: doc.assignment_id,
                isMandatory: doc.document_is_mandatory || false,
                isMultiple: doc.document_is_multiple || false,
                isVerificationRequired: doc.document_is_verification_required || false,
                submissions: [doc],
            })
        }
        groupedDocs.value = groups
    } catch (err) {
        console.error('[ProfileTab] Failed to load documents:', err)
    } finally {
        docLoading.value = false
    }
}

function downloadDoc(submission) {
    if (submission?.file_url) {
        const a = document.createElement('a')
        a.href = resolveMediaUrl(submission.file_url)
        a.download = submission.file_name || 'document'
        a.click()
    }
}

function editDoc() {
    if (props.employeeId) {
        const route = useRoute()
        const router = useRouter()
        router.replace({ query: { ...route.query, tab: 'documents' } })
    } else {
        navigateTo('/employee/profile?tab=documents')
    }
}

onMounted(() => {
    loadDocuments()
    loadRelationships()
})

watch(() => props.employee?.id, () => {
    if (props.employee?.id) {
        loadDocuments()
        loadRelationships()
    }
})
</script>

<style scoped>
.card {
    padding: 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    min-width: 0;
}

.hdr-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin-bottom: 10px;
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
}

.edit-btn {
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.55);
    transition: all 0.2s ease;
}

.edit-btn:hover {
    color: #4aff7a;
    background: rgba(74, 255, 122, 0.12);
}

.ic { width: 16px; height: 16px; opacity: 0.85; }

.grid2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
    font-size: 13.5px;
    line-height: 1.35;
}

.label {
    display: block;
    font-size: 10.5px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    margin-bottom: 2px;
}

.empty {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
}

.address {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.92);
    line-height: 1.5;
}

.addr-block {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
}

.addr-block .label {
    margin-bottom: 4px;
}

.summary {
    font-size: 13.5px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    white-space: pre-wrap;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-width: 0;
}

.field.col-span-2 {
    grid-column: span 2;
}

.lbl {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
}

.addr-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.5);
    margin: 4px 0 0;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* Relationships */
.rel-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 0;
    color: rgba(255, 255, 255, 0.45);
}

.rel-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.rel-card {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.03);
}

.rel-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.rel-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
    font-size: 13.5px;
    line-height: 1.35;
}

.rel-field-wide {
    grid-column: span 2;
}

.rel-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(74, 255, 122, 0.12);
    color: #4aff7a;
    flex-shrink: 0;
}

.rel-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
}

.rel-action-btn {
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.45);
    transition: all 0.15s ease;
}

.rel-action-btn:hover {
    color: #4aff7a;
    background: rgba(74, 255, 122, 0.12);
}

.rel-action-delete:hover {
    color: #ff4a4a;
    background: rgba(255, 74, 74, 0.12);
}

/* Multi-form relationship sidebar */
.rel-form-card {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.03);
}

.rel-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.rel-form-num {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.rel-form-remove {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 100, 100, 0.8);
    background: rgba(255, 74, 74, 0.08);
    border: 1px solid rgba(255, 74, 74, 0.15);
    cursor: pointer;
    transition: all 0.15s ease;
}

.rel-form-remove:hover {
    color: #ff4a4a;
    background: rgba(255, 74, 74, 0.15);
}

.rel-form-remove .ic {
    width: 13px;
    height: 13px;
}

.rel-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    border: 1px dashed rgba(74, 255, 122, 0.25);
    background: rgba(74, 255, 122, 0.04);
    color: #4aff7a;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    margin-top: 4px;
}

.rel-add-btn:hover {
    background: rgba(74, 255, 122, 0.1);
    border-color: rgba(74, 255, 122, 0.4);
}

.rel-add-btn .ic {
    width: 15px;
    height: 15px;
}

@media (max-width: 640px) {
    .grid2 { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .field.col-span-2 { grid-column: span 1; }
    .rel-card-grid { grid-template-columns: 1fr; }
    .rel-field-wide { grid-column: span 1; }
}
</style>
